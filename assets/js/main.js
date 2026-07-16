/* ==========================================================================
   Pink Ridge — shared interactions
   Vanilla JS · no dependencies · no storage
   ========================================================================== */
(function () {
  'use strict';

  /* ---- Mobile navigation ---- */
  var body = document.body;
  var hamburger = document.querySelector('.hamburger');
  var mobileNav = document.querySelector('.mobile-nav');

  function openNav() {
    body.classList.add('nav-open');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
  }
  function closeNav() {
    body.classList.remove('nav-open');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      body.classList.contains('nav-open') ? closeNav() : openNav();
    });
  }
  if (mobileNav) {
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('[data-close-nav]') || e.target.classList.contains('mobile-nav__scrim')) {
        closeNav();
      }
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* ---- Scroll reveal (fade-up) ---- */
  var animated = document.querySelectorAll('[data-animate]');
  if ('IntersectionObserver' in window && animated.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    animated.forEach(function (el) { io.observe(el); });
  } else {
    animated.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Inquiry form (no backend — success message only) ---- */
  var forms = document.querySelectorAll('form[data-inquiry]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // Honeypot: if filled, silently ignore (likely a bot).
      var hp = form.querySelector('input[name="company_website"]');
      if (hp && hp.value.trim() !== '') return;

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
