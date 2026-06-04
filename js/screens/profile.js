// ============================================
// THE VENDOR — Profile Screen
// ============================================

import { icons, showToast } from '../app.js';
import { enterDashboardMode } from '../dashboard-app.js';

export function renderProfileScreen(container) {
  container.innerHTML = `
    <div class="screen-profile">
      <!-- User Header -->
      <div class="user-profile-header">
        <div class="user-avatar">JD</div>
        <div class="user-name">John Doe</div>
        <div class="user-location">
          ${icons.location}
          Windhoek, Namibia
        </div>
      </div>

      <!-- Menu Sections -->
      <div class="profile-menu">
        <!-- Account -->
        <div class="profile-menu-section">
          <div class="profile-menu-label">Account</div>
          <div class="profile-menu-card">
            <div class="list-item">
              <div class="item-icon" style="background: var(--primary-50); color: var(--primary-500);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div class="item-content">
                <div class="item-title">Edit Profile</div>
                <div class="item-subtitle">Name, photo, location</div>
              </div>
              <span class="item-arrow">${icons.chevronRight}</span>
            </div>
            <div class="list-item">
              <div class="item-icon" style="background: var(--success-50); color: var(--success-500);">
                ${icons.location}
              </div>
              <div class="item-content">
                <div class="item-title">Saved Addresses</div>
                <div class="item-subtitle">Home, Work</div>
              </div>
              <span class="item-arrow">${icons.chevronRight}</span>
            </div>
            <div class="list-item">
              <div class="item-icon" style="background: var(--gold-50); color: var(--gold-600);">
                ${icons.bell}
              </div>
              <div class="item-content">
                <div class="item-title">Notifications</div>
                <div class="item-subtitle">Push, email, SMS</div>
              </div>
              <span class="item-arrow">${icons.chevronRight}</span>
            </div>
          </div>
        </div>

        <!-- Vendor -->
        <div class="profile-menu-section">
          <div class="profile-menu-label">Business</div>
          <div class="profile-menu-card">
            <div class="list-item" id="become-vendor-btn">
              <div class="item-icon" style="background: linear-gradient(135deg, var(--primary-50), var(--gold-50)); color: var(--primary-500);">
                ${icons.briefcase}
              </div>
              <div class="item-content">
                <div class="item-title">Become a Vendor</div>
                <div class="item-subtitle">List your business on The Vendor</div>
              </div>
              <span class="item-arrow">${icons.chevronRight}</span>
            </div>
          </div>
        </div>

        <!-- Support -->
        <div class="profile-menu-section">
          <div class="profile-menu-label">Support</div>
          <div class="profile-menu-card">
            <div class="list-item">
              <div class="item-icon" style="background: var(--gray-50); color: var(--gray-500);">
                ${icons.helpCircle}
              </div>
              <div class="item-content">
                <div class="item-title">Help & Support</div>
                <div class="item-subtitle">FAQ, contact us</div>
              </div>
              <span class="item-arrow">${icons.chevronRight}</span>
            </div>
            <div class="list-item">
              <div class="item-icon" style="background: var(--gray-50); color: var(--gray-500);">
                ${icons.settings}
              </div>
              <div class="item-content">
                <div class="item-title">Settings</div>
                <div class="item-subtitle">Privacy, language, display</div>
              </div>
              <span class="item-arrow">${icons.chevronRight}</span>
            </div>
            <div class="list-item">
              <div class="item-icon" style="background: var(--gray-50); color: var(--gray-500);">
                ${icons.share}
              </div>
              <div class="item-content">
                <div class="item-title">Share The Vendor</div>
                <div class="item-subtitle">Invite friends and businesses</div>
              </div>
              <span class="item-arrow">${icons.chevronRight}</span>
            </div>
          </div>
        </div>

        <!-- Sign Out -->
        <div class="profile-menu-section">
          <div class="profile-menu-card">
            <div class="list-item" id="logout-btn">
              <div class="item-icon" style="background: var(--error-50); color: var(--error-500);">
                ${icons.logOut}
              </div>
              <div class="item-content">
                <div class="item-title" style="color: var(--error-500);">Sign Out</div>
              </div>
            </div>
          </div>
        </div>

        <!-- App Info -->
        <div style="text-align: center; padding: var(--space-6) 0;">
          <div style="font-size: var(--text-sm); color: var(--text-tertiary);">The Vendor v1.0.0</div>
          <div style="font-size: var(--text-xs); color: var(--gray-300); margin-top: 2px;">Made in Namibia 🇳🇦</div>
        </div>
      </div>
    </div>
  `;

  // Become a Vendor -> Enter Dashboard
  document.getElementById('become-vendor-btn')?.addEventListener('click', () => {
    enterDashboardMode();
  });

  // Sign Out
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    showToast('Signed out successfully');
  });
}
