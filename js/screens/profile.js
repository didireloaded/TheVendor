// ============================================
// THE VENDOR — Profile Screen Dashboard
// ============================================

import { getState, icons, showToast } from '../app.js';
import { supabase } from '../lib/supabase.js';
import { escapeHtml, escapeAttr } from '../lib/sanitize.js';

export async function renderProfileScreen(container) {
  container.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-tertiary);">Loading profile...</div>`;

  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    document.getElementById('app').dispatchEvent(new CustomEvent('navigate', { detail: 'auth' }));
    return;
  }

  const user = session.user;
  const name = user.user_metadata?.full_name || user.email.split('@')[0];
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1A6FEF&color=fff&size=80&bold=true`;
  const isVendor = user.user_metadata?.account_type === 'vendor';
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(user.email);

  container.innerHTML = `
    <div class="screen-profile dashboard-profile" style="padding-bottom: 80px;">
      
      <!-- Hero Profile Header -->
      <div class="profile-hero-card">
        <div class="profile-hero-top" style="margin-bottom: var(--space-4);">
          <div class="profile-hero-avatar">
            <img src="${escapeAttr(avatarUrl)}" alt="${escapeAttr(name)}" />
          </div>
          <div class="profile-hero-info">
            <h2 class="profile-name">${safeName} <i data-lucide="badge-check" style="color: var(--primary-500); width: 18px; height: 18px; fill: var(--primary-50);"></i></h2>
            <div class="profile-location" style="margin-bottom: 4px;">${icons.mapPin} Windhoek, Namibia</div>
            <div class="profile-member-since">Member Since ${new Date(user.created_at).getFullYear()}</div>
          </div>
        </div>

        <div class="profile-completion" style="margin-bottom: var(--space-4);">
          <div class="completion-header">
            <span class="completion-title">Profile 85% Complete</span>
            <span class="completion-action">Complete Profile</span>
          </div>
          <div class="completion-bar-bg">
            <div class="completion-bar-fill" style="width: 85%;"></div>
          </div>
        </div>

        <!-- Quick Profile Actions -->
        <div class="profile-actions-row">
          <button class="action-btn">
            ${icons.edit2}
            <span>Edit Profile</span>
          </button>
          <button class="action-btn">
            ${icons.share2}
            <span>Share</span>
          </button>
          <button class="action-btn">
            ${icons.qrCode}
            <span>QR Code</span>
          </button>
          <button class="action-btn" id="nav-notifications-btn">
            ${icons.bell}
            <span>Alerts</span>
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="profile-stats-grid">
        <div class="stat-card">
          <div class="stat-value" id="stat-saved">24</div>
          <div class="stat-label">Saved</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">8</div>
          <div class="stat-label">Requests</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">12</div>
          <div class="stat-label">Reviews</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">3</div>
          <div class="stat-label">Bookings</div>
        </div>
      </div>

      <!-- My Activity -->
      <div class="profile-section">
        <div class="section-header">
          <h3 class="section-title">My Activity</h3>
          <button class="section-action">View All</button>
        </div>
        <div class="activity-timeline">
          <div class="timeline-item">
            <div class="timeline-icon" style="color: var(--primary-500); border-color: var(--primary-100); background: var(--primary-50);">
              ${icons.calendarCheck}
            </div>
            <div class="timeline-content">
              <div class="timeline-title">Booked <strong>Savage Eats Catering</strong></div>
              <div class="timeline-date">2 hours ago</div>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-icon" style="color: var(--gold-500); border-color: var(--gold-100); background: var(--gold-50);">
              ${icons.star}
            </div>
            <div class="timeline-content">
              <div class="timeline-title">Reviewed <strong>Auto Doctors</strong></div>
              <div class="timeline-date">Yesterday</div>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-icon" style="color: var(--blue-500); border-color: var(--blue-100); background: var(--blue-50);">
              ${icons.fileText}
            </div>
            <div class="timeline-content">
              <div class="timeline-title">Requested Quote from <strong>Grey's Cakes</strong></div>
              <div class="timeline-date">Oct 12, 2026</div>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-icon" style="color: var(--error-500); border-color: var(--error-100); background: var(--error-50);">
              ${icons.heart}
            </div>
            <div class="timeline-content">
              <div class="timeline-title">Saved <strong>VisionHaus Media</strong></div>
              <div class="timeline-date">Oct 10, 2026</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Saved Vendors -->
      <div class="profile-section">
        <div class="section-header">
          <h3 class="section-title">Saved Vendors</h3>
          <button class="section-action" id="menu-saved-vendors-btn">See All</button>
        </div>
        <div class="saved-vendor-list">
          <div class="saved-vendor-item">
            <div class="saved-vendor-logo" style="background-image: url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200');"></div>
            <div class="saved-vendor-info">
              <div class="saved-vendor-name">VisionHaus Media</div>
              <div class="saved-vendor-cat">Photography & Videography</div>
              <div class="saved-vendor-meta">
                ${icons.star} 4.9 (124) • 2.4 km • Saved Oct 10
              </div>
            </div>
          </div>
          <div class="saved-vendor-item">
            <div class="saved-vendor-logo" style="background-image: url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=200');"></div>
            <div class="saved-vendor-info">
              <div class="saved-vendor-name">Savage Eats Catering</div>
              <div class="saved-vendor-cat">Food & Catering</div>
              <div class="saved-vendor-meta">
                ${icons.star} 4.8 (89) • 5.1 km • Saved Oct 05
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Collections -->
      <div class="profile-section">
        <div class="section-header">
          <h3 class="section-title">Collections</h3>
          <button class="section-action">Manage</button>
        </div>
        <div class="collection-grid">
          <div class="collection-grid-card">
            <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=400" alt="Wedding">
            <div class="collection-grid-info">
              <div class="collection-grid-title">Wedding Vendors</div>
              <div class="collection-grid-count">12 Saved</div>
            </div>
          </div>
          <div class="collection-grid-card">
            <img src="https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&q=80&w=400" alt="Auto">
            <div class="collection-grid-info">
              <div class="collection-grid-title">Automotive</div>
              <div class="collection-grid-count">4 Saved</div>
            </div>
          </div>
          <div class="collection-grid-card">
            <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400" alt="Home">
            <div class="collection-grid-info">
              <div class="collection-grid-title">Home Services</div>
              <div class="collection-grid-count">8 Saved</div>
            </div>
          </div>
          <div class="collection-grid-card">
            <img src="https://images.unsplash.com/photo-1516975080661-46b083dc87ae?auto=format&fit=crop&q=80&w=400" alt="Creative">
            <div class="collection-grid-info">
              <div class="collection-grid-title">Creative Services</div>
              <div class="collection-grid-count">6 Saved</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recently Viewed -->
      <div class="profile-section">
        <div class="section-header">
          <h3 class="section-title">Recently Viewed</h3>
        </div>
        <div class="recently-viewed-scroll">
          <div class="recently-viewed-card">
            <div class="recently-viewed-logo" style="background-image: url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200');"></div>
            <div class="recently-viewed-name">CAPTIVV Studios</div>
            <div class="recently-viewed-date">Today</div>
          </div>
          <div class="recently-viewed-card">
            <div class="recently-viewed-logo" style="background-image: url('https://images.unsplash.com/photo-1507133750070-4289a2631584?auto=format&fit=crop&q=80&w=200');"></div>
            <div class="recently-viewed-name">Grey's Cakes</div>
            <div class="recently-viewed-date">Yesterday</div>
          </div>
          <div class="recently-viewed-card">
            <div class="recently-viewed-logo" style="background-image: url('https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&q=80&w=200');"></div>
            <div class="recently-viewed-name">FixIt Mechanics</div>
            <div class="recently-viewed-date">Oct 12</div>
          </div>
        </div>
      </div>

      <!-- Quote Requests -->
      <div class="profile-section">
        <div class="section-header">
          <h3 class="section-title">Quote Requests</h3>
          <button class="section-action">All Quotes</button>
        </div>
        <div class="requests-list">
          <div class="request-card">
            <div class="request-header">
              <div class="request-vendor">Grey's Cakes</div>
              <div class="request-status status-responded">Responded</div>
            </div>
            <div class="request-service">Custom Wedding Cake</div>
            <div class="request-date">Requested Oct 12, 2026</div>
          </div>
          <div class="request-card">
            <div class="request-header">
              <div class="request-vendor">Windhoek Plumbers</div>
              <div class="request-status status-pending">Pending</div>
            </div>
            <div class="request-service">Emergency Leak Repair</div>
            <div class="request-date">Requested Today</div>
          </div>
        </div>
      </div>

      <!-- My Reviews -->
      <div class="profile-section">
        <div class="section-header">
          <h3 class="section-title">My Reviews</h3>
          <button class="section-action">View All</button>
        </div>
        <div class="reviews-list">
          <div class="review-card-mini">
            <div class="review-header" style="margin-bottom: 8px;">
              <div class="review-vendor">Auto Doctors</div>
              <div class="review-date">Yesterday</div>
            </div>
            <div class="rating" style="display: flex; gap: 2px; margin-bottom: 8px;">
              ${icons.star} ${icons.star} ${icons.star} ${icons.star} ${icons.star}
            </div>
            <div class="review-text">"Excellent service! They fixed my brakes in under 2 hours and the price was very fair. Highly recommend."</div>
            <div class="review-actions">
              <button class="btn-text-sm">${icons.edit2} Edit</button>
              <button class="btn-text-sm text-danger">${icons.trash2} Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Business Section -->
      ${isVendor ? `
        <div class="profile-section">
          <div class="section-header">
            <h3 class="section-title">My Business</h3>
          </div>
          <div class="profile-menu-card">
            <div class="list-item" id="vendor-dashboard-menu-btn">
              <div class="item-icon" style="background: var(--primary-50); color: var(--primary-600);">${icons.layoutDashboard}</div>
              <div class="item-content"><div class="item-title">Vendor Dashboard</div></div>
              <span class="item-arrow">${icons.chevronRight}</span>
            </div>
            <div class="list-item">
              <div class="item-icon" style="background: var(--success-50); color: var(--success-600);">${icons.chartColumn}</div>
              <div class="item-content"><div class="item-title">Analytics & Insights</div></div>
              <span class="item-arrow">${icons.chevronRight}</span>
            </div>
            <div class="list-item">
              <div class="item-icon" style="background: var(--gold-50); color: var(--gold-600);">${icons.users}</div>
              <div class="item-content"><div class="item-title">Leads & Messages</div></div>
              <span class="item-arrow">${icons.chevronRight}</span>
            </div>
          </div>
        </div>
      ` : `
        <div class="promo-card vendor-promo" id="become-vendor-btn" style="margin-top: var(--space-4);">
          <div class="promo-content">
            <h3 class="promo-title">Grow Your Business</h3>
            <p class="promo-desc">List your business on The Vendor and reach thousands of customers.</p>
            <button class="btn btn-primary btn-sm mt-2" style="background: white; color: var(--primary-600); border: none;">Become A Vendor</button>
          </div>
          <div class="promo-icon">
            ${icons.briefcase}
          </div>
        </div>
      `}

      <!-- Account Hub -->
      <div class="profile-section">
        <div class="section-header">
          <h3 class="section-title">Account</h3>
        </div>
        <div class="profile-menu-card">
          <div class="list-item">
            <div class="item-icon" style="background: var(--gray-100); color: var(--gray-600);">${icons.userRound}</div>
            <div class="item-content"><div class="item-title">Profile Information</div></div>
            <span class="item-arrow">${icons.chevronRight}</span>
          </div>
          <div class="list-item">
            <div class="item-icon" style="background: var(--gray-100); color: var(--gray-600);">${icons.phone}</div>
            <div class="item-content">
              <div class="item-title">Phone Number</div>
              <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 2px;">+264 81 234 5678</div>
            </div>
            <span class="item-arrow">${icons.chevronRight}</span>
          </div>
          <div class="list-item">
            <div class="item-icon" style="background: var(--gray-100); color: var(--gray-600);">${icons.mail}</div>
            <div class="item-content">
              <div class="item-title">Email Address</div>
              <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 2px;">${safeEmail}</div>
            </div>
            <span class="item-arrow">${icons.chevronRight}</span>
          </div>
        </div>
      </div>

      <!-- Security Section -->
      <div class="profile-section">
        <div class="section-header">
          <h3 class="section-title">Security</h3>
        </div>
        <div class="profile-menu-card">
          <div class="list-item">
            <div class="item-icon" style="background: var(--gray-100); color: var(--gray-600);">${icons.shieldCheck}</div>
            <div class="item-content"><div class="item-title">Security Settings</div></div>
            <span class="item-arrow">${icons.chevronRight}</span>
          </div>
          <div class="list-item">
            <div class="item-icon" style="background: var(--gray-100); color: var(--gray-600);">${icons.lock}</div>
            <div class="item-content"><div class="item-title">Change Password</div></div>
            <span class="item-arrow">${icons.chevronRight}</span>
          </div>
          <div class="list-item">
            <div class="item-icon" style="background: var(--gray-100); color: var(--gray-600);">${icons.smartphone}</div>
            <div class="item-content"><div class="item-title">Two-Factor Authentication</div></div>
            <span class="item-arrow">${icons.chevronRight}</span>
          </div>
        </div>
      </div>

      <!-- Payments Section -->
      <div class="profile-section">
        <div class="section-header">
          <h3 class="section-title">Payments</h3>
        </div>
        <div class="profile-menu-card">
          <div class="list-item">
            <div class="item-icon" style="background: var(--gray-100); color: var(--gray-600);">${icons.creditCard}</div>
            <div class="item-content"><div class="item-title">Saved Payment Methods</div></div>
            <span class="item-arrow">${icons.chevronRight}</span>
          </div>
          <div class="list-item">
            <div class="item-icon" style="background: var(--gray-100); color: var(--gray-600);">${icons.receipt}</div>
            <div class="item-content"><div class="item-title">Transaction History</div></div>
            <span class="item-arrow">${icons.chevronRight}</span>
          </div>
        </div>
      </div>

      <!-- Support Section -->
      <div class="profile-section">
        <div class="section-header">
          <h3 class="section-title">Support</h3>
        </div>
        <div class="profile-menu-card">
          <div class="list-item">
            <div class="item-icon" style="background: var(--gray-100); color: var(--gray-600);">${icons.helpCircle}</div>
            <div class="item-content"><div class="item-title">Help Center</div></div>
            <span class="item-arrow">${icons.chevronRight}</span>
          </div>
          <div class="list-item">
            <div class="item-icon" style="background: var(--gray-100); color: var(--gray-600);">${icons.messageSquare}</div>
            <div class="item-content"><div class="item-title">Contact Support</div></div>
            <span class="item-arrow">${icons.chevronRight}</span>
          </div>
          <div class="list-item">
            <div class="item-icon" style="background: var(--gray-100); color: var(--gray-600);">${icons.shieldAlert}</div>
            <div class="item-content"><div class="item-title">Privacy & Terms</div></div>
            <span class="item-arrow">${icons.chevronRight}</span>
          </div>
        </div>
      </div>

      <!-- Settings Section -->
      <div class="profile-section">
        <div class="section-header">
          <h3 class="section-title">Preferences</h3>
        </div>
        <div class="profile-menu-card">
          <div class="list-item">
            <div class="item-icon" style="background: var(--gray-100); color: var(--gray-600);">${icons.moon}</div>
            <div class="item-content"><div class="item-title">Appearance</div></div>
            <span class="item-arrow">${icons.chevronRight}</span>
          </div>
          <div class="list-item">
            <div class="item-icon" style="background: var(--gray-100); color: var(--gray-600);">${icons.globe}</div>
            <div class="item-content"><div class="item-title">Language</div></div>
            <span class="item-arrow">${icons.chevronRight}</span>
          </div>
        </div>
      </div>

      <!-- Distinct Logout Section -->
      <div class="profile-section" style="border-bottom: none; padding-bottom: var(--space-8);">
        <div class="profile-menu-card logout-section">
          <div class="list-item" id="logout-btn" style="cursor: pointer;">
            <div class="item-icon">${icons.logOut}</div>
            <div class="item-content"><div class="item-title">Sign Out</div></div>
          </div>
        </div>
        
        <div style="text-align: center; padding: var(--space-6) 0;">
          <div style="font-size: var(--text-sm); color: var(--text-tertiary); font-weight: var(--font-medium);">The Vendor v2.0.0</div>
          <div style="font-size: 11px; color: var(--gray-400); margin-top: 4px;">Made in Namibia</div>
        </div>
      </div>

    </div>
  `;

  // Update real saved vendors count if available
  const state = getState();
  if (state && state.favorites) {
    const savedEl = document.getElementById('stat-saved');
    // Mix real count with mock to show UI is alive, or just use state.favorites.size
    if (savedEl) savedEl.textContent = state.favorites.size > 0 ? state.favorites.size : 24;
  }

  // Event Listeners
  document.getElementById('become-vendor-btn')?.addEventListener('click', () => {
    document.getElementById('app').dispatchEvent(new CustomEvent('navigate', { detail: 'vendor-registration' }));
  });

  document.getElementById('menu-saved-vendors-btn')?.addEventListener('click', () => {
    document.getElementById('app').dispatchEvent(new CustomEvent('navigate', { detail: 'saved-vendors' }));
  });

  document.getElementById('vendor-dashboard-menu-btn')?.addEventListener('click', () => {
    document.getElementById('dash-notif-btn')?.click();
  });

  // Make the bell icon navigate to notifications
  document.getElementById('nav-notifications-btn')?.addEventListener('click', () => {
    showToast('Notifications Center opening soon...');
  });

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('tv_authenticated');
    window.location.reload();
  });
  
  // Initialize Lucide icons for any freshly injected icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
