// index.js (debug-friendly full script)
console.log('index.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired');

  const $ = sel => document.querySelector(sel);
  const byId = id => document.getElementById(id);

  // --- Mobile Navigation Toggle (safe) ---
  const hamburger = $('.hamburger');
  const navMenu = $('.nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  } else {
    console.warn('Note: .hamburger or .nav-menu not found', { hamburger, navMenu });
  }

  // --- Smooth scrolling (safe) ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.warn('Smooth-scroll target not found for', href);
      }
    });
  });

  // --- Navbar background on scroll (safe) ---
  const navbar = $('.navbar');
  if (!navbar) console.warn('.navbar element not found');
  const updateNavbarBg = () => {
    if (!navbar) return;
    navbar.style.background = window.scrollY > 100 ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.9)';
  };
  window.addEventListener('scroll', updateNavbarBg);
  updateNavbarBg();

  // --- Countdown Timer (debuggable) ---
  let daysEl = byId('days');
  let hoursEl = byId('hours');
  let minutesEl = byId('minutes');
  let secondsEl = byId('seconds');

  console.log('Initial countdown elements', { daysEl, hoursEl, minutesEl, secondsEl });

  const listMissing = () => {
    const missing = [];
    if (!daysEl) missing.push('days');
    if (!hoursEl) missing.push('hours');
    if (!minutesEl) missing.push('minutes');
    if (!secondsEl) missing.push('seconds');
    return missing;
  };

  const missing = listMissing();
  if (missing.length) console.warn('Missing countdown elements:', missing);

  // Use ISO date (clear parsing) — adjust the "Z" if you want local midnight behavior
  const targetDateMs = new Date('2025-09-26T00:00:00Z').getTime();
  console.log('Parsed targetDate (ms):', targetDateMs, 'isNaN?', isNaN(targetDateMs));
  if (isNaN(targetDateMs)) console.error('Target date parsed invalidly.');

  let countdownInterval = null;

  function updateCountdownOnce() {
    try {
      const now = Date.now();
      const distance = targetDateMs - now;
      console.log('countdown distance (ms):', distance);

      if (distance <= 0) {
        const container = document.querySelector('.countdown-bar') || document.getElementById('countdown');
        if (container) container.innerHTML = '<div class="countdown-content">🎉 The adventure has begun! 🎉</div>';
        if (countdownInterval) clearInterval(countdownInterval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    } catch (err) {
      console.error('updateCountdownOnce error:', err);
      if (countdownInterval) clearInterval(countdownInterval);
    }
  }

  // If elements are missing, try a few short retries (useful for accidental DOM reflow or templating)
  if (missing.length) {
    let attempts = 0;
    const maxAttempts = 6;
    const retry = setInterval(() => {
      attempts++;
      console.log('retrying countdown element lookup, attempt', attempts);
      const d = byId('days'), h = byId('hours'), m = byId('minutes'), s = byId('seconds');
      if (d && h && m && s) {
        daysEl = d; hoursEl = h; minutesEl = m; secondsEl = s;
        clearInterval(retry);
        updateCountdownOnce();
        countdownInterval = setInterval(updateCountdownOnce, 1000);
      } else if (attempts >= maxAttempts) {
        clearInterval(retry);
        console.error('Countdown elements still missing after retries — aborting countdown setup.');
      }
    }, 400);
  } else {
    updateCountdownOnce();
    countdownInterval = setInterval(updateCountdownOnce, 1000);
  }

  // Expose for manual debug
  window.__debugCountdown = updateCountdownOnce;
});
