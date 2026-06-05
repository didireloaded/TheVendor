// ============================================
// THE VENDOR — Profile Screen (Premium Dashboard)
// ============================================

import { icons, showToast } from '../app.js';
import { enterDashboardMode } from '../dashboard-app.js';
import { getAllVendorsIncludingSeeded } from '../data.js';

export async function renderProfileScreen(container) {
  const allVendors = await getAllVendorsIncludingSeeded();

  container.innerHTML = `
    <div class="screen-profile">
      ${renderUserHero()}
      
      <div class="profile-dashboard-content">
        ${renderUserStats()}
        ${renderPromoCard()}
        ${renderRecentFavorites(allVendors)}
        ${renderMyRequests()}
        ${renderMyReviews()}
        ${renderActivityTimeline()}
        ${renderAccountSecurity()}
        ${renderSupportSection()}
        ${renderSignOutSection()}
        ${renderAppInfo()}
      </div>
    </div>
  `;

  bindProfileEvents(container);
}

function renderUserHero() {
  return `
    <div class="profile-hero-card">
      <div class="profile-hero-bg"></div>
      <div class="profile-hero-content">
        <div class="profile-hero-top">
          <div class="profile-hero-avatar">
            <img src="https://i.pravatar.cc/150?img=11" alt="John Doe" />
            <div class="profile-hero-verified">${icons.checkCircle}</div>
          </div>
          <button class="btn btn-outline btn-sm profile-edit-btn">Edit Profile</button>
        </div>
        <div class="profile-hero-info">
          <h1 class="profile-hero-name">John Doe</h1>
          <p class="profile-hero-meta">
            <span>${icons.location} Windhoek, Namibia</span>
            <span class="meta-dot">•</span>
            <span>Member Since 2026</span>
          </p>
        </div>
        <div class="profile-completion">
          <div class="completion-header">
            <span>Profile Completion</span>
            <span class="completion-percent">85%</span>
          </div>
          <div class="completion-bar-bg">
            <div class="completion-bar-fill" style="width: 85%;"></div>
          </div>
          <p class="completion-hint">Add your phone number to reach 100%</p>
        </div>
      </div>
    </div>
  `;
}

function renderUserStats() {
  return `
    <div class="profile-stats-grid">
      <div class="profile-stat-card">
        <div class="stat-value">24</div>
        <div class="stat-label">Saved</div>
      </div>
      <div class="profile-stat-card">
        <div class="stat-value">12</div>
        <div class="stat-label">Reviews</div>
      </div>
      <div class="profile-stat-card">
        <div class="stat-value">8</div>
        <div class="stat-label">Requests</div>
      </div>
      <div class="profile-stat-card">
        <div class="stat-value">3</div>
        <div class="stat-label">Bookings</div>
      </div>
    </div>
  `;
}

function renderPromoCard() {
  return `
    <div class="profile-promo-card" id="become-vendor-btn">
      <div class="promo-bg-glow"></div>
      <div class="promo-content">
        <h3>Grow Your Business</h3>
        <p>Reach thousands of customers across Namibia. List your services on The Vendor today.</p>
        <button class="btn btn-primary promo-btn">Become A Vendor</button>
      </div>
      <div class="promo-icon">${icons.briefcase}</div>
    </div>
  `;
}

function renderRecentFavorites(allVendors) {
  // Grab a few mock vendors for the favorites preview
  const favs = allVendors.slice(0, 3);
  
  return `
    <div class="profile-section-block">
      <div class="section-header">
        <h2 class="section-title">Recent Favorites</h2>
        <button class="section-action">See All</button>
      </div>
      <div class="horizontal-scroll favorites-scroll">
        ${favs.map(v => `
          <div class="favorite-mini-card">
            <div class="fav-mini-thumb" style="background: ${v.coverGradient};">
              <div class="fav-mini-heart active">${icons.heart}</div>
            </div>
            <div class="fav-mini-info">
              <h4>${v.name}</h4>
              <p>${v.categoryName}</p>
              <div class="fav-mini-rating">
                ${icons.star} <span>${v.rating}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderMyRequests() {
  return `
    <div class="profile-section-block">
      <div class="section-header">
        <h2 class="section-title">My Quote Requests</h2>
        <button class="section-action">View All</button>
      </div>
      <div class="requests-list">
        <div class="request-item">
          <div class="req-icon req-pending">${icons.clock}</div>
          <div class="req-content">
            <div class="req-title">Wedding Photography Package</div>
            <div class="req-vendor">CAPTIVV Studios • 2 days ago</div>
          </div>
          <div class="req-status status-pending">Pending</div>
        </div>
        <div class="request-item">
          <div class="req-icon req-responded">${icons.checkCircle}</div>
          <div class="req-content">
            <div class="req-title">Birthday Cake (2 Tier)</div>
            <div class="req-vendor">Grey's Cakes • 5 days ago</div>
          </div>
          <div class="req-status status-responded">Responded</div>
        </div>
      </div>
    </div>
  `;
}

function renderMyReviews() {
  return `
    <div class="profile-section-block">
      <div class="section-header">
        <h2 class="section-title">My Reviews</h2>
        <button class="section-action">View All</button>
      </div>
      <div class="reviews-list">
        <div class="review-manage-item">
          <div class="rev-manage-header">
            <div class="rev-manage-vendor">VisionHaus Media</div>
            <div class="rev-manage-rating">
              ${icons.star}${icons.star}${icons.star}${icons.star}${icons.star}
            </div>
          </div>
          <p class="rev-manage-text">"Absolutely amazing video production. Highly recommended!"</p>
          <div class="rev-manage-actions">
            <button class="btn-text">Edit</button>
            <button class="btn-text text-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderActivityTimeline() {
  return `
    <div class="profile-section-block">
      <h2 class="section-title">Recent Activity</h2>
      <div class="activity-timeline">
        <div class="activity-item">
          <div class="activity-dot bg-primary"></div>
          <div class="activity-content">
            <p>Saved <strong>CAPTIVV Studios</strong> to favorites</p>
            <span class="activity-time">2 hours ago</span>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-dot bg-gold"></div>
          <div class="activity-content">
            <p>Requested a quote from <strong>Grey's Cakes</strong></p>
            <span class="activity-time">Yesterday</span>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-dot bg-gray"></div>
          <div class="activity-content">
            <p>Viewed <strong>VisionHaus Media</strong></p>
            <span class="activity-time">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAccountSecurity() {
  return `
    <div class="profile-section-block">
      <h2 class="section-title">Account & Security</h2>
      <div class="settings-list">
        <div class="settings-item">
          <div class="settings-icon bg-success-light text-success">${icons.phone}</div>
          <div class="settings-info">
            <h4>Phone Verification</h4>
            <p>Add your number</p>
          </div>
          <div class="settings-action">${icons.chevronRight}</div>
        </div>
        <div class="settings-item">
          <div class="settings-icon bg-primary-light text-primary">${icons.email}</div>
          <div class="settings-info">
            <h4>Email Verification</h4>
            <p>john@example.com <span class="verified-text">Verified</span></p>
          </div>
          <div class="settings-action">${icons.chevronRight}</div>
        </div>
        <div class="settings-item">
          <div class="settings-icon bg-gray-light text-gray">${icons.lock}</div>
          <div class="settings-info">
            <h4>Change Password</h4>
            <p>Update your security</p>
          </div>
          <div class="settings-action">${icons.chevronRight}</div>
        </div>
      </div>
    </div>
  `;
}

function renderSupportSection() {
  return `
    <div class="profile-section-block">
      <h2 class="section-title">Support & Settings</h2>
      <div class="settings-list">
        <div class="settings-item">
          <div class="settings-icon bg-gray-light text-gray">${icons.helpCircle}</div>
          <div class="settings-info">
            <h4>Help & Support</h4>
            <p>FAQ, Contact Us</p>
          </div>
          <div class="settings-action">${icons.chevronRight}</div>
        </div>
        <div class="settings-item">
          <div class="settings-icon bg-gray-light text-gray">${icons.settings}</div>
          <div class="settings-info">
            <h4>App Settings</h4>
            <p>Privacy, Language</p>
          </div>
          <div class="settings-action">${icons.chevronRight}</div>
        </div>
      </div>
    </div>
  `;
}

function renderSignOutSection() {
  return `
    <div class="profile-signout-container">
      <button class="btn btn-outline btn-full text-danger border-danger" id="logout-btn">
        ${icons.logOut} Sign Out
      </button>
    </div>
  `;
}

function renderAppInfo() {
  return `
    <div class="profile-app-info">
      <div>The Vendor v2.0.0</div>
      <div class="made-in">Made in Namibia</div>
    </div>
  `;
}

function bindProfileEvents(container) {
  document.getElementById('become-vendor-btn')?.addEventListener('click', () => {
    enterDashboardMode();
  });

  // Sign Out
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    showToast('Signed out successfully');
  });
}
