// ============================================
// THE VENDOR — Search Screen
// ============================================

import { searchVendors, SEARCH_SUGGESTIONS, TRENDING_SEARCHES, CATEGORIES, VENDORS } from '../data.js';
import { navigateTo, openVendorProfileById, icons } from '../app.js';
import { getSemanticSearchCategories } from '../lib/ai.js';

let searchTimeout = null;

export function renderSearchScreen(container) {
  container.innerHTML = `
    <div class="screen-search">
      <div class="search-screen-header">
        <button class="search-back" id="search-back-btn">${icons.arrowLeft}</button>
        <div class="search-input-wrap">
          <input class="search-input" type="text" id="search-live-input" placeholder="Search vendors, services..." autofocus />
        </div>
      </div>

      <div id="search-content">
        <!-- Trending -->
        <div class="search-section">
          <div class="search-section-title">Trending Searches</div>
          ${TRENDING_SEARCHES.map(t => `
            <div class="search-suggestion" data-search-term="${t}">
              ${icons.trending}
              <span class="suggestion-text">${t}</span>
            </div>
          `).join('')}
        </div>

        <!-- Suggestions -->
        <div class="search-section">
          <div class="search-section-title">Popular</div>
          ${SEARCH_SUGGESTIONS.slice(0, 6).map(s => `
            <div class="search-suggestion" data-search-term="${s.text}">
              ${icons.search}
              <span class="suggestion-text">${s.text}</span>
              <span class="suggestion-category">${s.category}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Back button
  document.getElementById('search-back-btn')?.addEventListener('click', () => {
    navigateTo('home');
  });

  // Live search
  const input = document.getElementById('search-live-input');
  input?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      handleSearch(e.target.value);
    }, 400); // Increased debounce for AI
  });

  // Suggestion clicks
  container.querySelectorAll('[data-search-term]').forEach(item => {
    item.addEventListener('click', () => {
      const term = item.dataset.searchTerm;
      if (input) input.value = term;
      handleSearch(term);
    });
  });

  // Focus input
  requestAnimationFrame(() => input?.focus());
}

async function handleSearch(query) {
  const content = document.getElementById('search-content');
  if (!content) return;

  if (!query.trim()) {
    // Show default suggestions
    renderSearchScreen(document.getElementById('screen-container'));
    return;
  }

  content.innerHTML = `
    <div style="padding: var(--space-8); text-align: center; color: var(--text-tertiary);">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
      </svg>
      <p style="margin-top: var(--space-2); font-size: var(--text-sm);">Searching...</p>
    </div>
    <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
  `;

  let results = searchVendors(query);

  // Semantic AI Search if query seems descriptive
  if (query.trim().split(' ').length >= 2 || results.length === 0) {
    try {
      const aiCategories = await getSemanticSearchCategories(query, CATEGORIES);
      if (aiCategories.length > 0) {
        const categoryIds = CATEGORIES.filter(c => aiCategories.includes(c.name)).map(c => c.id);
        const semanticResults = VENDORS.filter(v => categoryIds.includes(v.category));
        
        const existingIds = new Set(results.map(v => v.id));
        for (const v of semanticResults) {
          if (!existingIds.has(v.id)) {
            results.push(v);
          }
        }
      }
    } catch(e) {
      console.error(e);
    }
  }

  // Double check content exists after await
  if (!document.getElementById('search-content')) return;

  content.innerHTML = `
    <div style="padding: var(--space-2) var(--space-4);">
      <span style="font-size: var(--text-sm); color: var(--text-tertiary);">${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"</span>
    </div>
    <div class="search-results">
      ${results.length > 0 ? results.map(v => `
        <div class="vendor-card-compact" data-vendor-id="${v.id}">
          <div class="card-thumb" style="background: ${v.coverGradient};">${v.logoInitials}</div>
          <div class="card-content">
            <div class="card-name">
              ${highlightMatch(v.name, query)}
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
              <span class="badge-pill ${v.isOpen ? 'badge-open' : 'badge-closed'}" style="font-size:10px;">${v.isOpen ? 'Open' : 'Closed'}</span>
            </div>
          </div>
          <div class="card-actions" style="justify-content: center;">
            <button class="btn-sm btn-whatsapp" style="padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); font-size: 11px;" onclick="event.stopPropagation(); window.open('https://wa.me/${v.whatsapp}')">
              ${icons.whatsapp}
            </button>
          </div>
        </div>
      `).join('') : `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <h3>No vendors found</h3>
          <p>Try a different search term or explore categories</p>
          <button class="btn btn-primary btn-sm" id="search-explore-btn">Explore Vendors</button>
        </div>
      `}
    </div>
  `;

  content.querySelectorAll('[data-vendor-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-whatsapp')) return;
      openVendorProfileById(card.dataset.vendorId);
    });
  });

  document.getElementById('search-explore-btn')?.addEventListener('click', () => {
    navigateTo('explore');
  });

  requestAnimationFrame(() => {
    content.querySelectorAll('.vendor-card-compact').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 40 * i);
    });
  });
}

function highlightMatch(text, query) {
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark style="background: var(--gold-100); color: inherit; padding: 0 1px; border-radius: 2px;">$1</mark>');
}

export function destroySearch() {
  clearTimeout(searchTimeout);
}
