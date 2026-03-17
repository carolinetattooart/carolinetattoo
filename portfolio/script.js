document.addEventListener('DOMContentLoaded', function() {

  /* ── LENIS ── */
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

  /* ── HERO ── */
  var hq = document.querySelector('.hero-q');
  if (hq) setTimeout(function() { hq.classList.add('show'); }, 50);

  /* ── REVEAL ── */
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.case').forEach(function(c) { io.observe(c); });

  /* ── CAROUSEL ── */
  var state = {};
  var cntMap = { c1: 'n1', c2: 'n2', c3: 'n3' };

  document.querySelectorAll('.carousel').forEach(function(car) {
    var id = car.id;
    var slides = Array.from(car.querySelectorAll('.sl'));
    state[id] = { slides: slides, cur: 0, busy: false };
  });

  function go(cid, dir) {
    var s = state[cid];
    if (!s || s.busy || s.slides.length < 2) return;
    s.busy = true;
    var oldIdx = s.cur;
    s.cur = (s.cur + dir + s.slides.length) % s.slides.length;
    var newIdx = s.cur;
    s.slides[oldIdx].classList.add('out');
    setTimeout(function() {
      s.slides[oldIdx].classList.remove('active', 'out');
      s.slides[newIdx].classList.add('active', 'in');
      setTimeout(function() { s.slides[newIdx].classList.remove('in'); s.busy = false; }, 320);
      var cntEl = document.getElementById(cntMap[cid]);
      if (cntEl) cntEl.textContent = (newIdx + 1) + ' / ' + s.slides.length;
    }, 260);
  }

  /* Arrow buttons */
  document.querySelectorAll('.cb').forEach(function(btn) {
    btn.addEventListener('click', function() {
      go(btn.getAttribute('data-c'), parseInt(btn.getAttribute('data-d')));
    });
  });

  /* ── SWIPE + MOUSE DRAG ── */
  document.querySelectorAll('.carousel').forEach(function(car) {
    var cid     = car.id;
    var startX  = 0;
    var startY  = 0;
    var isDrag  = false;
    var moved   = false;
    var THRESHOLD = 40;

    /* ── TOUCH (mobile) ── */
    car.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      moved  = false;
    }, { passive: true });

    car.addEventListener('touchmove', function(e) {
      var dx = Math.abs(e.touches[0].clientX - startX);
      var dy = Math.abs(e.touches[0].clientY - startY);
      if (dx > dy && dx > 8) { e.preventDefault(); moved = true; }
    }, { passive: false });

    car.addEventListener('touchend', function(e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) >= THRESHOLD) go(cid, diff > 0 ? 1 : -1);
    }, { passive: true });

    /* ── MOUSE DRAG (desktop) ── */
    car.addEventListener('mousedown', function(e) {
      startX = e.clientX;
      isDrag = true;
      moved  = false;
      car.classList.add('dragging');
      e.preventDefault();
    });

    window.addEventListener('mousemove', function(e) {
      if (!isDrag) return;
      if (Math.abs(e.clientX - startX) > 8) moved = true;
    });

    window.addEventListener('mouseup', function(e) {
      if (!isDrag) return;
      isDrag = false;
      car.classList.remove('dragging');
      var diff = startX - e.clientX;
      if (Math.abs(diff) >= THRESHOLD) go(cid, diff > 0 ? 1 : -1);
    });
  });

  /* ── LIGHTBOX ── */
  var allImgs = Array.from(document.querySelectorAll('.sl img'));
  var lb  = document.getElementById('lb');
  var lbi = document.getElementById('lb-i');
  var lbc = document.getElementById('lb-c');
  var idx = 0;

  allImgs.forEach(function(img, i) {
    img.addEventListener('click', function(e) {
      /* Don't open lightbox if user was dragging */
      idx     = i;
      lbi.src = img.src;
      lbc.textContent = (i + 1) + ' / ' + allImgs.length;
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
    idx = (i + allImgs.length) % allImgs.length;
    lbi.src = allImgs[idx].src;
    lbc.textContent = (idx + 1) + ' / ' + allImgs.length;
  }

  document.getElementById('lb-x').addEventListener('click', lbClose);
  lb.addEventListener('click', function(e) { if (e.target === lb) lbClose(); });
  document.getElementById('lb-p').addEventListener('click', function() { lbGo(idx - 1); });
  document.getElementById('lb-n').addEventListener('click', function() { lbGo(idx + 1); });
  document.addEventListener('keydown', function(e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     lbClose();
    if (e.key === 'ArrowLeft')  lbGo(idx - 1);
    if (e.key === 'ArrowRight') lbGo(idx + 1);
  });

});
