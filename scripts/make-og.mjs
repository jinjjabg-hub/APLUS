// 공유 미리보기(OG) 이미지 1200×630 생성: node scripts/make-og.mjs
// 업체명·지역을 바꾼 뒤 한 번 다시 실행하세요. (Playwright 필요: npm i -D playwright)
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import path from "node:path";
import { fileURLToPath } from "node:url";
import cfg from "../site.config.mjs";
import { site, txt, icon } from "../src/layout.mjs";
import { perPyeong } from "../src/content.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const html = `<html><body style="margin:0;width:1200px;height:630px;font-family:'Noto Sans CJK KR','Noto Sans KR',sans-serif;background:radial-gradient(circle at 85% 20%,#134e4a 0,#0f172a 55%);display:flex;flex-direction:column;justify-content:center;padding:0 90px;box-sizing:border-box;color:#fff">
<div style="display:flex;align-items:center;gap:18px;font-size:40px;font-weight:800"><span style="width:72px;height:72px;display:block">${icon.logo}</span>${site.name}<span style="font-size:26px;color:#94a3b8;font-weight:500">${txt(cfg.subName)}</span></div>
<div style="font-size:64px;font-weight:800;line-height:1.25;margin:40px 0 30px;letter-spacing:-1px">${site.region} 입주·이사청소<br><span style="color:#5eead4">새 집의 첫 공기까지</span></div>
<div style="font-size:30px;color:#fbbf24;font-weight:700">${txt(cfg.priceBasis)} ${perPyeong} · 직영팀 시공 · 고객 동행 검수</div>
</body></html>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html);
await p.screenshot({ path: path.join(root, "src/assets/og.jpg"), type: "jpeg", quality: 82 });
await b.close();
console.log("✔ src/assets/og.jpg 생성");
