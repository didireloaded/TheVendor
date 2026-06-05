// ============================================
// THE VENDOR — Vendor Profile Screen
// ============================================

import { getVendorById, VENDORS } from '../data.js';
import { supabase } from '../lib/supabase.js';
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
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.distance - b.distance;
    })
    .slice(0, 4);

  // Generate mock stats based on vendor properties
  const responseTime = vendor.rating > 4.7 ? '< 1 hour' : '1-3 hours';
  const completedJobs = Math.floor(vendor.reviewCount * 2.5) + '+';
  const yearsActive = vendor.rating > 4.5 ? '5 Years' : '2 Years';
  const verifiedSince = vendor.verified ? '2024' : 'N/A';

  overlay.innerHTML = `
    <!-- Cover -->
    <div class="profile-cover" style="background: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url('https://picsum.photos/seed/${vendor.id}-cover/800/400') center/cover;">
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

      <!-- Hero Trust Indicators -->
      <div class="vendor-hero-stats">
        <div class="vendor-hero-stat">
          <div class="vendor-hero-stat-icon"><i data-lucide="clock"></i></div>
          <div class="vendor-hero-stat-info">
            <span class="vendor-hero-stat-val">${responseTime}</span>
            <span class="vendor-hero-stat-label">Response Time</span>
          </div>
        </div>
        <div class="vendor-hero-stat">
          <div class="vendor-hero-stat-icon"><i data-lucide="check-circle-2"></i></div>
          <div class="vendor-hero-stat-info">
            <span class="vendor-hero-stat-val">${completedJobs}</span>
            <span class="vendor-hero-stat-label">Jobs Done</span>
          </div>
        </div>
        <div class="vendor-hero-stat">
          <div class="vendor-hero-stat-icon"><i data-lucide="calendar"></i></div>
          <div class="vendor-hero-stat-info">
            <span class="vendor-hero-stat-val">${yearsActive}</span>
            <span class="vendor-hero-stat-label">Years Active</span>
          </div>
        </div>
        <div class="vendor-hero-stat">
          <div class="vendor-hero-stat-icon"><i data-lucide="shield-check"></i></div>
          <div class="vendor-hero-stat-info">
            <span class="vendor-hero-stat-val">${verifiedSince}</span>
            <span class="vendor-hero-stat-label">Verified Since</span>
          </div>
        </div>
      </div>
    </div>

    <!-- About -->
    <div class="profile-section">
      <h2 class="profile-section-title">About</h2>
      <p class="profile-about">${vendor.description}</p>
    </div>

    <!-- Gallery -->
    <div class="profile-section">
      <h2 class="profile-section-title">Portfolio</h2>
      <div class="profile-gallery">
        ${[1,2,3,4,5,6].map(i => `
          <div class="gallery-item" style="background: url('https://picsum.photos/seed/${vendor.id}-gal${i}/400/300') center/cover;"></div>
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
                ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
                : '<svg class="empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
              ).join('')}
            </div>
          </div>
          <p class="review-text">${r.text}</p>
          ${r.hasPhotos ? `
            <div class="review-photos">
              ${[1,2].map(i => `<div class="review-photo" style="background: url('https://picsum.photos/seed/${vendor.id}-rev${i}/200/200') center/cover;"></div>`).join('')}
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
      <div style="background: url('https://picsum.photos/seed/${vendor.id}-map/600/300') center/cover; border-radius: var(--radius-lg); height: 160px; display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: var(--space-3);">
        <div style="background: white; padding: 4px 12px; border-radius: 100px; font-size: var(--text-sm); font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
          ${icons.location} ${vendor.address}
        </div>
      </div>
      <button class="btn btn-secondary btn-full" onclick="window.open('https://maps.google.com/?q=${vendor.lat},${vendor.lng}')">
        ${icons.directions} Get Directions
      </button>
    </div>

    <!-- Related Vendors -->
    ${related.length > 0 ? `
      <div class="profile-section" style="border-bottom: none;">
        <h2 class="profile-section-title">Similar Vendors</h2>
        <div class="similar-vendors-scroll">
        ${related.map(v => `
          <div class="similar-vendor-card" data-related-id="${v.id}">
            <div class="similar-vendor-cover" style="background: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url('https://picsum.photos/seed/${v.id}-cover/400/300') center/cover;">
              <div class="similar-vendor-logo" style="background: ${v.logoGradient};">${v.logoInitials}</div>
            </div>
            <div class="similar-vendor-info">
              <div class="similar-vendor-name">
                ${v.name}
                ${v.verified ? `<span class="badge-verified ${v.verifiedLevel}" style="transform: scale(0.8);">${icons.verifiedBadge}</span>` : ''}
              </div>
              <div class="similar-vendor-meta">
                <span style="color: var(--gold-500);"><i data-lucide="star"></i> ${v.rating}</span>
                <span><i data-lucide="map-pin"></i> ${v.distance}km</span>
              </div>
            </div>
          </div>
        `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Bottom Padding for FAB -->
    <div style="height: 100px;"></div>

    <!-- Floating Action Bar -->
    <div class="fab-bar-container">
      <button class="fab-btn" onclick="window.open('tel:${vendor.phone}')">
        <i data-lucide="phone"></i> Call
      </button>
      <button class="fab-btn" onclick="window.open('https://wa.me/${vendor.whatsapp}')">
        <i data-lucide="message-circle"></i> Chat
      </button>
      <button class="fab-btn" onclick="window.open('https://maps.google.com/?q=${vendor.lat},${vendor.lng}')">
        <i data-lucide="navigation"></i> Route
      </button>
      <button class="fab-btn primary" id="profile-quote-btn">
        <i data-lucide="file-text"></i> Request Quote
      </button>
    </div>
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
      <div class="quote-header">
        <div class="quote-vendor-logo" style="background: ${vendor.logoGradient};">${vendor.logoInitials}</div>
        <div>
          <h3 class="bottom-sheet-title" style="margin-bottom: 2px;">Request a Quote</h3>
          <p class="quote-vendor-name">from ${vendor.name}</p>
        </div>
      </div>
      
      <div class="quote-form-premium">
        <div class="form-group">
          <label class="form-label">What do you need?</label>
          <div class="quote-service-chips">
            ${vendor.services.map(s => `
              <label class="quote-chip">
                <input type="radio" name="quote_service" value="${s.name}">
                <span>${s.name}</span>
              </label>
            `).join('')}
            <label class="quote-chip">
              <input type="radio" name="quote_service" value="Other">
              <span>Other Request</span>
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Your Name</label>
            <div class="input-with-icon">
              <i data-lucide="user"></i>
              <input class="form-input" type="text" id="quote-name" placeholder="John Doe" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Contact (Phone/Email)</label>
            <div class="input-with-icon">
              <i data-lucide="phone"></i>
              <input class="form-input" type="text" id="quote-contact" placeholder="081 234 5678" />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Event/Need Date</label>
            <div class="input-with-icon">
              <i data-lucide="calendar"></i>
              <input class="form-input" type="date" id="quote-date" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Location</label>
            <div class="input-with-icon">
              <i data-lucide="map-pin"></i>
              <input class="form-input" type="text" id="quote-location" placeholder="Windhoek" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Budget (Optional)</label>
          <div class="input-with-icon">
            <span class="currency-symbol">N$</span>
            <input class="form-input" type="number" id="quote-budget" placeholder="0.00" style="padding-left: 36px;" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Message details</label>
          <textarea class="form-input" id="quote-message" placeholder="Hi, I am looking for..." rows="3"></textarea>
        </div>

        <div class="quote-footer">
          <p class="quote-disclaimer"><i data-lucide="shield-check" style="width: 14px; height: 14px; vertical-align: middle;"></i> Secure request. Vendors usually respond within ${responseTime}.</p>
          <button class="btn btn-primary btn-full quote-submit-btn" id="quote-submit-btn">
            Send Quote Request
          </button>
        </div>
      </div>
    `);
    
    // Wire up Submit Logic
    setTimeout(() => {
      document.getElementById('quote-submit-btn')?.addEventListener('click', async (e) => {
        const name = document.getElementById('quote-name')?.value;
        const contact = document.getElementById('quote-contact')?.value;
        const location = document.getElementById('quote-location')?.value;
        const budget = document.getElementById('quote-budget')?.value;
        const msg = document.getElementById('quote-message')?.value;
        const serviceNode = document.querySelector('input[name="quote_service"]:checked');
        const service = serviceNode ? serviceNode.value : 'General Request';

        if (!name || !contact) {
          showToast('Name and Contact are required.', 'error');
          return;
        }

        const btn = e.target;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        const { error } = await supabase.from('leads').insert({
          vendor_id: vendor.id,
          customer_name: name,
          customer_contact: contact,
          location: location || '',
          service_requested: service,
          budget: budget ? ('N$ ' + budget) : 'Not specified',
          message: msg || ''
        });

        if (error) {
          console.error(error);
          showToast('Failed to send request.', 'error');
          btn.textContent = 'Send Quote Request';
          btn.disabled = false;
        } else {
          document.getElementById('bottom-sheet-overlay').classList.add('hidden');
          showToast('Your quote request has been sent!', 'success');
        }
      });
      
      import('../app.js').then(module => {
          if (module.refreshIcons) module.refreshIcons();
      });
    }, 50);
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
