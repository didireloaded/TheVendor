// ============================================
// THE VENDOR — App Controller
// Routing, state management, navigation
// ============================================

import { renderHomeScreen } from './screens/home.js';
import { renderExploreScreen } from './screens/explore.js';
import { renderMapScreen, destroyMap } from './screens/map.js';
import { renderFavoritesScreen } from './screens/favorites.js';
import { renderProfileScreen } from './screens/profile.js';
import { renderSearchScreen, destroySearch } from './screens/search.js';
import { renderVendorProfile, closeVendorProfile } from './screens/vendor-profile.js';

// ---------- State ----------
const state = {
  currentScreen: 'home',
  previousScreen: null,
  favorites: new Set(),
  searchQuery: '',
  showSearch: false,
  history: ['home'],
};

// ---------- Boot Sequence ----------
function bootApp() {
  initSplash();
  
  // Custom events
  document.getElementById('app').addEventListener('openBottomSheet', (e) => {
    openBottomSheet(e.detail.html);
  });
  document.getElementById('app').addEventListener('openVendorProfile', (e) => {
    openVendorProfileById(e.detail.id);
  });

  // Handle browser back button
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.screen) {
      navigateTo(e.state.screen, true);
    }
  });

  // Swipe-to-go-back gesture
  initSwipeGesture();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}

function initSwipeGesture() {
  const container = document.getElementById('screen-container');
  let startX = 0;
  let currentX = 0;
  let isSwiping = false;

  container.addEventListener('touchstart', (e) => {
    // Only start swipe if near left edge (like iOS)
    if (e.touches[0].clientX < 30 && state.history.length > 1) {
      startX = e.touches[0].clientX;
      isSwiping = true;
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    if (diff > 0) {
      const activeScreen = container.querySelector('.screen-wrapper.active');
      if (activeScreen) {
        activeScreen.style.transform = `translateX(${diff}px)`;
        activeScreen.style.transition = 'none';
      }
    }
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    
    const diff = currentX - startX;
    const activeScreen = container.querySelector('.screen-wrapper.active');
    
    if (diff > 100 && state.history.length > 1) {
      // Complete the swipe
      if (activeScreen) {
        activeScreen.style.transition = 'transform 0.3s ease-out';
        activeScreen.style.transform = 'translateX(100%)';
      }
      setTimeout(() => {
        window.history.back(); // Trigger popstate
      }, 300);
    } else {
      // Cancel the swipe
      if (activeScreen) {
        activeScreen.style.transition = 'transform 0.3s ease-out';
        activeScreen.style.transform = 'translateX(0)';
        setTimeout(() => {
          activeScreen.style.transform = '';
          activeScreen.style.transition = '';
        }, 300);
      }
    }
  });
}

function initSplash() {
  const splash = document.getElementById('splash-screen');
  const onboarding = document.getElementById('onboarding-screen');
  const app = document.getElementById('app');

  // Check if user has seen onboarding
  const hasOnboarded = localStorage.getItem('tv_onboarded');

  setTimeout(() => {
    splash.style.opacity = '0';
    splash.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
      splash.classList.add('hidden');

      if (!hasOnboarded) {
        onboarding.classList.remove('hidden');
        initOnboarding();
      } else {
        app.classList.remove('hidden');
        initApp();
      }
    }, 500);
  }, 2200);
}

// ---------- Offline Strategy ----------
function initOfflineStrategy() {
  const updateOnlineStatus = () => {
    if (!navigator.onLine) {
      showToast('You are offline. Showing cached data.', 'error');
      document.body.classList.add('offline-mode');
    } else {
      if (document.body.classList.contains('offline-mode')) {
        showToast('Back online!', 'success');
        document.body.classList.remove('offline-mode');
      }
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initial check
  if (!navigator.onLine) {
    updateOnlineStatus();
  }
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
      app.classList.remove('hidden');
      initApp();
    }, 400);
  }
}

// ---------- App Init ----------
function initApp() {
  // Load favorites from localStorage
  const savedFavs = localStorage.getItem('tv_favorites');
  if (savedFavs) {
    JSON.parse(savedFavs).forEach(id => state.favorites.add(id));
  }

  // Cache core data for offline use
  import('./store.js').then(async (module) => {
    const store = module.store;
    const vendors = await store.getAllVendors();
    localStorage.setItem('tv_cached_vendors', JSON.stringify(vendors));
  }).catch(() => {
    console.warn('Failed to cache offline vendors');
  });

  import('./data.js').then(module => {
    localStorage.setItem('tv_cached_categories', JSON.stringify(module.CATEGORIES));
  }).catch(() => {
    console.warn('Failed to cache offline categories');
  });

  initNavigation();
  initOfflineStrategy();
  
  // Set initial history state
  window.history.replaceState({ screen: 'home' }, '', '');
  navigateTo('home', true);
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

export async function navigateTo(screen, isBack = false) {
  if (screen === state.currentScreen && screen !== 'home') return;

  // Close any open overlays
  closeVendorProfile();
  closeBottomSheet();

  // Destroy previous screen resources
  if (state.currentScreen === 'map') destroyMap();
  if (state.currentScreen === 'search') destroySearch();

  state.previousScreen = state.currentScreen;
  state.currentScreen = screen;

  // Manage history stack
  if (!isBack) {
    if (screen === 'home') {
      state.history = ['home']; // Reset history on home
    } else {
      state.history.push(screen);
    }
    window.history.pushState({ screen }, '', '');
  } else {
    // If it's a back navigation, pop the history stack
    state.history.pop();
  }

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

  // Render screen with transitions
  const container = document.getElementById('screen-container');
  const oldWrapper = container.querySelector('.screen-wrapper.active');
  
  const newWrapper = document.createElement('div');
  newWrapper.className = `screen-wrapper ${isBack ? 'incoming-back' : 'incoming-forward'}`;
  
  // IMPORTANT: Append to DOM *before* rendering so that document.getElementById inside render functions works!
  container.appendChild(newWrapper);
  
  switch (screen) {
    case 'home': await renderHomeScreen(newWrapper); break;
    case 'explore': await renderExploreScreen(newWrapper); break;
    case 'map': await renderMapScreen(newWrapper); break;
    case 'favorites': await renderFavoritesScreen(newWrapper); break;
    case 'profile': await renderProfileScreen(newWrapper); break;
    case 'search': await renderSearchScreen(newWrapper); break;
    default: await renderHomeScreen(newWrapper);
  }
  
  // Trigger reflow
  void newWrapper.offsetWidth;

  newWrapper.classList.add('active');
  newWrapper.classList.remove('incoming-back', 'incoming-forward');

  if (oldWrapper) {
    oldWrapper.classList.add(isBack ? 'outgoing-back' : 'outgoing-forward');
    oldWrapper.classList.remove('active');
    setTimeout(() => {
      if (oldWrapper.parentNode) oldWrapper.parentNode.removeChild(oldWrapper);
    }, 300); // Wait for CSS transition
  }

  // Trigger Lucide icon rendering ONLY for the new wrapper to save CPU cycles
  refreshIcons(newWrapper);
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

  // Bottom Sheet
export function openBottomSheet(contentHTML) {
  const overlay = document.getElementById('bottom-sheet-overlay');
  const content = document.getElementById('bottom-sheet-content');
  const backdrop = document.getElementById('bottom-sheet-backdrop');

  content.innerHTML = contentHTML;
  overlay.classList.remove('hidden');

  backdrop.onclick = closeBottomSheet;
  refreshIcons(content);
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
  globe: '<i data-lucide="globe" style="width: 24px; height: 24px;"></i>',
  bell: '<i data-lucide="bell" style="width: 24px; height: 24px;"></i>',
  settings: '<i data-lucide="settings" style="width: 24px; height: 24px;"></i>',
  helpCircle: '<i data-lucide="help-circle" style="width: 24px; height: 24px;"></i>',
  logOut: '<i data-lucide="log-out" style="width: 24px; height: 24px;"></i>',
  briefcase: '<i data-lucide="briefcase" style="width: 24px; height: 24px;"></i>',
  trending: '<i data-lucide="trending-up" style="width: 24px; height: 24px;"></i>',
};

// Export Lucide wrapper
export function refreshIcons(rootElement = document.body) {
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons({
      root: rootElement,
      nameAttr: 'data-lucide'
    });
  }
}

// Export state getter
export function getState() { return state; }
