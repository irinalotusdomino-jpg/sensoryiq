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
window.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if (t) { targetX = t.clientX; targetY = t.clientY; }
}, { passive: true });
window.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  if (t) { orbX = t.clientX; orbY = t.clientY; targetX = orbX; targetY = orbY; }
}, { passive: true });

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
  const updateDots = (clientX, clientY) => {
    if (prefersReduced) return;
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    const dx = (clientX - cx) / cx;
    const dy = (clientY - cy) / cy;
    dots.forEach(({ el, depth }) => {
      el.style.transform = `translate(${dx * depth * 14}px, ${dy * depth * 14}px)`;
    });
  };
  window.addEventListener('mousemove', (e) => updateDots(e.clientX, e.clientY));
  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (t) updateDots(t.clientX, t.clientY);
  }, { passive: true });
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

  // only mark as a genuinely missing/broken source on an actual error —
  // never just because metadata hasn't finished loading yet (that used to
  // block clicks on slower connections until the page was reloaded)
  video.addEventListener('error', () => card.classList.add('no-source'));
  video.querySelectorAll('source').forEach(src => {
    src.addEventListener('error', () => card.classList.add('no-source'));
  });

  const toggle = () => {
    if (video.paused) {
      video.muted = false;
      card.classList.remove('no-source');
      video.play().then(() => card.classList.add('is-playing')).catch(() => {
        // only show the fallback if the browser actually reports no playable source
        if (video.error) card.classList.add('no-source');
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

// ============ Gallery popup ============
const galleryModal = document.getElementById('galleryModal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalClose = document.getElementById('modalClose');

function openGalleryModal(title, text) {
  if (!galleryModal) return;
  modalTitle.textContent = title;
  modalText.textContent = text;
  galleryModal.classList.add('open');
  galleryModal.setAttribute('aria-hidden', 'false');
}
function closeGalleryModal() {
  if (!galleryModal) return;
  galleryModal.classList.remove('open');
  galleryModal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    openGalleryModal(item.dataset.title || '', item.dataset.text || '');
  });
});
modalClose?.addEventListener('click', closeGalleryModal);
galleryModal?.addEventListener('click', (e) => {
  if (e.target === galleryModal) closeGalleryModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeGalleryModal();
});

// ============ Phone call button ============
// На пристроях, що вміють дзвонити (телефони/планшети — грубо визначаємо
// за "грубим" типом вказівника, тобто пальцем, а не мишкою), кнопка
// поводиться як завжди: відкриває номеронабирач через tel:.
// На десктопі (мишка/трекпад — дзвонити нема чим) замість переходу
// показуємо віконце з номером, який можна скопіювати.
function canLikelyCall() {
  return window.matchMedia && window.matchMedia('(any-pointer: coarse)').matches;
}

const phoneCallBtn = document.getElementById('phoneCallBtn');
const phoneModal = document.getElementById('phoneModal');
const phoneModalNumber = document.getElementById('phoneModalNumber');
const phoneModalCopy = document.getElementById('phoneModalCopy');
const phoneModalClose = document.getElementById('phoneModalClose');

function openPhoneModal() {
  if (!phoneModal) return;
  phoneModal.classList.add('open');
  phoneModal.setAttribute('aria-hidden', 'false');
}
function closePhoneModal() {
  if (!phoneModal) return;
  phoneModal.classList.remove('open');
  phoneModal.setAttribute('aria-hidden', 'true');
}

phoneCallBtn?.addEventListener('click', (e) => {
  if (!canLikelyCall()) {
    e.preventDefault();
    openPhoneModal();
  }
  // якщо пристрій вміє дзвонити — нічого не робимо, посилання tel: відпрацює як завжди
});

phoneModalCopy?.addEventListener('click', async () => {
  const number = phoneModalNumber?.textContent.trim() || '';
  try {
    await navigator.clipboard.writeText(number);
    const original = phoneModalCopy.textContent;
    phoneModalCopy.textContent = 'Скопійовано ✓';
    setTimeout(() => { phoneModalCopy.textContent = original; }, 1800);
  } catch {
    // clipboard недоступний — просто ігноруємо, номер і так видно в тексті
  }
});

phoneModalClose?.addEventListener('click', closePhoneModal);
phoneModal?.addEventListener('click', (e) => {
  if (e.target === phoneModal) closePhoneModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePhoneModal();
});

// ============ Footer year ============
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============ Contact form → Telegram ============
// Куди відправляти заявки. Тут вказано адресу Cloudflare Worker,
// який пересилає дані у Telegram-бот. Щоб перемкнути форму на
// іншу людину/бізнес — просто заміни значення TELEGRAM_ENDPOINT
// на URL її власного Worker'а (сам сайт більше ніде міняти не треба).
const TELEGRAM_ENDPOINT = 'https://sensoryiq-contact-form.YOUR-SUBDOMAIN.workers.dev';

const form = document.getElementById('contactForm');
const phoneInput = document.getElementById('phoneInput');
const phoneError = document.getElementById('phoneError');
const formStatus = document.getElementById('formStatus');

// Номер вважається валідним, якщо після прибирання пробілів/дужок/тире
// лишається 10–15 цифр (за потреби з +), і це не всі однакові цифри —
// відсіює набори на кшталт "111111111" чи "123".
function isValidPhone(value) {
  const trimmed = value.trim();
  const digitsOnly = trimmed.replace(/[^\d]/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 15) return false;
  if (!/^[\d\s()+-]+$/.test(trimmed)) return false;
  if (/^(\d)\1+$/.test(digitsOnly)) return false;
  return true;
}

phoneInput?.addEventListener('input', () => {
  phoneInput.classList.remove('field-invalid');
  phoneError.classList.remove('show');
});

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  formStatus.textContent = '';
  formStatus.className = 'form-status';

  const phoneValue = phoneInput.value.trim();
  const phoneValid = phoneValue !== '' && isValidPhone(phoneValue);
  if (!phoneValid) {
    phoneInput.classList.add('field-invalid');
    phoneError.textContent = phoneValue === ''
      ? 'Будь ласка, заповніть номер телефону'
      : 'Введіть коректний номер телефону +380 XX XXX XX XX';
    phoneError.classList.add('show');
    phoneInput.focus();
    return;
  }
  phoneInput.classList.remove('field-invalid');
  phoneError.classList.remove('show');

  const btn = form.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Надсилаємо…';

  const data = Object.fromEntries(new FormData(form).entries());

  try {
    const res = await fetch(TELEGRAM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Request failed');

    formStatus.textContent = 'Дякуємо! Ми зв’яжемось незабаром ✓';
    formStatus.classList.add('success');
    form.reset();
  } catch (err) {
    formStatus.textContent = 'Не вдалося надіслати. Спробуйте ще раз або зателефонуйте нам.';
    formStatus.classList.add('error');
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
});
