/* ==========================================================================
   Pink Ridge — editorial interactions (restrained)
   Vanilla JS · no dependencies · no storage
   ========================================================================== */
(function () {
  'use strict';
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll-aware header + transparent nav over full-bleed hero */
  var header = document.querySelector('.site-header');
  var hasHeroFull = !!document.querySelector('.hero-full, .hero2');
  function onScroll() {
    var scrolled = window.scrollY > 24;
    if (header) header.classList.toggle('scrolled', scrolled);
    if (hasHeroFull) body.classList.toggle('at-top', !scrolled);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile nav */
  var hamburger = document.querySelector('.hamburger');
  var mobileNav = document.querySelector('.mobile-nav');
  function closeNav() { body.classList.remove('nav-open'); if (hamburger) hamburger.setAttribute('aria-expanded', 'false'); }
  if (hamburger) hamburger.addEventListener('click', function () {
    var open = body.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  if (mobileNav) mobileNav.addEventListener('click', function (e) {
    if (e.target.closest('[data-close-nav]') || e.target.classList.contains('mobile-nav__scrim')) closeNav();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  /* Subtle scroll reveal */
  var animated = document.querySelectorAll('[data-animate]');
  if ('IntersectionObserver' in window && animated.length && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    animated.forEach(function (el) { io.observe(el); });
  } else {
    animated.forEach(function (el) { el.classList.add('in'); });
  }

  /* Number counters */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target; cio.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var decimals = (target % 1 !== 0) ? 1 : 0;
        if (reduce) { el.textContent = target.toFixed(decimals) + suffix; return; }
        var start = performance.now(), dur = 1500;
        function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* Testimonials slider */
  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    var track = slider.querySelector('.tslider__track');
    var slides = slider.querySelectorAll('.tslide');
    var dotsWrap = slider.querySelector('.tslider__dots');
    if (!track || slides.length < 2) return;
    var i = 0, timer;
    slides.forEach(function (_, idx) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Testimonial ' + (idx + 1));
      b.addEventListener('click', function () { go(idx); reset(); });
      dotsWrap.appendChild(b);
    });
    var dots = dotsWrap.querySelectorAll('button');
    function go(n) { i = (n + slides.length) % slides.length; track.style.transform = 'translateX(' + (-i * 100) + '%)'; dots.forEach(function (d, k) { d.setAttribute('aria-selected', k === i ? 'true' : 'false'); }); }
    function reset() { if (reduce) return; clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 6000); }
    go(0); reset();
    slider.addEventListener('mouseenter', function () { clearInterval(timer); });
    slider.addEventListener('mouseleave', reset);
  });

  /* Carousel arrows */
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('.carousel__track');
    if (!track) return;
    function step() { var it = track.querySelector('.carousel__item'); return it ? it.offsetWidth + 24 : 280; }
    var p = car.querySelector('[data-car-prev]'), n = car.querySelector('[data-car-next]');
    if (p) p.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (n) n.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
  });

  /* Product gallery + lightbox + swipe */
  document.querySelectorAll('[data-gallery]').forEach(function (gallery) {
    var stage = gallery.querySelector('.gallery-stage');
    var stageImg = stage ? stage.querySelector('img') : null;
    var thumbs = Array.prototype.slice.call(gallery.querySelectorAll('.thumb'));
    var countEl = gallery.querySelector('.gallery-count b');
    if (!stage || !stageImg) return;
    var sources = thumbs.length ? thumbs.map(function (t) { return { full: t.getAttribute('data-full'), alt: t.querySelector('img').getAttribute('alt') }; })
      : [{ full: stageImg.getAttribute('src'), alt: stageImg.getAttribute('alt') }];
    var index = 0;
    function show(i, animate) {
      index = (i + sources.length) % sources.length;
      function set() { stageImg.src = sources[index].full; stageImg.alt = sources[index].alt; stage.classList.remove('swapping'); }
      if (animate && !reduce) { stage.classList.add('swapping'); setTimeout(set, 160); } else set();
      thumbs.forEach(function (t, k) { t.setAttribute('aria-current', k === index ? 'true' : 'false'); });
      if (countEl) countEl.textContent = (index + 1);
    }
    thumbs.forEach(function (t, k) { t.addEventListener('click', function () { show(k, true); }); });
    var x0 = null;
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 45) show(index + (dx < 0 ? 1 : -1), true); x0 = null; });

    var lb = document.getElementById('lightbox');
    if (lb) {
      var lbImg = lb.querySelector('.lightbox__img'), lbCount = lb.querySelector('.lightbox__count');
      function sync() { lbImg.src = sources[index].full; lbImg.alt = sources[index].alt; lbImg.classList.remove('zoomed'); if (lbCount) lbCount.textContent = (index + 1) + ' / ' + sources.length; }
      function openLb() { sync(); lb.classList.add('open'); body.style.overflow = 'hidden'; }
      function closeLb() { lb.classList.remove('open'); body.style.overflow = ''; }
      function lbShow(i) { show(i, false); sync(); }
      stage.addEventListener('click', openLb);
      stage.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(); } });
      lb.querySelector('.lightbox__close').addEventListener('click', closeLb);
      lb.querySelector('.lightbox__prev').addEventListener('click', function () { lbShow(index - 1); });
      lb.querySelector('.lightbox__next').addEventListener('click', function () { lbShow(index + 1); });
      lbImg.addEventListener('click', function () { lbImg.classList.toggle('zoomed'); });
      lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') closeLb(); else if (e.key === 'ArrowLeft') lbShow(index - 1); else if (e.key === 'ArrowRight') lbShow(index + 1);
      });
      var lx0 = null;
      lb.addEventListener('touchstart', function (e) { lx0 = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener('touchend', function (e) { if (lx0 === null) return; var dx = e.changedTouches[0].clientX - lx0; if (Math.abs(dx) > 45) lbShow(index + (dx < 0 ? 1 : -1)); lx0 = null; });
    }
    show(0, false);
  });

  /* Inquiry forms + product prefill */
  var params = new URLSearchParams(window.location.search);
  var product = params.get('product');
  document.querySelectorAll('[data-product-name]').forEach(function (el) { if (!product) product = el.getAttribute('data-product-name'); });
  if (product) {
    document.querySelectorAll('input[name="product"]').forEach(function (inp) { inp.value = product; });
    document.querySelectorAll('select[name="interest"]').forEach(function (sel) {
      for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].value === product || sel.options[i].text === product) { sel.selectedIndex = i; return; } }
    });
    document.querySelectorAll('textarea[name="message"]').forEach(function (ta) { if (!ta.value) ta.value = 'I would like a quote for: ' + product + '.\n\nQuantity / sizes / destination: '; });
  }
  document.querySelectorAll('form[data-inquiry]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hp = form.querySelector('input[name="company_website"]');
      if (hp && hp.value.trim() !== '') return;
      var success = form.querySelector('.form-success');
      form.querySelectorAll('input, select, textarea, button').forEach(function (el) { if (!el.classList.contains('hp')) el.setAttribute('disabled', 'disabled'); });
      if (success) { success.classList.add('show'); success.setAttribute('tabindex', '-1'); success.focus(); success.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
  });

  /* Year */
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

  /* Subtle parallax on full-bleed bands */
  var pxItems = Array.prototype.slice.call(document.querySelectorAll('[data-parallax] .parallax__bg'));
  if (pxItems.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var pxTick = false;
    function pxUpdate() {
      pxTick = false;
      var vh = window.innerHeight;
      pxItems.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var progress = (r.top + r.height / 2 - vh / 2) / vh; /* -1..1 */
        img.style.transform = 'translate3d(0,' + (progress * 7).toFixed(2) + '%,0) scale(1.14)';
      });
    }
    window.addEventListener('scroll', function () { if (!pxTick) { pxTick = true; requestAnimationFrame(pxUpdate); } }, { passive: true });
    window.addEventListener('resize', pxUpdate);
    pxUpdate();
  }

  /* ---------------- HERO: dust particles ---------------- */
  var dust = document.querySelector('[data-dust]');
  if (dust && !reduce) {
    var dctx = dust.getContext('2d'), dp = [], DPR = Math.min(window.devicePixelRatio || 1, 2);
    function dsize() {
      var r = dust.parentElement.getBoundingClientRect();
      dust.width = r.width * DPR; dust.height = r.height * DPR;
      var n = Math.round((r.width * r.height) / 26000);
      dp = []; for (var i = 0; i < n; i++) dp.push({
        x: Math.random() * dust.width, y: Math.random() * dust.height,
        r: (Math.random() * 1.6 + 0.4) * DPR, s: Math.random() * 0.28 + 0.05,
        d: Math.random() * Math.PI * 2, o: Math.random() * 0.5 + 0.2
      });
    }
    dsize(); window.addEventListener('resize', dsize);
    (function drawDust() {
      dctx.clearRect(0, 0, dust.width, dust.height);
      for (var i = 0; i < dp.length; i++) {
        var p = dp[i]; p.y -= p.s; p.x += Math.sin(p.d += 0.01) * 0.25;
        if (p.y < -6) { p.y = dust.height + 6; p.x = Math.random() * dust.width; }
        dctx.beginPath(); dctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        dctx.fillStyle = 'rgba(245,220,206,' + p.o + ')'; dctx.fill();
      }
      requestAnimationFrame(drawDust);
    })();
  }

  /* ---------------- HERO: depth parallax (mouse + scroll) ---------------- */
  var stage = document.querySelector('.hero2');
  if (stage && !reduce) {
    var depthEls = Array.prototype.slice.call(stage.querySelectorAll('[data-depth]'));
    var heroBg = stage.querySelector('[data-hero-bg]');
    var mx = 0, my = 0, cx = 0, cy = 0, sY = 0, raf = false;
    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
      req();
    });
    stage.addEventListener('mouseleave', function () { mx = 0; my = 0; req(); });
    window.addEventListener('scroll', function () { sY = window.pageYOffset; req(); }, { passive: true });
    function req() { if (!raf) { raf = true; requestAnimationFrame(loop); } }
    function loop() {
      raf = false;
      cx += (mx - cx) * 0.08; cy += (my - cy) * 0.08;
      depthEls.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-depth')) || 20;
        var tx = cx * d, ty = cy * d - (sY * d * 0.02);
        el.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0)';
      });
      if (heroBg) heroBg.style.transform = 'translate3d(' + (cx * 10).toFixed(2) + 'px,' + (sY * 0.18).toFixed(2) + 'px,0)';
      if (Math.abs(mx - cx) > 0.001 || Math.abs(my - cy) > 0.001) req();
    }
  }

  /* ---------------- Magnetic buttons ---------------- */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      var mraf = false, tx = 0, ty = 0;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        tx = (e.clientX - r.left - r.width / 2) * 0.28;
        ty = (e.clientY - r.top - r.height / 2) * 0.4;
        if (!mraf) { mraf = true; requestAnimationFrame(function () { mraf = false; el.style.transform = 'translate(' + tx + 'px,' + ty + 'px)'; }); }
      });
      el.addEventListener('mouseleave', function () { el.style.transform = 'translate(0,0)'; });
    });
  }
})();
