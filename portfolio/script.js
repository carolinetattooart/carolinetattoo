document.addEventListener('DOMContentLoaded', function() {

  /* LENIS */
  var lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    (function tick(t) { lenis.raf(t); requestAnimationFrame(tick); })(0);
    lenis.on('scroll', function(e) {
      document.getElementById('nav').classList.toggle('on', e.scroll > 40);
    });
  } else {
    window.addEventListener('scroll', function() {
      document.getElementById('nav').classList.toggle('on', window.scrollY > 40);
    }, { passive: true });
  }

  /* HERO */
  var hq = document.querySelector('.hero-q');
  var hs = document.querySelector('.hero-s');
  if (hq) hq.classList.add('show');
  setTimeout(function() { if (hs) hs.classList.add('show'); }, 120);

  /* REVEAL CASES */
  var cases = document.querySelectorAll('.case');
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
  cases.forEach(function(c) { io.observe(c); });

  /* CAROUSEL */
  var state = {};
  var carousels = document.querySelectorAll('.carousel');
  carousels.forEach(function(car) {
    var id = car.id;
    var slides = car.querySelectorAll('.sl');
    state[id] = { slides: slides, cur: 0 };
  });

  var cntMap = { c1: 'n1', c2: 'n2', c3: 'n3' };

  document.querySelectorAll('.cb').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var cid = btn.getAttribute('data-c');
      var dir = parseInt(btn.getAttribute('data-d'));
      var s = state[cid];
      if (!s) return;
      var old = s.cur;
      s.cur = (s.cur + dir + s.slides.length) % s.slides.length;
      var next = s.cur;
      s.slides[old].classList.add('out');
      setTimeout(function() {
        s.slides[old].classList.remove('active', 'out');
        s.slides[next].classList.add('active', 'in');
        setTimeout(function() { s.slides[next].classList.remove('in'); }, 320);
        var cntEl = document.getElementById(cntMap[cid]);
        if (cntEl) cntEl.textContent = (next + 1) + ' / ' + s.slides.length;
      }, 250);
    });
  });


  /* SWIPE */
  document.querySelectorAll('.carousel').forEach(function(car) {
    var startX = 0;
    var cid = car.id;
    car.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    car.addEventListener('touchend', function(e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) < 30) return;
      var s = state[cid];
      if (!s) return;
      var old = s.cur;
      var dir = diff > 0 ? 1 : -1;
      s.cur = (s.cur + dir + s.slides.length) % s.slides.length;
      var next = s.cur;
      s.slides[old].classList.add('out');
      setTimeout(function() {
        s.slides[old].classList.remove('active', 'out');
        s.slides[next].classList.add('active', 'in');
        setTimeout(function() { s.slides[next].classList.remove('in'); }, 320);
        var cntEl = document.getElementById(cntMap[cid]);
        if (cntEl) cntEl.textContent = (next + 1) + ' / ' + s.slides.length;
      }, 250);
    }, { passive: true });
  });

  /* LIGHTBOX */
  var imgs = document.querySelectorAll('.sl img');
  var lb   = document.getElementById('lb');
  var lbi  = document.getElementById('lb-i');
  var lbc  = document.getElementById('lb-c');
  var idx  = 0;

  imgs.forEach(function(img, i) {
    img.addEventListener('click', function() {
      idx = i;
      lbi.src = img.src;
      lbc.textContent = (i + 1) + ' / ' + imgs.length;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    });
  });

  function lbClose() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }
  function lbGo(i) {
    idx = (i + imgs.length) % imgs.length;
    lbi.src = imgs[idx].src;
    lbc.textContent = (idx + 1) + ' / ' + imgs.length;
  }

  document.getElementById('lb-x').addEventListener('click', lbClose);
  lb.addEventListener('click', function(e) { if (e.target === lb) lbClose(); });
  document.getElementById('lb-p').addEventListener('click', function() { lbGo(idx - 1); });
  document.getElementById('lb-n').addEventListener('click', function() { lbGo(idx + 1); });
  document.addEventListener('keydown', function(e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      lbClose();
    if (e.key === 'ArrowLeft')   lbGo(idx - 1);
    if (e.key === 'ArrowRight')  lbGo(idx + 1);
  });

});
