// ============================================
// THE VENDOR — Explore Screen
// ============================================

import { getAllVendorsIncludingSeeded, CATEGORIES, getVendorsByCategory } from '../data.js';
import { openVendorProfileById, toggleFavorite, isFavorite, icons, openBottomSheet, closeBottomSheet, refreshIcons } from '../app.js';
import { renderVendorCardGrid, renderVendorCardCompact } from '../components.js';

let viewMode = 'grid';

export async function renderExploreScreen(container) {
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
        <span style="font-size: var(--text-sm); color: var(--text-tertiary); display:flex; align-items:center;" id="explore-vendor-count">... vendors</span>
      </div>

      <!-- Results -->
      <div id="explore-results"></div>
    </div>
  `;

  const allVendors = await getAllVendorsIncludingSeeded();
  document.getElementById('explore-vendor-count').textContent = `${allVendors.length} vendors`;

  renderResults(allVendors);
  bindExploreEvents(container, allVendors);
  refreshIcons();
}

function renderResults(vendors) {
  const results = document.getElementById('explore-results');
  if (!results) return;

  if (viewMode === 'grid') {
    results.innerHTML = `
      <div class="explore-grid">
        ${vendors.map((v, i) => renderVendorCardGrid(v, i)).join('')}
      </div>
    `;
  } else {
    results.innerHTML = `
      <div class="explore-list">
        ${vendors.map((v, i) => renderVendorCardCompact(v, i)).join('')}
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



function bindExploreEvents(container, allVendors) {
  // View toggle
  container.querySelectorAll('.view-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      viewMode = btn.dataset.view;
      container.querySelectorAll('.view-toggle button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const activeCat = container.querySelector('.filter-chip.active')?.dataset.cat || 'all';
      if (activeCat === 'all') {
        renderResults(allVendors);
      } else {
        getVendorsByCategory(activeCat).then(filtered => renderResults(filtered));
      }
    });
  });

  // Category chips
  container.querySelectorAll('.filter-chip[data-cat]').forEach(chip => {
    chip.addEventListener('click', async () => {
      container.querySelectorAll('.filter-chip[data-cat]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.dataset.cat;
      const filtered = cat === 'all' ? allVendors : await getVendorsByCategory(cat);
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
