/* ── LENIS SMOOTH SCROLL (exact Flavio) ── */
const lenis = new Lenis({
  duration: 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

/* ── NAV ── */
lenis.on('scroll', ({ scroll }) => {
  document.getElementById('nav').classList.toggle('on', scroll > 40);
});

/* ── REVEAL — translateY(150px) → 0, tied to scroll ── */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .04, rootMargin: '0px 0px -16px 0px' });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.hero-q')?.classList.add('in');
  setTimeout(() => document.querySelector('.hero-sub')?.classList.add('in'), 120);
  document.querySelectorAll('.ong-card,.case,.for-s,.find-s').forEach(el => io.observe(el));
  initCarousels();
});

/* ── CAROUSEL — manual only ── */
function initCarousels() {
  const state = {};
  document.querySelectorAll('.carousel').forEach(car => {
    const id = car.dataset.id;
    state[id] = { slides: [...car.querySelectorAll('.cs')], cur: 0 };
  });

  function go(id, dir) {
    const s = state[id];
    const old = s.cur;
    s.cur = (s.cur + dir + s.slides.length) % s.slides.length;
    s.slides[old].classList.add('fo');
    setTimeout(() => {
      s.slides[old].classList.remove('active', 'fo');
      s.slides[s.cur].classList.add('active', 'fi');
      setTimeout(() => s.slides[s.cur].classList.remove('fi'), 350);
      const cn = document.querySelector(`.cn[data-id="${id}"]`);
      if (cn) cn.textContent = `${s.cur + 1} / ${s.slides.length}`;
    }, 280);
  }

  document.querySelectorAll('.ca').forEach(btn => {
    btn.addEventListener('click', () => go(btn.dataset.id, +btn.dataset.dir));
  });
}

/* ── LIGHTBOX ── */
const allImgs = [...document.querySelectorAll('.cs img')];
const lb  = document.getElementById('lb');
const lbi = document.getElementById('lbi');
const lbt = document.getElementById('lbt');
let idx = 0;

allImgs.forEach((img, i) => img.addEventListener('click', () => {
  idx = i; show(); lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  lenis.stop();
}));
function show() { lbi.src = allImgs[idx].src; lbt.textContent = `${idx + 1} / ${allImgs.length}`; }
function close() { lb.classList.remove('open'); document.body.style.overflow = ''; lenis.start(); }

document.getElementById('lbc').onclick = close;
lb.addEventListener('click', e => { if (e.target === lb) close(); });
document.getElementById('lbp').onclick = () => { idx = (idx - 1 + allImgs.length) % allImgs.length; show(); };
document.getElementById('lbn').onclick = () => { idx = (idx + 1) % allImgs.length; show(); };
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowLeft')  { idx = (idx - 1 + allImgs.length) % allImgs.length; show(); }
  if (e.key === 'ArrowRight') { idx = (idx + 1) % allImgs.length; show(); }
});
