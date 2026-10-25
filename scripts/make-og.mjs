// 공유 미리보기(OG) 이미지 1200×630 생성: node scripts/make-og.mjs
// 업체명·지역을 바꾼 뒤 한 번 다시 실행하세요. (Playwright 필요: npm i -D playwright)
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import path from "node:path";
import { fileURLToPath } from "node:url";
import cfg from "../site.config.mjs";
import { site, txt } from "../src/layout.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const html = `<html><body style="margin:0;width:1200px;height:630px;font-family:'Noto Sans CJK KR','Noto Sans KR',sans-serif;background:linear-gradient(150deg,#eaf8f1,#fff 60%);display:flex;flex-direction:column;justify-content:center;padding:0 90px;box-sizing:border-box;color:#17252a">
<div style="display:flex;align-items:center;gap:18px;font-size:44px;font-weight:800"><svg width="64" height="64" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#0f5e63"/><path d="M16 6l2.4 6.6L25 15l-6.6 2.4L16 24l-2.4-6.6L7 15l6.6-2.4z" fill="#b8f0d8"/></svg>${site.name}</div>
<div style="font-size:60px;font-weight:800;line-height:1.25;margin:34px 0 26px;letter-spacing:-1px">${site.regionText}<br>입주·이사청소</div>
<div style="font-size:32px;color:#0f5e63;font-weight:700">${txt(cfg.priceAnchor)}부터 · 작업 후 ${txt(cfg.asDays)}일 이내 A/S · ${site.phone}</div>
</body></html>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html);
await p.screenshot({ path: path.join(root, "src/assets/og.png") });
await b.close();
console.log("✔ src/assets/og.png 생성");
