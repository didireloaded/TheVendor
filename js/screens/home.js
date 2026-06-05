// ============================================
// THE VENDOR — Home Screen
// ============================================

import { CATEGORIES, SEARCH_PLACEHOLDERS, getGreeting, getFeaturedVendors, getTrendingVendors, getNearbyVendors } from '../data.js';
import { navigateTo, openVendorProfileById, toggleFavorite, isFavorite, icons } from '../app.js';
import { renderVendorCardCompact, renderVendorCardLarge } from '../components.js';

let placeholderInterval = null;

export async function renderHomeScreen(container) {
  // Show loading state while fetching data
  container.innerHTML = `
    <div style="display: flex; height: 100vh; justify-content: center; align-items: center; flex-direction: column; color: var(--text-muted);">
      <div class="spinner" style="margin-bottom: var(--space-3); border: 3px solid var(--border-light); border-top-color: var(--primary); border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite;"></div>
      Loading vendors...
    </div>
  `;

  const greeting = getGreeting();
  const featured = await getFeaturedVendors();
  const trending = await getTrendingVendors();
  const nearby = await getNearbyVendors(5);

  container.innerHTML = `
    <div class="screen-home">
      <!-- Header -->
      <div class="home-header">
        <div class="home-greeting">
          <span class="greeting-text">${greeting}!</span>
          <div class="location-text">
            ${icons.location}
            Windhoek, Namibia
          </div>
        </div>
        <button class="notification-btn" id="home-notif-btn">
          ${icons.bell}
          <span class="notif-dot"></span>
        </button>
      </div>

      <!-- Search Bar -->
      <div class="search-bar-wrapper">
        <div class="search-bar" id="home-search-bar">
          ${icons.search}
          <input type="text" id="home-search-input" placeholder="${SEARCH_PLACEHOLDERS[0]}" readonly />
        </div>
      </div>

      <!-- Categories -->
      <div class="home-section">
        <div class="section-header">
          <h2 class="section-title">Categories</h2>
          <button class="section-link" id="home-see-all-cats">
            See All ${icons.chevronRight}
          </button>
        </div>
        <div class="category-scroll" id="home-categories">
          ${CATEGORIES.slice(0, 8).map(cat => `
            <div class="category-pill" data-category="${cat.id}">
              <div class="pill-icon" style="background: ${cat.color}15; color: ${cat.color};">
                ${cat.icon}
              </div>
              <span class="pill-label">${cat.name.split(' ')[0]}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Featured Vendors -->
      <div class="home-section">
        <div class="section-header">
          <h2 class="section-title">Featured Vendors</h2>
          <button class="section-link">
            See All ${icons.chevronRight}
          </button>
        </div>
        <div class="h-scroll" id="home-featured">
          ${featured.map((v, i) => renderVendorCardLarge(v, i)).join('')}
        </div>
      </div>

      <!-- Near Me -->
      <div class="home-section">
        <div class="section-header">
          <h2 class="section-title">Near You</h2>
          <button class="section-link">
            See All ${icons.chevronRight}
          </button>
        </div>
        <div class="h-scroll" id="home-nearby">
          ${nearby.slice(0, 6).map((v, i) => renderNearbyCard(v, i)).join('')}
        </div>
      </div>

      <!-- Trending -->
      <div class="home-section">
        <div class="section-header">
          <h2 class="section-title">Trending</h2>
          <button class="section-link">
            See All ${icons.chevronRight}
          </button>
        </div>
        <div style="padding: 0 var(--space-4); display: flex; flex-direction: column; gap: var(--space-3);">
          ${trending.slice(0, 4).map((v, i) => renderVendorCardCompact(v, i)).join('')}
        </div>
      </div>
    </div>
  `;

  // Start placeholder rotation
  startPlaceholderRotation();

  // Event listeners
  document.getElementById('home-search-bar').addEventListener('click', () => {
    clearInterval(placeholderInterval);
    navigateTo('search');
  });

  // Category clicks
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      navigateTo('explore');
    });
  });

  // Vendor card clicks
  container.querySelectorAll('[data-vendor-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-fav-id]')) return;
      openVendorProfileById(card.dataset.vendorId);
    });
  });

  // Favorite clicks
  container.querySelectorAll('[data-fav-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.favId);
    });
  });

  // Staggered animations
  requestAnimationFrame(() => {
    container.querySelectorAll('.vendor-card-large, .vendor-card-compact, .category-pill').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 60 * i);
    });
  });
}

function startPlaceholderRotation() {
  let idx = 0;
  const input = document.getElementById('home-search-input');
  if (!input) return;

  placeholderInterval = setInterval(() => {
    idx = (idx + 1) % SEARCH_PLACEHOLDERS.length;
    input.style.opacity = '0';
    setTimeout(() => {
      input.placeholder = SEARCH_PLACEHOLDERS[idx];
      input.style.opacity = '1';
    }, 200);
  }, 3000);
}

function renderNearbyCard(vendor, index) {
  const fav = isFavorite(vendor.id);
  return `
    <div class="vendor-card-large" data-vendor-id="${vendor.id}" style="width: 220px; animation-delay: ${index * 80}ms">
      <div class="card-image" style="background: ${vendor.coverGradient}; height: 120px;">
        <button class="card-favorite ${fav ? 'active' : ''}" data-fav-id="${vendor.id}">
          ${icons.heart}
        </button>
      </div>
      <div class="card-body" style="padding-top: var(--space-3);">
        <div class="card-info" style="padding-top: 0;">
          <div class="card-name" style="font-size: var(--text-sm);">
            ${vendor.name}
            ${vendor.verified ? `<span class="badge-verified ${vendor.verifiedLevel}">${icons.verifiedBadge}</span>` : ''}
          </div>
          <div class="card-meta" style="font-size: var(--text-xs);">
            <span class="rating">
              <span class="star">${icons.star}</span>
              <span class="rating-text" style="font-size: var(--text-xs);">${vendor.rating}</span>
            </span>
            <span class="distance" style="font-size: var(--text-xs);">${vendor.distance}km</span>
            <span class="badge-pill ${vendor.isOpen ? 'badge-open' : 'badge-closed'}">${vendor.isOpen ? 'Open' : 'Closed'}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
