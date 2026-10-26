// 글꼴 다시 만들기: npm run fonts
// fonts-src/ 의 원본 글꼴에서 "자주 쓰는 한글 2,350자 + 사이트에 실제 쓰인 글자 + 영문·기호"만 남겨
// src/assets/fonts/ 에 웹용(WOFF2)으로 저장합니다. 문구를 많이 바꾼 뒤 한 번 실행하세요.
// 필요: Python + fonttools (pip install fonttools brotli)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const chars = new Set();
// KS X 1001 완성형 한글 2,350자 (EUC-KR 2바이트로 표현되는 글자)
const dec = new TextDecoder("euc-kr");
for (let hi = 0xb0; hi <= 0xc8; hi++) for (let lo = 0xa1; lo <= 0xfe; lo++) chars.add(dec.decode(new Uint8Array([hi, lo])));
// 사이트 문구에 실제 쓰인 글자
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
for (const f of ["site.config.mjs", ...walk(path.join(root, "src")).filter((f) => /\.(mjs|js|css)$/.test(f)).map((f) => path.relative(root, f))]) {
  for (const c of fs.readFileSync(path.join(root, f), "utf8")) chars.add(c);
}
for (let c = 0x20; c < 0x7f; c++) chars.add(String.fromCharCode(c));
for (const c of "·~㎡—–’‘“”→←‹›…×%℃•°") chars.add(c);
const text = [...chars].filter((c) => /\P{C}/u.test(c)).join("");
const tmp = path.join(os.tmpdir(), "aplus-subset.txt");
fs.writeFileSync(tmp, text);

const jobs = [
  ["Paperlogy-5Medium", "paperlogy"], ["Paperlogy-7Bold", "paperlogy"], ["Paperlogy-8ExtraBold", "paperlogy"],
  ["Pretendard-Regular", "pretendard"], ["Pretendard-SemiBold", "pretendard"],
];
for (const [name, dir] of jobs) {
  const out = path.join(root, "src/assets/fonts", dir, `${name}.woff2`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execFileSync("pyftsubset", [path.join(root, "fonts-src", `${name}.woff2`), `--text-file=${tmp}`, "--flavor=woff2", "--layout-features=*", "--name-IDs=*", `--output-file=${out}`], { stdio: ["ignore", "ignore", "inherit"] });
  console.log(`✔ ${dir}/${name}.woff2  ${(fs.statSync(out).size / 1024).toFixed(0)}KB`);
}
console.log(`글자 ${chars.size}개 포함`);
