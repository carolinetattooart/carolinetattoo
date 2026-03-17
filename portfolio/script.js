/* ── NAV ── */
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── REVEAL ── */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
}, { threshold: 0.04, rootMargin: '0px 0px -20px 0px' });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.hero-quote')?.classList.add('in');
  setTimeout(() => document.querySelector('.hero-current')?.classList.add('in'), 130);
  document.querySelectorAll('.ongoing-card, .case, .for-section, .findme').forEach(el => obs.observe(el));
  initCarousels();
});

/* ── CAROUSEL ── */
function initCarousels() {
  const carousels = {};

  document.querySelectorAll('.carousel').forEach(car => {
    const id = car.id;
    const slides = car.querySelectorAll('.cslide');
    const countEl = document.getElementById('count-' + id.replace('carousel-', ''));
    carousels[id] = { slides, current: 0, countEl };

    car.querySelector('.c-prev').addEventListener('click', () => goTo(id, -1));
    car.querySelector('.c-next').addEventListener('click', () => goTo(id, 1));
  });

  function goTo(id, dir) {
    const c = carousels[id];
    const prev = c.current;
    c.current = (c.current + dir + c.slides.length) % c.slides.length;

    const outClass = dir > 0 ? 'slide-out-left' : 'slide-out-right';
    const inClass  = dir > 0 ? 'slide-in-right'  : 'slide-in-left';

    c.slides[prev].classList.add(outClass);
    setTimeout(() => {
      c.slides[prev].classList.remove('active', outClass);
      c.slides[c.current].classList.add('active', inClass);
      setTimeout(() => c.slides[c.current].classList.remove(inClass), 400);
    }, 350);

    if (c.countEl) c.countEl.textContent = `${c.current + 1} / ${c.slides.length}`;
  }

  // Auto-rotate every 4s
  setInterval(() => {
    Object.keys(carousels).forEach(id => goTo(id, 1));
  }, 4000);
}

/* ── LIGHTBOX ── */
const allImgs = document.querySelectorAll('.cimg img');
const lb  = document.getElementById('lightbox');
const lbI = document.getElementById('lbImg');
const lbT = document.getElementById('lbInfo');
let idx = 0;

allImgs.forEach((img, i) => {
  img.parentElement.addEventListener('click', () => {
    idx = i; show();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});
function show() { lbI.src = allImgs[idx].src; lbT.textContent = `${idx+1} / ${allImgs.length}`; }
function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }

document.getElementById('lbClose').onclick = close;
lb.addEventListener('click', e => { if (e.target === lb) close(); });
document.getElementById('lbPrev').onclick = () => { idx = (idx-1+allImgs.length)%allImgs.length; show(); };
document.getElementById('lbNext').onclick = () => { idx = (idx+1)%allImgs.length; show(); };
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowLeft')  { idx=(idx-1+allImgs.length)%allImgs.length; show(); }
  if (e.key === 'ArrowRight') { idx=(idx+1)%allImgs.length; show(); }
});
