// ============================================
// THE VENDOR — Favorites Screen
// ============================================

import { getVendorById } from '../data.js';
import { getFavoriteIds, toggleFavorite, openVendorProfileById, icons, navigateTo } from '../app.js';
import { renderVendorCardCompact, renderEmptyState } from '../components.js';

let activeFilter = 'all';

export async function renderFavoritesScreen(container) {
  const favIds = getFavoriteIds();
  const vendorsPromises = favIds.map(id => getVendorById(id));
  const vendors = (await Promise.all(vendorsPromises)).filter(Boolean);
  
  // Extract unique categories from favorited vendors
  const categories = [...new Set(vendors.map(v => v.category))];
  
  const filteredVendors = activeFilter === 'all' 
    ? vendors 
    : vendors.filter(v => v.category === activeFilter);

  container.innerHTML = `
    <div class="screen-favorites">
      <div class="favorites-header">
        <h1>Favorites</h1>
      </div>

      ${vendors.length > 0 ? `
        <div class="map-quick-filters hide-scrollbar" style="padding: 0 var(--space-4) var(--space-3); position: sticky; top: 0; z-index: 10; background: var(--bg-primary);">
          <button class="filter-chip ${activeFilter === 'all' ? 'active' : ''}" data-cat="all">All</button>
          ${categories.map(cat => {
            const v = vendors.find(v => v.category === cat);
            return `<button class="filter-chip ${activeFilter === cat ? 'active' : ''}" data-cat="${cat}">${v.categoryName.split(' ')[0]}</button>`;
          }).join('')}
        </div>
        <div class="favorites-list">
          ${filteredVendors.map((v, i) => renderVendorCardCompact(v, i)).join('')}
          ${filteredVendors.length === 0 ? `<div style="text-align: center; color: var(--text-tertiary); margin-top: var(--space-6);">No favorites in this category.</div>` : ''}
        </div>
      ` : `
        ${renderEmptyState('heart-crack', 'No Favorites Yet', 'Save vendors you like to find them quickly later.')}
        <div style="text-align: center; margin-top: calc(-1 * var(--space-4));">
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

  // Filter clicks
  container.querySelectorAll('.filter-chip[data-cat]').forEach(chip => {
    chip.addEventListener('click', () => {
      activeFilter = chip.dataset.cat;
      renderFavoritesScreen(container);
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
