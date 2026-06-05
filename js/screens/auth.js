// ============================================
// THE VENDOR — Authentication Screens
// Sign In, Sign Up, OTP Verification
// ============================================

import { refreshIcons } from '../app.js';

let currentView = 'signin'; // 'signin' | 'signup' | 'otp'
let otpTimer = null;

export function renderAuthScreen(containerEl) {
  switch (currentView) {
    case 'signin':
      renderSignIn(containerEl);
      break;
    case 'signup':
      renderSignUp(containerEl);
      break;
    case 'otp':
      renderOTP(containerEl);
      break;
  }
  refreshIcons();
}

function renderSignIn(container) {
  container.innerHTML = `
    <div class="auth-screen">
      <div class="auth-brand">
        <div class="auth-logo">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <path d="M24 4L8 14V34L24 44L40 34V14L24 4Z" fill="url(#aGrad)" />
            <path d="M24 14L16 19V29L24 34L32 29V19L24 14Z" fill="white" fill-opacity="0.3" />
            <path d="M24 20L20 22.5V27.5L24 30L28 27.5V22.5L24 20Z" fill="white" />
            <defs>
              <linearGradient id="aGrad" x1="8" y1="4" x2="40" y2="44">
                <stop offset="0%" stop-color="#1A6FEF" />
                <stop offset="100%" stop-color="#0F2B4C" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 class="auth-title">Welcome Back</h1>
        <p class="auth-subtitle">Sign in to The Vendor</p>
      </div>

      <div class="auth-form">
        <div class="form-group">
          <label class="form-label">Email or Phone</label>
          <div class="auth-input-wrap">
            <i data-lucide="mail"></i>
            <input class="form-input auth-input" type="text" id="auth-email" placeholder="name@example.com" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="auth-input-wrap">
            <i data-lucide="lock"></i>
            <input class="form-input auth-input" type="password" id="auth-password" placeholder="Enter your password" />
          </div>
          <button class="auth-forgot-link">Forgot password?</button>
        </div>

        <button class="btn btn-primary btn-full auth-submit-btn" id="auth-signin-btn">
          Sign In
        </button>

        <div class="auth-divider">
          <span>or continue with</span>
        </div>

        <div class="auth-social-row">
          <button class="auth-social-btn" id="auth-google-btn">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>
          <button class="auth-social-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </button>
        </div>
      </div>

      <div class="auth-footer">
        <p>Don't have an account? <button class="auth-switch-link" id="auth-go-signup">Create Account</button></p>
        <button class="auth-skip-link" id="auth-skip">Skip for now</button>
      </div>
    </div>
  `;

  // Sign in
  document.getElementById('auth-signin-btn')?.addEventListener('click', () => {
    const email = document.getElementById('auth-email')?.value;
    if (!email) {
      shakeInput('auth-email');
      return;
    }
    completeAuth(container);
  });

  // Go to signup
  document.getElementById('auth-go-signup')?.addEventListener('click', () => {
    currentView = 'signup';
    renderAuthScreen(container);
  });

  // Skip
  document.getElementById('auth-skip')?.addEventListener('click', () => {
    completeAuth(container);
  });

  // Google
  document.getElementById('auth-google-btn')?.addEventListener('click', () => {
    completeAuth(container);
  });
}

function renderSignUp(container) {
  container.innerHTML = `
    <div class="auth-screen">
      <div class="auth-brand">
        <div class="auth-logo">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <path d="M24 4L8 14V34L24 44L40 34V14L24 4Z" fill="url(#aGrad2)" />
            <path d="M24 14L16 19V29L24 34L32 29V19L24 14Z" fill="white" fill-opacity="0.3" />
            <path d="M24 20L20 22.5V27.5L24 30L28 27.5V22.5L24 20Z" fill="white" />
            <defs>
              <linearGradient id="aGrad2" x1="8" y1="4" x2="40" y2="44">
                <stop offset="0%" stop-color="#1A6FEF" />
                <stop offset="100%" stop-color="#0F2B4C" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">Join The Vendor community</p>
      </div>

      <div class="auth-form">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <div class="auth-input-wrap">
            <i data-lucide="user"></i>
            <input class="form-input auth-input" type="text" id="auth-name" placeholder="John Doe" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <div class="auth-input-wrap">
            <i data-lucide="mail"></i>
            <input class="form-input auth-input" type="email" id="auth-signup-email" placeholder="name@example.com" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <div class="auth-input-wrap">
            <span class="auth-phone-prefix">+264</span>
            <input class="form-input auth-input auth-phone-input" type="tel" id="auth-phone" placeholder="81 234 5678" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="auth-input-wrap">
            <i data-lucide="lock"></i>
            <input class="form-input auth-input" type="password" id="auth-signup-password" placeholder="Min. 8 characters" />
          </div>
        </div>

        <label class="auth-checkbox">
          <input type="checkbox" id="auth-terms" />
          <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
        </label>

        <button class="btn btn-primary btn-full auth-submit-btn" id="auth-signup-btn">
          Create Account
        </button>
      </div>

      <div class="auth-footer">
        <p>Already have an account? <button class="auth-switch-link" id="auth-go-signin">Sign In</button></p>
      </div>
    </div>
  `;

  document.getElementById('auth-signup-btn')?.addEventListener('click', () => {
    const name = document.getElementById('auth-name')?.value;
    const email = document.getElementById('auth-signup-email')?.value;
    if (!name || !email) {
      if (!name) shakeInput('auth-name');
      if (!email) shakeInput('auth-signup-email');
      return;
    }
    currentView = 'otp';
    renderAuthScreen(container);
  });

  document.getElementById('auth-go-signin')?.addEventListener('click', () => {
    currentView = 'signin';
    renderAuthScreen(container);
  });
}

function renderOTP(container) {
  container.innerHTML = `
    <div class="auth-screen">
      <div class="auth-brand">
        <div class="auth-logo">
          <i data-lucide="shield-check" style="width: 48px; height: 48px; color: var(--primary-500);"></i>
        </div>
        <h1 class="auth-title">Verify Your Phone</h1>
        <p class="auth-subtitle">We sent a 6-digit code to +264 81 *** **78</p>
      </div>

      <div class="auth-form">
        <div class="otp-input-group" id="otp-group">
          ${Array.from({ length: 6 }, (_, i) => `
            <input class="otp-input" type="text" maxlength="1" inputmode="numeric" data-otp-index="${i}" />
          `).join('')}
        </div>

        <div class="otp-timer" id="otp-timer">Resend code in <strong>00:30</strong></div>

        <button class="btn btn-primary btn-full auth-submit-btn" id="auth-verify-btn">
          Verify & Continue
        </button>

        <button class="auth-resend-link hidden" id="auth-resend">Resend Code</button>
      </div>

      <div class="auth-footer">
        <button class="auth-switch-link" id="auth-otp-back">
          <i data-lucide="arrow-left" style="width: 14px; height: 14px; vertical-align: middle;"></i> Back to Sign Up
        </button>
      </div>
    </div>
  `;

  // OTP auto-focus
  const inputs = container.querySelectorAll('.otp-input');
  inputs.forEach((inp, i) => {
    inp.addEventListener('input', (e) => {
      if (e.target.value && i < inputs.length - 1) {
        inputs[i + 1].focus();
      }
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && i > 0) {
        inputs[i - 1].focus();
      }
    });
  });
  inputs[0]?.focus();

  // Timer
  let seconds = 30;
  const timerEl = document.getElementById('otp-timer');
  const resendBtn = document.getElementById('auth-resend');
  otpTimer = setInterval(() => {
    seconds--;
    if (timerEl) timerEl.innerHTML = `Resend code in <strong>00:${String(seconds).padStart(2, '0')}</strong>`;
    if (seconds <= 0) {
      clearInterval(otpTimer);
      if (timerEl) timerEl.classList.add('hidden');
      if (resendBtn) resendBtn.classList.remove('hidden');
    }
  }, 1000);

  // Verify
  document.getElementById('auth-verify-btn')?.addEventListener('click', () => {
    completeAuth(container);
  });

  // Resend
  document.getElementById('auth-resend')?.addEventListener('click', () => {
    seconds = 30;
    if (timerEl) {
      timerEl.classList.remove('hidden');
      timerEl.innerHTML = `Resend code in <strong>00:30</strong>`;
    }
    if (resendBtn) resendBtn.classList.add('hidden');
    otpTimer = setInterval(() => {
      seconds--;
      if (timerEl) timerEl.innerHTML = `Resend code in <strong>00:${String(seconds).padStart(2, '0')}</strong>`;
      if (seconds <= 0) {
        clearInterval(otpTimer);
        if (timerEl) timerEl.classList.add('hidden');
        if (resendBtn) resendBtn.classList.remove('hidden');
      }
    }, 1000);
  });

  // Back
  document.getElementById('auth-otp-back')?.addEventListener('click', () => {
    clearInterval(otpTimer);
    currentView = 'signup';
    renderAuthScreen(container);
  });
}

function completeAuth(container) {
  clearInterval(otpTimer);
  currentView = 'signin';
  localStorage.setItem('tv_authenticated', 'true');
  localStorage.setItem('tv_user', JSON.stringify({ name: 'John Doe', email: 'john@thevendor.na', phone: '+264 81 234 5678' }));

  // Transition out
  const screen = container.closest('#auth-screen') || container;
  screen.style.opacity = '0';
  screen.style.transition = 'opacity 0.4s ease';

  setTimeout(() => {
    screen.classList.add('hidden');
    screen.style.opacity = '';
    const app = document.getElementById('app');
    if (app) {
      app.classList.remove('hidden');
      // Trigger app init
      window.dispatchEvent(new CustomEvent('authComplete'));
    }
  }, 400);
}

function shakeInput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
}

export function destroyAuth() {
  clearInterval(otpTimer);
  currentView = 'signin';
}
