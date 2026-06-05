// ============================================
// THE VENDOR — Saved Vendors Screen
// ============================================

import { getVendorById } from '../data.js';
import { getFavoriteIds, toggleFavorite, openVendorProfileById, icons, navigateTo } from '../app.js';
import { escapeHtml, escapeAttr, safeCssColor } from '../lib/sanitize.js';

export function renderSavedVendorsScreen(container) {
  const favIds = getFavoriteIds();
  const vendors = favIds.map(id => getVendorById(id)).filter(Boolean);

  container.innerHTML = `
    <div class="screen-favorites">
      <div class="screen-header-with-back" style="display: flex; align-items: center; padding: var(--space-4); gap: var(--space-3);">
        <button class="icon-btn" id="saved-back-btn">
          ${icons.arrowLeft}
        </button>
        <h1 style="font-size: var(--text-xl); font-weight: 700; margin: 0;">Saved Vendors</h1>
      </div>

      ${vendors.length > 0 ? `
        <div class="favorites-list" style="padding: 0 var(--space-4);">
          ${vendors.map(v => `
            <div class="vendor-card-compact" data-vendor-id="${escapeAttr(v.id)}" style="margin-bottom: var(--space-3);">
              <div class="card-thumb" style="background: ${safeCssColor(v.coverGradient)};">${escapeHtml(v.logoInitials)}</div>
              <div class="card-content">
                <div class="card-name">
                  ${escapeHtml(v.name)}
                  ${v.verified ? `<span class="badge-verified ${escapeAttr(v.verifiedLevel)}">${icons.verifiedBadge}</span>` : ''}
                </div>
                <span class="card-category-text">${escapeHtml(v.categoryName)}</span>
                <div class="card-meta" style="margin-top: 4px;">
                  <span class="rating" style="color: var(--gold-500); font-weight: 600;">
                    ${icons.star} ${escapeHtml(v.rating)}
                  </span>
                  <span class="distance" style="color: var(--text-tertiary); margin-left: 8px;">
                    ${icons.location} ${escapeHtml(v.distance)}km
                  </span>
                </div>
                <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 6px;">Saved recently</div>
              </div>
              <div class="card-actions" style="display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-2);">
                <button class="card-favorite active" data-fav-id="${escapeAttr(v.id)}" style="position:static; background: var(--error-50);">
                  ${icons.heart}
                </button>
                <button class="btn btn-sm btn-primary" style="padding: 4px 8px; font-size: 11px;" data-quote-vendor="${escapeAttr(v.id)}">Quote</button>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:80px;height:80px;color:var(--gray-300);">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <h3>No Saved Vendors Yet</h3>
          <p>Save vendors you like to find them quickly later.</p>
          <button class="btn btn-primary" id="fav-explore-btn">Explore Vendors</button>
        </div>
      `}
    </div>
  `;

  // Events
  document.getElementById('saved-back-btn')?.addEventListener('click', () => {
    navigateTo('profile');
  });

  container.querySelectorAll('.vendor-card-compact').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-fav-id]') || e.target.closest('[data-quote-vendor]')) return;
      openVendorProfileById(card.dataset.vendorId);
    });
  });

  container.querySelectorAll('[data-fav-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.favId);
      setTimeout(() => renderSavedVendorsScreen(container), 300);
    });
  });

  container.querySelectorAll('[data-quote-vendor]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openVendorProfileById(btn.dataset.quoteVendor);
      // Wait for profile to open, then trigger quote
      setTimeout(() => {
        document.getElementById('profile-quote-btn')?.click();
      }, 300);
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
