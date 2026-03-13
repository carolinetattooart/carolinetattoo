// ============================================================
// CAROLINE TATTOO — main.js
// Lightspark particles · Custom cursor · Dark/Light mode
// ============================================================

(function () {
  'use strict';

  // ── Theme ─────────────────────────────────────────────────
  const html = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');

  // Default: dark. Respeta preferencia guardada
  const saved = localStorage.getItem('ct-theme');
  if (saved) html.setAttribute('data-theme', saved);
  else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }

  themeBtn?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ct-theme', next);
    initParticles(); // reinit particles with new color
  });

  // ── Particles (Lightspark) ─────────────────────────────────
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas?.getContext('2d');
  let particles = [];
  let animId;
  let W, H;

  function getParticleColor() {
    return html.getAttribute('data-theme') === 'dark'
      ? 'rgba(240,237,232,'
      : 'rgba(26,25,23,';
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.35 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function initParticles() {
    if (!canvas) return;
    cancelAnimationFrame(animId);
    resize();
    const count = Math.min(Math.floor((W * H) / 14000), 80);
    particles = Array.from({ length: count }, createParticle);
    loopParticles();
  }

  function loopParticles() {
    ctx.clearRect(0, 0, W, H);
    const col = getParticleColor();
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.008;
      const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = col + a + ')';
      ctx.fill();
    });
    // Draw faint connecting lines for nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const lineAlpha = (1 - dist / 120) * 0.06;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = col + lineAlpha + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    animId = requestAnimationFrame(loopParticles);
  }

  window.addEventListener('resize', () => { resize(); }, { passive: true });
  initParticles();

  // ── Cursor ─────────────────────────────────────────────────
  const cursor = document.getElementById('cursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    let cx = -100, cy = -100;
    document.addEventListener('mousemove', e => {
      cx = e.clientX; cy = e.clientY;
      cursor.style.opacity = '1';
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
    });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  // ── Nav ────────────────────────────────────────────────────
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  navToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
  });
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
    });
  });

  // ── Portfolio filter ───────────────────────────────────────
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.p-item').forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        if (show) {
          item.classList.remove('hidden');
          requestAnimationFrame(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          });
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => item.classList.add('hidden'), 320);
        }
      });
    });
  });

  // ── Scroll reveal ──────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Stagger siblings
      const siblings = [...entry.target.parentElement.children].filter(el => el.classList.contains('reveal') && !el.classList.contains('visible'));
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), idx * 90);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
  revealEls.forEach(el => observer.observe(el));

  // ── Waitlist forms ─────────────────────────────────────────
  function setupWaitlist(formId, msgId) {
    const form = document.getElementById(formId);
    const msg  = document.getElementById(msgId);
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value;
      const list = JSON.parse(localStorage.getItem('ct-waitlist') || '[]');
      if (!list.includes(email)) { list.push(email); localStorage.setItem('ct-waitlist', JSON.stringify(list)); }
      form.reset();
      if (msg) { msg.textContent = '¡Listo! Te avisamos cuando esté disponible.'; setTimeout(() => msg.textContent = '', 5000); }
    });
  }
  setupWaitlist('waitlistForm', 'waitlistMsg');
  setupWaitlist('shopWaitlistForm', 'shopWaitlistMsg');

  // ── Contact form ───────────────────────────────────────────
  const contactoForm = document.getElementById('contactoForm');
  const formMsg = document.getElementById('formMsg');
  contactoForm?.addEventListener('submit', e => {
    e.preventDefault();
    // Integra Formspree: cambia action del form a https://formspree.io/f/TU_ID
    formMsg.textContent = '¡Mensaje enviado! Te respondo pronto.';
    contactoForm.reset();
    setTimeout(() => formMsg.textContent = '', 6000);
  });

  // ── Lightspark hover glow on service rows ──────────────────
  document.querySelectorAll('.srv-row').forEach(row => {
    row.addEventListener('mousemove', e => {
      const rect = row.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      row.style.setProperty('--mx', x + '%');
      row.style.setProperty('--my', y + '%');
    });
  });

  // ── Active nav highlight on scroll ────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navAs = document.querySelectorAll('.nav-links a[href^="#"]');
  const secObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAs.forEach(a => a.classList.toggle('active-nav', a.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  sections.forEach(s => secObserver.observe(s));

})();
