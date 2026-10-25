// 견적 폼 4단계 진행 + 카카오톡/문자 전송
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

  if (!form) return;
  var steps = form.querySelectorAll(".q-step");
  var bars = form.querySelectorAll(".q-progress li");
  var prev = form.querySelector("[data-prev]");
  var next = form.querySelector("[data-next]");
  var send = form.querySelector(".q-send");
  var cur = 0;

  function val(n) {
    var el = form.querySelector('[name="' + n + '"]:checked') || form.querySelector('[name="' + n + '"]:not([type=radio]):not([type=checkbox])');
    return el ? el.value.trim() : "";
  }
  function show(i) {
    cur = i;
    steps.forEach(function (s, k) { s.classList.toggle("on", k === i); });
    bars.forEach(function (b, k) { b.classList.toggle("on", k <= i); });
    prev.hidden = i === 0;
    next.hidden = i === steps.length - 1;
    send.hidden = i !== steps.length - 1;
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
    var date = val("date") ? val("date") : "미정";
    var lines = [
      "[견적 문의] " + (S.name || ""),
      "서비스: " + val("service"),
      "공간: " + val("space") + (val("size") ? " / " + val("size") : "") + " / 오염: " + val("dirt"),
      "희망일: " + date + " " + val("time") + (form.flex.checked ? " (조정 가능)" : ""),
      "지역: " + val("area"),
      "성함: " + (val("name") || "-"),
      "연락처: " + val("phone"),
    ];
    if (val("memo")) lines.push("요청: " + val("memo"));
    return lines.join("\n");
  }

  // 단계 1에서 서비스를 고르면 자동으로 다음 단계로
  form.querySelectorAll('[name="service"]').forEach(function (r) {
    r.addEventListener("change", function () { if (cur === 0) setTimeout(function () { show(1); }, 180); });
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

  // 메인 첫 화면 "30초 견적" → 아래 폼으로 이어서
  document.querySelectorAll("[data-pick]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var r = form.querySelector('[name="service"][value="' + a.dataset.pick + '"]');
      if (!r) return;
      e.preventDefault();
      r.checked = true;
      show(1);
      document.getElementById("quote").scrollIntoView({ behavior: "smooth" });
    });
  });

  // /quote/?service=move-in 처럼 들어오면 서비스 미리 선택
  var slug = new URLSearchParams(location.search).get("service");
  var map = S.svc || {};
  if (slug && map[slug]) {
    var r = form.querySelector('[name="service"][value="' + map[slug] + '"]');
    if (r) { r.checked = true; show(1); }
  } else show(0);
})();
