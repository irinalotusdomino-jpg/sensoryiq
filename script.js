// ============ Header scroll state ============
const header = document.getElementById('siteHeader');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ============ Back to top ============
const toTop = document.getElementById('toTop');
const onScrollToTop = () => toTop?.classList.toggle('visible', window.scrollY > 480);
document.addEventListener('scroll', onScrollToTop, { passive: true });
onScrollToTop();
toTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============ Mobile nav ============
const burger = document.getElementById('burger');
const nav = document.getElementById('mainNav');
burger?.addEventListener('click', () => nav.classList.toggle('open'));
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// ============ Cursor-reactive sensory orb (signature element) ============
const orb = document.getElementById('cursorOrb');
let orbX = window.innerWidth / 2, orbY = window.innerHeight / 2;
let targetX = orbX, targetY = orbY;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

window.addEventListener('mousemove', (e) => {
  targetX = e.clientX;
  targetY = e.clientY;
});

function animateOrb() {
  orbX += (targetX - orbX) * 0.08;
  orbY += (targetY - orbY) * 0.08;
  if (orb) orb.style.transform = `translate(${orbX}px, ${orbY}px)`;
  requestAnimationFrame(animateOrb);
}
if (orb && !prefersReduced) animateOrb();

// ============ Floating sensory dots in hero (parallax on mousemove) ============
const heroField = document.getElementById('heroField');
if (heroField) {
  const palette = ['var(--accent)', 'var(--accent-2)', '#FFD37A'];
  const dots = [];
  const dotCount = window.innerWidth < 720 ? 8 : 16;
  for (let i = 0; i < dotCount; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot';
    const size = 6 + Math.random() * 18;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * 58}%`;
    dot.style.background = palette[i % palette.length];
    dot.style.opacity = (0.25 + Math.random() * 0.35).toFixed(2);
    heroField.appendChild(dot);
    dots.push({ el: dot, depth: 0.5 + Math.random() * 1.5 });
  }
  window.addEventListener('mousemove', (e) => {
    if (prefersReduced) return;
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    dots.forEach(({ el, depth }) => {
      el.style.transform = `translate(${dx * depth * 14}px, ${dy * depth * 14}px)`;
    });
  });
}

// ============ Scroll reveal ============
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// ============ Animated stat counters ============
const statNums = document.querySelectorAll('.stat-num');
const countIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    countIO.unobserve(el);
  });
}, { threshold: 0.6 });
statNums.forEach(el => countIO.observe(el));

// ============ Magnetic buttons ============
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    if (prefersReduced) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// ============ Video cards: click-to-play, graceful fallback ============
document.querySelectorAll('.video-card').forEach(card => {
  const video = card.querySelector('video');
  const playBtn = card.querySelector('.video-play');
  if (!video) return;

  // assume placeholder until the video proves it has a real, playable source
  card.classList.add('no-source');
  video.addEventListener('loadedmetadata', () => card.classList.remove('no-source'));
  video.addEventListener('error', () => card.classList.add('no-source'));
  video.querySelectorAll('source').forEach(src => {
    src.addEventListener('error', () => card.classList.add('no-source'));
  });

  const toggle = () => {
    if (card.classList.contains('no-source')) return;
    if (video.paused) {
      video.muted = false;
      video.play().then(() => card.classList.add('is-playing')).catch(() => {
        // autoplay/policy or missing file — keep fallback visible
      });
    } else {
      video.pause();
      card.classList.remove('is-playing');
    }
  };

  // the whole card toggles play/pause — not just the (fading) play icon,
  // so a video that's already playing can always be stopped again
  card.addEventListener('click', toggle);
  playBtn?.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
});

// ============ Footer year ============
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============ Contact form (demo only) ============
const form = document.getElementById('contactForm');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'Дякуємо! Ми зв’яжемось незабаром ✓';
  form.reset();
  setTimeout(() => { btn.textContent = original; }, 3200);
});
