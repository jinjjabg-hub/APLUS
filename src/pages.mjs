// 페이지별 내용. 각 페이지는 { path, title, description, body, jsonld } 를 돌려줍니다.
import cfg from "../site.config.mjs";
import { services, promises, steps, faqs } from "./content.mjs";
import { v, txt, site, regionHtml, u, abs, icon, quoteForm, photoSlots, ctaBand } from "./layout.mjs";

// ── 구조화 데이터 ───────────────────────────────────────────
const bizId = () => abs("/#business");
const areaServed = () =>
  cfg.region.districts.map((d) => ({ "@type": "AdministrativeArea", name: `${txt(cfg.region.city)} ${txt(d)}` }));

const localBusiness = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": bizId(),
  name: site.name,
  description: `${site.regionText} ${services.map((s) => s.name).join("·")} 전문. ${txt(cfg.tagline)}`,
  url: abs("/"),
  telephone: site.phone,
  email: txt(cfg.company.email),
  image: abs("/assets/og.png"),
  logo: abs("/assets/favicon.svg"),
  priceRange: `${txt(cfg.priceAnchor)}~`,
  address: {
    "@type": "PostalAddress",
    streetAddress: txt(cfg.company.address),
    addressRegion: txt(cfg.region.city),
    addressCountry: "KR",
  },
  areaServed: areaServed(),
  sameAs: [site.kakao],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "청소 서비스",
    itemListElement: services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.name, url: abs(`/services/${s.slug}/`) },
      description: txt(s.priceFrom),
    })),
  },
});

const faqPage = (list) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  // 아직 답이 정해지지 않은([TODO]만 있는) 질문은 구조화 데이터에서 뺍니다.
  mainEntity: list
    .filter((f) => txt(f.a) && !/^\[TODO/.test(f.a))
    .map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: txt(f.a) } })),
});

const crumbs = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [["홈", "/"], ...items].map(([name, p], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: abs(p),
  })),
});

const crumbNav = (items) =>
  `<nav class="crumbs wrap" aria-label="현재 위치"><a href="${u("/")}">홈</a>${items
    .map(([n, p], i) => (i === items.length - 1 ? ` <span>›</span> <b>${n}</b>` : ` <span>›</span> <a href="${u(p)}">${n}</a>`))
    .join("")}</nav>`;

const faqList = (list) =>
  `<div class="faq">${list.map((f) => `<details><summary>${v(f.q)}</summary><p>${v(f.a)}</p></details>`).join("")}</div>`;

const stepsList = () =>
  `<ol class="steps">${steps.map((s, i) => `<li><span class="n">${i + 1}</span><b>${s.t}</b><p>${s.d}</p></li>`).join("")}</ol>`;

const reviewSlots = (n = 3) =>
  `<div class="rv-grid">${Array.from({ length: n })
    .map(
      () => `<article class="rv rv-empty">
    <div class="rv-stars" aria-label="별점 자리">☆☆☆☆☆</div>
    <div class="rv-photo slot"><span>고객 사진 자리</span></div>
    <p>실제 고객 후기가 들어갈 자리예요.</p>
    <footer>지역 · 서비스 · 작업일</footer>
  </article>`
    )
    .join("")}</div>`;

// ── 1. 메인 ─────────────────────────────────────────────────
function home() {
  const title = `${site.regionText} 입주·이사청소 | ${site.name}`;
  const description = `${site.regionText} 입주청소·이사청소·거주청소·에어컨청소·사무실청소. ${txt(cfg.priceAnchor)}부터, 같은 체크리스트와 검수 순서, 작업 후 ${txt(cfg.asDays)}일 이내 A/S.`;
  const body = `
<section class="hero">
  <div class="wrap hero-in">
    <div class="hero-copy">
      <p class="eyebrow">${regionHtml} 청소</p>
      <h1>${v(cfg.tagline)}</h1>
      <p class="anchor"><span>원룸 기준</span> <strong>${v(cfg.priceAnchor)}</strong>부터</p>
      <div class="cta-row">
        <a class="btn" href="${site.tel}">${icon.phone} 전화</a>
        <a class="btn btn-kakao" href="${site.kakao}" target="_blank" rel="noopener">${icon.chat} 카톡</a>
        <a class="btn btn-ghost" href="#quote">${icon.doc} 견적</a>
      </div>
    </div>
    <div class="hero-quick" aria-label="빠른 견적">
      <p class="hq-title"><b>30초 견적</b> 어떤 청소가 필요하세요?</p>
      <div class="hq-chips">
        ${services.map((s) => `<a class="chip-link" data-pick="${s.name}" href="${u(`/quote/?service=${s.slug}`)}">${s.name}</a>`).join("")}
      </div>
      <p class="hq-note">고르시면 아래 견적 폼으로 이어져요 · ${v(cfg.hours)}</p>
    </div>
  </div>
</section>

<section class="sec" id="services">
  <div class="wrap">
    <h2 class="sec-title">어떤 공간을 맡기시나요?</h2>
    <div class="svc-grid">
      ${services
        .map(
          (s) => `<a class="svc" href="${u(`/services/${s.slug}/`)}">
        <span class="svc-q">“${s.question}”</span>
        <b>${s.name}</b>
        <p>${s.short}</p>
        <span class="svc-price">${v(s.priceFrom)}</span>
      </a>`
        )
        .join("")}
    </div>
  </div>
</section>

<section class="sec sec-tint">
  <div class="wrap">
    <h2 class="sec-title">결과를 미리 볼 수 없으니, 약속을 먼저 드려요</h2>
    <div class="promise-grid">
      ${promises(cfg).map((p) => `<div class="promise">${icon.check}<b>${v(p.title)}</b><p>${v(p.body)}</p></div>`).join("")}
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <h2 class="sec-title">이렇게 진행돼요</h2>
    ${stepsList()}
  </div>
</section>

<section class="sec sec-tint">
  <div class="wrap">
    <h2 class="sec-title">작업 전후</h2>
    <p class="sec-sub">실제 현장 사진만 올립니다.</p>
    ${photoSlots(["[TODO:입주청소 · 주방 상부장]", "[TODO:이사청소 · 욕실 줄눈]", "[TODO:에어컨청소 · 송풍팬]"])}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <h2 class="sec-title">고객후기</h2>
    <p class="sec-sub">별점과 사진이 있는 실제 후기만 싣습니다.</p>
    ${reviewSlots(3)}
    <p class="more"><a href="${u("/reviews/")}">후기 더 보기 →</a></p>
  </div>
</section>

<section class="sec sec-tint">
  <div class="wrap region">
    <h2 class="sec-title">서비스 지역</h2>
    <ul class="region-list">${cfg.region.districts.map((d) => `<li>${v(cfg.region.city)} ${v(d)}</li>`).join("")}</ul>
    <p>${v(cfg.region.note)}</p>
  </div>
</section>

<section class="sec quote-sec" id="quote">
  <div class="wrap narrow">
    <h2 class="sec-title">견적 신청</h2>
    <p class="sec-sub">4단계만 고르면 끝나요. 남겨 주시면 확인하는 대로 연락드립니다.</p>
    ${quoteForm()}
  </div>
</section>`;
  return { path: "/", title, description, body, jsonld: [localBusiness(), faqPage(faqs(cfg))] };
}

// ── 2. 서비스 상세 ─────────────────────────────────────────
function servicePage(s) {
  const path = `/services/${s.slug}/`;
  const title = `${site.regionText} ${s.name} | ${site.name}`;
  const description = `${site.regionText} ${s.name}. ${s.short} 가격 ${txt(s.priceFrom)}. 체크리스트 작업, 고객 동반 검수, ${txt(cfg.asDays)}일 이내 A/S.`;
  const others = services.filter((o) => o.slug !== s.slug);
  const body = `
${crumbNav([["서비스", "/#services"], [s.name, path]])}
<section class="hero hero-sub">
  <div class="wrap">
    <p class="eyebrow">${regionHtml}</p>
    <h1>${s.name}</h1>
    <p class="lead">${s.short}</p>
    <p class="anchor"><strong>${v(s.priceFrom)}</strong></p>
    <div class="cta-row">
      <a class="btn" href="${site.tel}">${icon.phone} 전화</a>
      <a class="btn btn-kakao" href="${site.kakao}" target="_blank" rel="noopener">${icon.chat} 카톡</a>
      <a class="btn btn-ghost" href="${u(`/quote/?service=${s.slug}`)}">${icon.doc} 견적</a>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap two">
    <div>
      <h2 class="sec-title">이럴 때 맡기세요</h2>
      <ul class="ticks">${s.when.map((w) => `<li>${icon.check}${v(w)}</li>`).join("")}</ul>
    </div>
    <div class="card">
      <h2 class="sec-title">작업 체크리스트</h2>
      <p class="sec-sub">모든 현장에서 이 순서 그대로 작업하고, 끝나면 같이 확인합니다.</p>
      <ol class="checklist">${s.checklist.map((c) => `<li>${v(c)}</li>`).join("")}</ol>
      <p class="muted"><b>별도 문의 항목</b> · ${s.notIncluded.map(v).join(", ")}</p>
      <p class="muted"><b>소요 시간</b> · ${v(s.duration)}</p>
    </div>
  </div>
</section>

<section class="sec sec-tint">
  <div class="wrap">
    <h2 class="sec-title">진행 과정</h2>
    ${stepsList()}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <h2 class="sec-title">${s.name} 전후</h2>
    ${photoSlots([`[TODO:${s.name} 현장 사진 1]`, `[TODO:${s.name} 현장 사진 2]`])}
  </div>
</section>

<section class="sec sec-tint">
  <div class="wrap narrow">
    <h2 class="sec-title">${s.name} 자주 묻는 질문</h2>
    ${faqList(s.faqs)}
    <p class="more"><a href="${u("/faq/")}">전체 질문 보기 →</a></p>
  </div>
</section>

${ctaBand(`${s.name}, 사진 몇 장이면 견적이 빨라져요`)}

<section class="sec">
  <div class="wrap">
    <h2 class="sec-title">다른 서비스</h2>
    <div class="svc-mini">${others.map((o) => `<a href="${u(`/services/${o.slug}/`)}"><b>${o.name}</b><span>${o.question}</span></a>`).join("")}</div>
  </div>
</section>`;
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${site.regionText} ${s.name}`,
    serviceType: s.name,
    description: s.short,
    url: abs(path),
    provider: { "@type": "LocalBusiness", "@id": bizId(), name: site.name, telephone: site.phone },
    areaServed: areaServed(),
    offers: { "@type": "Offer", description: txt(s.priceFrom), priceCurrency: "KRW" },
  };
  return {
    path,
    title,
    description,
    body,
    jsonld: [serviceLd, faqPage(s.faqs), crumbs([["서비스", "/#services"], [s.name, path]])],
  };
}

// ── 3. 견적 신청 ───────────────────────────────────────────
function quote() {
  const path = "/quote/";
  return {
    path,
    title: `${site.regionText} 청소 견적 신청 | ${site.name}`,
    description: `${site.regionText} 입주·이사·거주·에어컨·사무실청소 견적 신청. 서비스·공간·일정·연락처 4단계로 1분이면 끝나요.`,
    body: `
${crumbNav([["견적 신청", path]])}
<section class="sec quote-sec">
  <div class="wrap narrow">
    <h1 class="sec-title">견적 신청</h1>
    <p class="sec-sub">4단계만 고르면 끝나요. 사진이 있으면 카톡으로 함께 보내 주세요.</p>
    ${quoteForm()}
    <div class="alt-contact">
      <p>폼이 번거로우시면</p>
      <a class="btn" href="${site.tel}">${icon.phone} ${v(cfg.phone)}</a>
      <a class="btn btn-kakao" href="${site.kakao}" target="_blank" rel="noopener">${icon.chat} 카톡 상담</a>
    </div>
  </div>
</section>`,
    jsonld: [crumbs([["견적 신청", path]])],
  };
}

// ── 4. 고객후기 ────────────────────────────────────────────
function reviews() {
  const path = "/reviews/";
  return {
    path,
    title: `${site.regionText} 청소 고객후기 | ${site.name}`,
    description: `${site.name} ${site.regionText} 청소 실제 고객후기. 별점, 작업 사진, 지역과 서비스를 함께 보여드립니다.`,
    body: `
${crumbNav([["고객후기", path]])}
<section class="sec">
  <div class="wrap">
    <h1 class="sec-title">고객후기</h1>
    <p class="sec-sub">별점·사진·지역·서비스·작업일을 함께 공개합니다. 직접 쓴 후기가 아닌 내용은 싣지 않습니다.</p>
    <div class="rv-filter" role="group" aria-label="서비스별 보기">
      <button type="button" class="chip on">전체</button>${services.map((s) => `<button type="button" class="chip">${s.name}</button>`).join("")}
    </div>
    ${reviewSlots(6)}
    <p class="muted center">외부 후기도 확인하세요 · <span class="todo">네이버 플레이스 리뷰 링크</span> · <span class="todo">숨고/당근 후기 링크</span></p>
  </div>
</section>
${ctaBand()}`,
    jsonld: [crumbs([["고객후기", path]])],
  };
}

// ── 5. 자주 묻는 질문 ──────────────────────────────────────
function faqPageView() {
  const path = "/faq/";
  const all = [...faqs(cfg), ...services.flatMap((s) => s.faqs)];
  return {
    path,
    title: `${site.regionText} 청소 자주 묻는 질문 | ${site.name}`,
    description: `${site.regionText} 입주청소·이사청소 견적, 추가요금, A/S, 예약 변경, 결제 방법 등 자주 묻는 질문과 답변.`,
    body: `
${crumbNav([["자주 묻는 질문", path]])}
<section class="sec">
  <div class="wrap narrow">
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
    title: `회사소개 | ${site.regionText} 청소 ${site.name}`,
    description: `${site.name}은 ${site.regionText}에서 입주·이사·거주·에어컨·사무실청소를 합니다. 같은 체크리스트, 고객 동반 검수, ${txt(cfg.asDays)}일 이내 A/S를 약속합니다.`,
    body: `
${crumbNav([["회사소개", path]])}
<section class="sec">
  <div class="wrap narrow">
    <h1 class="sec-title">회사소개</h1>
    <p class="lead">청소는 끝나기 전까지 결과를 볼 수 없는 서비스입니다. 그래서 저희는 결과를 약속하기 전에 <b>과정</b>을 먼저 보여드립니다.</p>
    <div class="card todo-card">
      <b>대표 인사말 자리</b>
      <p>[TODO] 대표님이 직접 쓰시는 3~5문장: 이 일을 시작한 이유, 고객에게 지키는 원칙, 하지 않는 것.</p>
      <div class="slot slot-wide"><span>대표 또는 작업팀 실제 사진 자리</span></div>
    </div>
  </div>
</section>
<section class="sec sec-tint">
  <div class="wrap">
    <h2 class="sec-title">지키는 약속</h2>
    <div class="promise-grid">${promises(cfg).map((p) => `<div class="promise">${icon.check}<b>${v(p.title)}</b><p>${v(p.body)}</p></div>`).join("")}</div>
  </div>
</section>
<section class="sec">
  <div class="wrap narrow">
    <h2 class="sec-title">업체 정보</h2>
    <dl class="info">
      <div><dt>상호</dt><dd>${v(cfg.name)}</dd></div>
      <div><dt>대표자</dt><dd>${v(c.owner)}</dd></div>
      <div><dt>서비스 지역</dt><dd>${regionHtml}</dd></div>
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
  <div class="cta-row center"><a class="btn" href="${u("/")}">홈으로</a><a class="btn btn-ghost" href="${u("/quote/")}">견적 신청</a></div>
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
