/* Oomph! AI — interactions. No dependencies; transform/opacity animations only. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav ---------- */
  var nav = document.getElementById("nav");
  var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var burger = document.getElementById("navBurger");
  var links = document.getElementById("navLinks");
  burger.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up stats ---------- */
  var counters = document.querySelectorAll(".stat-num[data-count]");
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var start = null, dur = 1200;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCounter(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Signature: multilingual ambassador terminal ---------- */
  var scenes = [
    { code: "EN", lang: "English",  guest: "Where can I get late dinner near the hotel?",
      reply: "Rooftop Kitchen on level 21 serves until 1 AM — I can reserve a table for you right now." },
    { code: "中文", lang: "Chinese", guest: "酒店附近哪里可以吃夜宵？",
      reply: "21楼的空中餐厅营业至凌晨1点——我现在就可以为您预订座位。" },
    { code: "ES", lang: "Español",  guest: "¿Dónde puedo cenar tarde cerca del hotel?",
      reply: "Rooftop Kitchen en el piso 21 sirve hasta la 1 AM — puedo reservarle una mesa ahora mismo." },
    { code: "AR", lang: "العربية",  guest: "أين يمكنني تناول عشاء متأخر بالقرب من الفندق؟",
      reply: "مطعم رووفتوب في الطابق ٢١ يقدم الطعام حتى الواحدة صباحاً — يمكنني حجز طاولة لك الآن." },
    { code: "JA", lang: "日本語",    guest: "ホテルの近くで遅い夕食はどこで食べられますか？",
      reply: "21階のルーフトップキッチンは深夜1時まで営業しています。今すぐお席をご予約できます。" },
    { code: "FR", lang: "Français", guest: "Où puis-je dîner tard près de l'hôtel ?",
      reply: "Le Rooftop Kitchen au 21e étage sert jusqu'à 1 h — je peux vous réserver une table immédiatement." }
  ];

  var termLang = document.getElementById("termLang");
  var termGuest = document.getElementById("termGuest");
  var termReply = document.getElementById("termReply");
  var termRail = document.getElementById("termRail");

  scenes.forEach(function (s, i) {
    var chip = document.createElement("span");
    chip.textContent = s.code;
    if (i === 0) chip.classList.add("active");
    termRail.appendChild(chip);
  });
  var chips = termRail.children;

  var sceneIdx = 0, typeTimer = null, sceneTimer = null;

  function showScene(idx, animate) {
    var s = scenes[idx];
    termLang.textContent = s.code + " · " + s.lang;
    termGuest.textContent = s.guest;
    for (var i = 0; i < chips.length; i++) chips[i].classList.toggle("active", i === idx);

    clearTimeout(typeTimer);
    if (!animate) {
      termReply.textContent = s.reply;
      return;
    }
    termReply.textContent = "";
    var ci = 0;
    (function type() {
      if (ci <= s.reply.length) {
        termReply.textContent = s.reply.slice(0, ci);
        ci += 2;
        typeTimer = setTimeout(type, 28);
      }
    })();
  }

  function nextScene() {
    sceneIdx = (sceneIdx + 1) % scenes.length;
    showScene(sceneIdx, !reduceMotion);
    sceneTimer = setTimeout(nextScene, 6500);
  }

  showScene(0, !reduceMotion);
  sceneTimer = setTimeout(nextScene, 6500);

  // Pause the loop when the tab is hidden to save battery.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { clearTimeout(sceneTimer); clearTimeout(typeTimer); }
    else { sceneTimer = setTimeout(nextScene, 3000); }
  });

  /* ---------- Role rotator ---------- */
  var roles = [
    { word: "concierge",           tail: "for every guest",    ind: "Hospitality" },
    { word: "salesperson",         tail: "in every store",     ind: "Retail" },
    { word: "promoter",            tail: "at every booth",     ind: "Exhibitions" },
    { word: "receptionist",        tail: "at every entrance",  ind: "Corporate" },
    { word: "consultant",          tail: "for every buyer",    ind: "Real Estate" },
    { word: "advisor",             tail: "for every patient",  ind: "Healthcare" },
    { word: "counsellor",          tail: "for every student",  ind: "Education" },
    { word: "information officer", tail: "for every citizen",  ind: "Government" }
  ];
  var rotator = document.querySelector(".rotator");
  var rotWord = document.getElementById("rotWord");
  var rotTail = document.getElementById("rotTail");
  var rotInd = document.getElementById("rotInd");
  var roleIdx = 0;

  function nextRole() {
    roleIdx = (roleIdx + 1) % roles.length;
    var apply = function () {
      rotWord.textContent = roles[roleIdx].word;
      rotTail.textContent = roles[roleIdx].tail;
      rotInd.textContent = roles[roleIdx].ind;
    };
    if (reduceMotion) { apply(); return; }
    rotator.classList.add("switching");
    setTimeout(function () {
      apply();
      rotator.classList.remove("switching");
    }, 320);
  }
  setInterval(nextRole, 3200);

  /* ---------- Demo form (front-end only) ----------
     Composes an email to the sales inbox. To use a form backend instead
     (Formspree, Basin, your API), replace this handler with a fetch(). */
  var form = document.getElementById("demoForm");
  var note = document.getElementById("formNote");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var d = new FormData(form);
    var subject = "Demo request — Oomph! AI (" + d.get("industry") + ")";
    var body = "Name: " + d.get("name") +
      "\nCompany: " + d.get("company") +
      "\nEmail: " + d.get("email") +
      "\nIndustry: " + d.get("industry") +
      "\n\n" + (d.get("message") || "");
    window.location.href = "mailto:contact@gennexisdigital.com?subject=" +
      encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    note.textContent = "Opening your email client — send the drafted message to complete the request.";
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
