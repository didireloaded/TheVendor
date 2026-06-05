// ============================================
// THE VENDOR — Home Screen
// ============================================

import { CATEGORIES, SEARCH_PLACEHOLDERS, getGreeting, getFeaturedVendors, getTrendingVendors, getNearbyVendors } from '../data.js';
import { navigateTo, openVendorProfileById, toggleFavorite, isFavorite, icons } from '../app.js';
import { escapeHtml, escapeAttr, safeCssColor, safeHexColor } from '../lib/sanitize.js';

let placeholderInterval = null;

export function renderHomeScreen(container) {
  const greeting = getGreeting();
  const featured = getFeaturedVendors();
  const trending = getTrendingVendors();
  const nearby = getNearbyVendors(5);

  container.innerHTML = `
    <div class="screen-home">
      <!-- Header -->
      <div class="home-header">
        <div class="home-greeting">
          <span class="greeting-text">${greeting}</span>
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
            <div class="category-pill" data-category="${escapeAttr(cat.id)}">
              <div class="pill-icon" style="background: ${safeHexColor(cat.color)}15; color: ${safeHexColor(cat.color)};">
                ${icons[cat.icon] || icons.briefcase}
              </div>
              <span class="pill-label">${escapeHtml(cat.name.split(' ')[0])}</span>
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
          ${featured.map((v, i) => renderFeaturedCard(v, i)).join('')}
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
          ${trending.slice(0, 4).map((v, i) => renderCompactCard(v, i)).join('')}
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

  // Notification bell
  document.getElementById('home-notif-btn')?.addEventListener('click', () => {
    navigateTo('notifications');
  });

  // Category clicks
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      navigateTo('explore', { category: pill.dataset.category });
    });
  });

  // See All clicks
  document.querySelectorAll('.section-link').forEach(btn => {
    btn.addEventListener('click', () => {
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

function renderFeaturedCard(vendor, index) {
  const fav = isFavorite(vendor.id);
  return `
    <div class="vendor-card-large" data-vendor-id="${escapeAttr(vendor.id)}" style="animation-delay: ${index * 80}ms">
      <div class="card-image" style="background: ${safeCssColor(vendor.coverGradient)};">
        <span class="card-category">${escapeHtml(vendor.categoryName.split(' ')[0])}</span>
        <button class="card-favorite ${fav ? 'active' : ''}" data-fav-id="${escapeAttr(vendor.id)}">
          ${icons.heart}
        </button>
      </div>
      <div class="card-body">
        <div class="card-logo" style="background: ${safeCssColor(vendor.logoGradient)};">${escapeHtml(vendor.logoInitials)}</div>
        <div class="card-info">
          <div class="card-name">
            ${escapeHtml(vendor.name)}
            ${vendor.verified ? `<span class="badge-verified ${escapeAttr(vendor.verifiedLevel)}">${icons.verifiedBadge}</span>` : ''}
          </div>
          <div class="card-meta">
            <span class="rating">
              <span class="star">${icons.star}</span>
              <span class="rating-text">${escapeHtml(vendor.rating)}</span>
              <span class="rating-count">(${escapeHtml(vendor.reviewCount)})</span>
            </span>
            <span class="distance">${icons.location} ${escapeHtml(vendor.distance)}km</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderNearbyCard(vendor, index) {
  const fav = isFavorite(vendor.id);
  return `
    <div class="vendor-card-large" data-vendor-id="${escapeAttr(vendor.id)}" style="width: 220px; animation-delay: ${index * 80}ms">
      <div class="card-image" style="background: ${safeCssColor(vendor.coverGradient)}; height: 120px;">
        <button class="card-favorite ${fav ? 'active' : ''}" data-fav-id="${escapeAttr(vendor.id)}">
          ${icons.heart}
        </button>
      </div>
      <div class="card-body" style="padding-top: var(--space-3);">
        <div class="card-info" style="padding-top: 0;">
          <div class="card-name" style="font-size: var(--text-sm);">
            ${escapeHtml(vendor.name)}
            ${vendor.verified ? `<span class="badge-verified ${escapeAttr(vendor.verifiedLevel)}">${icons.verifiedBadge}</span>` : ''}
          </div>
          <div class="card-meta" style="font-size: var(--text-xs);">
            <span class="rating">
              <span class="star">${icons.star}</span>
              <span class="rating-text" style="font-size: var(--text-xs);">${escapeHtml(vendor.rating)}</span>
            </span>
            <span class="distance" style="font-size: var(--text-xs);">${escapeHtml(vendor.distance)}km</span>
            <span class="badge-pill ${vendor.isOpen ? 'badge-open' : 'badge-closed'}">${vendor.isOpen ? 'Open' : 'Closed'}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCompactCard(vendor, index) {
  const fav = isFavorite(vendor.id);
  return `
    <div class="vendor-card-compact" data-vendor-id="${escapeAttr(vendor.id)}" style="animation-delay: ${index * 80}ms">
      <div class="card-thumb" style="background: ${safeCssColor(vendor.coverGradient)};">${escapeHtml(vendor.logoInitials)}</div>
      <div class="card-content">
        <div class="card-name">
          ${escapeHtml(vendor.name)}
          ${vendor.verified ? `<span class="badge-verified ${escapeAttr(vendor.verifiedLevel)}">${icons.verifiedBadge}</span>` : ''}
        </div>
        <span class="card-category-text">${escapeHtml(vendor.categoryName)}</span>
        <div class="card-meta">
          <span class="rating">
            <span class="star">${icons.star}</span>
            <span class="rating-text">${escapeHtml(vendor.rating)}</span>
            <span class="rating-count">(${escapeHtml(vendor.reviewCount)})</span>
          </span>
          <span class="distance">${icons.location} ${escapeHtml(vendor.distance)}km</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="card-favorite ${fav ? 'active' : ''}" data-fav-id="${escapeAttr(vendor.id)}" style="position:static; background: var(--gray-50);">
          ${icons.heart}
        </button>
        <span class="badge-pill ${vendor.isOpen ? 'badge-open' : 'badge-closed'}" style="font-size: 10px;">${vendor.isOpen ? 'Open' : 'Closed'}</span>
      </div>
    </div>
  `;
}
