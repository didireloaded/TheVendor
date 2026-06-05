// ============================================
// THE VENDOR — Profile Screen Dashboard
// ============================================

import { icons, showToast } from '../app.js';
import { enterDashboardMode } from '../dashboard-app.js';

export function renderProfileScreen(container) {
  container.innerHTML = `
    <div class="screen-profile dashboard-profile">
      
      <!-- Hero Profile Header -->
      <div class="profile-hero-card">
        <div class="profile-hero-top">
          <div class="profile-hero-avatar">
            <img src="https://ui-avatars.com/api/?name=John+Doe&background=1A6FEF&color=fff&size=80&bold=true" alt="John Doe" />
          </div>
          <div class="profile-hero-info">
            <h2 class="profile-name">John Doe <span class="badge-verified blue" title="Verified Account">${icons.checkCircle}</span></h2>
            <div class="profile-location">${icons.mapPin} Windhoek, Namibia</div>
            <div class="profile-member-since">Member since 2026</div>
          </div>
        </div>
        <div class="profile-completion">
          <div class="completion-header">
            <span class="completion-title">Profile 85% Complete</span>
            <span class="completion-action">Complete</span>
          </div>
          <div class="completion-bar-bg">
            <div class="completion-bar-fill" style="width: 85%;"></div>
          </div>
        </div>
      </div>

      <!-- Admin Tools -->
      <div class="profile-section-label" style="font-size: var(--text-xs); font-weight: var(--font-bold); color: var(--text-tertiary); text-transform: uppercase; margin: var(--space-4) 0 var(--space-2) var(--space-2); letter-spacing: 0.5px;">Admin</div>
      <div class="profile-menu-card">
        <button class="profile-menu-item" onclick="document.getElementById('app').dispatchEvent(new CustomEvent('navigate', { detail: 'admin' }))">
          <div class="menu-item-icon" style="background: var(--error-50); color: var(--error-600);"><i data-lucide="shield-alert"></i></div>
          <div class="menu-item-text">Moderation Queue</div>
          <div class="menu-item-arrow"><i data-lucide="chevron-right"></i></div>
        </button>
      </div>

      <!-- Quick Stats -->
      <div class="profile-stats-grid">
        <div class="stat-card">
          <div class="stat-value">24</div>
          <div class="stat-label">Saved</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">12</div>
          <div class="stat-label">Reviews</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">7</div>
          <div class="stat-label">Requests</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">3</div>
          <div class="stat-label">Bookings</div>
        </div>
      </div>

      <!-- Become A Vendor Promo Card -->
      <div class="promo-card vendor-promo" id="become-vendor-btn">
        <div class="promo-content">
          <h3 class="promo-title">Grow Your Business</h3>
          <p class="promo-desc">List your services on The Vendor and reach thousands of customers across Namibia.</p>
          <button class="btn btn-primary btn-sm mt-2" style="background: white; color: var(--primary-600); border: none;">Business Dashboard &rarr;</button>
        </div>
        <div class="promo-icon">
          ${icons.briefcase}
        </div>
      </div>

      <!-- My Activity -->
      <div class="profile-section">
        <div class="section-header">
          <h3 class="section-title">Recent Activity</h3>
          <button class="btn-text">View All</button>
        </div>
        <div class="activity-feed">
          <div class="activity-item">
            <div class="activity-icon bg-blue">${icons.bookmark}</div>
            <div class="activity-content">
              <div class="activity-text">Saved <strong>VisionHaus Media</strong> to favorites.</div>
              <div class="activity-time">2 hours ago</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon bg-amber">${icons.messageSquare}</div>
            <div class="activity-content">
              <div class="activity-text">Requested Quote from <strong>CAPTIVV Studios</strong>.</div>
              <div class="activity-time">Yesterday</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon bg-green">${icons.star}</div>
            <div class="activity-content">
              <div class="activity-text">Reviewed <strong>Grey's Cakes</strong>.</div>
              <div class="activity-time">3 days ago</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon bg-purple">${icons.eye}</div>
            <div class="activity-content">
              <div class="activity-text">Viewed <strong>Auto Doctors</strong>.</div>
              <div class="activity-time">1 week ago</div>
            </div>
          </div>
        </div>
      </div>

      <!-- My Collections -->
      <div class="profile-section">
        <div class="section-header">
          <h3 class="section-title">My Collections</h3>
          <button class="btn-text">See All</button>
        </div>
        <div class="collections-scroll h-scroll">
          <div class="collection-card" style="background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&q=80') center/cover;">
            <div class="collection-info">
              <h4 class="collection-title">Wedding Vendors</h4>
              <p class="collection-count">12 Saved</p>
            </div>
          </div>
          <div class="collection-card" style="background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1542044896530-05d3c0541235?w=500&q=80') center/cover;">
            <div class="collection-info">
              <h4 class="collection-title">Creative Services</h4>
              <p class="collection-count">5 Saved</p>
            </div>
          </div>
          <div class="collection-card" style="background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&q=80') center/cover;">
            <div class="collection-info">
              <h4 class="collection-title">Automotive</h4>
              <p class="collection-count">3 Saved</p>
            </div>
          </div>
        </div>
      </div>

      <!-- My Requests -->
      <div class="profile-section">
        <div class="section-header">
          <h3 class="section-title">My Requests</h3>
          <button class="btn-text">See All</button>
        </div>
        <div class="requests-list">
          <div class="request-card">
            <div class="request-header">
              <span class="request-vendor">CAPTIVV Studios</span>
              <span class="request-status status-pending">Pending</span>
            </div>
            <div class="request-service">Wedding Videography</div>
            <div class="request-date">Requested on Oct 12, 2026</div>
          </div>
          <div class="request-card">
            <div class="request-header">
              <span class="request-vendor">Twapa Events</span>
              <span class="request-status status-responded">Responded</span>
            </div>
            <div class="request-service">Event Planning</div>
            <div class="request-date">Requested on Oct 5, 2026</div>
          </div>
        </div>
      </div>

      <!-- My Reviews -->
      <div class="profile-section">
        <div class="section-header">
          <h3 class="section-title">My Reviews</h3>
          <button class="btn-text">See All</button>
        </div>
        <div class="reviews-list">
          <div class="review-card-mini">
            <div class="review-vendor">Grey's Cakes</div>
            <div class="rating">
              <span class="star">${icons.star}</span><span class="star">${icons.star}</span><span class="star">${icons.star}</span><span class="star">${icons.star}</span><span class="star">${icons.star}</span>
              <span class="review-date">Oct 1, 2026</span>
            </div>
            <p class="review-text">Absolutely amazing service! The cake was delicious and beautiful.</p>
            <div class="review-actions">
              <button class="btn-text-sm">Edit</button>
              <button class="btn-text-sm text-danger">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Settings -->
      <div class="profile-menu">
        <div class="profile-menu-section">
          <div class="profile-menu-label">Account</div>
          <div class="profile-menu-card">
            <div class="list-item">
              <div class="item-icon" style="background: var(--primary-50); color: var(--primary-500);">${icons.user}</div>
              <div class="item-content"><div class="item-title">Edit Profile</div></div>
              <span class="item-arrow">${icons.chevronRight}</span>
            </div>
            <div class="list-item">
              <div class="item-icon" style="background: var(--success-50); color: var(--success-500);">${icons.location}</div>
              <div class="item-content"><div class="item-title">Saved Addresses</div></div>
              <span class="item-arrow">${icons.chevronRight}</span>
            </div>
            <div class="list-item">
              <div class="item-icon" style="background: var(--gold-50); color: var(--gold-600);">${icons.bell}</div>
              <div class="item-content"><div class="item-title">Notifications</div></div>
              <span class="item-arrow">${icons.chevronRight}</span>
            </div>
            <div class="list-item">
              <div class="item-icon" style="background: var(--error-50); color: var(--error-500);">${icons.shield}</div>
              <div class="item-content"><div class="item-title">Security & Privacy</div></div>
              <span class="item-arrow">${icons.chevronRight}</span>
            </div>
          </div>
        </div>

        <div class="profile-menu-section">
          <div class="profile-menu-label">Support</div>
          <div class="profile-menu-card">
            <div class="list-item">
              <div class="item-icon" style="background: var(--gray-50); color: var(--gray-500);">${icons.helpCircle}</div>
              <div class="item-content"><div class="item-title">Help Centre</div></div>
              <span class="item-arrow">${icons.chevronRight}</span>
            </div>
            <div class="list-item">
              <div class="item-icon" style="background: var(--gray-50); color: var(--gray-500);">${icons.fileText}</div>
              <div class="item-content"><div class="item-title">Terms & Policies</div></div>
              <span class="item-arrow">${icons.chevronRight}</span>
            </div>
          </div>
        </div>

        <div class="profile-menu-section">
          <div class="profile-menu-card">
            <div class="list-item" id="logout-btn">
              <div class="item-icon" style="background: var(--error-50); color: var(--error-500);">${icons.logOut}</div>
              <div class="item-content"><div class="item-title" style="color: var(--error-500);">Sign Out</div></div>
            </div>
          </div>
        </div>

        <div style="text-align: center; padding: var(--space-6) 0;">
          <div style="font-size: var(--text-sm); color: var(--text-tertiary);">The Vendor v1.0.0</div>
          <div style="font-size: var(--text-xs); color: var(--gray-300); margin-top: 2px;">Made in Namibia</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('become-vendor-btn')?.addEventListener('click', () => {
    document.getElementById('app').dispatchEvent(new CustomEvent('navigate', { detail: 'vendor-registration' }));
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('tv_authenticated');
    localStorage.removeItem('tv_user');
    window.location.reload();
  });
}

