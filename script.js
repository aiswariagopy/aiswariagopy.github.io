(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ Theme toggle (preference kept in a JS variable, mirrored to localStorage when available) ============ */
  var currentTheme = 'dark';
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      currentTheme = saved;
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      currentTheme = 'light';
    }
  } catch (e) { /* storage unavailable — JS variable alone is fine */ }

  var themeToggle = document.getElementById('themeToggle');
  var themeIcon = themeToggle.querySelector('i');

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    var isDark = theme === 'dark';
    themeIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.setAttribute('aria-pressed', String(!isDark));
    try { localStorage.setItem('theme', theme); } catch (e) { /* ignore */ }
  }
  applyTheme(currentTheme);

  themeToggle.addEventListener('click', function () {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  /* ============ Typing animation ============ */
  var phrases = [
    'Senior Frontend Developer',
    'Figma-to-HTML Specialist',
    'Arabic RTL Expert',
    'Accessibility Advocate (MADA)',
    'React · Angular · Vue Developer'
  ];
  var typedEl = document.getElementById('typed');

  if (!prefersReducedMotion) {
    var pIndex = 0, cIndex = phrases[0].length, deleting = true;
    // Start by deleting the pre-rendered first phrase after a pause.
    setTimeout(function tick() {
      var phrase = phrases[pIndex];
      if (deleting) {
        cIndex--;
        typedEl.textContent = phrase.slice(0, cIndex);
        if (cIndex === 0) {
          deleting = false;
          pIndex = (pIndex + 1) % phrases.length;
        }
        setTimeout(tick, 35);
      } else {
        cIndex++;
        typedEl.textContent = phrases[pIndex].slice(0, cIndex);
        if (cIndex === phrases[pIndex].length) {
          deleting = true;
          setTimeout(tick, 2200);
        } else {
          setTimeout(tick, 70);
        }
      }
    }, 2400);
  }

  /* ============ Particle background ============ */
  var canvas = document.getElementById('particles');
  if (!prefersReducedMotion && canvas) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var COUNT = 45;
    var LINK_DIST = 130;

    function resize() {
      var hero = canvas.parentElement;
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    function makeParticles() {
      particles = [];
      for (var i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.8 + 0.8
        });
      }
    }

    function particleColor(alpha) {
      return currentTheme === 'dark'
        ? 'rgba(140, 165, 255,' + alpha + ')'
        : 'rgba(59, 91, 219,' + alpha + ')';
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = particleColor(0.5);
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = particleColor(0.14 * (1 - dist / LINK_DIST));
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }

    resize();
    makeParticles();
    draw();
    window.addEventListener('resize', function () { resize(); makeParticles(); });
  }

  /* ============ Scroll reveal ============ */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, idx) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.style.transitionDelay = (idx % 6) * 60 + 'ms';
          el.classList.add('visible');
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ============ Sticky navbar + active section highlight ============ */
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  var navAnchors = document.querySelectorAll('.nav-links a');
  var sections = document.querySelectorAll('main section[id]');
  if ('IntersectionObserver' in window) {
    var activeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navAnchors.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { activeObserver.observe(s); });
  }

  /* ============ Hamburger menu ============ */
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  var hamburgerIcon = hamburger.querySelector('i');

  function setMenu(open) {
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    hamburgerIcon.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  }

  hamburger.addEventListener('click', function () {
    setMenu(!navLinks.classList.contains('open'));
  });
  navAnchors.forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      setMenu(false);
      hamburger.focus();
    }
  });

  /* ============ Footer year ============ */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
