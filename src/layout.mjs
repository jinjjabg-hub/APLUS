// 공통 레이아웃: <head>(SEO), 헤더, 푸터, 고정 퀵메뉴, 견적 폼
import cfg from "../site.config.mjs";
import { services } from "./content.mjs";

// ── 값 처리 도우미 ──────────────────────────────────────────
const TODO_RE = /\[TODO(?::([^\]]*))?\]/g;
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// 화면 표시용: [TODO:값] → 노란 형광펜
export const v = (s) => esc(s).replace(TODO_RE, (_, x) => `<span class="todo">${x ? x.trim() : "TODO"}</span>`);
// 텍스트용(메타태그·구조화 데이터): [TODO:값] → 값
export const txt = (s) => String(s).replace(TODO_RE, (_, x) => (x ? x.trim() : "")).replace(/\s+/g, " ").trim();
export const attr = (s) => esc(txt(s));

export const site = {
  name: txt(cfg.name),
  domain: txt(cfg.domain).replace(/\/$/, ""),
  phone: txt(cfg.phone),
  tel: "tel:" + txt(cfg.phone).replace(/[^0-9+]/g, ""),
  kakao: txt(cfg.kakaoChannel),
  regionShort: cfg.region.districts.map(txt).join("·"),
  regionText: `${txt(cfg.region.city)} ${cfg.region.districts.map(txt).join("·")}`,
};
export const regionHtml = `${v(cfg.region.city)} ${cfg.region.districts.map(v).join("·")}`;

// ── 링크 도우미 ─────────────────────────────────────────────
// 기본: /faq/ 처럼 깔끔한 주소. --preview: ../faq/index.html 처럼 더블클릭으로 열리는 상대주소.
let mode = { preview: false, page: "/" };
export const setPage = (page, preview) => (mode = { page, preview });
export const u = (path) => {
  if (!mode.preview || /^(https?:|tel:|sms:|mailto:|#)/.test(path)) return path;
  const [, p, rest = ""] = path.match(/^([^?#]*)(.*)$/);
  const depth = mode.page.split("/").filter(Boolean).length - (mode.page.endsWith("/") ? 0 : 1);
  let rel = "../".repeat(depth) + p.replace(/^\//, "");
  if (rel === "" || rel.endsWith("/")) rel += "index.html";
  return rel + rest;
};
export const abs = (path) => site.domain + path;

// ── 아이콘 (인라인 SVG, 외부 요청 없음) ─────────────────────
export const icon = {
  phone: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>`,
  chat: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.8 5.3 4.6 6.7L5.6 21l4-2.6c.8.1 1.6.2 2.4.2 5.5 0 10-3.6 10-8S17.5 3 12 3z"/></svg>`,
  doc: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5M8 12h8M8 16h8M8 8h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  check: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  logo: `<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#0f5e63"/><path d="M16 6l2.4 6.6L25 15l-6.6 2.4L16 24l-2.4-6.6L7 15l6.6-2.4z" fill="#b8f0d8"/></svg>`,
};

// ── <head> ──────────────────────────────────────────────────
export function head({ title, description, path, jsonld = [] }) {
  const url = abs(path);
  const og = abs("/assets/og.png");
  const ver = cfg.verification;
  const ld = jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n");
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
${cfg.draft ? `<meta name="robots" content="noindex, nofollow"><!-- 시안 모드: 오픈 시 site.config.mjs의 draft를 false로 -->` : `<meta name="robots" content="index, follow, max-image-preview:large">`}
${ver.naver ? `<meta name="naver-site-verification" content="${esc(ver.naver)}">` : `<!-- [TODO] 네이버 사이트 인증: site.config.mjs > verification.naver -->`}
${ver.google ? `<meta name="google-site-verification" content="${esc(ver.google)}">` : `<!-- [TODO] 구글 사이트 인증: site.config.mjs > verification.google -->`}
<meta property="og:type" content="website">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(og)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(site.name + " · " + site.regionText + " 청소")}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0f5e63">
<link rel="icon" href="${u("/assets/favicon.svg")}" type="image/svg+xml">
<link rel="stylesheet" href="${u("/assets/style.css")}">
${ld}
</head>`;
}

// ── 헤더 / 푸터 / 퀵메뉴 ───────────────────────────────────
export function header() {
  const nav = [
    ["/#services", "서비스"],
    ["/reviews/", "고객후기"],
    ["/faq/", "자주 묻는 질문"],
    ["/about/", "회사소개"],
  ];
  return `<body>
${cfg.draft ? `<div class="draft-bar">시안입니다 · <span class="todo">노란 표시</span>는 실제 정보로 바뀔 자리예요</div>` : ""}
<a class="skip" href="#main">본문 바로가기</a>
<header class="site-header">
  <div class="wrap header-in">
    <a class="brand" href="${u("/")}">${icon.logo}<span>${v(cfg.name)}</span></a>
    <nav class="nav" aria-label="주요 메뉴">
      ${nav.map(([h, t]) => `<a href="${u(h)}">${t}</a>`).join("")}
      <a class="btn btn-sm" href="${u("/quote/")}">견적 신청</a>
    </nav>
    <details class="mnav">
      <summary aria-label="메뉴 열기"><span></span><span></span><span></span></summary>
      <div class="mnav-panel">
        ${services.map((s) => `<a href="${u(`/services/${s.slug}/`)}">${s.name}</a>`).join("")}
        <hr>
        ${nav.slice(1).map(([h, t]) => `<a href="${u(h)}">${t}</a>`).join("")}
        <a class="btn" href="${u("/quote/")}">견적 신청</a>
      </div>
    </details>
  </div>
</header>
<main id="main">`;
}

export function quickMenu() {
  return `<nav class="quick" aria-label="빠른 문의">
  <a href="${site.tel}" class="q-call">${icon.phone}<span>전화</span></a>
  <a href="${esc(site.kakao)}" class="q-kakao" target="_blank" rel="noopener">${icon.chat}<span>카톡</span></a>
  <a href="${u("/quote/")}" class="q-quote">${icon.doc}<span>견적</span></a>
</nav>`;
}

export function footer() {
  const c = cfg.company;
  return `</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="f-top">
      <div>
        <a class="brand" href="${u("/")}">${icon.logo}<span>${v(cfg.name)}</span></a>
        <p class="f-region">서비스 지역: ${regionHtml}</p>
        <p>${v(cfg.hours)} · <a href="${site.tel}">${v(cfg.phone)}</a></p>
      </div>
      <nav class="f-links" aria-label="하단 메뉴">
        ${services.map((s) => `<a href="${u(`/services/${s.slug}/`)}">${s.name}</a>`).join("")}
        <a href="${u("/quote/")}">견적 신청</a>
        <a href="${u("/reviews/")}">고객후기</a>
        <a href="${u("/faq/")}">자주 묻는 질문</a>
        <a href="${u("/about/")}">회사소개</a>
      </nav>
    </div>
    <dl class="biz">
      <div><dt>상호</dt><dd>${v(cfg.name)}</dd></div>
      <div><dt>대표자</dt><dd>${v(c.owner)}</dd></div>
      <div><dt>주소</dt><dd>${v(c.address)}</dd></div>
      <div><dt>사업자등록번호</dt><dd>${v(c.bizNo)}</dd></div>
      <div><dt>통신판매업 신고번호</dt><dd>${v(c.mailOrderNo)}</dd></div>
      <div><dt>이메일</dt><dd>${v(c.email)}</dd></div>
    </dl>
    <p class="copy">© ${new Date().getFullYear()} ${v(cfg.name)}</p>
  </div>
</footer>
${quickMenu()}
<script>window.SITE=${JSON.stringify({ name: site.name, phone: site.phone, kakao: site.kakao, kakaoOn: cfg.quote.kakao, smsOn: cfg.quote.sms, svc: Object.fromEntries(services.map((s) => [s.slug, s.name])) })};</script>
<script src="${u("/assets/main.js")}" defer></script>
</body>
</html>`;
}

// ── 견적 폼 (서비스 → 공간 → 일정 → 연락처) ────────────────
// 접수: 입력 내용을 정리해 ① 복사 후 카카오톡 채널 대화창 열기 ② 문자앱에 채워서 열기
export function quoteForm({ preset = "" } = {}) {
  const chip = (name, value, label, checked = false, type = "radio") =>
    `<label class="chip"><input type="${type}" name="${name}" value="${esc(value)}"${checked ? " checked" : ""}><span>${label}</span></label>`;
  const today = new Date().toISOString().slice(0, 10);
  return `<form class="qform" id="qform" novalidate>
  <ol class="q-progress" aria-hidden="true"><li class="on">서비스</li><li>공간</li><li>일정</li><li>연락처</li></ol>

  <fieldset class="q-step on" data-step="1">
    <legend><b>1/4</b> 어떤 청소가 필요하세요?</legend>
    <div class="chips">${services.map((s) => chip("service", s.name, s.name, s.slug === preset)).join("")}</div>
    <p class="q-err" hidden>서비스를 골라 주세요.</p>
  </fieldset>

  <fieldset class="q-step" data-step="2">
    <legend><b>2/4</b> 어떤 공간인가요?</legend>
    <div class="chips">${["아파트", "빌라", "오피스텔", "단독주택", "사무실·상가"].map((t) => chip("space", t, t)).join("")}</div>
    <label class="field"><span>평수 또는 대수</span><input name="size" placeholder="예: 32평 / 벽걸이 2대" autocomplete="off"></label>
    <div class="field"><span>오염 정도</span><div class="chips">${["보통", "심한 편", "잘 모르겠어요"].map((t, i) => chip("dirt", t, t, i === 0)).join("")}</div></div>
    <p class="q-err" hidden>공간 종류를 골라 주세요.</p>
  </fieldset>

  <fieldset class="q-step" data-step="3">
    <legend><b>3/4</b> 언제가 좋으세요?</legend>
    <label class="field"><span>희망 날짜</span><input type="date" name="date" min="${today}"></label>
    <div class="field"><span>시간대</span><div class="chips">${["오전", "오후", "상관없음"].map((t, i) => chip("time", t, t, i === 2)).join("")}</div></div>
    <label class="check"><input type="checkbox" name="flex" value="1"> 날짜 조정 가능해요</label>
  </fieldset>

  <fieldset class="q-step" data-step="4">
    <legend><b>4/4</b> 연락받을 곳을 알려 주세요</legend>
    <label class="field"><span>성함</span><input name="name" autocomplete="name" placeholder="홍길동"></label>
    <label class="field"><span>연락처 <em>필수</em></span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" required></label>
    <label class="field"><span>지역</span><select name="area">${cfg.region.districts.map((d) => `<option>${esc(txt(cfg.region.city) + " " + txt(d))}</option>`).join("")}<option>그 외 지역</option></select></label>
    <label class="field"><span>요청 사항</span><textarea name="memo" rows="3" placeholder="예: 베란다 확장형, 붙박이장 많음, 사진 따로 보낼게요"></textarea></label>
    <label class="check"><input type="checkbox" name="agree" value="1" required><span>상담을 위한 개인정보(성함·연락처·지역) 수집에 동의합니다. <small>상담 후 <span class="todo">보관 기간</span> 뒤 파기</small></span></label>
    <p class="q-err" hidden>연락처와 동의 항목을 확인해 주세요.</p>
  </fieldset>

  <div class="q-nav">
    <button type="button" class="btn btn-ghost" data-prev hidden>이전</button>
    <button type="button" class="btn" data-next>다음</button>
    <div class="q-send" hidden>
      ${cfg.quote.kakao ? `<button type="button" class="btn btn-kakao" data-send="kakao">${icon.chat} 카카오톡으로 보내기</button>` : ""}
      ${cfg.quote.sms ? `<button type="button" class="btn btn-ghost" data-send="sms">${icon.phone} 문자로 보내기</button>` : ""}
    </div>
  </div>
  <div class="q-done" hidden role="status">
    <p><b>문의 내용이 복사됐어요.</b> 열린 카카오톡 대화창에 <b>붙여넣기</b> 후 보내 주세요.</p>
    <textarea readonly rows="7" aria-label="문의 내용"></textarea>
  </div>
  <noscript><p class="q-err">견적 폼은 자바스크립트가 필요해요. <a href="${site.tel}">전화</a>로 문의해 주세요.</p></noscript>
</form>`;
}

// 전후 사진 자리 (실제 사진이 생기면 교체)
export function photoSlots(list) {
  return `<div class="ba-grid">${list
    .map(
      (label) => `<figure class="ba">
    <div class="ba-pair">
      <div class="slot"><b>BEFORE</b><span>사진 자리</span></div>
      <div class="slot"><b>AFTER</b><span>사진 자리</span></div>
    </div>
    <figcaption>${v(label)}</figcaption>
    <!-- [TODO] 실제 사진으로 교체: README의 "사진 넣는 법" 참고 -->
  </figure>`
    )
    .join("")}</div>`;
}

export function ctaBand(title = "사진 몇 장이면 견적이 빨라져요") {
  return `<section class="cta-band">
  <div class="wrap">
    <h2>${title}</h2>
    <p>공간 사진을 카톡으로 보내 주시면 오염 정도를 보고 더 정확하게 안내드립니다.</p>
    <div class="cta-row">
      <a class="btn btn-light" href="${site.tel}">${icon.phone} 전화 상담</a>
      <a class="btn btn-kakao" href="${esc(site.kakao)}" target="_blank" rel="noopener">${icon.chat} 카톡 상담</a>
      <a class="btn btn-outline-light" href="${u("/quote/")}">${icon.doc} 견적 신청</a>
    </div>
  </div>
</section>`;
}
