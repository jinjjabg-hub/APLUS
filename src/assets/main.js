// 견적 폼 4단계 진행 + 예상 금액 계산 + 카카오톡/문자 전송
(function () {
  var form = document.getElementById("qform");
  var S = window.SITE || {};

  // 후기 필터 버튼 (실제 후기가 생기면 data-service로 필터링)
  document.querySelectorAll(".rv-filter .chip").forEach(function (b, _, all) {
    b.addEventListener("click", function () {
      all.forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
    });
  });

  // 영상 위 헤더: 스크롤하면 흰 배경으로
  var hdr = document.querySelector(".site-header.is-overlay");
  if (hdr) {
    var onScroll = function () {
      var past = window.scrollY > window.innerHeight * 0.6;
      hdr.classList.toggle("scrolled", past);
      document.body.classList.toggle("at-hero", !past); // PC: 첫 화면에서는 퀵메뉴 대신 헤더 버튼 사용
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // 움직임 줄이기 설정이면 배경 영상 멈춤
  var vid = document.querySelector(".hv-video");
  if (vid && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { vid.removeAttribute("autoplay"); vid.pause(); }

  // 전후 비교 슬라이더
  document.querySelectorAll(".ba-box").forEach(function (box) {
    var r = box.querySelector("input");
    r.addEventListener("input", function () { box.style.setProperty("--pos", r.value + "%"); });
  });

  // 요금 섹션 평수 계산기
  var calcBox = document.querySelector(".calc");
  if (calcBox) {
    var cr = calcBox.querySelector("input"), rate = +calcBox.dataset.rate, link = calcBox.querySelector("[data-calc-link]");
    var upd = function () {
      calcBox.querySelector("output b").textContent = cr.value;
      calcBox.querySelector(".calc-sum b").textContent = (cr.value * rate).toLocaleString("ko-KR");
      link.href = link.href.replace(/py=\d+/, "py=" + cr.value);
    };
    cr.addEventListener("input", upd);
  }

  if (!form) return;
  var steps = form.querySelectorAll(".q-step");
  var bars = form.querySelectorAll(".q-progress li");
  var prev = form.querySelector("[data-prev]");
  var next = form.querySelector("[data-next]");
  var send = form.querySelector(".q-send");
  var range = form.pyeongRange, num = form.pyeong;
  var cur = 0;

  function val(n) {
    var el = form.querySelector('[name="' + n + '"]:checked') || form.querySelector('[name="' + n + '"]:not([type=radio]):not([type=checkbox])');
    return el ? el.value.trim() : "";
  }
  function all(n) {
    return [].map.call(form.querySelectorAll('[name="' + n + '"]:checked'), function (x) { return x.value; });
  }
  function won(n) { return n.toLocaleString("ko-KR"); }

  // 예상 금액: 입주·이사청소(+패키지 기본 청소분)만 평수 × 단가로 계산
  function calc() {
    var p = Math.max(0, parseInt(num.value, 10) || 0);
    form.querySelector("[data-m2]").textContent = p ? "약 " + (p * 3.3058).toFixed(1) + "㎡ (공급면적)" : "";
    var svc = val("service");
    var sum = form.querySelector("[data-calc-sum]"), unit = form.querySelector("[data-calc-unit]"), note = form.querySelector("[data-calc-note]");
    if (svc && (S.perPyeong || []).indexOf(svc) > -1 && p) {
      sum.textContent = won(p * S.rate);
      unit.textContent = "원~";
      note.textContent = p + "평 × " + won(S.rate) + "원 기준" + (svc === "올인원 패키지" || all("addon").length ? " · 추가 시공은 상담 후 안내" : "");
    } else if (svc) {
      sum.textContent = "상담 후";
      unit.textContent = "";
      note.textContent = svc + "은 현장 확인 후 견적을 드려요.";
    } else {
      sum.textContent = "-";
      unit.textContent = "";
      note.textContent = "입주·이사청소를 고르면 평수로 바로 계산돼요.";
    }
    return sum.textContent + unit.textContent;
  }
  range.addEventListener("input", function () { num.value = range.value; calc(); });
  num.addEventListener("input", function () { range.value = Math.min(80, Math.max(10, num.value || 10)); calc(); });
  form.addEventListener("change", calc);

  function show(i) {
    cur = i;
    steps.forEach(function (s, k) { s.classList.toggle("on", k === i); });
    bars.forEach(function (b, k) { b.classList.toggle("on", k <= i); });
    prev.hidden = i === 0;
    next.hidden = i === steps.length - 1;
    send.hidden = i !== steps.length - 1;
    calc();
  }
  function ok(i) {
    var bad = false;
    if (i === 0) bad = !val("service");
    if (i === 1) bad = !val("space");
    if (i === 3) bad = val("phone").replace(/[^0-9]/g, "").length < 9 || !form.agree.checked;
    var err = steps[i].querySelector(".q-err");
    if (err) err.hidden = !bad;
    return !bad;
  }
  function message() {
    var add = all("addon"), ext = all("extra");
    var lines = [
      "[견적 문의] " + (S.name || ""),
      "서비스: " + val("service") + (add.length ? " + " + add.join(", ") : ""),
      "공간: " + val("space") + " / 공급 " + val("pyeong") + "평 / 베란다 " + val("balcony") + (ext.length ? " / " + ext.join(", ") : ""),
      "예상 기본 금액: " + calc(),
      "희망일: " + (val("date") || "미정") + " " + val("time"),
      "지역: " + val("area") + (val("building") ? " (" + val("building") + ")" : ""),
      "성함: " + (val("name") || "-"),
      "연락처: " + val("phone"),
    ];
    if (val("memo")) lines.push("요청: " + val("memo"));
    return lines.join("\n");
  }

  // 단계 1에서 서비스를 고르면 금액을 보여 주고 자동으로 다음 단계로
  form.querySelectorAll('[name="service"]').forEach(function (r) {
    r.addEventListener("change", function () { calc(); if (cur === 0) setTimeout(function () { show(1); }, 250); });
  });
  next.addEventListener("click", function () { if (ok(cur)) show(cur + 1); });
  prev.addEventListener("click", function () { show(cur - 1); });

  form.querySelectorAll("[data-send]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!ok(3)) return;
      var msg = message();
      var done = form.querySelector(".q-done");
      done.querySelector("textarea").value = msg;
      if (b.dataset.send === "sms") {
        // iOS·안드로이드 모두 동작하는 형식
        location.href = "sms:" + (S.phone || "").replace(/[^0-9]/g, "") + "?&body=" + encodeURIComponent(msg);
        return;
      }
      var open = function () { window.open(S.kakao.replace(/\/$/, "") + "/chat", "_blank", "noopener"); };
      done.hidden = false;
      if (navigator.clipboard) navigator.clipboard.writeText(msg).then(open, open);
      else { done.querySelector("textarea").select(); try { document.execCommand("copy"); } catch (e) {} open(); }
    });
  });

  function pick(name) {
    var r = form.querySelector('[name="service"][value="' + name + '"]');
    if (r) { r.checked = true; show(1); }
    return r;
  }

  // 메인 첫 화면 "1분 견적" → 아래 폼으로 이어서
  document.querySelectorAll("[data-pick]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (!pick(a.dataset.pick)) return;
      e.preventDefault();
      document.getElementById("quote").scrollIntoView({ behavior: "smooth" });
    });
  });

  // /quote/?service=move-in 처럼 들어오면 서비스 미리 선택
  var qs = new URLSearchParams(location.search);
  var py = parseInt(qs.get("py"), 10);
  if (py > 0) { num.value = py; range.value = Math.min(80, Math.max(10, py)); }
  var slug = qs.get("service");
  var map = S.svc || {};
  map["package"] = "올인원 패키지";
  if (!(slug && map[slug] && pick(map[slug]))) show(0);
})();
