// ============================================
// THE VENDOR — Vendor Profile Screen
// ============================================

import { getVendorById, VENDORS } from '../data.js';
import { toggleFavorite, isFavorite, icons, openBottomSheet, showToast } from '../app.js';

export function renderVendorProfile(vendorId) {
  const vendor = getVendorById(vendorId);
  if (!vendor) return;

  const overlay = document.getElementById('vendor-profile-overlay');
  const fav = isFavorite(vendor.id);
  const today = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];

  // Smart Recommendations: same category, sort by rating and distance
  const related = VENDORS
    .filter(v => v.category === vendor.category && v.id !== vendor.id)
    .sort((a, b) => {
      // Prioritize higher rating, then closer distance
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.distance - b.distance;
    })
    .slice(0, 3);

  overlay.innerHTML = `
    <!-- Cover -->
    <div class="profile-cover" style="background: ${vendor.coverGradient};">
      <button class="profile-back-btn" id="profile-back">${icons.arrowLeft}</button>
      <button class="profile-share-btn">${icons.share}</button>
    </div>

    <!-- Info -->
    <div class="profile-info-section">
      <div class="profile-logo" style="background: ${vendor.logoGradient};">${vendor.logoInitials}</div>
      <h1 class="profile-name">
        ${vendor.name}
        ${vendor.verified ? `<span class="badge-verified ${vendor.verifiedLevel}">${icons.verifiedBadge}</span>` : ''}
      </h1>
      <p class="profile-category">${vendor.categoryName}</p>
      <div class="profile-stats">
        <span class="stat-item">
          <span style="color: var(--gold-400);">${icons.star}</span>
          <strong>${vendor.rating}</strong>
          <span style="color: var(--text-tertiary);">(${vendor.reviewCount} reviews)</span>
        </span>
        <span class="stat-item">
          ${icons.location}
          ${vendor.distance}km
        </span>
        <span class="badge-pill ${vendor.isOpen ? 'badge-open' : 'badge-closed'}">
          ${vendor.isOpen ? '● Open Now' : '● Closed'}
        </span>
      </div>
    </div>

    <!-- Sticky Actions -->
    <div class="profile-actions-sticky">
      <button class="action-btn action-whatsapp" onclick="window.open('https://wa.me/${vendor.whatsapp}')">
        ${icons.whatsapp} WhatsApp
      </button>
      <button class="action-btn action-call" onclick="window.open('tel:${vendor.phone}')">
        ${icons.phone} Call
      </button>
      <button class="action-btn action-directions">
        ${icons.directions}
      </button>
      <button class="action-btn action-quote" id="profile-quote-btn">
        ${icons.quote}
      </button>
    </div>

    <!-- About -->
    <div class="profile-section">
      <h2 class="profile-section-title">About</h2>
      <p class="profile-about">${vendor.description}</p>
    </div>

    <!-- Gallery -->
    <div class="profile-section">
      <h2 class="profile-section-title">Gallery</h2>
      <div class="profile-gallery">
        ${vendor.galleryColors.map((color, i) => `
          <div class="gallery-item" style="background: linear-gradient(135deg, ${color}, ${color}cc);"></div>
        `).join('')}
      </div>
    </div>

    <!-- Services -->
    <div class="profile-section">
      <h2 class="profile-section-title">Services</h2>
      ${vendor.services.map(s => `
        <div class="service-card">
          <div class="service-image" style="background: linear-gradient(135deg, ${s.color}, ${s.color}cc);"></div>
          <div class="service-info">
            <h3 class="service-name">${s.name}</h3>
            <p class="service-desc">${s.description}</p>
            <span class="service-price">${s.price}</span>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Reviews -->
    <div class="profile-section">
      <h2 class="profile-section-title">Reviews (${vendor.reviewCount})</h2>
      ${vendor.reviews.map(r => `
        <div class="review-card">
          <div class="review-header">
            <div class="avatar avatar-md" style="background: ${r.avatarColor};">${r.avatar}</div>
            <div class="review-author">
              <div class="author-name">${r.author}</div>
              <div class="review-date">${r.date}</div>
            </div>
            <div class="review-stars">
              ${Array.from({ length: 5 }, (_, i) => i < r.rating
                ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
                : `<svg class="empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
              ).join('')}
            </div>
          </div>
          <p class="review-text">${r.text}</p>
          ${r.hasPhotos ? `
            <div class="review-photos">
              ${(r.photoColors || []).map(c => `<div class="review-photo" style="background: ${c};"></div>`).join('')}
            </div>
          ` : ''}
          ${r.reply ? `
            <div class="review-reply">
              <div class="reply-label">Owner Response</div>
              <p class="reply-text">${r.reply}</p>
            </div>
          ` : ''}
        </div>
      `).join('')}
      <button class="btn btn-secondary btn-full" style="margin-top: var(--space-3);">Write a Review</button>
    </div>

    <!-- Operating Hours -->
    <div class="profile-section">
      <h2 class="profile-section-title">Operating Hours</h2>
      <div class="hours-list">
        ${Object.entries(vendor.hours).map(([day, time]) => `
          <div class="hours-item ${day === today ? 'today' : ''}">
            <span class="hours-day">${day.charAt(0).toUpperCase() + day.slice(1)}</span>
            <span class="hours-time">${time}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Location -->
    <div class="profile-section">
      <h2 class="profile-section-title">Location</h2>
      <div style="background: var(--gray-100); border-radius: var(--radius-lg); height: 160px; display: flex; align-items: center; justify-content: center; color: var(--text-tertiary); margin-bottom: var(--space-3);">
        <div style="text-align: center;">
          <div style="font-size: 32px; margin-bottom: var(--space-2);"><i data-lucide="map-pin-house" style="width: 32px; height: 32px; color: var(--primary);"></i></div>
          <span style="font-size: var(--text-sm);">${vendor.address}</span>
        </div>
      </div>
      <button class="btn btn-secondary btn-full" onclick="window.open('https://maps.google.com/?q=${vendor.lat},${vendor.lng}')">
        ${icons.directions} Get Directions
      </button>
    </div>

    <!-- Contact -->
    <div class="profile-section">
      <h2 class="profile-section-title">Contact</h2>
      <div class="contact-links">
        ${vendor.whatsapp ? `
          <a class="contact-link" href="https://wa.me/${vendor.whatsapp}" target="_blank">
            <div class="link-icon" style="background: #25D366;">${icons.whatsapp}</div>
            <span class="link-text">WhatsApp</span>
          </a>
        ` : ''}
        ${vendor.phone ? `
          <a class="contact-link" href="tel:${vendor.phone}">
            <div class="link-icon" style="background: var(--primary-500);">${icons.phone}</div>
            <span class="link-text">Call</span>
          </a>
        ` : ''}
        ${vendor.email ? `
          <a class="contact-link" href="mailto:${vendor.email}">
            <div class="link-icon" style="background: var(--gray-600);">${icons.email}</div>
            <span class="link-text">Email</span>
          </a>
        ` : ''}
        ${vendor.website ? `
          <a class="contact-link" href="${vendor.website}" target="_blank">
            <div class="link-icon" style="background: var(--gray-800);">${icons.globe}</div>
            <span class="link-text">Website</span>
          </a>
        ` : ''}
        ${vendor.instagram ? `
          <a class="contact-link" href="https://instagram.com/${vendor.instagram.replace('@', '')}" target="_blank">
            <div class="link-icon" style="background: linear-gradient(135deg, #833AB4, #E1306C, #F77737);">${icons.globe}</div>
            <span class="link-text">Instagram</span>
          </a>
        ` : ''}
        ${vendor.facebook ? `
          <a class="contact-link" href="https://facebook.com/${vendor.facebook}" target="_blank">
            <div class="link-icon" style="background: #1877F2;">${icons.globe}</div>
            <span class="link-text">Facebook</span>
          </a>
        ` : ''}
      </div>
    </div>

    <!-- Related Vendors -->
    ${related.length > 0 ? `
      <div class="profile-section" style="border-bottom: none;">
        <h2 class="profile-section-title">You May Also Like</h2>
        ${related.map(v => `
          <div class="vendor-card-compact" data-related-id="${v.id}" style="margin-bottom: var(--space-3); cursor: pointer;">
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
                <span class="distance"><i data-lucide="map-pin" style="width: 14px; height: 14px; margin-right: 2px;"></i> ${v.distance}km</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- Bottom Padding -->
    <div style="height: var(--space-8);"></div>
  `;

  overlay.classList.remove('hidden');
  overlay.scrollTop = 0;

  // Render newly added Lucide icons
  import('../app.js').then(module => {
    if (module.refreshIcons) module.refreshIcons();
  });

  // Events
  document.getElementById('profile-back')?.addEventListener('click', closeVendorProfile);

  // Quote button
  document.getElementById('profile-quote-btn')?.addEventListener('click', () => {
    openBottomSheet(`
      <h3 class="bottom-sheet-title">Request a Quote</h3>
      <div class="quote-form">
        <div class="form-group">
          <label class="form-label">Your Name</label>
          <input class="form-input" type="text" placeholder="Enter your name" />
        </div>
        <div class="form-group">
          <label class="form-label">Service Required</label>
          <select class="form-input form-select">
            <option value="">Select a service</option>
            ${vendor.services.map(s => `<option>${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Budget</label>
            <input class="form-input" type="text" placeholder="e.g. N$5,000" />
          </div>
          <div class="form-group">
            <label class="form-label">Date Needed</label>
            <input class="form-input" type="date" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Message</label>
          <textarea class="form-input" placeholder="Describe what you need..." rows="3"></textarea>
        </div>
        <button class="btn btn-primary btn-full" onclick="document.getElementById('bottom-sheet-overlay').classList.add('hidden'); document.getElementById('toast-container').innerHTML += '<div class=\\'toast success\\'>Your quote request has been sent!</div>'; setTimeout(() => document.querySelector('.toast')?.remove(), 3000);">
          Send Request
        </button>
      </div>
    `);
  });

  // Related vendor clicks
  overlay.querySelectorAll('[data-related-id]').forEach(card => {
    card.addEventListener('click', () => {
      renderVendorProfile(card.dataset.relatedId);
    });
  });

  // Favorite
  overlay.querySelectorAll('[data-fav-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.favId);
    });
  });
}

export function closeVendorProfile() {
  const overlay = document.getElementById('vendor-profile-overlay');
  if (overlay && !overlay.classList.contains('hidden')) {
    overlay.classList.add('closing');
    setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.classList.remove('closing');
      overlay.innerHTML = '';
    }, 300); // Matches animation duration
  }
}
