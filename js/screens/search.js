// ============================================
// THE VENDOR — Search Screen
// ============================================

import { searchVendors, SEARCH_SUGGESTIONS, TRENDING_SEARCHES } from '../data.js';
import { navigateTo, openVendorProfileById, icons } from '../app.js';
import { renderEmptyState, renderVendorCardCompact } from '../components.js';

let searchTimeout = null;

export async function renderSearchScreen(container) {
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
    }, 200);
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

  content.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted);">Searching...</div>`;

  const results = await searchVendors(query);

  content.innerHTML = `
    <div style="padding: var(--space-2) var(--space-4);">
      <span style="font-size: var(--text-sm); color: var(--text-tertiary);">${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"</span>
    </div>
    <div class="search-results">
      ${results.length > 0 ? results.map((v, i) => {
        // We temporarily replace the name with highlighted HTML before rendering
        const originalName = v.name;
        v.name = highlightMatch(v.name, query);
        const cardHtml = renderVendorCardCompact(v, i);
        v.name = originalName; // restore
        return cardHtml;
      }).join('') : `
        ${renderEmptyState('search-x', 'No vendors found', 'Try a different search term or explore categories')}
        <div style="text-align: center; margin-top: calc(-1 * var(--space-4));">
          <button class="btn btn-primary btn-sm" id="search-explore-btn">Explore Vendors</button>
        </div>
      `}
    </div>
  `;

  // Bind result clicks
  content.querySelectorAll('[data-vendor-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-whatsapp')) return;
      openVendorProfileById(card.dataset.vendorId);
    });
  });

  document.getElementById('search-explore-btn')?.addEventListener('click', () => {
    navigateTo('explore');
  });

  // Stagger
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
