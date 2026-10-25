// 첫 화면 영상 압축: npm run video -- 원본.mp4 [시작초] [길이초]
//   예) npm run video -- ~/Downloads/현장영상.mov 3 12   → 3초부터 12초 분량
// 결과: src/assets/hero.mp4 (PC, 가로 1280px) · hero-m.mp4 (모바일, 세로 720×1280) · hero-poster.webp (첫 장면)
// 필요: ffmpeg (맥: brew install ffmpeg / 윈도우: winget install ffmpeg)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const [src, start = "0", dur = "12"] = process.argv.slice(2);
if (!src || !fs.existsSync(src)) {
  console.error("사용법: npm run video -- 원본영상파일 [시작초] [길이초]");
  process.exit(1);
}
const out = (f) => path.join(root, "src/assets", f);
const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", start, "-t", dur, "-i", src, ...args], { stdio: "inherit" });
// 소리 제거, 웹 재생용 H.264, 첫 프레임 바로 재생(faststart)
const common = ["-an", "-c:v", "libx264", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-r", "30"];

ff(["-vf", "scale=1280:-2", "-crf", "27", "-maxrate", "2M", "-bufsize", "4M", ...common, out("hero.mp4")]);
ff(["-vf", "crop='min(iw,ih*9/16)':ih,scale=720:1280", "-crf", "29", "-maxrate", "1.2M", "-bufsize", "2.4M", ...common, out("hero-m.mp4")]);
ff(["-frames:v", "1", "-vf", "scale=1280:-2", "-c:v", "libwebp", "-quality", "70", out("hero-poster.webp")]);

for (const f of ["hero.mp4", "hero-m.mp4", "hero-poster.webp"]) {
  console.log(`✔ src/assets/${f}  ${(fs.statSync(out(f)).size / 1024).toFixed(0)}KB`);
}
console.log("다음: npm run build (또는 git에 올리면 자동 배포)");
