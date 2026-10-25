// 페이지별 내용. 각 페이지는 { path, title, description, body, jsonld } 를 돌려줍니다.
import cfg from "../site.config.mjs";
import { services, cards, oneStop, promises, equipment, steps, inspection, faqs, perPyeong } from "./content.mjs";
import { v, txt, site, regionSummary, areaServed, tagline, taglineText, u, abs, icon, quoteForm, photoSlots, ctaBand } from "./layout.mjs";

const R = cfg.region.label; // 부산·경남

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
  `<nav class="crumbs wrap" aria-label="현재 위치"><a href="${u("/")}">홈</a>${items
    .map(([n, p], i) => (i === items.length - 1 ? ` <span>›</span> <b>${n}</b>` : ` <span>›</span> <a href="${u(p)}">${n}</a>`))
    .join("")}</nav>`;

const faqList = (list) => `<div class="faq">${list.map((f) => `<details><summary>${v(f.q)}</summary><p>${v(f.a)}</p></details>`).join("")}</div>`;

const stepsList = () =>
  `<ol class="steps">${steps.map((s, i) => `<li><span class="n">${i + 1}</span><b>${s.t}</b><p>${s.d}</p></li>`).join("")}</ol>`;

const head2 = (eyebrow, title, sub = "") =>
  `<header class="sec-head"><p class="eyebrow">${eyebrow}</p><h2 class="sec-title">${title}</h2>${sub ? `<p class="sec-sub">${sub}</p>` : ""}</header>`;

const statStrip = () => `<ul class="stats">
  <li>${icon.pin}<span><small>출장 지역</small><b>${R} 전 지역</b></span></li>
  <li>${icon.team}<span><small>시공 인력</small><b>본사 직영팀</b></span></li>
  <li>${icon.shield}<span><small>마감 방식</small><b>고객 동행 검수</b></span></li>
  <li>${icon.coin}<span><small>기본 단가</small><b>${perPyeong}</b></span></li>
</ul>`;

const promiseGrid = () =>
  `<div class="promise-grid">${promises(cfg).map((p, i) => `<div class="promise"><span class="p-n">${String(i + 1).padStart(2, "0")}</span><b>${v(p.title)}</b><p>${v(p.body)}</p></div>`).join("")}</div>`;

const reviewSlots = (n = 3) =>
  `<div class="rv-grid">${Array.from({ length: n })
    .map(
      () => `<article class="rv rv-empty">
    <div class="rv-stars" aria-label="별점 자리">★★★★★</div>
    <div class="rv-photo slot"><span>고객 동의를 받은 실제 사진 자리</span></div>
    <p>실제 고객 후기가 들어갈 자리예요.</p>
    <footer>지역 · 서비스 · 평형 · 작업일</footer>
  </article>`
    )
    .join("")}</div>`;

const regionBlock = () => `<div class="region-grid">${cfg.region.areas
  .map((a) => `<div class="region-card"><b>${a.full}</b><ul class="region-list">${a.parts.map((p) => `<li>${p}</li>`).join("")}</ul></div>`)
  .join("")}</div><p class="muted">${v(cfg.region.note)}</p>`;

// ── 1. 메인 ─────────────────────────────────────────────────
function home() {
  const title = `${R} 입주청소·이사청소 | ${site.name}`;
  const description = `${R} 입주청소·이사청소·준공청소·상가 정기청소·탄성코트·줄눈·새집증후군 케어. ${txt(cfg.priceBasis)} ${perPyeong}, 직영팀 시공, 고객 동행 검수, ${txt(cfg.hours)} 상담.`;
  const body = `
<section class="hero">
  <div class="wrap hero-in">
    <div class="hero-copy">
      <ul class="pills"><li>${icon.pin} ${R} 전 지역 출장</li><li>${icon.team} 본사 직영팀</li><li>${icon.leaf} 중성 세제·고온 스팀</li></ul>
      <h1>${tagline(cfg.tagline)}</h1>
      <p class="lead">${v(cfg.intro)}</p>
      <p class="anchor"><span>입주·이사청소</span> <strong>${perPyeong}</strong> <small>${v(cfg.priceBasis)}</small></p>
      <div class="cta-row">
        <a class="btn" href="#quote">${icon.doc} 무료 견적</a>
        <a class="btn btn-kakao" href="${site.kakao}" target="_blank" rel="noopener">${icon.chat} 카톡 상담</a>
        <a class="btn btn-dark" href="${site.tel}">${icon.phone} 전화</a>
      </div>
    </div>
    <div class="hero-quick" aria-label="빠른 견적">
      <p class="hq-title"><b>1분 견적</b> 어떤 청소가 필요하세요?</p>
      <div class="hq-chips">
        ${services.map((s) => `<a class="chip-link" data-pick="${s.name}" href="${u(`/quote/?service=${s.slug}`)}">${s.name}</a>`).join("")}
      </div>
      <p class="hq-note">고르면 아래 견적 폼으로 이어지고, 입주·이사청소는 금액이 바로 계산돼요.</p>
    </div>
  </div>
  <div class="wrap">${statStrip()}</div>
</section>

<section class="sec" id="services">
  <div class="wrap">
    ${head2("SERVICES", "어떤 공간을 맡기시나요?", "공간마다 맞는 장비와 세제로, 같은 체크리스트에 따라 작업합니다.")}
    <div class="svc-grid">
      ${cards()
        .map(
          (c) => `<article class="svc">
        <div class="svc-top"><span class="svc-q">“${c.question}”</span><span class="badge">${c.badge}</span></div>
        <h3>${c.title}</h3>
        <p>${c.short}</p>
        <ul class="tags">${c.tags.map((t) => `<li>${t}</li>`).join("")}</ul>
        <div class="svc-price"><small>${c.priceNote}</small><b>${v(c.priceFrom)}</b></div>
        <div class="svc-links">${c.links.map(([n, s]) => `<a href="${u(`/services/${s}/`)}">${n} 자세히 ${icon.arrow}</a>`).join("")}</div>
      </article>`
        )
        .join("")}
    </div>
  </div>
</section>

<section class="sec sec-tint">
  <div class="wrap">
    ${head2("ALL-IN-ONE", "입주 준비를 한 번에 끝내는 원스톱 패키지", "입주청소, 탄성코트, 줄눈, 새집증후군 케어를 업체마다 따로 알아볼 필요가 없어요.")}
    <div class="pack">
      <div class="pack-points">${oneStop.points.map(([t, d]) => `<div><b>${icon.check} ${t}</b><p>${d}</p></div>`).join("")}</div>
      <div class="pack-plan">
        <p class="pack-title">${oneStop.plan.title}</p>
        <ol>${oneStop.plan.items.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join("")}</ol>
        <a class="btn" href="${u("/quote/?service=package")}">패키지 견적 받기 ${icon.arrow}</a>
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${head2("PROMISE", "결과를 미리 볼 수 없으니, 약속을 먼저 드려요")}
    ${promiseGrid()}
    <div class="equip">${equipment.map(([t, d]) => `<div><b>${t}</b><p>${v(d)}</p></div>`).join("")}</div>
  </div>
</section>

<section class="sec sec-tint">
  <div class="wrap">
    ${head2("PROCESS", "이렇게 진행돼요")}
    ${stepsList()}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${head2("BEFORE · AFTER", "작업 전후", "실제 현장 사진만 올립니다.")}
    ${photoSlots(["[TODO:입주청소 · 창틀 레일]", "[TODO:이사청소 · 주방 후드망]", "[TODO:입주청소 · 욕실 배수구]"])}
  </div>
</section>

<section class="sec sec-tint">
  <div class="wrap">
    ${head2("REVIEWS", "고객후기", "별점과 사진이 있는 실제 후기만 싣습니다.")}
    ${reviewSlots(3)}
    <p class="more"><a href="${u("/reviews/")}">시공사례·후기 더 보기 ${icon.arrow}</a></p>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${head2("AREA", "서비스 지역", `${regionSummary}에 직접 출장합니다.`)}
    ${regionBlock()}
  </div>
</section>

<section class="sec quote-sec" id="quote">
  <div class="wrap narrow">
    ${head2("FREE ESTIMATE", "1분 무료 견적", "4단계만 고르면 끝나요. 입주·이사청소는 평수에 따라 예상 금액이 바로 보여요.")}
    ${quoteForm()}
  </div>
</section>`;
  return { path: "/", title, description, body, jsonld: [localBusiness(), faqPage(faqs(cfg))] };
}

// ── 2. 서비스 상세 ─────────────────────────────────────────
function servicePage(s) {
  const path = `/services/${s.slug}/`;
  const title = `${R} ${s.name} | ${site.name}`;
  const description = `${R} ${s.name}. ${s.short} ${txt(s.priceFrom)}(${s.priceNote}). 직영팀 시공, 고객 동행 검수.`;
  const others = services.filter((o) => o.slug !== s.slug);
  const compare = s.compare
    ? `<section class="sec sec-tint">
  <div class="wrap">
    ${head2("DIFFERENCE", `${s.name}, 일반 청소와 뭐가 다른가요?`)}
    <div class="compare">
      <div class="cmp cmp-bad"><p class="cmp-h">${icon.x} 일반 청소로 남는 것</p>${s.compare.bad.map(([t, d]) => `<div><b>${t}</b><p>${d}</p></div>`).join("")}</div>
      <div class="cmp cmp-good"><p class="cmp-h">${icon.check} ${site.name}의 방식</p>${s.compare.good.map(([t, d]) => `<div><b>${t}</b><p>${d}</p></div>`).join("")}</div>
    </div>
  </div>
</section>`
    : "";
  const scope = s.zones
    ? `<div class="zones">${s.zones.map(([z, items]) => `<div class="zone"><b>${z}</b><ul>${items.map((i) => `<li>${icon.check}<span>${v(i)}</span></li>`).join("")}</ul></div>`).join("")}</div>`
    : `<ol class="checklist">${s.checklist.map((c) => `<li>${v(c)}</li>`).join("")}</ol>`;
  const body = `
${crumbNav([["서비스", "/#services"], [s.name, path]])}
<section class="hero hero-sub">
  <div class="wrap">
    <ul class="pills"><li>${icon.pin} ${R}</li><li>${s.badge}</li></ul>
    <h1>${R} ${s.name}</h1>
    <p class="lead">${s.short}</p>
    <p class="anchor"><strong>${v(s.priceFrom)}</strong> <small>${s.priceNote}</small></p>
    <div class="cta-row">
      <a class="btn" href="${u(`/quote/?service=${s.slug}`)}">${icon.doc} 견적</a>
      <a class="btn btn-kakao" href="${site.kakao}" target="_blank" rel="noopener">${icon.chat} 카톡</a>
      <a class="btn btn-dark" href="${site.tel}">${icon.phone} 전화</a>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap two">
    <div>
      ${head2("WHEN", "이럴 때 맡기세요")}
      <ul class="ticks">${s.when.map((w) => `<li>${icon.check}${v(w)}</li>`).join("")}</ul>
      <p class="muted"><b>소요 시간</b> · ${v(s.duration)}</p>
    </div>
    <div class="card">
      <p class="eyebrow">CHECKLIST</p>
      <h2 class="sec-title">작업 체크리스트</h2>
      <p class="sec-sub">모든 현장에서 이 순서 그대로 작업하고, 끝나면 함께 확인합니다.</p>
      ${s.zones ? "" : scope}
      <p class="muted"><b>별도 문의</b> · ${s.notIncluded.map(v).join(" / ")}</p>
    </div>
  </div>
  ${s.zones ? `<div class="wrap">${scope}</div>` : ""}
</section>

${compare}

<section class="sec${s.compare ? "" : " sec-tint"}">
  <div class="wrap">
    ${head2("PROCESS", "진행 과정")}
    ${stepsList()}
  </div>
</section>

<section class="sec${s.compare ? " sec-tint" : ""}">
  <div class="wrap">
    ${head2("BEFORE · AFTER", `${s.name} 전후`)}
    ${photoSlots([`[TODO:${s.name} 현장 사진 1]`, `[TODO:${s.name} 현장 사진 2]`])}
  </div>
</section>

<section class="sec">
  <div class="wrap narrow">
    ${head2("FAQ", `${s.name} 자주 묻는 질문`)}
    ${faqList(s.faqs)}
    <p class="more"><a href="${u("/faq/")}">전체 질문 보기 ${icon.arrow}</a></p>
  </div>
</section>

${ctaBand(`${s.name}, 사진 한 장이면 견적이 빨라져요`)}

<section class="sec">
  <div class="wrap">
    <h2 class="sec-title">다른 서비스</h2>
    <div class="svc-mini">${others.map((o) => `<a href="${u(`/services/${o.slug}/`)}"><b>${o.name}</b><span>${o.question}</span></a>`).join("")}</div>
  </div>
</section>`;
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${R} ${s.name}`,
    serviceType: s.name,
    description: s.short,
    url: abs(path),
    provider: { "@type": "LocalBusiness", "@id": bizId(), name: site.name, telephone: site.phone },
    areaServed: areaServed(),
    offers: { "@type": "Offer", description: `${txt(s.priceFrom)} (${s.priceNote})`, priceCurrency: "KRW" },
  };
  return { path, title, description, body, jsonld: [serviceLd, faqPage(s.faqs), crumbs([["서비스", "/#services"], [s.name, path]])] };
}

// ── 3. 견적 신청 ───────────────────────────────────────────
function quote() {
  const path = "/quote/";
  return {
    path,
    title: `${R} 청소 무료 견적 신청 | ${site.name}`,
    description: `${R} 입주청소·이사청소·준공청소·탄성코트·줄눈 무료 견적. 서비스·공간·일정·연락처 4단계, 입주·이사청소는 ${perPyeong} 기준으로 바로 계산됩니다.`,
    body: `
${crumbNav([["무료 견적 신청", path]])}
<section class="sec quote-sec">
  <div class="wrap quote-layout">
    <div>
      <p class="eyebrow">FREE ESTIMATE</p>
      <h1 class="sec-title">빠르고 투명한 1분 무료 견적</h1>
      <p class="sec-sub">공급평수와 서비스를 고르시면 담당 팀장이 현장 특성을 반영해 상세 견적을 안내드립니다.</p>
      ${quoteForm()}
    </div>
    <aside class="quote-side">
      <div class="card">
        <b class="side-h">${icon.shield} 안심 약속</b>
        <ul class="ticks">${promises(cfg).slice(1, 5).map((p) => `<li>${icon.check}${v(p.title)}</li>`).join("")}</ul>
      </div>
      <div class="card">
        <b class="side-h">바로 상담하기</b>
        <p class="muted">급하시거나 현장 조건이 복잡하면 바로 연락 주세요. ${v(cfg.hours)}</p>
        <a class="btn" href="${site.tel}">${icon.phone} ${v(cfg.phone)}</a>
        <a class="btn btn-kakao" href="${site.kakao}" target="_blank" rel="noopener">${icon.chat} 카카오톡 1:1 상담</a>
      </div>
    </aside>
  </div>
</section>`,
    jsonld: [crumbs([["무료 견적 신청", path]])],
  };
}

// ── 4. 시공사례·후기 ───────────────────────────────────────
function reviews() {
  const path = "/reviews/";
  return {
    path,
    title: `${R} 입주청소 시공사례·후기 | ${site.name}`,
    description: `${site.name} ${R} 실제 시공 현장의 전후 사진과 고객 동행 검수 후기. 검수 체크리스트도 공개합니다.`,
    body: `
${crumbNav([["시공사례·후기", path]])}
<section class="sec">
  <div class="wrap">
    <p class="eyebrow">PORTFOLIO & REVIEWS</p>
    <h1 class="sec-title">시공사례 · 고객후기</h1>
    <p class="sec-sub">실제 현장의 전후 사진과 동행 검수 후기를 그대로 공개합니다. 예시나 지어낸 후기는 싣지 않습니다.</p>
    <div class="rv-filter" role="group" aria-label="서비스별 보기">
      <button type="button" class="chip on">전체</button>${services.slice(0, 5).map((s) => `<button type="button" class="chip">${s.name}</button>`).join("")}
    </div>
    <h2 class="faq-h">전후 사례</h2>
    ${photoSlots(["[TODO:현장명 · 평형 · 작업 내용]", "[TODO:현장명 · 평형 · 작업 내용]", "[TODO:현장명 · 평형 · 작업 내용]"])}
    <h2 class="faq-h">고객후기</h2>
    ${reviewSlots(6)}
    <p class="muted center">외부 후기도 확인하세요 · <span class="todo">네이버 플레이스 리뷰 링크</span> · <span class="todo">숨고·당근 후기 링크</span></p>
  </div>
</section>
<section class="sec sec-tint">
  <div class="wrap">
    ${head2("INSPECTION", "현장 검수 체크리스트", "청소가 끝나면 팀장과 고객님이 이 목록을 함께 대조하고, 모든 항목을 확인한 뒤 마감합니다.")}
    <div class="zones">${inspection.map(([z, items]) => `<div class="zone"><b>${z}</b><ul>${items.map((i) => `<li>${icon.check}<span>${i}</span></li>`).join("")}</ul></div>`).join("")}</div>
  </div>
</section>
${ctaBand("우리 집도 이렇게 될까요? 사진으로 먼저 물어보세요")}`,
    jsonld: [crumbs([["시공사례·후기", path]])],
  };
}

// ── 5. 자주 묻는 질문 ──────────────────────────────────────
function faqPageView() {
  const path = "/faq/";
  const all = [...faqs(cfg), ...services.flatMap((s) => s.faqs)];
  return {
    path,
    title: `${R} 입주청소 자주 묻는 질문 | ${site.name}`,
    description: `${R} 입주청소·이사청소 견적 기준(공급평수), 추가요금, 외창 청소, 결제 시점, A/S, 서비스 지역 등 자주 묻는 질문과 답변.`,
    body: `
${crumbNav([["자주 묻는 질문", path]])}
<section class="sec">
  <div class="wrap narrow">
    <p class="eyebrow">FAQ</p>
    <h1 class="sec-title">자주 묻는 질문</h1>
    <h2 class="faq-h">공통</h2>
    ${faqList(faqs(cfg))}
    ${services.map((s) => `<h2 class="faq-h">${s.name}</h2>${faqList(s.faqs)}`).join("")}
  </div>
</section>
${ctaBand("찾는 답이 없으면 바로 물어보세요")}`,
    jsonld: [faqPage(all), crumbs([["자주 묻는 질문", path]])],
  };
}

// ── 6. 회사소개 ────────────────────────────────────────────
function about() {
  const path = "/about/";
  const c = cfg.company;
  return {
    path,
    title: `회사소개 | ${R} 입주청소 ${site.name}`,
    description: `${site.name}(${txt(cfg.subName)})은 ${R}에서 입주·이사·준공·상가 청소와 탄성코트·줄눈·새집증후군 케어를 하는 직영 청소팀입니다.`,
    body: `
${crumbNav([["회사소개", path]])}
<section class="sec">
  <div class="wrap narrow">
    <p class="eyebrow">ABOUT</p>
    <h1 class="sec-title">${v(cfg.name)} <small class="muted">${v(cfg.subName)}</small></h1>
    <p class="lead">청소는 끝나기 전까지 결과를 볼 수 없는 서비스입니다. 그래서 저희는 결과를 약속하기 전에 <b>과정</b>을 먼저 보여드립니다. 같은 체크리스트, 같은 검수 순서, 그리고 고객님과 함께하는 마감 확인입니다.</p>
    <div class="card todo-card">
      <b>대표 인사말 자리</b>
      <p>[TODO] 대표님이 직접 쓰시는 3~5문장: 이 일을 시작한 이유, 직영팀을 고집하는 이유, 하지 않는 것.</p>
      <div class="slot slot-wide"><span>대표 또는 작업팀 실제 사진 자리</span></div>
    </div>
  </div>
</section>
<section class="sec sec-tint">
  <div class="wrap">
    ${head2("PROMISE", "지키는 약속")}
    ${promiseGrid()}
  </div>
</section>
<section class="sec">
  <div class="wrap narrow">
    <h2 class="sec-title">업체 정보</h2>
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
    jsonld: [localBusiness(), crumbs([["회사소개", path]])],
  };
}

function notFound() {
  return {
    path: "/404.html",
    title: `페이지를 찾을 수 없어요 | ${site.name}`,
    description: "요청하신 페이지가 없습니다.",
    noindex: true,
    body: `<section class="sec"><div class="wrap narrow center">
  <h1 class="sec-title">페이지를 찾을 수 없어요</h1>
  <p>주소가 바뀌었거나 없는 페이지예요.</p>
  <div class="cta-row center"><a class="btn" href="${u("/")}">홈으로</a><a class="btn btn-ghost" href="${u("/quote/")}">무료 견적 신청</a></div>
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
