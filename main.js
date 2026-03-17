// ─── HEADER SCROLL ───
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ─── BURGER MENU ───
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// ─── PORTFOLIO FILTER ───
const filters = document.querySelectorAll('.filter');
const gridItems = document.querySelectorAll('.grid-item');

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    gridItems.forEach(item => {
      if (cat === 'all' || item.dataset.cat === cat) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

// ─── REVEAL ON SCROLL ───
const revealEls = document.querySelectorAll('.section, .grid-item, .service-row, .sobre__img, .sobre__content, .contacto__left, .contacto__form, .stat');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal', 'visible');
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.grid-item, .service-row, .sobre__img, .sobre__content, .contacto__left, .contacto__form, .stat').forEach(el => {
  el.classList.add('reveal');
  revealObs.observe(el);
});

// ─── FORM SUBMIT ───
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Mensaje enviado ✓';
    btn.style.opacity = '0.6';
    btn.disabled = true;
  });
}
