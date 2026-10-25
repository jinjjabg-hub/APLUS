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

const R = cfg.region;
export const site = {
  name: txt(cfg.name),
  domain: txt(cfg.domain).replace(/\/$/, ""),
  phone: txt(cfg.phone),
  tel: "tel:" + txt(cfg.phone).replace(/[^0-9+]/g, ""),
  kakao: txt(cfg.kakaoChannel),
  region: R.label, // "부산·경남"
  areaList: R.areas.flatMap((a) => a.parts.map((p) => `${a.name} ${p}`)), // "부산 해운대구" …
};
export const regionSummary = R.areas.map((a) => (a.parts.length > 6 ? `${a.name} ${a.parts.length}개 구·군 전 지역` : `${a.name} ${a.parts.join("·")}`)).join(" · ");
export const areaServed = () => R.areas.flatMap((a) => a.parts.map((p) => ({ "@type": "AdministrativeArea", name: `${a.full} ${p}` })));
export const tagline = (s) => v(s).replace(/\{([^}]+)\}/g, '<em>$1</em>');
export const taglineText = (s) => txt(s).replace(/[{}]/g, "");

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
const ic = (d, extra = "") => `<svg viewBox="0 0 24 24" aria-hidden="true"${extra}>${d}</svg>`;
const line = (d) => ic(`<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`);
export const icon = {
  phone: ic(`<path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/>`),
  chat: ic(`<path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.8 5.3 4.6 6.7L5.6 21l4-2.6c.8.1 1.6.2 2.4.2 5.5 0 10-3.6 10-8S17.5 3 12 3z"/>`),
  doc: line("M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5M8 12h8M8 16h8M8 8h4"),
  check: ic(`<path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`),
  x: ic(`<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`),
  arrow: line("M5 12h14M13 6l6 6-6 6"),
  pin: line("M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"),
  team: line("M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 10v-1a6 6 0 0 1 12 0v1m3-10a3 3 0 1 0 0-6m5 16v-1a5 5 0 0 0-4-4.9"),
  shield: line("M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zm-3.5 9l2.5 2.5 4.5-5"),
  coin: line("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm-3-7.5h6M9 10h6m-4.5-3l1.5 3 1.5-3M12 10v7"),
  leaf: line("M5 19c0-8 6-14 15-14 0 9-6 15-14 15M5 19l7-7"),
  logo: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="#0f766e"/><path d="M11.5 28 18 11h4l6.5 17h-4.2l-1.3-3.7h-6.1L15.6 28zm6.3-7h4.2L20 14.9z" fill="#fff"/><path d="M30 9.5v7M26.5 13h7" stroke="#fbbf24" stroke-width="2.6" stroke-linecap="round"/></svg>`,
};

// ── <head> ──────────────────────────────────────────────────
export function head({ title, description, path, jsonld = [] }) {
  const url = abs(path);
  const og = abs("/assets/og.jpg");
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
<meta property="og:image:alt" content="${esc(site.name + " · " + site.region + " 입주청소·이사청소")}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0f172a">
<link rel="icon" href="${u("/assets/favicon.svg")}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap">
<link rel="stylesheet" href="${u("/assets/style.css")}">
${ld}
</head>`;
}

// ── 헤더 / 푸터 / 퀵메뉴 ───────────────────────────────────
const brand = () => `<a class="brand" href="${u("/")}">${icon.logo}<span><b>${v(cfg.name)}</b><small>${v(cfg.subName)}</small></span></a>`;

export function header() {
  const nav = [
    ["/#services", "서비스 안내"],
    ["/services/move-in/", "입주청소"],
    ["/reviews/", "시공사례·후기"],
    ["/faq/", "자주 묻는 질문"],
    ["/about/", "회사소개"],
  ];
  return `<body>
${cfg.draft ? `<div class="draft-bar">시안입니다 · <span class="todo">노란 표시</span>는 실제 정보로 바뀔 자리예요</div>` : ""}
<a class="skip" href="#main">본문 바로가기</a>
<header class="site-header">
  <div class="wrap header-in">
    ${brand()}
    <nav class="nav" aria-label="주요 메뉴">
      ${nav.map(([h, t]) => `<a href="${u(h)}">${t}</a>`).join("")}
    </nav>
    <div class="h-cta">
      <a class="h-tel" href="${site.tel}"><small>전화문의 (${v(cfg.hours)})</small><b>${v(cfg.phone)}</b></a>
      <a class="btn btn-sm" href="${u("/quote/")}">무료 견적 신청</a>
    </div>
    <details class="mnav">
      <summary aria-label="메뉴 열기"><span></span><span></span><span></span></summary>
      <div class="mnav-panel">
        ${services.map((s) => `<a href="${u(`/services/${s.slug}/`)}">${s.name}</a>`).join("")}
        <hr>
        ${nav.slice(2).map(([h, t]) => `<a href="${u(h)}">${t}</a>`).join("")}
        <a class="btn" href="${u("/quote/")}">무료 견적 신청</a>
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
        ${brand()}
        <p class="f-region">서비스 지역: ${regionSummary}</p>
        <p>고객센터 <a href="${site.tel}">${v(cfg.phone)}</a> · ${v(cfg.hours)}</p>
      </div>
      <nav class="f-links" aria-label="하단 메뉴">
        ${services.map((s) => `<a href="${u(`/services/${s.slug}/`)}">${s.name}</a>`).join("")}
        <a href="${u("/quote/")}">견적 신청</a>
        <a href="${u("/reviews/")}">시공사례·후기</a>
        <a href="${u("/faq/")}">자주 묻는 질문</a>
        <a href="${u("/about/")}">회사소개</a>
      </nav>
    </div>
    <dl class="biz">
      <div><dt>상호</dt><dd>${v(cfg.name)} (${v(cfg.subName.split("|")[0].trim())})</dd></div>
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
<script>window.SITE=${JSON.stringify({ name: site.name, phone: site.phone, kakao: site.kakao, rate: cfg.pricePerPyeong, perPyeong: ["입주청소", "이사청소", "올인원 패키지"], svc: Object.fromEntries(services.map((s) => [s.slug, s.name])) })};</script>
<script src="${u("/assets/main.js")}" defer></script>
</body>
</html>`;
}

// ── 견적 폼 (서비스 → 공간 → 일정 → 연락처) ────────────────
// 접수: 입력 내용을 정리해 ① 복사 후 카카오톡 채널 대화창 열기 ② 문자앱에 채워서 열기
export function quoteForm() {
  const chip = (name, value, label = value, checked = false, type = "radio") =>
    `<label class="chip"><input type="${type}" name="${name}" value="${esc(value)}"${checked ? " checked" : ""}><span>${label}</span></label>`;
  const today = new Date().toISOString().slice(0, 10);
  const options = [
    ...services.map((s) => [s.name, s.priceFrom]),
    ["올인원 패키지", "청소+탄성+줄눈+새집증후군"],
  ];
  const addons = ["탄성코트", "줄눈 시공", "새집증후군 케어", "매트리스 살균", "욕실 나노코팅", "시스템에어컨 분해세척"];
  return `<form class="qform" id="qform" novalidate>
  <ol class="q-progress" aria-hidden="true"><li class="on">서비스</li><li>공간</li><li>일정·지역</li><li>연락처</li></ol>

  <div class="q-calc" aria-live="polite">
    <span>예상 기본 금액</span>
    <strong><b data-calc-sum>-</b><small data-calc-unit></small></strong>
    <p data-calc-note>입주·이사청소를 고르면 평수로 바로 계산돼요.</p>
  </div>

  <fieldset class="q-step on" data-step="1">
    <legend><b>1</b> 어떤 서비스가 필요하세요?</legend>
    <div class="opt-grid">${options
      .map(([n, p], i) => `<label class="opt"><input type="radio" name="service" value="${esc(n)}"><span><b>${n}</b><small>${v(p)}</small></span></label>`)
      .join("")}</div>
    <div class="field"><span>추가 시공 (선택)</span><div class="chips">${addons.map((a) => chip("addon", a, a, false, "checkbox")).join("")}</div></div>
    <p class="q-err" hidden>서비스를 골라 주세요.</p>
  </fieldset>

  <fieldset class="q-step" data-step="2">
    <legend><b>2</b> 어떤 공간인가요?</legend>
    <div class="field"><span>건물 형태</span><div class="chips">${["아파트", "오피스텔", "빌라·주택", "상가·사무실"].map((t) => chip("space", t)).join("")}</div></div>
    <div class="field"><span>베란다</span><div class="chips">${["확장형", "비확장형", "모름"].map((t, i) => chip("balcony", t, t, i === 0)).join("")}</div></div>
    <div class="field">
      <span>공급 평수 <small class="muted">관리비 고지서의 공급면적 ÷ 3.3</small></span>
      <div class="pyeong"><input type="range" name="pyeongRange" min="10" max="80" value="34" aria-label="평수 슬라이더"><label><input type="number" name="pyeong" min="1" max="300" value="34" inputmode="numeric"> 평</label></div>
      <p class="muted" data-m2></p>
    </div>
    <div class="field"><span>특이사항</span><div class="chips">${["복층 구조", "테라스·옥상 있음", "반려동물 거주", "오염 심한 편"].map((t) => chip("extra", t, t, false, "checkbox")).join("")}</div></div>
    <p class="q-err" hidden>건물 형태를 골라 주세요.</p>
  </fieldset>

  <fieldset class="q-step" data-step="3">
    <legend><b>3</b> 언제, 어디서 하시나요?</legend>
    <label class="field"><span>희망 날짜</span><input type="date" name="date" min="${today}"></label>
    <p class="muted">이사 당일 작업은 이삿짐 입출고 시간을 확인하고 신청해 주세요.</p>
    <div class="field"><span>시간대</span><div class="chips">${["오전", "오후", "상관없음"].map((t, i) => chip("time", t, t, i === 2)).join("")}</div></div>
    <label class="field"><span>지역</span><select name="area">${R.areas
      .map((a) => `<optgroup label="${a.name}">${a.parts.map((p) => `<option>${a.name} ${p}</option>`).join("")}</optgroup>`)
      .join("")}<option>그 외 지역</option></select></label>
    <label class="field"><span>아파트 단지명 또는 건물명</span><input name="building" placeholder="예: 명지 OO아파트 102동" autocomplete="off"></label>
  </fieldset>

  <fieldset class="q-step" data-step="4">
    <legend><b>4</b> 연락받을 곳을 알려 주세요</legend>
    <label class="field"><span>성함</span><input name="name" autocomplete="name" placeholder="홍길동"></label>
    <label class="field"><span>휴대폰 번호 <em>필수</em></span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" required></label>
    <label class="field"><span>요청 사항</span><textarea name="memo" rows="3" placeholder="예: 욕실 실리콘 곰팡이가 심해요, 붙박이장이 방마다 있어요"></textarea></label>
    <label class="check"><input type="checkbox" name="agree" value="1" required><span>견적 안내를 위한 개인정보(성함·연락처·지역) 수집에 동의합니다. <small>상담과 시공이 끝나면 <span class="todo">보관 기간</span> 뒤 파기합니다.</small></span></label>
    <p class="q-err" hidden>휴대폰 번호와 동의 항목을 확인해 주세요.</p>
  </fieldset>

  <div class="q-nav">
    <button type="button" class="btn btn-ghost" data-prev hidden>이전</button>
    <button type="button" class="btn" data-next>다음 ${icon.arrow}</button>
    <div class="q-send" hidden>
      ${cfg.quote.kakao ? `<button type="button" class="btn btn-kakao" data-send="kakao">${icon.chat} 카카오톡으로 견적 받기</button>` : ""}
      ${cfg.quote.sms ? `<button type="button" class="btn btn-ghost" data-send="sms">${icon.phone} 문자로 보내기</button>` : ""}
    </div>
  </div>
  <p class="q-trust">${icon.shield} 상담 신청 후 영업 전화는 하지 않아요. 요청하신 방식으로만 안내드립니다.</p>
  <div class="q-done" hidden role="status">
    <p><b>문의 내용이 복사됐어요.</b> 열린 카카오톡 대화창에 <b>붙여넣기</b> 후 보내 주세요.</p>
    <textarea readonly rows="8" aria-label="문의 내용"></textarea>
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
      <div class="slot"><b>BEFORE</b><span>실제 현장 사진 자리</span></div>
      <div class="slot"><b>AFTER</b><span>실제 현장 사진 자리</span></div>
    </div>
    <figcaption>${v(label)}</figcaption>
    <!-- [TODO] 실제 사진으로 교체: README의 "사진 넣는 법" 참고 -->
  </figure>`
    )
    .join("")}</div>`;
}

export function ctaBand(title = "사진 한 장이면 견적이 빨라져요") {
  return `<section class="cta-band">
  <div class="wrap">
    <div>
      <p class="eyebrow-dark">1분 사진 견적</p>
      <h2>${title}</h2>
      <p>창틀이나 주방 사진을 카톡으로 보내 주시면, 추가금 없는 견적과 가능한 일정을 바로 안내드립니다.</p>
    </div>
    <div class="cta-row">
      <a class="btn btn-kakao" href="${esc(site.kakao)}" target="_blank" rel="noopener">${icon.chat} 카톡으로 사진 보내기</a>
      <a class="btn btn-light" href="${site.tel}">${icon.phone} 전화 상담</a>
      <a class="btn btn-outline-light" href="${u("/quote/")}">${icon.doc} 견적 신청</a>
    </div>
  </div>
</section>`;
}
