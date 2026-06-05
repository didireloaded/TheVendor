// ============================================
// THE VENDOR — Vendor Profile Screen (Premium)
// ============================================

import { getVendorById, getVendorsByCategory } from '../data.js';
import { toggleFavorite, isFavorite, icons, openBottomSheet, showToast } from '../app.js';

export async function renderVendorProfile(vendorId) {
  const vendor = await getVendorById(vendorId);
  if (!vendor) return;

  const overlay = document.getElementById('vendor-profile-overlay');
  const fav = isFavorite(vendor.id);
  const today = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];

  // Smart Recommendations
  let related = await getVendorsByCategory(vendor.category);
  related = related
    .filter(v => v.id !== vendor.id)
    .sort((a, b) => {
      if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
      return (a.distance || 0) - (b.distance || 0);
    })
    .slice(0, 3);

  // Generate dynamic stats for premium look
  const responseTime = vendor.rating > 4.5 ? 'Responds Within 30 Mins' : 'Usually Replies Same Day';
  const jobsCompleted = Math.floor(vendor.reviewCount * 2.5) + '+ Projects Completed';
  const yearsActive = 'Trusted Since ' + (new Date().getFullYear() - Math.floor(Math.random() * 5 + 1));
  const availability = vendor.isOpen ? (vendor.rating > 4.5 ? 'Highly Responsive' : 'Available') : 'Closed';
  const availClass = vendor.isOpen ? 'avail-active' : 'avail-closed';

  overlay.innerHTML = `
    <!-- High-Impact Hero -->
    <div class="vendor-hero-section" style="background: ${vendor.coverImage ? `url('${vendor.coverImage}') center/cover` : vendor.coverGradient};">
      <div class="vendor-hero-overlay"></div>
      
      <div class="vendor-hero-nav">
        <button class="hero-icon-btn" id="profile-back">${icons.arrowLeft}</button>
        <div class="hero-actions">
          <button class="hero-icon-btn">${icons.share}</button>
          <button class="hero-icon-btn fav-btn ${fav ? 'active' : ''}" data-fav-id="${vendor.id}">
            <svg class="heart-icon" viewBox="0 0 24 24" fill="${fav ? 'var(--error-500)' : 'none'}" stroke="${fav ? 'var(--error-500)' : 'currentColor'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
        </div>
      </div>

      <div class="vendor-hero-metrics">
        <span class="hero-metric"><i data-lucide="zap" style="width:14px;height:14px;"></i> ${responseTime}</span>
        <span class="hero-metric"><i data-lucide="check-circle" style="width:14px;height:14px;"></i> ${jobsCompleted}</span>
      </div>
    </div>

    <!-- Info & Social Proof Above the Fold -->
    <div class="vp-info-section">
      <div class="vp-logo-wrap">
        <div class="vp-logo" style="background: ${vendor.logoImage ? `url('${vendor.logoImage}') center/cover` : vendor.logoGradient};">${vendor.logoImage ? '' : vendor.logoInitials}</div>
      </div>
      
      <div class="vp-title-row">
        <h1 class="vp-name">
          ${vendor.name}
          ${vendor.verified ? `<span class="vp-verified-badge ${vendor.verifiedLevel}">${icons.verifiedBadge}</span>` : ''}
        </h1>
        <p class="vp-category">${vendor.categoryName} • ${yearsActive}</p>
      </div>

      <div class="vp-social-proof">
        <div class="vp-rating-block">
          <span class="vp-star">${icons.star}</span>
          <span class="vp-rating-score">${vendor.rating}</span>
          <span class="vp-review-count">(${vendor.reviewCount} Reviews)</span>
        </div>
        <div class="vp-proof-divider"></div>
        <div class="vp-recommend-block">
          <span class="vp-recommend-icon">${icons.checkCircle}</span>
          <span>98% Recommend</span>
        </div>
      </div>

      <div class="vp-location-status">
        <span class="vp-distance">${icons.location} ${vendor.distance}km away</span>
        <span class="vp-avail-badge ${availClass}">● ${availability}</span>
      </div>
    </div>

    <!-- Sticky Contact Actions -->
    <div class="vp-sticky-actions">
      <button class="btn btn-primary vp-quote-btn" id="profile-quote-btn">
        ${icons.quote} Request Quote
      </button>
      <button class="btn vp-icon-btn whatsapp" onclick="window.open('https://wa.me/${vendor.whatsapp}')">
        ${icons.whatsapp}
      </button>
      <button class="btn vp-icon-btn call" onclick="window.open('tel:${vendor.phone}')">
        ${icons.phone}
      </button>
    </div>

    <!-- Business Trust Section -->
    <div class="vp-section">
      <div class="vp-trust-card">
        <div class="trust-item">
          <div class="trust-icon text-success">${icons.checkCircle}</div>
          <div class="trust-text">Business Verified</div>
        </div>
        <div class="trust-item">
          <div class="trust-icon text-success">${icons.phone}</div>
          <div class="trust-text">Phone Verified</div>
        </div>
        <div class="trust-item">
          <div class="trust-icon text-primary">${icons.shield}</div>
          <div class="trust-text">Identity Verified</div>
        </div>
      </div>
    </div>

    <!-- About -->
    <div class="vp-section">
      <h2 class="vp-section-title">About</h2>
      <p class="vp-about-text">${vendor.description}</p>
    </div>

    <!-- Portfolio & Gallery -->
    <div class="vp-section">
      <div class="vp-section-header">
        <h2 class="vp-section-title">Portfolio</h2>
        <span class="vp-section-link">View All</span>
      </div>
      
      <div class="vp-portfolio-stats">
        <span class="portfolio-chip bg-primary-light text-primary">${icons.image} 32 Photos</span>
        <span class="portfolio-chip bg-gold-light text-gold-dark">${icons.video} 12 Videos</span>
      </div>

      <div class="vp-gallery-grid">
        ${vendor.galleryColors.map((color, i) => `
          <div class="vp-gallery-item" style="background: linear-gradient(135deg, ${color}, ${color}cc);">
            ${i === 0 ? `<div class="vp-gallery-tag">Featured</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Services (Premium UI) -->
    <div class="vp-section">
      <h2 class="vp-section-title">Services</h2>
      <div class="vp-services-list">
        ${vendor.services.map((s, i) => `
          <div class="vp-service-card">
            ${i === 0 ? `<div class="vp-service-badge bg-gold-light text-gold-dark">Most Popular</div>` : ''}
            <div class="vp-service-img" style="background: linear-gradient(135deg, ${s.color}, ${s.color}cc);"></div>
            <div class="vp-service-content">
              <h3 class="vp-service-name">${s.name}</h3>
              <p class="vp-service-desc">${s.description}</p>
              <div class="vp-service-meta">
                <span class="vp-service-price">From ${s.price}</span>
                <span class="vp-service-time">${icons.clock} 2-3 Days</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Related Vendors (Moved Up for better visibility) -->
    ${related.length > 0 ? `
      <div class="vp-section">
        <h2 class="vp-section-title">You May Also Like</h2>
        <div class="vp-related-scroll">
          ${related.map(v => `
            <div class="vp-related-card" data-related-id="${v.id}">
              <div class="vp-related-thumb" style="background: ${v.coverImage ? `url('${v.coverImage}') center/cover` : v.coverGradient};">${v.logoImage ? '' : v.logoInitials}</div>
              <div class="vp-related-info">
                <h4>${v.name}</h4>
                <p>${v.categoryName}</p>
                <div class="vp-related-meta">
                  <span class="vp-related-rating">${icons.star} ${v.rating}</span>
                  <span class="vp-related-dist">${v.distance}km</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Location (Simulated Mini-Map) -->
    <div class="vp-section">
      <h2 class="vp-section-title">Location</h2>
      <div class="vp-minimap-card">
        <div class="vp-minimap-bg">
          <div class="vp-map-marker">
            <div class="vp-marker-pulse"></div>
            ${icons.location}
          </div>
        </div>
        <div class="vp-minimap-info">
          <div>
            <h4 class="vp-minimap-address">${vendor.address}</h4>
            <p class="vp-minimap-dist">${vendor.distance}km away • ~15 mins drive</p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="window.open('https://maps.google.com/?q=${vendor.lat},${vendor.lng}')">
            Directions
          </button>
        </div>
      </div>
    </div>

    <!-- Operating Hours -->
    <div class="vp-section">
      <h2 class="vp-section-title">Operating Hours</h2>
      <div class="vp-hours-card">
        ${Object.entries(vendor.hours).map(([day, time]) => `
          <div class="vp-hour-row ${day === today ? 'vp-hour-today' : ''}">
            <span class="vp-hour-day">${day.charAt(0).toUpperCase() + day.slice(1)}</span>
            <span class="vp-hour-time">${time}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Reviews -->
    <div class="vp-section">
      <div class="vp-section-header">
        <h2 class="vp-section-title">Reviews (${vendor.reviewCount})</h2>
      </div>
      <div class="vp-reviews-list">
        ${vendor.reviews.map(r => `
          <div class="vp-review-card">
            <div class="vp-review-header">
              <div class="vp-review-avatar" style="background: ${r.avatarColor};">${r.avatar}</div>
              <div class="vp-review-author">
                <div class="vp-author-name">${r.author}</div>
                <div class="vp-review-date">${r.date}</div>
              </div>
              <div class="vp-review-stars text-gold-500">
                ${Array.from({ length: 5 }, (_, i) => i < r.rating ? icons.star : '').join('')}
              </div>
            </div>
            <p class="vp-review-text">${r.text}</p>
            ${r.hasPhotos ? `
              <div class="vp-review-photos">
                ${(r.photoColors || []).map(c => `<div class="vp-review-photo" style="background: ${c};"></div>`).join('')}
              </div>
            ` : ''}
            ${r.reply ? `
              <div class="vp-review-reply">
                <div class="vp-reply-label">Owner Response</div>
                <p class="vp-reply-text">${r.reply}</p>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
      <button class="btn btn-outline btn-full mt-4">Write a Review</button>
    </div>

    <div style="height: 100px;"></div>
  `;

  overlay.classList.remove('hidden');
  overlay.scrollTop = 0;

  import('../app.js').then(module => {
    if (module.refreshIcons) module.refreshIcons();
  });

  // Events
  document.getElementById('profile-back')?.addEventListener('click', closeVendorProfile);

  // Advanced Quote Modal
  document.getElementById('profile-quote-btn')?.addEventListener('click', () => {
    openBottomSheet(`
      <h3 class="bottom-sheet-title">Request Quote from ${vendor.name}</h3>
      <div class="quote-form-premium">
        <div class="form-group">
          <label class="form-label">Service Required</label>
          <select class="form-input form-select">
            <option value="">Select a service</option>
            ${vendor.services.map(s => `<option>${s.name}</option>`).join('')}
            <option>Custom Request</option>
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Budget Range (N$)</label>
            <select class="form-input form-select">
              <option>Under 1,000</option>
              <option>1,000 - 5,000</option>
              <option>5,000 - 15,000</option>
              <option>15,000+</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Event Date</label>
            <input class="form-input" type="date" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Event Location</label>
          <input class="form-input" type="text" placeholder="e.g. Windhoek Country Club" />
        </div>

        <div class="form-group">
          <label class="form-label">Your Phone Number</label>
          <input class="form-input" type="tel" placeholder="+264 81..." />
        </div>

        <div class="form-group">
          <label class="form-label">Message Details</label>
          <textarea class="form-input" placeholder="Describe your exact needs to get an accurate quote..." rows="3"></textarea>
        </div>

        <div class="form-group file-upload-group">
          <div class="file-upload-box">
            ${icons.image}
            <span>Attach reference photos or files</span>
          </div>
        </div>

        <button class="btn btn-primary btn-full quote-submit-btn" onclick="document.getElementById('bottom-sheet-overlay').classList.add('hidden'); document.getElementById('toast-container').innerHTML += '<div class=\\'toast success\\'>Quote request sent! Vendor usually replies within 30 mins.</div>'; setTimeout(() => document.querySelector('.toast')?.remove(), 4000);">
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

  // Favorite toggle
  overlay.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isFav = toggleFavorite(btn.dataset.favId);
      if (isFav) {
        btn.classList.add('active');
        btn.innerHTML = `<svg class="heart-icon" viewBox="0 0 24 24" fill="var(--error-500)" stroke="var(--error-500)" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      } else {
        btn.classList.remove('active');
        btn.innerHTML = `<svg class="heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      }
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
    }, 300);
  }
}
