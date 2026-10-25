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
const html = `<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500;700&display=swap"></head><body style="margin:0;width:1200px;height:630px;font-family:'Noto Sans CJK KR',sans-serif;background:radial-gradient(60% 70% at 85% 20%,rgba(20,144,127,.45),transparent 70%),radial-gradient(40% 50% at 10% 90%,rgba(217,154,43,.18),transparent 70%),#0b1513;display:flex;flex-direction:column;justify-content:space-between;padding:70px 90px;box-sizing:border-box;color:#fff">
<div style="display:flex;align-items:center;gap:16px;font-size:30px;font-family:'Noto Serif KR',serif;font-weight:700"><span style="width:52px;height:52px;display:block;color:#fff">${icon.logo}</span>${site.name}</div>
<div><div style="font-size:26px;letter-spacing:6px;color:rgba(255,255,255,.7);margin-bottom:18px">${site.region} 입주청소 · 이사청소</div>
<div style="font-family:'Noto Serif KR',serif;font-weight:500;font-size:96px;line-height:1.05;letter-spacing:-4px">새 집의 첫 공기까지</div></div>
<div style="font-size:26px;color:rgba(255,255,255,.75);border-top:1px solid rgba(255,255,255,.25);padding-top:22px">${txt(cfg.priceBasis)} ${perPyeong} · 직영팀 시공 · 고객 동행 검수</div>
</body></html>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html, { waitUntil: "networkidle" });
await p.screenshot({ path: path.join(root, "src/assets/og.jpg"), type: "jpeg", quality: 82 });
await b.close();
console.log("✔ src/assets/og.jpg 생성");
