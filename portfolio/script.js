/* ============================================================
   CAROLINE TATTOO — /portfolio/script.js
   GSAP + ScrollTrigger + Lenis smooth scroll
   Hover image reveal tracking mouse
   ============================================================ */
(function () {
'use strict';

gsap.registerPlugin(ScrollTrigger);

// ── Theme ─────────────────────────────────────────────────
const html = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
const saved = localStorage.getItem('ct-theme');
if (saved) html.setAttribute('data-theme', saved);
else html.setAttribute('data-theme',
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

themeBtn?.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('ct-theme', next);
});

// ── Preloader ──────────────────────────────────────────────
const preloader = document.getElementById('preloader');
const preNum    = document.getElementById('preNum');
const preLine   = document.querySelector('.pre-line');
let progress = 0;

const counter = setInterval(() => {
  progress += Math.random() * 18;
  if (progress >= 100) {
    progress = 100;
    clearInterval(counter);
    // Exit preloader
    setTimeout(() => {
      gsap.to(preloader, {
        yPercent: -100,
        duration: 1,
        ease: 'power4.inOut',
        onComplete: () => {
          preloader.style.display = 'none';
          initAnimations();
        }
      });
    }, 200);
  }
  preNum.textContent = Math.floor(progress);
  gsap.to(preLine, { width: progress + '%', duration: .3, ease: 'none' });
}, 80);

// ── Lenis smooth scroll ────────────────────────────────────
let lenis;
function initLenis() {
  lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });
  function raf(time) {
    lenis.raf(time);
    ScrollTrigger.update();
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// ── Custom cursor ──────────────────────────────────────────
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mx = -100, my = -100;
let fx = -100, fy = -100;

if (window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    cursor.style.opacity = '1';
    follower.style.opacity = '1';
  });

  // Smooth follower
  (function followLoop() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(followLoop);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
  });
  document.querySelectorAll('.work-link').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-link'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-link'));
  });
} else {
  cursor.style.display = 'none';
  follower.style.display = 'none';
}

// ── Hover image reveal (follow mouse) ─────────────────────
const workItems = document.querySelectorAll('.work-item');

workItems.forEach(item => {
  const img = item.querySelector('.work-hover-img');
  if (!img) return;

  let posX = 0, posY = 0;
  let targetX = 0, targetY = 0;
  let raf;

  function track() {
    posX += (targetX - posX) * 0.1;
    posY += (targetY - posY) * 0.1;
    img.style.left = posX + 'px';
    img.style.top  = posY + 'px';
    raf = requestAnimationFrame(track);
  }

  item.addEventListener('mouseenter', () => {
    raf = requestAnimationFrame(track);
  });

  item.addEventListener('mousemove', e => {
    // offset so image doesn't cover the text
    const offsetX = window.innerWidth > 1100 ? 40 : 20;
    const offsetY = -img.offsetHeight / 2;
    targetX = e.clientX + offsetX;
    targetY = e.clientY + offsetY;
    // Keep within viewport
    const maxX = window.innerWidth - img.offsetWidth - 20;
    const maxY = window.innerHeight - img.offsetHeight - 20;
    targetX = Math.min(Math.max(20, targetX), maxX);
    targetY = Math.min(Math.max(20, targetY), maxY);
  });

  item.addEventListener('mouseleave', () => {
    cancelAnimationFrame(raf);
  });
});

// ── Nav scroll ────────────────────────────────────────────
const nav = document.getElementById('nav');
ScrollTrigger.create({
  start: 'top -60',
  onUpdate: self => nav.classList.toggle('scrolled', self.progress > 0),
});

// ── Main animations (after preloader) ─────────────────────
function initAnimations() {
  initLenis();

  // Hero label
  gsap.to('.hero-label', {
    opacity: 1, y: 0, duration: .8, ease: 'power3.out', delay: .1,
    from: { opacity: 0, y: 12 },
  });
  gsap.fromTo('.hero-label', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', delay: .1 });

  // Hero title lines unmask
  gsap.fromTo('.line-inner', {
    yPercent: 105,
  }, {
    yPercent: 0,
    duration: 1.1,
    ease: 'power4.out',
    stagger: .12,
    delay: .2,
  });

  // Hero meta
  gsap.fromTo('.hero-meta', {
    opacity: 0, y: 16,
  }, {
    opacity: 1, y: 0,
    duration: .9, ease: 'power3.out', delay: .6,
  });

  // Hero scroll indicator
  gsap.fromTo('.hero-scroll', {
    opacity: 0,
  }, {
    opacity: 1, duration: 1, ease: 'power2.out', delay: 1.2,
  });

  // Filters bar
  gsap.fromTo('.filters-bar', {
    opacity: 0, y: -8,
  }, {
    opacity: 1, y: 0,
    duration: .7, ease: 'power3.out', delay: .4,
  });

  // Work items stagger on scroll
  workItems.forEach((item, i) => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top 88%',
      onEnter: () => {
        setTimeout(() => item.classList.add('visible'), i * 60);
      },
      once: true,
    });
  });

  // CTA section lines
  gsap.utils.toArray('.cta-section .line-inner').forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(el, {
          yPercent: 0,
          duration: 1, ease: 'power4.out',
          delay: i * .12,
        });
      },
      once: true,
    });
  });

  gsap.fromTo('.cta-label', {
    opacity: 0, y: 12,
  }, {
    opacity: 1, y: 0,
    duration: .8, ease: 'power3.out',
    scrollTrigger: { trigger: '.cta-section', start: 'top 80%' },
  });

  gsap.fromTo('.cta-btns', {
    opacity: 0, y: 16,
  }, {
    opacity: 1, y: 0,
    duration: .8, ease: 'power3.out', delay: .3,
    scrollTrigger: { trigger: '.cta-section', start: 'top 80%' },
  });
}

// ── Filters ───────────────────────────────────────────────
const fBtns = document.querySelectorAll('.f-btn');
fBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    fBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    workItems.forEach((item, i) => {
      const match = filter === 'all' || item.dataset.category === filter;
      if (match) {
        item.classList.remove('filtered-out');
        item.style.opacity = '0';
        item.style.transform = 'translateY(16px)';
        setTimeout(() => {
          item.style.transition = 'opacity .5s var(--ease), transform .5s var(--ease)';
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, i * 50);
      } else {
        item.style.transition = 'opacity .3s, transform .3s';
        item.style.opacity = '0';
        item.style.transform = 'translateY(8px)';
        setTimeout(() => item.classList.add('filtered-out'), 300);
      }
    });

    // Update count in hero
    const count = filter === 'all'
      ? workItems.length
      : [...workItems].filter(i => i.dataset.category === filter).length;
    const heroCount = document.getElementById('heroCount');
    if (heroCount) {
      heroCount.textContent = `— ${String(count).padStart(2, '0')} trabajos`;
    }
  });
});

})();
