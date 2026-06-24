/* Takelaar Sleepdienst — interactivity */
(function () {
  'use strict';

  var header = document.getElementById('header');
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('nav-links');
  var toast = document.getElementById('toast');

  /* ---- Header scroll state ---- */
  function onScroll() {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu toggle ---- */
  var navClose = document.getElementById('nav-close');
  var navOverlay = document.getElementById('nav-overlay');
  function closeMenu() {
    header.classList.remove('menu-open');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function openMenu() {
    header.classList.add('menu-open');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  if (hamburger) {
    hamburger.addEventListener('click', function () {
      if (header.classList.contains('menu-open')) closeMenu();
      else openMenu();
    });
  }
  if (navClose) navClose.addEventListener('click', closeMenu);
  if (navOverlay) navOverlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---- Smooth scroll for in-page anchors + close menu ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = header.offsetHeight + 12;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
      closeMenu();
    });
  });

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---- Active nav link highlighting ---- */
  var sections = [];
  navLinks && navLinks.querySelectorAll('a[href^="#"]').forEach(function (link) {
    var sec = document.querySelector(link.getAttribute('href'));
    if (sec) sections.push({ link: link, sec: sec });
  });
  function setActive() {
    var pos = window.scrollY + header.offsetHeight + 80;
    var current = null;
    sections.forEach(function (item) {
      if (item.sec.offsetTop <= pos) current = item;
    });
    sections.forEach(function (item) {
      item.link.classList.toggle('active', item === current);
    });
  }
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  /* ---- Toast helper ---- */
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 4500);
  }

  /* ---- Form handling: stuur ingevulde gegevens naar WhatsApp ---- */
  var WHATSAPP_NUMBER = '31620201777';

  function fieldVal(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el && el.value ? el.value.trim() : '';
  }

  function handleForm(form, opts) {
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      // Bouw een net WhatsApp-bericht op uit de ingevulde velden
      var lines = [opts.intro];
      opts.fields.forEach(function (f) {
        var v = fieldVal(form, f.name);
        if (v) lines.push(f.label + ': ' + v);
      });
      var text = encodeURIComponent(lines.join('\n'));
      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + text;

      showToast(opts.toast);
      // open WhatsApp (nieuw tabblad/app)
      window.open(url, '_blank');
      form.reset();
    });
  }

  handleForm(document.getElementById('quick-form'), {
    intro: 'Hallo, ik heb met spoed hulp nodig via Autoredder.nl:',
    toast: '✅ WhatsApp wordt geopend — tik op verzenden om te versturen.',
    fields: [
      { name: 'naam', label: 'Naam' },
      { name: 'telefoon', label: 'Telefoon' },
      { name: 'locatie', label: 'Locatie' },
      { name: 'dienst', label: 'Dienst' }
    ]
  });

  handleForm(document.getElementById('offerte-form'), {
    intro: 'Hallo, ik wil graag een offerte aanvragen via Autoredder.nl:',
    toast: '✅ WhatsApp wordt geopend — tik op verzenden om te versturen.',
    fields: [
      { name: 'naam', label: 'Naam' },
      { name: 'telefoon', label: 'Telefoon' },
      { name: 'email', label: 'E-mail' },
      { name: 'dienst', label: 'Dienst' },
      { name: 'van', label: 'Ophaaladres' },
      { name: 'naar', label: 'Bestemming' },
      { name: 'bericht', label: 'Toelichting' }
    ]
  });

  /* ---- FAQ: close siblings for accordion feel ---- */
  var faqList = document.getElementById('faq-list');
  if (faqList) {
    var items = faqList.querySelectorAll('details');
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) {
          items.forEach(function (other) {
            if (other !== d) other.open = false;
          });
        }
      });
    });
  }

  /* ---- Current year in footer (if placeholder present) ---- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
