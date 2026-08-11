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

  /* ---------- Role rotator ---------- */
  var roles = [
    { word: "salesperson", tail: "in every store",    ind: "Retail" },
    { word: "concierge",   tail: "for every guest",   ind: "Hospitality" },
    { word: "promoter",    tail: "at every booth",    ind: "MICE" },
    { word: "concierge",   tail: "at every entrance", ind: "Airports" }
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
