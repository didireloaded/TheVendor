// ============================================
// THE VENDOR — Dashboard Management Screen
// ============================================

import { closeBottomSheet, openBottomSheet, showToast } from '../../app.js';
import { escapeAttr } from '../../lib/sanitize.js';

export function renderDashboardManage(container) {
  container.innerHTML = `
    <div class="dash-card-header" style="margin-bottom: var(--space-3);">
      <h2 class="dash-card-title" style="font-size: 20px;">Manage Business</h2>
    </div>

    <div style="display: flex; flex-direction: column; gap: var(--space-3);">
      
      <!-- Profile Management -->
      <div class="dash-card" style="padding: var(--space-4); margin-bottom: 0; cursor: pointer;" id="manage-profile-btn">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <div style="width: 40px; height: 40px; border-radius: var(--radius-full); background: var(--blue-50); color: var(--blue-600); display: flex; align-items: center; justify-content: center;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <div style="font-weight: bold; font-size: var(--text-sm);">Profile & Branding</div>
              <div style="font-size: 11px; color: var(--text-tertiary);">Edit name, logo, bio, location</div>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; color: var(--text-tertiary);"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>

      <!-- Services & Products Grid -->
      <div class="dash-card-header" style="margin-top: var(--space-4); margin-bottom: var(--space-2);">
        <h3 class="dash-card-title">Services & Products</h3>
      </div>
      
      <div class="manage-grid" id="manage-services-grid">
        <div style="font-size: 13px; color: var(--text-tertiary); text-align: center; padding: 20px 0; grid-column: 1 / -1;">No offerings added yet. Click 'Add New Offering' to get started.</div>
      </div>
      <button id="manage-add-offering" style="width: 100%; padding: 12px; border-radius: var(--radius-lg); background: white; border: 1px dashed var(--primary-500); color: var(--primary-600); font-weight: bold; font-size: var(--text-sm); display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: var(--space-5); cursor: pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add New Offering
      </button>

      <!-- Opportunities -->
      <div class="dash-card-header" style="margin-bottom: var(--space-2);">
        <h3 class="dash-card-title">Market Opportunities</h3>
        <div class="dash-card-subtitle">Grow your business</div>
      </div>
      
      <div style="font-size: 13px; color: var(--text-tertiary); text-align: center; padding: 20px 0;">No new opportunities at this time.</div>

      <!-- Settings -->
      <div class="dash-card" style="padding: var(--space-4); margin-bottom: 0; cursor: pointer;" id="manage-settings-btn">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <div style="width: 40px; height: 40px; border-radius: var(--radius-full); background: var(--gray-100); color: var(--text-secondary); display: flex; align-items: center; justify-content: center;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <div>
              <div style="font-weight: bold; font-size: var(--text-sm);">Settings</div>
              <div style="font-size: 11px; color: var(--text-tertiary);">Notifications, account, billing</div>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; color: var(--text-tertiary);"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
      
    </div>
  `;

  // Hide service
  container.querySelectorAll('.hide-svc-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.manage-item-card');
      card.style.opacity = '0.5';
      e.target.textContent = 'Unhide';
      showToast('Service hidden from public profile');
    });
  });

  // Edit service
  container.querySelectorAll('.edit-svc-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = e.target.dataset.name;
      const price = e.target.dataset.price;
      openServiceForm(name, price);
    });
  });

  // Add service
  document.getElementById('manage-add-offering')?.addEventListener('click', () => {
    openServiceForm();
  });

  // Edit Profile
  document.getElementById('manage-profile-btn')?.addEventListener('click', () => {
    openProfileForm();
  });

  // Settings
  document.getElementById('manage-settings-btn')?.addEventListener('click', () => {
    openSettingsForm();
  });
}

function openServiceForm(initialName = '', initialPrice = '') {
  const html = `
    <div style="padding: var(--space-4);">
      <h3 style="font-size: 18px; font-weight: bold; margin-bottom: var(--space-4);">${initialName ? 'Edit' : 'Add'} Offering</h3>
      <div class="form-group">
        <label class="form-label">Service Name</label>
        <input type="text" class="form-input" id="bs-svc-name" value="${escapeAttr(initialName)}" placeholder="e.g. Graphic Design" />
      </div>
      <div class="form-group">
        <label class="form-label">Price</label>
        <input type="text" class="form-input" id="bs-svc-price" value="${escapeAttr(initialPrice)}" placeholder="e.g. N$ 500" />
      </div>
      <button class="btn btn-primary btn-full" id="bs-svc-save" style="margin-top: var(--space-4);">Save</button>
    </div>
  `;
  openBottomSheet(html);

  setTimeout(() => {
    document.getElementById('bs-svc-save')?.addEventListener('click', () => {
      closeBottomSheet();
      showToast('Offering saved successfully', 'success');
    });
  }, 100);
}

function openProfileForm() {
  const html = `
    <div style="padding: var(--space-4);">
      <h3 style="font-size: 18px; font-weight: bold; margin-bottom: var(--space-4);">Profile & Branding</h3>
      <div class="form-group">
        <label class="form-label">Business Name</label>
        <input type="text" class="form-input" id="bs-prof-name" placeholder="Your Business Name" />
      </div>
      <div class="form-group">
        <label class="form-label">Bio</label>
        <textarea class="form-input" rows="3">Premium visual content creation.</textarea>
      </div>
      <button class="btn btn-primary btn-full" id="bs-prof-save" style="margin-top: var(--space-4);">Save Profile</button>
    </div>
  `;
  openBottomSheet(html);

  setTimeout(() => {
    document.getElementById('bs-prof-save')?.addEventListener('click', () => {
      closeBottomSheet();
      showToast('Profile updated successfully', 'success');
    });
  }, 100);
}

function openSettingsForm() {
  const html = `
    <div style="padding: var(--space-4);">
      <h3 style="font-size: 18px; font-weight: bold; margin-bottom: var(--space-4);">Settings</h3>
      <div class="form-group">
        <label class="auth-checkbox">
          <input type="checkbox" checked />
          <span>Email Notifications</span>
        </label>
      </div>
      <div class="form-group" style="margin-top: var(--space-3);">
        <label class="auth-checkbox">
          <input type="checkbox" checked />
          <span>SMS Notifications</span>
        </label>
      </div>
      <button class="btn btn-secondary btn-full" id="bs-set-save" style="margin-top: var(--space-6);">Close</button>
    </div>
  `;
  openBottomSheet(html);

  setTimeout(() => {
    document.getElementById('bs-set-save')?.addEventListener('click', () => {
      closeBottomSheet();
    });
  }, 100);
}
