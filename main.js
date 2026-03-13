(function () {
  'use strict';

  // ── THEME ──────────────────────────────────────────────────────────────────
  const html = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('ct-theme');
  if (saved) html.setAttribute('data-theme', saved);
  else html.setAttribute('data-theme', window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');

  themeBtn?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ct-theme', next);
    initParticles();
  });

  // ── PARTICLES ──────────────────────────────────────────────────────────────
  const canvas = document.getElementById('canvas');
  const ctx = canvas?.getContext('2d');
  let pts = [], raf;

  function resize() { if (!canvas) return; canvas.width = innerWidth; canvas.height = innerHeight; }
  function color(a) {
    return html.getAttribute('data-theme') === 'dark'
      ? `rgba(237,233,227,${a})`
      : `rgba(26,24,22,${a})`;
  }
  function mk() {
    return {
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * .8 + .2,
      vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .12,
      a: Math.random() * .25 + .04, p: Math.random() * Math.PI * 2
    };
  }
  function initParticles() {
    if (!canvas) return;
    cancelAnimationFrame(raf);
    resize();
    pts = Array.from({ length: Math.min(Math.floor(canvas.width * canvas.height / 18000), 60) }, mk);
    loop();
  }
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.p += .006;
      if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
      const a = p.a * (.7 + .3 * Math.sin(p.p));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = color(a); ctx.fill();
    });
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 100) {
        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = color((1 - d / 100) * .04); ctx.lineWidth = .4; ctx.stroke();
      }
    }
    raf = requestAnimationFrame(loop);
  }
  window.addEventListener('resize', () => resize(), { passive: true });
  initParticles();

  // ── NAV ────────────────────────────────────────────────────────────────────
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 30);
  }, { passive: true });

  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger?.addEventListener('click', () => {
    const o = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', o);
  });
  navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
  }));

  // ── CAROUSEL ───────────────────────────────────────────────────────────────
  const carousel = document.getElementById('carousel');
  const carPrev = document.getElementById('carPrev');
  const carNext = document.getElementById('carNext');
  const carDots = document.getElementById('carDots');

  let slides = [...carousel.querySelectorAll('.slide')];
  let visibleSlides = [...slides];
  let currentIndex = 0;

  function scrollToIndex(idx) {
    if (!visibleSlides.length) return;
    idx = Math.max(0, Math.min(idx, visibleSlides.length - 1));
    currentIndex = idx;
    carousel.scrollTo({ left: visibleSlides[idx].offsetLeft, behavior: 'smooth' });
    updateDots();
  }

  function updateDots() {
    carDots.querySelectorAll('.dot-btn').forEach((d, i) => d.classList.toggle('active', i === currentIndex));
  }

  function buildDots() {
    carDots.innerHTML = '';
    visibleSlides.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'dot-btn' + (i === 0 ? ' active' : '');
      b.setAttribute('aria-label', `Slide ${i + 1}`);
      b.addEventListener('click', () => scrollToIndex(i));
      carDots.appendChild(b);
    });
  }

  carPrev?.addEventListener('click', () => scrollToIndex(currentIndex - 1));
  carNext?.addEventListener('click', () => scrollToIndex(currentIndex + 1));

  // Swipe + drag
  let startX = 0, isDragging = false;
  carousel.addEventListener('mousedown', e => { isDragging = true; startX = e.clientX; });
  carousel.addEventListener('mousemove', e => { if (!isDragging) return; carousel.scrollLeft -= (e.clientX - startX) * .5; });
  carousel.addEventListener('mouseup', () => { isDragging = false; snapAfterDrag(); });
  carousel.addEventListener('mouseleave', () => { isDragging = false; });
  carousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 44) dx < 0 ? scrollToIndex(currentIndex + 1) : scrollToIndex(currentIndex - 1);
  }, { passive: true });

  function snapAfterDrag() {
    const s = visibleSlides[0];
    if (!s) return;
    const w = s.offsetWidth + 14;
    const idx = Math.round(carousel.scrollLeft / w);
    scrollToIndex(Math.max(0, Math.min(idx, visibleSlides.length - 1)));
  }

  carousel.addEventListener('scroll', () => {
    const s = visibleSlides[0];
    if (!s) return;
    const w = s.offsetWidth + 14;
    const idx = Math.round(carousel.scrollLeft / w);
    if (idx !== currentIndex) { currentIndex = idx; updateDots(); }
  }, { passive: true });

  buildDots();

  // ── FILTERS ────────────────────────────────────────────────────────────────
  document.querySelectorAll('.f-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.f-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      visibleSlides = [];
      slides.forEach(s => {
        const show = f === 'all' || s.dataset.category === f;
        s.classList.toggle('hidden', !show);
        if (show) visibleSlides.push(s);
      });
      currentIndex = 0;
      if (visibleSlides.length) carousel.scrollTo({ left: 0, behavior: 'instant' });
      buildDots();
    });
  });

  // ── SCROLL REVEAL ──────────────────────────────────────────────────────────
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const siblings = [...e.target.parentElement.children]
        .filter(el => el.classList.contains('reveal') && !el.classList.contains('visible'));
      const i = siblings.indexOf(e.target);
      setTimeout(() => e.target.classList.add('visible'), i * 90);
      obs.unobserve(e.target);
    });
  }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // ── WAITLISTS ──────────────────────────────────────────────────────────────
  function wl(fid, mid) {
    const f = document.getElementById(fid), m = document.getElementById(mid);
    if (!f) return;
    f.addEventListener('submit', e => {
      e.preventDefault();
      const em = f.querySelector('input[type="email"]').value;
      const l = JSON.parse(localStorage.getItem('ct-wl') || '[]');
      if (!l.includes(em)) { l.push(em); localStorage.setItem('ct-wl', JSON.stringify(l)); }
      f.reset();
      if (m) { m.textContent = '¡Listo! Te avisamos pronto.'; setTimeout(() => m.textContent = '', 5000); }
    });
  }
  wl('waitlistForm', 'waitlistMsg');
  wl('shopForm', 'shopMsg');

  // ── CONTACT FORM ───────────────────────────────────────────────────────────
  document.getElementById('contactoForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const m = document.getElementById('formMsg');
    if (m) { m.textContent = '¡Mensaje enviado! Te respondo pronto.'; setTimeout(() => m.textContent = '', 6000); }
    e.target.reset();
  });

  // ── ACTIVE NAV ─────────────────────────────────────────────────────────────
  const secs = document.querySelectorAll('section[id]');
  const nas = document.querySelectorAll('.nav-links a[href^="#"]');
  secs.forEach(s => {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) nas.forEach(a => a.classList.toggle('active-nav', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-50% 0px -50% 0px' }).observe(s);
  });

})();
