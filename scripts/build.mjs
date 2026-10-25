// 사용법: node scripts/build.mjs            → dist/    (배포용, 깔끔한 주소)
//         node scripts/build.mjs --preview  → preview/ (index.html 더블클릭으로 열어보기용)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cfg from "../site.config.mjs";
import { services } from "../src/content.mjs";
import { head, header, footer, setPage, site, txt, abs } from "../src/layout.mjs";
import { pageList } from "../src/pages.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const preview = process.argv.includes("--preview");
const out = path.join(root, preview ? "preview" : "dist");

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync(path.join(root, "src/assets"), path.join(out, "assets"), { recursive: true });

const write = (p, s) => {
  const f = path.join(out, p);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, s);
};

// 1) HTML 페이지
const built = [];
for (const { path: p, render } of pageList) {
  setPage(p, preview);
  const pg = render();
  let html = head(pg) + header() + pg.body + footer();
  if (pg.noindex) html = html.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex">');
  write(p.endsWith("/") ? p + "index.html" : p, html);
  if (!pg.noindex) built.push(p);
}

// 2) sitemap.xml
const today = new Date().toISOString().slice(0, 10);
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${built.map((p) => `  <url><loc>${abs(p)}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`
);

// 3) robots.txt — 검색엔진 + AI 검색 봇 허용
const aiBots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Yeti"];
write(
  "robots.txt",
  `User-agent: *
Allow: /

${aiBots.map((b) => `User-agent: ${b}\nAllow: /`).join("\n\n")}

Sitemap: ${abs("/sitemap.xml")}
`
);

// 4) llms.txt — AI 검색이 읽는 업체 요약
const c = cfg.company;
write(
  "llms.txt",
  `# ${site.name}

> ${site.regionText} 지역 청소 업체. ${services.map((s) => s.name).join(", ")}. ${txt(cfg.tagline)}.

## 회사 소개
- 상호: ${site.name}
- 대표자: ${txt(c.owner)}
- 주소: ${txt(c.address)}
- 사업자등록번호: ${txt(c.bizNo)} / 통신판매업 신고번호: ${txt(c.mailOrderNo)}
- 약속: 모든 현장 동일 체크리스트·검수 순서, 고객 동반 검수, 작업 후 ${txt(cfg.asDays)}일 이내 A/S

## 서비스 지역
${cfg.region.districts.map((d) => `- ${txt(cfg.region.city)} ${txt(d)}`).join("\n")}
- ${txt(cfg.region.note)}

## 서비스와 요금
${services.map((s) => `- [${s.name}](${abs(`/services/${s.slug}/`)}): ${txt(s.priceFrom)} — ${s.short}`).join("\n")}
- 최종 금액은 평수·오염 정도·추가 항목을 확인한 뒤 확정

## 연락처
- 전화: ${site.phone}
- 카카오톡 채널: ${site.kakao}
- 상담 시간: ${txt(cfg.hours)}
- 견적 신청: ${abs("/quote/")}

## 더 보기
- [자주 묻는 질문](${abs("/faq/")})
- [고객후기](${abs("/reviews/")})
- [회사소개](${abs("/about/")})
`
);

// 5) www → non-www 301 리다이렉트 (Netlify 형식, Cloudflare Pages는 README 참고)
const host = site.domain.replace(/^https?:\/\//, "");
write("_redirects", `https://www.${host}/*  https://${host}/:splat  301!\nhttp://www.${host}/*  https://${host}/:splat  301!\n`);
write("_headers", `/assets/*\n  Cache-Control: public, max-age=2592000\n`);

// 6) 아직 채우지 않은 [TODO] 목록
const todos = new Set();
for (const f of ["site.config.mjs", "src/content.mjs"]) {
  for (const m of fs.readFileSync(path.join(root, f), "utf8").replace(/^\s*\/\/.*$/gm, "").matchAll(/\[TODO(?::([^\]]*))?\]/g)) todos.add(`${f}: ${m[1] || "TODO"}`);
}

console.log(`✔ ${preview ? "preview" : "dist"}/ 빌드 완료 · 페이지 ${pageList.length}개`);
console.log(`  남은 [TODO] ${todos.size}개 (자세한 목록: TODO.md)`);
if (cfg.draft) console.log("  ⚠ 시안 모드(draft: true) — 검색 노출 차단 중. 오픈 전 false로 바꾸세요.");
