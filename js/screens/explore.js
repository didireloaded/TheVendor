// ============================================
// THE VENDOR — Explore Screen (Instagram/Pinterest Inspired)
// ============================================

import { VENDORS, CATEGORIES, initExploreContent, EXPLORE_POSTS, EXPLORE_STORIES, EXPLORE_REELS } from '../data.js';
import { openVendorProfileById, toggleFavorite, isFavorite, icons, openBottomSheet, closeBottomSheet, refreshIcons, showToast } from '../app.js';
import { escapeHtml, escapeAttr, safeCssColor } from '../lib/sanitize.js';

let explorePlaceholderInterval = null;

export async function renderExploreScreen(container, params = {}) {
  // Ensure content is generated
  if (EXPLORE_POSTS.length === 0) {
    await initExploreContent();
  }

  container.innerHTML = `
    <div class="screen-explore-social">
      
      <!-- 1. Floating Search Bar -->
      <div class="explore-search-floating">
        <div class="search-bar-inner" id="explore-search-trigger">
          ${icons.search}
          <span class="search-placeholder" id="explore-search-placeholder">Find wedding inspiration...</span>
        </div>
      </div>

      <div class="explore-content-scrollable">
        
        <!-- 2. Stories Section -->
        <div class="explore-stories-container">
          <div class="horizontal-scroll-container hide-scrollbar" style="padding: var(--space-4); gap: var(--space-3);">
            <!-- Add to story -->
            <div class="story-avatar-container add-story">
              <div class="story-ring add-ring">
                ${icons.plus}
              </div>
              <span class="story-name">Your Story</span>
            </div>
            ${EXPLORE_STORIES.map(story => renderStoryAvatar(story)).join('')}
          </div>
        </div>

        <!-- 3. Trending Right Now (Tags) -->
        <div class="explore-trending-tags">
          <div class="horizontal-scroll-container hide-scrollbar" style="padding: 0 var(--space-4) var(--space-3); gap: var(--space-2);">
            <button class="trending-tag active">#wedding</button>
            <button class="trending-tag">#photography</button>
            <button class="trending-tag">#makeup</button>
            <button class="trending-tag">#catering</button>
            <button class="trending-tag">#dj</button>
          </div>
        </div>

        <!-- 4. Pinterest-style Masonry Feed -->
        <div class="explore-section">
          <div class="masonry-grid" id="explore-masonry-feed" style="padding: 0 var(--space-4);">
            ${renderMasonryFeed('#wedding')}
          </div>
        </div>

        <!-- 5. Vertical Reels Section -->
        <div class="explore-section">
          <div class="explore-section-header">
            <h2 class="explore-section-title" style="margin: 0; font-size: var(--text-lg);">Trending Reels</h2>
          </div>
          <div class="horizontal-scroll-container hide-scrollbar" style="padding: var(--space-2) var(--space-4);">
            ${EXPLORE_REELS.map(reel => renderReelCard(reel)).join('')}
          </div>
        </div>

      </div>
    </div>
  `;

  // Bind Interactions
  document.getElementById('explore-search-trigger')?.addEventListener('click', () => {
    // Show search modal or navigate
  });

  container.querySelectorAll('.story-avatar-container:not(.add-story)').forEach(el => {
    el.addEventListener('click', () => {
      showToast('Viewing story for ' + el.dataset.vendorName);
    });
  });

  container.querySelectorAll('.add-story').forEach(el => {
    el.addEventListener('click', () => {
      showToast('Open camera to add story');
    });
  });

  container.querySelectorAll('.trending-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      container.querySelectorAll('.trending-tag').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      const tagText = e.target.textContent.trim();
      const feed = container.querySelector('#explore-masonry-feed');
      if (feed) {
        feed.innerHTML = renderMasonryFeed(tagText);
        bindMasonryCards(container);
      }
    });
  });

  bindMasonryCards(container);

  container.querySelectorAll('.reel-card').forEach(card => {
    card.addEventListener('click', () => {
      showToast('Playing reel...');
    });
  });
}

function bindMasonryCards(container) {
  container.querySelectorAll('.masonry-card').forEach(card => {
    // Only bind if not already bound
    if (!card.dataset.bound) {
      card.dataset.bound = 'true';
      card.addEventListener('click', () => {
        openVendorProfileById(card.dataset.vendorId);
      });
    }
  });
}

function renderMasonryFeed(tagFilter) {
  const filtered = EXPLORE_POSTS.filter(post => post.caption && post.caption.toLowerCase().includes(tagFilter.toLowerCase()));
  // If too few, just show some random ones
  const postsToShow = filtered.length >= 4 ? filtered : EXPLORE_POSTS.slice(0, 14);
  return postsToShow.map(post => renderMasonryCard(post)).join('');
}

function renderStoryAvatar(story) {
  return `
    <div class="story-avatar-container" data-vendor-id="${escapeAttr(story.vendorId)}" data-vendor-name="${escapeAttr(story.vendorName)}">
      <div class="story-ring ${story.hasUnseen ? 'unseen' : ''}">
        <div class="story-inner" style="background: ${safeCssColor(story.vendorColor)}">
          ${escapeHtml(story.vendorLogo)}
        </div>
      </div>
      <span class="story-name">${escapeHtml(story.vendorName)}</span>
    </div>
  `;
}

function renderMasonryCard(post) {
  return `
    <div class="masonry-card" data-vendor-id="${escapeAttr(post.vendorId)}">
      <div class="masonry-image" style="background: ${safeCssColor(post.imageGradient)}; height: ${post.height}px;">
        <div class="masonry-overlay">
          <div class="masonry-actions">
            <button class="masonry-action-btn">${icons.heart}</button>
          </div>
          <div class="masonry-vendor-info">
            <div class="masonry-vendor-logo" style="background: ${safeCssColor(post.vendorColor)}">
              ${escapeHtml(post.vendorLogo)}
            </div>
            <span class="masonry-vendor-name">${escapeHtml(post.vendorName)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderReelCard(reel) {
  return `
    <div class="reel-card" data-vendor-id="${escapeAttr(reel.vendorId)}">
      <div class="reel-thumbnail" style="background: ${safeCssColor(reel.coverGradient)}">
        <div class="reel-play-icon">${icons.play}</div>
        <div class="reel-stats">${icons.eye} ${reel.views}</div>
        <div class="reel-vendor">
          <div class="reel-vendor-logo" style="background: var(--primary-500)">
            ${escapeHtml(reel.vendorLogo)}
          </div>
          <span class="reel-vendor-name">${escapeHtml(reel.vendorName)}</span>
        </div>
      </div>
    </div>
  `;
}

export function destroyExplore() {
  if (explorePlaceholderInterval) {
    clearInterval(explorePlaceholderInterval);
    explorePlaceholderInterval = null;
  }
}