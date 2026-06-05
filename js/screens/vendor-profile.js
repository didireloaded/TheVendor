// ============================================
// THE VENDOR — Vendor Profile Screen
// ============================================

import { getVendorById, VENDORS } from '../data.js';
import { supabase } from '../lib/supabase.js';
import { toggleFavorite, isFavorite, icons, openBottomSheet, showToast, closeBottomSheet, refreshIcons } from '../app.js';
import { renderChatConversation } from './chat-conversation.js';
import { escapeHtml, escapeAttr, safeCssColor } from '../lib/sanitize.js';

export function renderVendorProfile(vendorId) {
  const vendor = getVendorById(vendorId);
  if (!vendor) return;

  const overlay = document.getElementById('vendor-profile-overlay');
  const fav = isFavorite(vendor.id);
  const today = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
  const vendorSeed = encodeURIComponent(vendor.id || 'vendor');
  const vendorLogoGradient = safeCssColor(vendor.logoGradient);
  const vendorName = escapeHtml(vendor.name);

  // Smart Recommendations: same category, sort by rating and distance
  const related = VENDORS
    .filter(v => v.category === vendor.category && v.id !== vendor.id)
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.distance - b.distance;
    })
    .slice(0, 4);

  overlay.innerHTML = `
    <div class="vendor-profile-header">
      <div class="vendor-hero" style="background: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.7)), url('https://picsum.photos/seed/${vendorSeed}-cover/800/400') center/cover;">
        <button class="profile-action-btn" id="profile-back" style="position: absolute; top: var(--space-4); left: var(--space-4);">
          <i data-lucide="arrow-left"></i>
        </button>
        <button class="profile-action-btn" id="profile-share" style="position: absolute; top: var(--space-4); right: var(--space-4);">
          <i data-lucide="share-2"></i>
        </button>
        <button class="profile-action-btn card-favorite ${fav ? 'active' : ''}" data-fav-id="${escapeAttr(vendor.id)}" style="position: absolute; top: var(--space-4); right: calc(var(--space-4) * 2 + 40px);">
          <i data-lucide="heart"></i>
        </button>
        
        <div class="vendor-hero-content">
          <div class="vendor-hero-logo" style="background: ${vendorLogoGradient};">${escapeHtml(vendor.logoInitials)}</div>
          <div>
            <h1 class="vendor-hero-name">
              ${vendorName}
              ${vendor.verified ? `<span class="badge-verified ${escapeAttr(vendor.verifiedLevel)}" style="margin-left: 8px;">${icons.verifiedBadge}</span>` : ''}
            </h1>
            <p class="vendor-hero-category">${escapeHtml(vendor.categoryName)} • ${escapeHtml(vendor.distance)}km away</p>
          </div>
        </div>
      </div>

      <!-- Hero Trust Indicators -->
      <div class="vendor-hero-stats">
        <div class="vendor-hero-stat">
          <div class="vendor-hero-stat-icon"><i data-lucide="star"></i></div>
          <div class="vendor-hero-stat-info">
            <span class="vendor-hero-stat-val">${escapeHtml(vendor.rating)}</span>
            <span class="vendor-hero-stat-label">Rating</span>
          </div>
        </div>
        <div class="vendor-hero-stat">
          <div class="vendor-hero-stat-icon"><i data-lucide="message-square"></i></div>
          <div class="vendor-hero-stat-info">
            <span class="vendor-hero-stat-val">${escapeHtml(vendor.reviewCount)}</span>
            <span class="vendor-hero-stat-label">Reviews</span>
          </div>
        </div>
        ${vendor.verified ? `
        <div class="vendor-hero-stat">
          <div class="vendor-hero-stat-icon"><i data-lucide="shield-check"></i></div>
          <div class="vendor-hero-stat-info">
            <span class="vendor-hero-stat-val">Verified</span>
            <span class="vendor-hero-stat-label">Business</span>
          </div>
        </div>
        ` : ''}
      </div>
    </div>

    <!-- About -->
    <div class="profile-section">
      <h2 class="profile-section-title">About</h2>
      <p class="profile-about">${escapeHtml(vendor.description)}</p>
    </div>

    <!-- Gallery -->
    <div class="profile-section">
      <h2 class="profile-section-title">Portfolio</h2>
      <div class="profile-gallery">
        ${[1,2,3,4,5,6].map(i => `
          <div class="gallery-item" style="background: url('https://picsum.photos/seed/${vendorSeed}-gal${i}/400/300') center/cover;"></div>
        `).join('')}
      </div>
    </div>

    <!-- Services -->
    <div class="profile-section">
      <h2 class="profile-section-title">Services</h2>
      ${vendor.services.map(s => `
        <div class="service-card">
          <div class="service-image" style="background: ${safeCssColor(s.color, vendorLogoGradient)};"></div>
          <div class="service-info">
            <h3 class="service-name">${escapeHtml(s.name)}</h3>
            <p class="service-desc">${escapeHtml(s.description)}</p>
            <span class="service-price">${escapeHtml(s.price)}</span>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Reviews -->
    <div class="profile-section">
      <h2 class="profile-section-title">Reviews (${escapeHtml(vendor.reviewCount)})</h2>
      ${vendor.reviews.map(r => `
        <div class="review-card">
          <div class="review-header">
            <div class="avatar avatar-md" style="background: ${safeCssColor(r.avatarColor)};">${escapeHtml(r.avatar)}</div>
            <div class="review-author">
              <div class="author-name">${escapeHtml(r.author)}</div>
              <div class="review-date">${escapeHtml(r.date)}</div>
            </div>
            <div class="review-stars">
              ${Array.from({ length: 5 }, (_, i) => i < r.rating
                ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
                : '<svg class="empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
              ).join('')}
            </div>
          </div>
          <p class="review-text">${escapeHtml(r.text)}</p>
          ${r.hasPhotos ? `
            <div class="review-photos">
              ${[1,2].map(i => `<div class="review-photo" style="background: url('https://picsum.photos/seed/${vendorSeed}-rev${i}/200/200') center/cover;"></div>`).join('')}
            </div>
          ` : ''}
          ${r.reply ? `
            <div class="review-reply">
              <div class="reply-label">Owner Response</div>
              <p class="reply-text">${escapeHtml(r.reply)}</p>
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
            <span class="hours-day">${escapeHtml(day.charAt(0).toUpperCase() + day.slice(1))}</span>
            <span class="hours-time">${escapeHtml(time)}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Location -->
    <div class="profile-section">
      <h2 class="profile-section-title">Location</h2>
      <div style="background: url('https://picsum.photos/seed/${vendorSeed}-map/600/300') center/cover; border-radius: var(--radius-lg); height: 160px; display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: var(--space-3);">
        <div style="background: white; padding: 4px 12px; border-radius: 100px; font-size: var(--text-sm); font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
          ${icons.location} ${escapeHtml(vendor.address)}
        </div>
      </div>
      <button class="btn btn-secondary btn-full" data-profile-action="directions">
        ${icons.directions} Get Directions
      </button>
    </div>

    <!-- Related Vendors -->
    ${related.length > 0 ? `
      <div class="profile-section" style="border-bottom: none;">
        <h2 class="profile-section-title">Similar Vendors</h2>
        <div class="similar-vendors-scroll">
        ${related.map(v => `
          <div class="similar-vendor-card" data-related-id="${escapeAttr(v.id)}">
            <div class="similar-vendor-cover" style="background: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url('https://picsum.photos/seed/${encodeURIComponent(v.id || 'vendor')}-cover/400/300') center/cover;">
              <div class="similar-vendor-logo" style="background: ${safeCssColor(v.logoGradient)};">${escapeHtml(v.logoInitials)}</div>
            </div>
            <div class="similar-vendor-info">
              <div class="similar-vendor-name">
                ${escapeHtml(v.name)}
                ${v.verified ? `<span class="badge-verified ${escapeAttr(v.verifiedLevel)}" style="transform: scale(0.8);">${icons.verifiedBadge}</span>` : ''}
              </div>
              <div class="similar-vendor-meta">
                <span style="color: var(--gold-500);"><i data-lucide="star"></i> ${escapeHtml(v.rating)}</span>
                <span><i data-lucide="map-pin"></i> ${escapeHtml(v.distance)}km</span>
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
      <button class="fab-btn" data-profile-action="call">
        <i data-lucide="phone"></i> Call
      </button>
      <button class="fab-btn" data-profile-action="whatsapp">
        <i data-lucide="message-circle"></i> Chat
      </button>
      <button class="fab-btn" data-profile-action="route">
        <i data-lucide="navigation"></i> Route
      </button>
      <button class="fab-btn primary" id="profile-quote-btn">
        <i data-lucide="file-text"></i> Request Quote
      </button>
    </div>
  `;

  overlay.classList.remove('hidden');
  overlay.scrollTop = 0;

  refreshIcons();

  // Events
  document.getElementById('profile-back')?.addEventListener('click', closeVendorProfile);

  overlay.querySelectorAll('[data-profile-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.profileAction;
      if (action === 'call') {
        const phone = phoneDigits(vendor.phone);
        if (phone) window.open(`tel:${phone}`);
      }
      if (action === 'whatsapp') {
        const phone = phoneDigits(vendor.whatsapp || vendor.phone);
        if (phone) window.open(`https://wa.me/${phone}`);
      }
      if (action === 'directions' || action === 'route') {
        window.open(`https://maps.google.com/?q=${mapQueryFor(vendor)}`);
      }
    });
  });

  // Quote button
  document.getElementById('profile-quote-btn')?.addEventListener('click', () => {
    openBottomSheet(`
      <div class="quote-header">
        <div class="quote-vendor-logo" style="background: ${vendorLogoGradient};">${escapeHtml(vendor.logoInitials)}</div>
        <div>
          <h3 class="bottom-sheet-title" style="margin-bottom: 2px;">Request a Quote</h3>
          <p class="quote-vendor-name">from ${vendorName}</p>
        </div>
      </div>
      
      <div class="quote-form-premium">
        <div class="form-group">
          <label class="form-label">What do you need?</label>
          <div class="quote-service-chips">
            ${vendor.services.map(s => `
              <label class="quote-chip">
                <input type="radio" name="quote_service" value="${escapeAttr(s.name)}">
                <span>${escapeHtml(s.name)}</span>
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
          <p class="quote-disclaimer"><i data-lucide="shield-check" style="width: 14px; height: 14px; vertical-align: middle;"></i> Secure request.</p>
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

        const isEmail = contact.includes('@');
        const email = isEmail ? contact : null;
        const phone = !isEmail ? contact : null;
        const compiledDetails = `Service: ${service}\nLocation: ${location || 'N/A'}\nBudget: ${budget ? ('N$ ' + budget) : 'N/A'}\nMessage: ${msg || 'None'}`;

        const { error } = await supabase.from('leads').insert({
          vendor_id: vendor.id,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          details: compiledDetails
        });

        if (error) {
          console.error(error);
          showToast('Failed to send request.', 'error');
          btn.textContent = 'Send Quote Request';
          btn.disabled = false;
        } else {
          closeBottomSheet();
          showToast('Your quote request has been sent!', 'success');
          
          // Open Chat Conversation with System Quote Card
          const mockConvData = {
            id: 'conv_new_' + Date.now(),
            vendorId: vendor.id,
            vendorName: vendor.name,
            logoInitials: vendor.logoInitials,
            logoGradient: vendor.logoGradient,
            verified: vendor.verified,
            verifiedLevel: vendor.verifiedLevel,
            lastMessage: 'I am looking for ' + service,
            timestamp: 'Just now',
            unreadCount: 0,
            onlineStatus: 'online',
            responseTime: 'Usually responds within 1 hour',
            type: 'quote',
            quoteDetails: {
              service: service,
              budget: budget ? ('N$' + budget) : 'Not specified',
              date: document.getElementById('quote-date')?.value || 'TBD'
            }
          };
          renderChatConversation(mockConvData);
        }
      });
      
      refreshIcons();
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

function phoneDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function mapQueryFor(vendor) {
  const lat = Number(vendor.lat);
  const lng = Number(vendor.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `${lat},${lng}`;
  }
  return encodeURIComponent(vendor.address || vendor.name || 'Namibia');
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
