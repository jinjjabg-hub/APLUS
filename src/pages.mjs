// 페이지별 내용. 각 페이지는 { path, title, description, body, jsonld } 를 돌려줍니다.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cfg from "../site.config.mjs";
import { services, promises, equipment, steps, inspection, faqs, perPyeong } from "./content.mjs";
import { v, txt, site, regionSummary, areaServed, u, abs, icon, quoteForm, baSlider, ctaBand } from "./layout.mjs";

const R = cfg.region.label; // 부산·경남
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const asset = (p) => p && fs.existsSync(path.join(root, "src", p)) ? p : "";

// ── 구조화 데이터 ───────────────────────────────────────────
const bizId = () => abs("/#business");

const localBusiness = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": bizId(),
  name: site.name,
  alternateName: txt(cfg.subName).split("|").map((s) => s.trim()),
  description: `${R} 입주청소·이사청소·준공청소·상가 정기청소·탄성코트·줄눈·새집증후군 케어. 직영팀 시공, 고객 동행 검수. ${txt(cfg.priceBasis)} ${perPyeong}`,
  url: abs("/"),
  telephone: site.phone,
  email: txt(cfg.company.email),
  image: abs("/assets/og.jpg"),
  logo: abs("/assets/favicon.svg"),
  priceRange: perPyeong,
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "08:00",
    closes: "20:00",
  },
  address: { "@type": "PostalAddress", streetAddress: txt(cfg.company.address), addressRegion: "부산광역시", addressCountry: "KR" },
  areaServed: areaServed(),
  sameAs: [site.kakao],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "청소·시공 서비스",
    itemListElement: services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.name, url: abs(`/services/${s.slug}/`) },
      description: `${txt(s.priceFrom)} (${s.priceNote})`,
    })),
  },
});

const faqPage = (list) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  // 아직 답이 정해지지 않은([TODO]만 있는) 질문은 구조화 데이터에서 뺍니다.
  mainEntity: list
    .filter((f) => !/^\[TODO/.test(f.a))
    .map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: txt(f.a.replace(/\[TODO[^\]]*\]/g, "")) } })),
});

const crumbs = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [["홈", "/"], ...items].map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(p) })),
});

// ── 공통 조각 ───────────────────────────────────────────────
const crumbNav = (items) =>
  `<nav class="crumbs" aria-label="현재 위치"><a href="${u("/")}">홈</a>${items
    .map(([n, p], i) => (i === items.length - 1 ? ` <span>/</span> <b>${n}</b>` : ` <span>/</span> <a href="${u(p)}">${n}</a>`))
    .join("")}</nav>`;

const faqList = (list) => `<div class="faq">${list.map((f) => `<details><summary>${v(f.q)}</summary><p>${v(f.a)}</p></details>`).join("")}</div>`;

// 진행 과정: 한 줄로 이어지는 다섯 단어
const stepsLine = () =>
  `<ol class="flow">${steps.map((s) => `<li><b>${s.t}</b><p>${s.d}</p></li>`).join("")}</ol>`;

// 서비스 목록: 카드 대신 큰 글씨의 목록
const serviceIndex = (list = services, { pkg = true } = {}) => `<ul class="idx">
  ${list
    .map(
      (s) => `<li><a class="idx-row" href="${u(`/services/${s.slug}/`)}">
    <span class="idx-name">${s.name}</span>
    <span class="idx-q">${s.question}</span>
    <span class="idx-price">${v(s.priceFrom)}</span>
    <span class="idx-go" aria-hidden="true">${icon.arrow}</span>
  </a></li>`
    )
    .join("")}
  ${pkg ? `<li><a class="idx-row idx-pkg" href="${u("/quote/?service=package")}">
    <span class="idx-name">올인원 패키지</span>
    <span class="idx-q">입주청소·탄성코트·줄눈·새집증후군을 한 번에. 일정 조율은 저희가 합니다.</span>
    <span class="idx-price">맞춤 견적</span>
    <span class="idx-go" aria-hidden="true">${icon.arrow}</span>
  </a></li>` : ""}
</ul>`;

// 현장 검수표: 실제 종이 검수표처럼 (체크 칸은 눌러 볼 수 있음)
const sheet = (zones, title = "현장 검수표") => `<div class="sheet">
  <div class="sheet-head">
    <b>${v(cfg.name)} · ${title}</b>
    <span>현장 <i></i></span><span>일자 <i></i></span>
  </div>
  ${zones
    .map(
      ([z, items]) => `<div class="sheet-zone"><p class="sheet-z">${z}</p><ul>${items
        .map((i) => `<li><label><input type="checkbox"><span>${v(i)}</span></label></li>`)
        .join("")}</ul></div>`
    )
    .join("")}
  <div class="sheet-sign"><span>팀장 확인 <i></i></span><span>고객 확인 <i></i></span></div>
</div>`;

const regionText = () => `<div class="area">${cfg.region.areas
  .map((a) => `<div class="area-row"><h3>${a.name}</h3><p>${a.parts.join("<span>·</span>")}</p></div>`)
  .join("")}<p class="muted">${v(cfg.region.note)}</p></div>`;

// 입주·이사청소 평수 계산기 (메인 요금 섹션)
const priceBlock = () => `<section class="price" id="price">
  <div class="wrap price-in">
    <div class="price-big">
      <p class="label">입주청소 · 이사청소</p>
      <p class="num"><span>평당</span>${cfg.pricePerPyeong.toLocaleString("ko-KR")}<small>원부터</small></p>
      <ul class="price-notes">
        <li>${v(cfg.priceBasis)} · 관리비 고지서의 공급면적(㎡) ÷ 3.3</li>
        <li>베란다 확장, 오염 정도, 추가 시공에 따라 최종 금액 안내</li>
        <li>외창(바깥면 유리)은 안전상 기본 제외</li>
      </ul>
    </div>
    <div class="calc" data-rate="${cfg.pricePerPyeong}">
      <label for="calc-py">우리 집 공급 평수</label>
      <div class="calc-row"><input id="calc-py" type="range" min="10" max="70" value="34"><output><b>34</b>평</output></div>
      <p class="calc-sum"><b>442,000</b>원~</p>
      <p class="muted">기본 청소 기준 예상 금액이에요.</p>
      <a class="btn" data-calc-link href="${u("/quote/?service=move-in&py=34")}">이 평수로 견적 받기 ${icon.arrow}</a>
    </div>
  </div>
</section>`;

// ── 1. 메인 ─────────────────────────────────────────────────
function home() {
  const title = `${R} 입주청소·이사청소 | ${site.name}`;
  const description = `${R} 입주청소·이사청소·준공청소·상가 정기청소·탄성코트·줄눈·새집증후군 케어. ${txt(cfg.priceBasis)} ${perPyeong}, 직영팀 시공, 고객 동행 검수, ${txt(cfg.hours)} 상담.`;
  const hv = cfg.heroVideo;
  const vDesk = asset(hv.desktop), vMob = asset(hv.mobile), poster = asset(hv.poster);
  const video = vDesk
    ? `<video class="hv-video" autoplay muted loop playsinline preload="auto"${poster ? ` poster="${u(poster)}"` : ""} aria-hidden="true">
      ${vMob ? `<source src="${u(vMob)}" type="video/mp4" media="(max-width: 720px)">` : ""}
      <source src="${u(vDesk)}" type="video/mp4">
    </video>`
    : `${cfg.draft ? `<span class="hv-slot">대표 영상 자리 · src/assets/hero.mp4</span>` : ""}`;
  const body = `
<section class="hero-v">
  <div class="hv-bg" aria-hidden="true"></div>
  ${video}
  <div class="hv-shade" aria-hidden="true"></div>
  <div class="wrap hv-in">
    <p class="hv-kicker">${R} 입주청소 · 이사청소</p>
    <h1 class="hv-title">새 집의<br>첫 공기까지</h1>
    <p class="hv-lead">${v(cfg.intro)}</p>
    <div class="hv-actions">
      <a class="btn btn-light" href="#quote">무료 견적 받기 ${icon.arrow}</a>
      <a class="hv-tel" href="${site.tel}">${icon.phone} ${v(cfg.phone)}</a>
    </div>
  </div>
  <div class="wrap hv-foot">
    <span>${perPyeong} <em>${v(cfg.priceBasis)}</em></span>
    <span>${v(cfg.hours)}</span>
    <a href="#about" class="hv-scroll">스크롤</a>
  </div>
</section>

<section class="manifesto" id="about">
  <div class="wrap">
    <p class="m-big">청소는 끝나기 전까지<br>결과를 볼 수 없습니다.<br><span>그래서 과정을 먼저 보여드립니다.</span></p>
    <dl class="m-facts">
      <div><dt>직영팀</dt><dd>외부 용역에 넘기지 않습니다. 교육받은 본사 소속 팀장이 현장을 책임집니다.</dd></div>
      <div><dt>동행 검수</dt><dd>끝나기 30분 전 연락드리고, 검수표를 함께 대조합니다. 미흡한 곳은 그 자리에서 다시 합니다.</dd></div>
      <div><dt>추가금 없음</dt><dd>미리 알려드린 금액 외에 현장에서 임의로 더 받지 않습니다.</dd></div>
    </dl>
  </div>
</section>

<section class="sec" id="services">
  <div class="wrap">
    <div class="sec-top"><h2 class="h-serif">맡기실 공간을<br>골라 주세요</h2><p>공간마다 장비와 세제가 다릅니다. 순서와 검수 기준은 같습니다.</p></div>
    ${serviceIndex()}
  </div>
</section>

<section class="sheet-sec">
  <div class="wrap sheet-in">
    <div class="sheet-copy">
      <h2 class="h-serif">끝은<br>검수표로 정합니다</h2>
      <p>청소가 끝나면 팀장과 고객님이 이 표를 한 줄씩 대조합니다. 모든 칸이 채워져야 작업이 끝나고, 그다음에 결제합니다.</p>
      <p class="muted">담당 팀장이 바뀌어도 이 표는 바뀌지 않습니다.</p>
      <ul class="equip">${equipment.map(([t, d]) => `<li><b>${t}</b> ${v(d)}</li>`).join("")}</ul>
    </div>
    ${sheet(inspection)}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-top"><h2 class="h-serif">작업 전과 후</h2><p>실제 현장 사진만 올립니다. 가운데 선을 밀어 비교해 보세요.</p></div>
    ${baSlider({ caption: "[TODO:해운대 OO아파트 34평 · 주방 하부장 걸레받이]" })}
  </div>
</section>

${priceBlock()}

<section class="sec">
  <div class="wrap">
    <div class="sec-top"><h2 class="h-serif">진행 순서</h2><p>문의부터 사후관리까지 다섯 단계입니다.</p></div>
    ${stepsLine()}
  </div>
</section>

<section class="sec sec-line">
  <div class="wrap two-col">
    <div><h2 class="h-serif">고객후기</h2><p>고객님이 동의한 실제 후기만 사진과 함께 싣습니다. 지어낸 후기나 예시는 올리지 않습니다.</p></div>
    <div class="rv-quiet">
      <p class="todo-block">첫 후기를 준비하고 있습니다.<br><small>[여기에 넣을 자료] 별점 · 현장 사진 · 지역 · 평형 · 작업일</small></p>
      <p><a href="${u("/reviews/")}">시공사례·후기 페이지 ${icon.arrow}</a> · <span class="todo">네이버 플레이스 리뷰 링크</span></p>
    </div>
  </div>
</section>

<section class="sec sec-line">
  <div class="wrap two-col">
    <div><h2 class="h-serif">서비스 지역</h2><p>${regionSummary}에 직접 출장합니다.</p></div>
    ${regionText()}
  </div>
</section>

<section class="quote-sec" id="quote">
  <div class="wrap quote-in">
    <div class="quote-copy">
      <h2 class="h-serif">견적은<br>1분이면 됩니다</h2>
      <p>서비스, 공간, 날짜, 연락처만 골라 주세요. 입주·이사청소는 평수를 넣는 순간 예상 금액이 보입니다.</p>
      <p class="quote-direct">바로 상담<br><a href="${site.tel}">${v(cfg.phone)}</a><br><small>${v(cfg.hours)}</small></p>
    </div>
    ${quoteForm()}
  </div>
</section>`;
  return { path: "/", title, description, body, overlay: true, jsonld: [localBusiness(), faqPage(faqs(cfg))] };
}

// ── 2. 서비스 상세 ─────────────────────────────────────────
function servicePage(s) {
  const p = `/services/${s.slug}/`;
  const title = `${R} ${s.name} | ${site.name}`;
  const description = `${R} ${s.name}. ${s.short} ${txt(s.priceFrom)}(${s.priceNote}). 직영팀 시공, 고객 동행 검수.`;
  const others = services.filter((o) => o.slug !== s.slug);
  const zones = s.zones || [["작업 범위", s.checklist]];
  const body = `
<section class="page-head">
  <div class="wrap">
    ${crumbNav([["서비스", "/#services"], [s.name, p]])}
    <p class="kicker">${R} · ${s.badge}</p>
    <h1 class="h-serif ph-title">${s.name}</h1>
    <p class="ph-lead">${s.short}</p>
    <div class="ph-meta">
      <p><span>기본 요금</span><b>${v(s.priceFrom)}</b><small>${s.priceNote}</small></p>
      <p><span>소요 시간</span><b>${v(s.duration)}</b></p>
    </div>
    <div class="cta-row">
      <a class="btn" href="${u(`/quote/?service=${s.slug}`)}">견적 받기 ${icon.arrow}</a>
      <a class="btn btn-kakao" href="${site.kakao}" target="_blank" rel="noopener">${icon.chat} 카톡 상담</a>
      <a class="btn btn-ghost" href="${site.tel}">${icon.phone} 전화</a>
    </div>
  </div>
  <div class="wrap"><div class="slot slot-hero"><span>${s.name} 실제 현장 사진 또는 영상 자리</span></div></div>
</section>

<section class="sec">
  <div class="wrap two-col">
    <div><h2 class="h-serif">이럴 때<br>맡기세요</h2></div>
    <ul class="plain-list">${s.when.map((w) => `<li>${v(w)}</li>`).join("")}</ul>
  </div>
</section>

${s.compare ? `<section class="sec sec-line">
  <div class="wrap">
    <div class="sec-top"><h2 class="h-serif">일반 청소와<br>무엇이 다른가요</h2></div>
    <div class="vs">
      <div><p class="vs-h">일반 청소로 남는 것</p>${s.compare.bad.map(([t, d]) => `<p><b>${t}</b>${d}</p>`).join("")}</div>
      <div class="vs-good"><p class="vs-h">${site.name}의 방식</p>${s.compare.good.map(([t, d]) => `<p><b>${t}</b>${d}</p>`).join("")}</div>
    </div>
  </div>
</section>` : ""}

<section class="sheet-sec">
  <div class="wrap sheet-in">
    <div class="sheet-copy">
      <h2 class="h-serif">${s.name}<br>작업 범위</h2>
      <p>현장마다 이 표 순서대로 작업하고, 끝나면 함께 한 줄씩 확인합니다.</p>
      <p class="muted"><b>별도 문의</b><br>${s.notIncluded.map(v).join("<br>")}</p>
    </div>
    ${sheet(zones, `${s.name} 작업표`)}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-top"><h2 class="h-serif">${s.name} 전과 후</h2></div>
    ${baSlider({ caption: `[TODO:${s.name} 현장명 · 평형 · 작업 부위]` })}
  </div>
</section>

<section class="sec sec-line">
  <div class="wrap">
    <div class="sec-top"><h2 class="h-serif">진행 순서</h2></div>
    ${stepsLine()}
  </div>
</section>

<section class="sec sec-line">
  <div class="wrap two-col">
    <div><h2 class="h-serif">자주 묻는<br>질문</h2><p><a href="${u("/faq/")}">전체 질문 보기 ${icon.arrow}</a></p></div>
    ${faqList(s.faqs)}
  </div>
</section>

${ctaBand(`${s.name}, 사진 한 장이면<br>견적이 빨라져요`)}

<section class="sec">
  <div class="wrap">
    <div class="sec-top"><h2 class="h-serif">다른 서비스</h2></div>
    ${serviceIndex(others, { pkg: false })}
  </div>
</section>`;
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${R} ${s.name}`,
    serviceType: s.name,
    description: s.short,
    url: abs(p),
    provider: { "@type": "LocalBusiness", "@id": bizId(), name: site.name, telephone: site.phone },
    areaServed: areaServed(),
    offers: { "@type": "Offer", description: `${txt(s.priceFrom)} (${s.priceNote})`, priceCurrency: "KRW" },
  };
  return { path: p, title, description, body, jsonld: [serviceLd, faqPage(s.faqs), crumbs([["서비스", "/#services"], [s.name, p]])] };
}

// ── 3. 견적 신청 ───────────────────────────────────────────
function quote() {
  const p = "/quote/";
  return {
    path: p,
    title: `${R} 청소 무료 견적 신청 | ${site.name}`,
    description: `${R} 입주청소·이사청소·준공청소·탄성코트·줄눈 무료 견적. 서비스·공간·일정·연락처 4단계, 입주·이사청소는 ${perPyeong} 기준으로 바로 계산됩니다.`,
    body: `
<section class="quote-sec quote-page">
  <div class="wrap">${crumbNav([["무료 견적", p]])}</div>
  <div class="wrap quote-in">
    <div class="quote-copy">
      <h1 class="h-serif">견적은<br>1분이면 됩니다</h1>
      <p>공급평수와 서비스를 고르시면 담당 팀장이 현장 특성을 반영해 상세 견적을 보내드립니다. 상담 후 영업 전화는 하지 않습니다.</p>
      <ul class="plain-list small">${promises(cfg).slice(1, 5).map((x) => `<li>${v(x.title)}</li>`).join("")}</ul>
      <p class="quote-direct">바로 상담<br><a href="${site.tel}">${v(cfg.phone)}</a><br><small>${v(cfg.hours)}</small></p>
    </div>
    ${quoteForm()}
  </div>
</section>`,
    jsonld: [crumbs([["무료 견적", p]])],
  };
}

// ── 4. 시공사례·후기 ───────────────────────────────────────
function reviews() {
  const p = "/reviews/";
  return {
    path: p,
    title: `${R} 입주청소 시공사례·후기 | ${site.name}`,
    description: `${site.name} ${R} 실제 시공 현장의 전후 사진과 고객 동행 검수 후기. 검수표도 공개합니다.`,
    body: `
<section class="page-head">
  <div class="wrap">
    ${crumbNav([["시공사례·후기", p]])}
    <h1 class="h-serif ph-title">시공사례와 후기</h1>
    <p class="ph-lead">실제 현장의 전후 사진과 동행 검수 후기를 그대로 올립니다. 예시나 지어낸 후기는 싣지 않습니다.</p>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-top"><h2 class="h-serif">현장 사례</h2></div>
    <div class="case-list">
      ${[1, 2].map(() => baSlider({ caption: "[TODO:현장명 · 평형 · 서비스 · 작업일]" })).join("")}
    </div>
  </div>
</section>
<section class="sec sec-line">
  <div class="wrap two-col">
    <div><h2 class="h-serif">고객후기</h2><p>별점, 사진, 지역, 평형, 작업일을 함께 공개합니다.</p></div>
    <div class="rv-quiet">
      <p class="todo-block">첫 후기를 준비하고 있습니다.<br><small>[여기에 넣을 자료] 고객 동의를 받은 후기 · 별점 · 현장 사진</small></p>
      <p>외부 후기 · <span class="todo">네이버 플레이스 리뷰 링크</span> · <span class="todo">숨고·당근 후기 링크</span></p>
    </div>
  </div>
</section>
<section class="sheet-sec">
  <div class="wrap sheet-in">
    <div class="sheet-copy"><h2 class="h-serif">모든 현장에서<br>쓰는 검수표</h2><p>청소가 끝나면 팀장과 고객님이 이 표를 함께 대조하고, 모든 칸을 확인한 뒤 마감합니다.</p></div>
    ${sheet(inspection)}
  </div>
</section>
${ctaBand("우리 집도 이렇게 될까요?<br>사진으로 먼저 물어보세요")}`,
    jsonld: [crumbs([["시공사례·후기", p]])],
  };
}

// ── 5. 자주 묻는 질문 ──────────────────────────────────────
function faqPageView() {
  const p = "/faq/";
  const all = [...faqs(cfg), ...services.flatMap((s) => s.faqs)];
  return {
    path: p,
    title: `${R} 입주청소 자주 묻는 질문 | ${site.name}`,
    description: `${R} 입주청소·이사청소 견적 기준(공급평수), 추가요금, 외창 청소, 결제 시점, A/S, 서비스 지역 등 자주 묻는 질문과 답변.`,
    body: `
<section class="page-head">
  <div class="wrap">
    ${crumbNav([["자주 묻는 질문", p]])}
    <h1 class="h-serif ph-title">자주 묻는 질문</h1>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="two-col faq-group"><h2 class="h-serif">공통</h2>${faqList(faqs(cfg))}</div>
    ${services.map((s) => `<div class="two-col faq-group"><h2 class="h-serif">${s.name}</h2>${faqList(s.faqs)}</div>`).join("")}
  </div>
</section>
${ctaBand("찾는 답이 없으면<br>바로 물어보세요")}`,
    jsonld: [faqPage(all), crumbs([["자주 묻는 질문", p]])],
  };
}

// ── 6. 회사소개 ────────────────────────────────────────────
function about() {
  const p = "/about/";
  const c = cfg.company;
  return {
    path: p,
    title: `회사소개 | ${R} 입주청소 ${site.name}`,
    description: `${site.name}(${txt(cfg.subName)})은 ${R}에서 입주·이사·준공·상가 청소와 탄성코트·줄눈·새집증후군 케어를 하는 직영 청소팀입니다.`,
    body: `
<section class="page-head">
  <div class="wrap">
    ${crumbNav([["회사소개", p]])}
    <p class="kicker">${v(cfg.subName)}</p>
    <h1 class="h-serif ph-title">${v(cfg.name)}</h1>
    <p class="ph-lead">청소는 끝나기 전까지 결과를 볼 수 없는 서비스입니다. 그래서 저희는 결과를 약속하기 전에 과정을 먼저 보여드립니다.</p>
  </div>
  <div class="wrap"><div class="slot slot-hero"><span>대표 또는 작업팀 실제 사진 자리</span></div></div>
</section>
<section class="sec">
  <div class="wrap two-col">
    <div><h2 class="h-serif">대표 인사말</h2></div>
    <p class="todo-block">[TODO] 대표님이 직접 쓰시는 3~5문장: 이 일을 시작한 이유, 직영팀을 고집하는 이유, 하지 않는 것.</p>
  </div>
</section>
<section class="sec sec-line">
  <div class="wrap two-col">
    <div><h2 class="h-serif">지키는 약속</h2></div>
    <dl class="promise-list">${promises(cfg).map((x) => `<div><dt>${v(x.title)}</dt><dd>${v(x.body)}</dd></div>`).join("")}</dl>
  </div>
</section>
<section class="sec sec-line">
  <div class="wrap two-col">
    <div><h2 class="h-serif">업체 정보</h2></div>
    <dl class="info">
      <div><dt>상호</dt><dd>${v(cfg.name)} (${v(cfg.subName)})</dd></div>
      <div><dt>대표자</dt><dd>${v(c.owner)}</dd></div>
      <div><dt>서비스 지역</dt><dd>${regionSummary}</dd></div>
      <div><dt>상담 시간</dt><dd>${v(cfg.hours)}</dd></div>
      <div><dt>대표번호</dt><dd><a href="${site.tel}">${v(cfg.phone)}</a></dd></div>
      <div><dt>주소</dt><dd>${v(c.address)}</dd></div>
      <div><dt>사업자등록번호</dt><dd>${v(c.bizNo)}</dd></div>
      <div><dt>통신판매업 신고번호</dt><dd>${v(c.mailOrderNo)}</dd></div>
      <div><dt>보험·인증</dt><dd><span class="todo">실제 가입한 보험·보유 자격만 기재 (없으면 이 줄 삭제)</span></dd></div>
    </dl>
  </div>
</section>
${ctaBand()}`,
    jsonld: [localBusiness(), crumbs([["회사소개", p]])],
  };
}

function notFound() {
  return {
    path: "/404.html",
    title: `페이지를 찾을 수 없어요 | ${site.name}`,
    description: "요청하신 페이지가 없습니다.",
    noindex: true,
    body: `<section class="page-head"><div class="wrap">
  <h1 class="h-serif ph-title">페이지를 찾을 수 없어요</h1>
  <p class="ph-lead">주소가 바뀌었거나 없는 페이지예요.</p>
  <div class="cta-row"><a class="btn" href="${u("/")}">홈으로</a><a class="btn btn-ghost" href="${u("/quote/")}">견적 문의</a></div>
</div></section>`,
    jsonld: [],
  };
}

// build.mjs가 페이지마다 주소를 먼저 정한 뒤(setPage) render()를 부릅니다.
export const pageList = [
  { path: "/", render: home },
  ...services.map((s) => ({ path: `/services/${s.slug}/`, render: () => servicePage(s) })),
  { path: "/quote/", render: quote },
  { path: "/reviews/", render: reviews },
  { path: "/faq/", render: faqPageView },
  { path: "/about/", render: about },
  { path: "/404.html", render: notFound },
];
