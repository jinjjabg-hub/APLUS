// 점검: ① 깨진 내부 링크 ② 페이지별 용량(HTML+CSS+JS+이미지)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), "dist");
const htmls = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".html")) htmls.push(p);
  }
})(dir);

const resolve = (from, ref) => {
  const clean = ref.split(/[?#]/)[0];
  if (!clean) return from;
  let p = clean.startsWith("/") ? path.join(dir, clean) : path.join(path.dirname(from), clean);
  if (clean.endsWith("/")) p = path.join(p, "index.html");
  return p;
};

let broken = 0;
const rows = [];
for (const file of htmls) {
  const html = fs.readFileSync(file, "utf8");
  const code = html.replace(/<!--[\s\S]*?-->/g, "");
  const refs = [...code.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]).filter((r) => !/^(https?:|tel:|sms:|mailto:|#|data:)/.test(r));
  const assets = new Set();
  for (const r of refs) {
    const target = resolve(file, r);
    if (!fs.existsSync(target)) { broken++; console.log(`✘ 깨진 링크: ${path.relative(dir, file)} → ${r}`); }
    else if (/\.(css|js|svg|png|webp|jpe?g|woff2|mp4|webm)$/.test(target)) assets.add(target);
  }
  const htmlKB = Buffer.byteLength(html) / 1024;
  const assetKB = [...assets].reduce((s, a) => s + fs.statSync(a).size / 1024, 0);
  rows.push([path.relative(dir, file), htmlKB, assetKB]);
}

console.log("\n페이지                         HTML(KB)  CSS·JS·이미지(KB)  합계(KB)");
for (const [f, h, a] of rows) console.log(`${f.padEnd(30)} ${h.toFixed(1).padStart(8)} ${a.toFixed(1).padStart(18)} ${(h + a).toFixed(1).padStart(9)}`);
const og = fs.statSync(path.join(dir, "assets/og.png")).size / 1024;
console.log(`\n(참고) 공유용 OG 이미지 og.png ${og.toFixed(1)}KB — 페이지 로딩에는 포함되지 않음`);
console.log(broken ? `\n✘ 깨진 링크 ${broken}개` : "\n✔ 깨진 내부 링크 없음");
process.exit(broken ? 1 : 0);
