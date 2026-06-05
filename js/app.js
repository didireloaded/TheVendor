// ============================================
// THE VENDOR — App Controller
// Routing, state management, navigation
// ============================================

import { renderHomeScreen } from './screens/home.js';
import { renderExploreScreen, destroyExplore } from './screens/explore.js';
import { renderMapScreen, destroyMap } from './screens/map.js';
import { renderChatScreen } from './screens/chat.js';
import { renderSavedVendorsScreen } from './screens/saved-vendors.js';
import { renderProfileScreen } from './screens/profile.js';
import { renderSearchScreen, destroySearch } from './screens/search.js';
import { renderVendorProfile, closeVendorProfile } from './screens/vendor-profile.js';
import { renderAdminScreen } from './screens/admin.js';
import { renderNotificationsScreen } from './screens/notifications.js';
import { renderAuthScreen } from './screens/auth.js';
import { renderVendorRegistration } from './screens/vendor-registration.js';
import { initData } from './data.js';
import { supabase } from './lib/supabase.js';

// ---------- State ----------
const state = {
  currentScreen: 'home',
  previousScreen: null,
  favorites: new Set(),
  searchQuery: '',
  showSearch: false,
  isAuthenticated: false,
  hasInitialized: false,
};

// ---------- Boot Sequence ----------
document.addEventListener('DOMContentLoaded', async () => {
  await refreshAuthState();
  initSplash();
  
  // Custom events
  document.getElementById('app').addEventListener('openBottomSheet', (e) => {
    openBottomSheet(e.detail.html);
  });
  document.getElementById('app').addEventListener('openVendorProfile', (e) => {
    openVendorProfileById(e.detail.id);
  });
  document.getElementById('app').addEventListener('navigate', (e) => {
    navigateTo(e.detail);
  });
  window.addEventListener('authComplete', (event) => {
    state.isAuthenticated = !event.detail?.guest;
    showAppShell();
    initApp();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    state.isAuthenticated = !!session;
  });
});

let splashTimeout1, splashTimeout2;

function initSplash() {
  const splash = document.getElementById('splash-screen');
  const onboarding = document.getElementById('onboarding-screen');
  const app = document.getElementById('app');

  // Check if user has seen onboarding
  const hasOnboarded = localStorage.getItem('tv_onboarded');

  splashTimeout1 = setTimeout(() => {
    splash.style.opacity = '0';
    splash.style.transition = 'opacity 0.5s ease';

    splashTimeout2 = setTimeout(() => {
      splash.classList.add('hidden');

      if (!hasOnboarded) {
        onboarding.classList.remove('hidden');
        initOnboarding();
      } else if (!state.isAuthenticated) {
        showAuthScreen();
      } else {
        showAppShell();
        initApp();
      }
    }, 500);
  }, 2200);
}

// Added cleanup function to avoid memory leaks if navigation occurs before splash completes
export function cleanupSplash() {
  if (splashTimeout1) clearTimeout(splashTimeout1);
  if (splashTimeout2) clearTimeout(splashTimeout2);
}

// ---------- Onboarding ----------
function initOnboarding() {
  let currentSlide = 0;
  const slides = document.querySelectorAll('.onboarding-slide');
  const dots = document.querySelectorAll('.onboarding-dots .dot');
  const nextBtn = document.getElementById('onboarding-next-btn');
  const skipBtn = document.getElementById('onboarding-skip-btn');

  function goToSlide(index) {
    slides.forEach((s, i) => {
      s.classList.remove('active', 'exit');
      if (i < index) s.classList.add('exit');
      if (i === index) s.classList.add('active');
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === index));

    if (index === slides.length - 1) {
      nextBtn.textContent = 'Get Started';
    } else {
      nextBtn.textContent = 'Next';
    }
  }

  nextBtn.addEventListener('click', () => {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      goToSlide(currentSlide);
    } else {
      completeOnboarding();
    }
  });

  skipBtn.addEventListener('click', completeOnboarding);

  function completeOnboarding() {
    localStorage.setItem('tv_onboarded', 'true');
    const onboarding = document.getElementById('onboarding-screen');
    const app = document.getElementById('app');

    onboarding.style.opacity = '0';
    onboarding.style.transition = 'opacity 0.4s ease';
    setTimeout(() => {
      onboarding.classList.add('hidden');
      if (!state.isAuthenticated) {
        showAuthScreen();
      } else {
        showAppShell();
        initApp();
      }
    }, 400);
  }
}

// ---------- App Init ----------
async function initApp() {
  if (state.hasInitialized) return;
  await initData();
  state.hasInitialized = true;
  
  // Load favorites from localStorage
  const savedFavs = localStorage.getItem('tv_favorites');
  if (savedFavs) {
    try {
      JSON.parse(savedFavs).forEach(id => state.favorites.add(id));
    } catch {
      localStorage.removeItem('tv_favorites');
    }
  }

  initNavigation();
  navigateTo('home');
}

async function refreshAuthState() {
  const { data: { session } } = await supabase.auth.getSession();
  state.isAuthenticated = !!session;
}

function showAppShell() {
  document.getElementById('auth-screen')?.classList.add('hidden');
  document.getElementById('app')?.classList.remove('hidden');
}

function showAuthScreen() {
  const authScreen = document.getElementById('auth-screen');
  document.getElementById('app')?.classList.add('hidden');
  authScreen.classList.remove('hidden');
  renderAuthScreen(authScreen);
}

// ---------- Navigation ----------
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const screen = item.dataset.screen;
      navigateTo(screen);
    });
  });
}

export function navigateTo(screen, params = {}) {
  if (screen === 'auth') {
    showAuthScreen();
    return;
  }

  if (screen === state.currentScreen && screen !== 'home' && Object.keys(params).length === 0) return;

  // Close any open overlays
  closeVendorProfile();
  closeBottomSheet();

  // Destroy previous screen resources
  if (state.currentScreen === 'explore') destroyExplore();
  if (state.currentScreen === 'map') destroyMap();
  if (state.currentScreen === 'search') destroySearch();

  state.previousScreen = state.currentScreen;
  state.currentScreen = screen;

  // Update nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.screen === screen);
  });

  // Show/hide nav for search
  const nav = document.getElementById('bottom-nav');
  if (screen === 'search') {
    nav.style.display = 'none';
  } else {
    nav.style.display = 'flex';
  }

  // Render screen
  const container = document.getElementById('screen-container');
  container.scrollTop = 0;

  switch (screen) {
    case 'home':
      renderHomeScreen(container);
      break;
    case 'explore':
      renderExploreScreen(container, params);
      break;
    case 'map':
      renderMapScreen(container);
      break;
    case 'chat':
      renderChatScreen(container);
      break;
    case 'saved-vendors':
      renderSavedVendorsScreen(container);
      break;
    case 'profile':
      renderProfileScreen(container);
      break;
    case 'search':
      renderSearchScreen(container);
      break;
    case 'admin':
      renderAdminScreen(container);
      break;
    case 'notifications':
      renderNotificationsScreen(container);
      break;
    case 'vendor-registration':
      renderVendorRegistration(container);
      break;
    default:
      renderHomeScreen(container);
  }

  // Trigger Lucide icon rendering
  refreshIcons();
}

// ---------- Vendor Profile ----------
export function openVendorProfileById(vendorId) {
  renderVendorProfile(vendorId);
}

// ---------- Favorites ----------
export function toggleFavorite(vendorId) {
  if (state.favorites.has(vendorId)) {
    state.favorites.delete(vendorId);
    showToast('Removed from favorites');
  } else {
    state.favorites.add(vendorId);
    showToast('Added to favorites', 'success');
  }
  localStorage.setItem('tv_favorites', JSON.stringify([...state.favorites]));

  // Update all visible heart icons
  document.querySelectorAll(`[data-fav-id="${vendorId}"]`).forEach(btn => {
    btn.classList.toggle('active', state.favorites.has(vendorId));
  });

  return state.favorites.has(vendorId);
}

export function isFavorite(vendorId) {
  return state.favorites.has(vendorId);
}

export function getFavoriteIds() {
  return [...state.favorites];
}

// ---------- Bottom Sheet ----------
export function openBottomSheet(contentHTML) {
  const overlay = document.getElementById('bottom-sheet-overlay');
  const content = document.getElementById('bottom-sheet-content');
  const backdrop = document.getElementById('bottom-sheet-backdrop');

  content.innerHTML = contentHTML;
  overlay.classList.remove('hidden');

  backdrop.onclick = closeBottomSheet;
  refreshIcons();
}

export function closeBottomSheet() {
  const overlay = document.getElementById('bottom-sheet-overlay');
  overlay.classList.add('hidden');
}

// ---------- Toast ----------
export function showToast(message, type = '') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ---------- SVG Icons ----------
export const icons = {
  star: '<i data-lucide="star" style="fill: currentColor; width: 24px; height: 24px;"></i>',
  starEmpty: '<i data-lucide="star" style="width: 24px; height: 24px;"></i>',
  heart: '<i data-lucide="heart" style="width: 24px; height: 24px;"></i>',
  verified: '<i data-lucide="badge-check" style="fill: currentColor; width: 24px; height: 24px;"></i>',
  verifiedBadge: '<i data-lucide="badge-check" style="fill: currentColor; width: 24px; height: 24px;"></i>',
  location: '<i data-lucide="map-pin" style="width: 24px; height: 24px;"></i>',
  search: '<i data-lucide="search" style="width: 24px; height: 24px;"></i>',
  arrowLeft: '<i data-lucide="arrow-left" style="width: 24px; height: 24px;"></i>',
  arrowRight: '<i data-lucide="arrow-right" style="width: 24px; height: 24px;"></i>',
  chevronRight: '<i data-lucide="chevron-right" style="width: 24px; height: 24px;"></i>',
  phone: '<i data-lucide="phone" style="width: 24px; height: 24px;"></i>',
  whatsapp: '<i data-lucide="message-circle" style="fill: currentColor; width: 24px; height: 24px;"></i>',
  directions: '<i data-lucide="navigation" style="width: 24px; height: 24px;"></i>',
  quote: '<i data-lucide="file-text" style="width: 24px; height: 24px;"></i>',
  share: '<i data-lucide="share-2" style="width: 24px; height: 24px;"></i>',
  grid: '<i data-lucide="grid" style="width: 24px; height: 24px;"></i>',
  list: '<i data-lucide="list" style="width: 24px; height: 24px;"></i>',
  filter: '<i data-lucide="sliders-horizontal" style="width: 24px; height: 24px;"></i>',
  crosshair: '<i data-lucide="crosshair" style="width: 24px; height: 24px;"></i>',
  clock: '<i data-lucide="clock-3" style="width: 24px; height: 24px;"></i>',
  email: '<i data-lucide="mail" style="width: 24px; height: 24px;"></i>',
  mail: '<i data-lucide="mail" style="width: 24px; height: 24px;"></i>',
  globe: '<i data-lucide="globe" style="width: 24px; height: 24px;"></i>',
  bell: '<i data-lucide="bell" style="width: 24px; height: 24px;"></i>',
  settings: '<i data-lucide="settings" style="width: 24px; height: 24px;"></i>',
  helpCircle: '<i data-lucide="help-circle" style="width: 24px; height: 24px;"></i>',
  logOut: '<i data-lucide="log-out" style="width: 24px; height: 24px;"></i>',
  briefcase: '<i data-lucide="briefcase" style="width: 24px; height: 24px;"></i>',
  trending: '<i data-lucide="trending-up" style="width: 24px; height: 24px;"></i>',
  checkCircle: '<i data-lucide="check-circle" style="width: 24px; height: 24px;"></i>',
  mapPin: '<i data-lucide="map-pin" style="width: 24px; height: 24px;"></i>',
  bookmark: '<i data-lucide="bookmark" style="width: 24px; height: 24px;"></i>',
  messageSquare: '<i data-lucide="message-square" style="width: 24px; height: 24px;"></i>',
  eye: '<i data-lucide="eye" style="width: 24px; height: 24px;"></i>',
  shield: '<i data-lucide="shield" style="width: 24px; height: 24px;"></i>',
  fileText: '<i data-lucide="file-text" style="width: 24px; height: 24px;"></i>',
  user: '<i data-lucide="user" style="width: 24px; height: 24px;"></i>',
  userRound: '<i data-lucide="user-round" style="width: 24px; height: 24px;"></i>',
  edit2: '<i data-lucide="edit-2" style="width: 24px; height: 24px;"></i>',
  share2: '<i data-lucide="share-2" style="width: 24px; height: 24px;"></i>',
  qrCode: '<i data-lucide="qr-code" style="width: 24px; height: 24px;"></i>',
  calendarCheck: '<i data-lucide="calendar-check" style="width: 24px; height: 24px;"></i>',
  layoutDashboard: '<i data-lucide="layout-dashboard" style="width: 24px; height: 24px;"></i>',
  chartColumn: '<i data-lucide="chart-column" style="width: 24px; height: 24px;"></i>',
  users: '<i data-lucide="users" style="width: 24px; height: 24px;"></i>',
  trash2: '<i data-lucide="trash-2" style="width: 24px; height: 24px;"></i>',
  shieldCheck: '<i data-lucide="shield-check" style="width: 24px; height: 24px;"></i>',
  shieldAlert: '<i data-lucide="shield-alert" style="width: 24px; height: 24px;"></i>',
  lock: '<i data-lucide="lock" style="width: 24px; height: 24px;"></i>',
  smartphone: '<i data-lucide="smartphone" style="width: 24px; height: 24px;"></i>',
  creditCard: '<i data-lucide="credit-card" style="width: 24px; height: 24px;"></i>',
  receipt: '<i data-lucide="receipt" style="width: 24px; height: 24px;"></i>',
  moon: '<i data-lucide="moon" style="width: 24px; height: 24px;"></i>',
};

// Export Lucide wrapper
export function refreshIcons() {
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
}

// Export state getter
export function getState() { return state; }
