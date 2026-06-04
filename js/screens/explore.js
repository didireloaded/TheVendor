// ============================================
// THE VENDOR — Explore Screen
// ============================================

import { VENDORS, CATEGORIES, getVendorsByCategory } from '../data.js';
import { openVendorProfileById, toggleFavorite, isFavorite, icons, openBottomSheet, closeBottomSheet, refreshIcons } from '../app.js';

let viewMode = 'grid';

export function renderExploreScreen(container) {
  container.innerHTML = `
    <div class="screen-explore">
      <div class="explore-header">
        <h1 class="explore-title">Explore</h1>
      </div>

      <!-- Filter Chips -->
      <div class="filter-chips" style="margin-bottom: var(--space-4);">
        <button class="filter-chip active" data-cat="all">All</button>
        ${CATEGORIES.slice(0, 8).map(c => `
          <button class="filter-chip" data-cat="${c.id}">${c.icon} ${c.name.split(' ')[0]}</button>
        `).join('')}
      </div>

      <!-- Tools -->
      <div class="explore-tools">
        <div class="view-toggle">
          <button class="${viewMode === 'grid' ? 'active' : ''}" data-view="grid">${icons.grid}</button>
          <button class="${viewMode === 'list' ? 'active' : ''}" data-view="list">${icons.list}</button>
        </div>
        <button class="filter-btn" id="explore-filter-btn">
          ${icons.filter} Filters
        </button>
        <div style="flex:1;"></div>
        <span style="font-size: var(--text-sm); color: var(--text-tertiary); display:flex; align-items:center;">${VENDORS.length} vendors</span>
      </div>

      <!-- Results -->
      <div id="explore-results"></div>
    </div>
  `;

  renderResults(VENDORS);
  bindExploreEvents(container);
  refreshIcons();
}

function renderResults(vendors) {
  const results = document.getElementById('explore-results');
  if (!results) return;

  if (viewMode === 'grid') {
    results.innerHTML = `
      <div class="explore-grid">
        ${vendors.map(v => renderGridCard(v)).join('')}
      </div>
    `;
  } else {
    results.innerHTML = `
      <div class="explore-list">
        ${vendors.map(v => renderListCard(v)).join('')}
      </div>
    `;
  }

  // Bind card events
  results.querySelectorAll('[data-vendor-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-fav-id]')) return;
      openVendorProfileById(card.dataset.vendorId);
    });
  });

  results.querySelectorAll('[data-fav-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.favId);
    });
  });

  // Stagger animations
  requestAnimationFrame(() => {
    results.querySelectorAll('.vendor-card-grid, .vendor-card-compact').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 40 * i);
    });
  });

  refreshIcons();
}

function renderGridCard(v) {
  const fav = isFavorite(v.id);
  return `
    <div class="vendor-card-grid" data-vendor-id="${v.id}">
      <div class="grid-image" style="background: ${v.coverGradient};">
        <button class="card-favorite ${fav ? 'active' : ''}" data-fav-id="${v.id}">
          ${icons.heart}
        </button>
      </div>
      <div class="grid-body">
        <div class="grid-name">
          ${v.name}
          ${v.verified ? `<span class="badge-verified ${v.verifiedLevel}" style="display:inline-flex;">${icons.verifiedBadge}</span>` : ''}
        </div>
        <div class="grid-category">${v.categoryName}</div>
        <div class="grid-footer">
          <span class="grid-rating">${icons.star} ${v.rating}</span>
          <span class="grid-distance">${v.distance}km</span>
        </div>
      </div>
    </div>
  `;
}

function renderListCard(v) {
  const fav = isFavorite(v.id);
  return `
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
          </span>
          <span class="distance">${icons.location} ${v.distance}km</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="card-favorite ${fav ? 'active' : ''}" data-fav-id="${v.id}" style="position:static; background: var(--gray-50);">
          ${icons.heart}
        </button>
        <span class="badge-pill ${v.isOpen ? 'badge-open' : 'badge-closed'}" style="font-size: 10px;">${v.isOpen ? 'Open' : 'Closed'}</span>
      </div>
    </div>
  `;
}

function bindExploreEvents(container) {
  // View toggle
  container.querySelectorAll('.view-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      viewMode = btn.dataset.view;
      container.querySelectorAll('.view-toggle button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderResults(VENDORS);
    });
  });

  // Category chips
  container.querySelectorAll('.filter-chip[data-cat]').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.filter-chip[data-cat]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.dataset.cat;
      const filtered = cat === 'all' ? VENDORS : getVendorsByCategory(cat);
      renderResults(filtered);
      // Update count
      const count = container.querySelector('.explore-tools span:last-child');
      if (count) count.textContent = `${filtered.length} vendors`;
    });
  });

  // Filter button
  document.getElementById('explore-filter-btn')?.addEventListener('click', () => {
    openBottomSheet(`
      <h3 class="bottom-sheet-title">Filters</h3>
      <div class="form-group">
        <label class="form-label">Sort By</label>
        <select class="form-input form-select">
          <option>Nearest</option>
          <option>Highest Rated</option>
          <option>Most Popular</option>
          <option>Recently Added</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Distance</label>
        <select class="form-input form-select">
          <option>Within 1km</option>
          <option selected>Within 5km</option>
          <option>Within 10km</option>
          <option>Within 20km</option>
          <option>Any distance</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Rating</label>
        <select class="form-input form-select">
          <option>Any rating</option>
          <option>4+ stars</option>
          <option>4.5+ stars</option>
        </select>
      </div>
      <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
        <span class="form-label" style="margin: 0;">Open Now Only</span>
        <div style="width: 44px; height: 24px; background: var(--gray-200); border-radius: 12px; position: relative; cursor: pointer;" onclick="this.classList.toggle('on'); this.style.background = this.classList.contains('on') ? 'var(--primary-500)' : 'var(--gray-200)'; this.querySelector('div').style.transform = this.classList.contains('on') ? 'translateX(20px)' : 'translateX(0)'">
          <div style="width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.2s ease; box-shadow: var(--shadow-sm);"></div>
        </div>
      </div>
      <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
        <span class="form-label" style="margin: 0;">Verified Only</span>
        <div style="width: 44px; height: 24px; background: var(--gray-200); border-radius: 12px; position: relative; cursor: pointer;" onclick="this.classList.toggle('on'); this.style.background = this.classList.contains('on') ? 'var(--primary-500)' : 'var(--gray-200)'; this.querySelector('div').style.transform = this.classList.contains('on') ? 'translateX(20px)' : 'translateX(0)'">
          <div style="width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.2s ease; box-shadow: var(--shadow-sm);"></div>
        </div>
      </div>
      <div style="display: flex; gap: var(--space-3); margin-top: var(--space-5);">
        <button class="btn btn-secondary" style="flex:1;" onclick="document.getElementById('bottom-sheet-overlay').classList.add('hidden')">Reset</button>
        <button class="btn btn-primary" style="flex:2;" onclick="document.getElementById('bottom-sheet-overlay').classList.add('hidden')">Apply Filters</button>
      </div>
    `);
  });
}
