gsap.registerPlugin(ScrollTrigger);

/* ── LENIS ── */
const lenis = new Lenis({
  duration: 1.3,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
function raf(time) { lenis.raf(time); ScrollTrigger.update(); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

/* ── PRELOADER ── */
const preloader = document.getElementById('preloader');
const preFill   = document.getElementById('preFill');
let n = 0;
const iv = setInterval(() => {
  n += Math.floor(Math.random() * 14) + 5;
  if (n >= 100) {
    n = 100; clearInterval(iv);
    setTimeout(() => {
      preloader.classList.add('done');
      boot();
    }, 300);
  }
  preFill.style.width = n + '%';
}, 55);

/* ── CURSOR ── */
const cur  = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

window.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.cssText += `left:${mx}px;top:${my}px;`;
});
(function tick() {
  rx += (mx - rx) * .1; ry += (my - ry) * .1;
  ring.style.cssText += `left:${rx}px;top:${ry}px;`;
  requestAnimationFrame(tick);
})();

document.querySelectorAll('a, button, .ci').forEach(el => {
  el.addEventListener('mouseenter', () => { cur.classList.add('grow'); ring.classList.add('grow'); });
  el.addEventListener('mouseleave', () => { cur.classList.remove('grow'); ring.classList.remove('grow'); });
});

/* ── SPLIT + ANIMATE TITLES ── */
function splitTitle(el) {
  if (el.dataset.split) return;
  const words = el.textContent.trim().split(' ');
  el.textContent = '';
  words.forEach((word, wi) => {
    const ws = document.createElement('span');
    ws.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.06em;';
    word.split('').forEach(ch => {
      const ls = document.createElement('span');
      ls.textContent = ch;
      ls.classList.add('letter');
      ws.appendChild(ls);
    });
    el.appendChild(ws);
    if (wi < words.length - 1) el.append('\u00A0');
  });
  el.dataset.split = 'true';
}

function animTitle(el, triggerEl) {
  splitTitle(el);
  const letters = el.querySelectorAll('.letter');
  gsap.fromTo(letters,
    { y: '-115%', opacity: 0 },
    {
      y: '0%', opacity: 1,
      duration: 1.1,
      ease: 'power3.out',
      stagger: { each: .04, from: 'start' },
      scrollTrigger: {
        trigger: triggerEl || el,
        start: 'top 90%',
        toggleActions: 'play none none none',
      }
    }
  );
}

/* ── NUMBER DATA ATTRS ── */
document.querySelectorAll('.cat-grid .ci').forEach((ci, i) => {
  ci.setAttribute('data-n', String(i + 1).padStart(2, '0'));
});

/* ── BOOT ── */
function boot() {
  // Hero title
  animTitle(document.querySelector('.hero-title'));

  // Category titles + sections
  document.querySelectorAll('.cat-section').forEach(sec => {
    const title = sec.querySelector('.cat-title');
    if (title) animTitle(title, sec);

    // Header line draw
    const rule = sec.querySelector('.cat-header');
    if (rule) {
      gsap.fromTo(rule,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: .8, ease: 'power2.out',
          scrollTrigger: { trigger: rule, start: 'top 88%', toggleActions: 'play none none none' } }
      );
    }

    // Grid items stagger
    const items = sec.querySelectorAll('.ci');
    gsap.fromTo(items,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        duration: .75, ease: 'power3.out',
        stagger: { each: .07, from: 'start' },
        scrollTrigger: { trigger: sec.querySelector('.cat-grid'), start: 'top 85%', toggleActions: 'play none none none' }
      }
    );

    // Parallax on images
    items.forEach(ci => {
      const img = ci.querySelector('img');
      if (!img) return;
      gsap.fromTo(img,
        { yPercent: -8 },
        { yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: ci, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
        }
      );
    });
  });

  // CTA title
  animTitle(document.querySelector('.cta-title'));

  // Dividers
  document.querySelectorAll('.divider-line').forEach(line => {
    gsap.fromTo(line,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: line, start: 'top 90%', toggleActions: 'play none none none' } }
    );
  });

  // Cat desc text
  document.querySelectorAll('.cat-desc').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: .9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } }
    );
  });

  // Header scroll
  lenis.on('scroll', ({ scroll }) => {
    document.getElementById('header').classList.toggle('scrolled', scroll > 60);
  });
}

/* ── LIGHTBOX ── */
const allCi    = document.querySelectorAll('.ci');
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lbImg');
const lbInfo   = document.getElementById('lbInfo');
const lbClose  = document.getElementById('lbClose');
const lbPrev   = document.getElementById('lbPrev');
const lbNext   = document.getElementById('lbNext');
let idx = 0;

function open(i) {
  idx = i;
  show();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lenis.stop();
}
function show() {
  const ci  = allCi[idx];
  const img = ci.querySelector('img');
  const cat = ci.closest('.cat-section')?.id?.replace('cat-', '') || '';
  lbImg.src = img.src;
  lbInfo.textContent = `${cat.charAt(0).toUpperCase() + cat.slice(1)} — ${String(idx + 1).padStart(2,'0')} / ${allCi.length}`;
}
function close() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lenis.start();
}

allCi.forEach((ci, i) => ci.addEventListener('click', () => open(i)));
lbClose.addEventListener('click', close);
lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
lbPrev.addEventListener('click', () => { idx = (idx - 1 + allCi.length) % allCi.length; show(); });
lbNext.addEventListener('click', () => { idx = (idx + 1) % allCi.length; show(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowLeft')  { idx = (idx - 1 + allCi.length) % allCi.length; show(); }
  if (e.key === 'ArrowRight') { idx = (idx + 1) % allCi.length; show(); }
});
