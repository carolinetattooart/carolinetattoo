/* NAV */
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* REVEAL — translateY(150px) exact Flavio */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
}, { threshold: 0.04, rootMargin: '0px 0px -20px 0px' });

document.addEventListener('DOMContentLoaded', () => {
  // Hero immediate
  document.querySelector('.hero-quote')?.classList.add('in');
  setTimeout(() => document.querySelector('.hero-current')?.classList.add('in'), 130);
  // All other reveal elements
  document.querySelectorAll('.js-reveal, .js-reveal-delay, .ongoing-card, .case, .for-section, .findme').forEach(el => obs.observe(el));
});

/* LIGHTBOX */
const imgs = document.querySelectorAll('.cimg img');
const lb   = document.getElementById('lightbox');
const lbI  = document.getElementById('lbImg');
const lbTx = document.getElementById('lbInfo');
let idx = 0;

imgs.forEach((img, i) => img.parentElement.addEventListener('click', () => { idx = i; show(); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }));
function show() { lbI.src = imgs[idx].src; lbTx.textContent = `${idx+1} / ${imgs.length}`; }
function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }

document.getElementById('lbClose').onclick = close;
lb.addEventListener('click', e => { if (e.target === lb) close(); });
document.getElementById('lbPrev').onclick = () => { idx = (idx-1+imgs.length)%imgs.length; show(); };
document.getElementById('lbNext').onclick = () => { idx = (idx+1)%imgs.length; show(); };
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key==='Escape') close();
  if (e.key==='ArrowLeft')  { idx=(idx-1+imgs.length)%imgs.length; show(); }
  if (e.key==='ArrowRight') { idx=(idx+1)%imgs.length; show(); }
});
