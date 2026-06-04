// ============================================
// THE VENDOR — Favorites Screen
// ============================================

import { getVendorById } from '../data.js';
import { getFavoriteIds, toggleFavorite, openVendorProfileById, icons, navigateTo } from '../app.js';

export function renderFavoritesScreen(container) {
  const favIds = getFavoriteIds();
  const vendors = favIds.map(id => getVendorById(id)).filter(Boolean);

  container.innerHTML = `
    <div class="screen-favorites">
      <div class="favorites-header">
        <h1>Favorites</h1>
      </div>

      ${vendors.length > 0 ? `
        <div class="favorites-list">
          ${vendors.map(v => `
            <div class="vendor-card-compact" data-vendor-id="${v.id}">
              <div class="card-thumb" style="background: ${v.coverGradient};">${v.logoInitials}</div>
              <div class="card-content">
                <div class="card-name">
                  ${v.name}
                  ${v.verified ? `<span class="badge-verified ${v.verifiedLevel}">${icons.verifiedBadge}</span>` : ''}
                </div>
                <span class="card-category-text">${v.categoryName}</span>
                <div class="card-meta">
                  <span class="rating">
                    <span class="star">${icons.star}</span>
                    <span class="rating-text">${v.rating}</span>
                    <span class="rating-count">(${v.reviewCount})</span>
                  </span>
                  <span class="distance">${icons.location} ${v.distance}km</span>
                </div>
              </div>
              <div class="card-actions">
                <button class="card-favorite active" data-fav-id="${v.id}" style="position:static; background: var(--error-50);">
                  ${icons.heart}
                </button>
                <span class="badge-pill ${v.isOpen ? 'badge-open' : 'badge-closed'}" style="font-size: 10px;">${v.isOpen ? 'Open' : 'Closed'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:80px;height:80px;color:var(--gray-300);">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <h3>No Favorites Yet</h3>
          <p>Save vendors you like to find them quickly later.</p>
          <button class="btn btn-primary" id="fav-explore-btn">Explore Vendors</button>
        </div>
      `}
    </div>
  `;

  // Events
  container.querySelectorAll('[data-vendor-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-fav-id]')) return;
      openVendorProfileById(card.dataset.vendorId);
    });
  });

  container.querySelectorAll('[data-fav-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.favId);
      // Re-render favorites after removal
      setTimeout(() => renderFavoritesScreen(container), 300);
    });
  });

  document.getElementById('fav-explore-btn')?.addEventListener('click', () => {
    navigateTo('explore');
  });

  // Stagger
  requestAnimationFrame(() => {
    container.querySelectorAll('.vendor-card-compact').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 60 * i);
    });
  });
}
