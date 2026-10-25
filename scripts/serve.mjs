// 로컬 미리보기 서버: node scripts/serve.mjs → http://localhost:4000
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), "dist");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".woff2": "font/woff2" };
const port = Number(process.env.PORT) || 4000;

http
  .createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    let f = path.join(dir, p);
    if (!f.startsWith(dir) || !fs.existsSync(f)) {
      res.writeHead(404, { "content-type": types[".html"] });
      return res.end(fs.readFileSync(path.join(dir, "404.html")));
    }
    if (fs.statSync(f).isDirectory()) {
      res.writeHead(301, { location: p + "/" });
      return res.end();
    }
    res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  })
  .listen(port, () => console.log(`미리보기: http://localhost:${port}  (끄려면 Ctrl+C)`));
