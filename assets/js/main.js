/* ==========================================================================
   Pink Ridge — premium interactions
   Vanilla JS · no dependencies · no storage · performance-minded
   ========================================================================== */
(function () {
  'use strict';
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Scroll-aware sticky header ---- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 30);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile navigation ---- */
  var hamburger = document.querySelector('.hamburger');
  var mobileNav = document.querySelector('.mobile-nav');
  function openNav() { body.classList.add('nav-open'); if (hamburger) hamburger.setAttribute('aria-expanded', 'true'); }
  function closeNav() { body.classList.remove('nav-open'); if (hamburger) hamburger.setAttribute('aria-expanded', 'false'); }
  if (hamburger) hamburger.addEventListener('click', function () {
    body.classList.contains('nav-open') ? closeNav() : openNav();
  });
  if (mobileNav) mobileNav.addEventListener('click', function (e) {
    if (e.target.closest('[data-close-nav]') || e.target.classList.contains('mobile-nav__scrim')) closeNav();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  /* ---- Scroll reveal ---- */
  var animated = document.querySelectorAll('[data-animate]');
  if ('IntersectionObserver' in window && animated.length && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    animated.forEach(function (el) { io.observe(el); });
  } else {
    animated.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Number counters ---- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        cio.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var decimals = (target % 1 !== 0) ? 1 : 0;
        if (reduce) { el.textContent = target.toFixed(decimals) + suffix; return; }
        var start = performance.now(), dur = 1600;
        function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---- Button ripple ---- */
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (reduce) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - rect.left - size / 2) + 'px';
      span.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(span);
      setTimeout(function () { span.remove(); }, 620);
    });
  });

  /* ---- Card tilt (desktop, fine pointer) ---- */
  if (window.matchMedia('(pointer:fine)').matches && !reduce) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      el.classList.add('tilt');
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (-y * 6) + 'deg) rotateY(' + (x * 6) + 'deg) translateY(-6px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---- Hero parallax on decorative blobs ---- */
  var blobs = document.querySelectorAll('[data-parallax]');
  if (blobs.length && !reduce) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      blobs.forEach(function (b) {
        var speed = parseFloat(b.getAttribute('data-parallax')) || 0.2;
        b.style.transform = 'translateY(' + (y * speed) + 'px)';
      });
    }, { passive: true });
  }

  /* ---- Testimonials slider ---- */
  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    var track = slider.querySelector('.tslider__track');
    var slides = slider.querySelectorAll('.tslide');
    var dotsWrap = slider.querySelector('.tslider__dots');
    if (!track || slides.length < 2) return;
    var i = 0, timer;
    slides.forEach(function (_, idx) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Go to testimonial ' + (idx + 1));
      b.addEventListener('click', function () { go(idx); reset(); });
      dotsWrap.appendChild(b);
    });
    var dots = dotsWrap.querySelectorAll('button');
    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-i * 100) + '%)';
      dots.forEach(function (d, k) { d.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    }
    function next() { go(i + 1); }
    function reset() { if (reduce) return; clearInterval(timer); timer = setInterval(next, 5500); }
    go(0); reset();
    slider.addEventListener('mouseenter', function () { clearInterval(timer); });
    slider.addEventListener('mouseleave', reset);
  });

  /* ---- Carousel arrows ---- */
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('.carousel__track');
    var prev = car.querySelector('[data-car-prev]');
    var nextb = car.querySelector('[data-car-next]');
    if (!track) return;
    function step() { var item = track.querySelector('.carousel__item'); return item ? item.offsetWidth + 22 : 300; }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (nextb) nextb.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
  });

  /* ---- Inquiry form ---- */
  document.querySelectorAll('form[data-inquiry]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hp = form.querySelector('input[name="company_website"]');
      if (hp && hp.value.trim() !== '') return; // bot
      var success = form.querySelector('.form-success');
      form.querySelectorAll('input, select, textarea, button').forEach(function (el) {
        if (!el.classList.contains('hp')) el.setAttribute('disabled', 'disabled');
      });
      if (success) {
        success.classList.add('show');
        success.setAttribute('tabindex', '-1');
        success.focus();
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  /* ---- Footer year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
