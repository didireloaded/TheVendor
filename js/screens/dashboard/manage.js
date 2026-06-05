// ============================================
// THE VENDOR — Dashboard Management Screen
// ============================================

import { TOP_PRODUCTS, OPPORTUNITIES } from '../../dashboard-data.js';

export function renderDashboardManage(container) {
  container.innerHTML = `
    <div class="dash-card-header" style="margin-bottom: var(--space-3);">
      <h2 class="dash-card-title" style="font-size: 20px;">Manage Business</h2>
    </div>

    <div style="display: flex; flex-direction: column; gap: var(--space-3);">
      
      <!-- Profile Management -->
      <div class="dash-card" style="padding: var(--space-4); margin-bottom: 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
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
      
      <div class="manage-grid">
        ${TOP_PRODUCTS.map(p => `
          <div class="manage-item-card">
            <div class="manage-item-thumb">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 24px; height: 24px; color: var(--text-tertiary);"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div class="manage-item-info">
              <div class="manage-item-title">${p.name}</div>
              <div class="manage-item-price">${p.price}</div>
              <div style="font-size: 10px; color: ${p.stock === 0 ? 'var(--error-600)' : (p.stock < 5 ? 'var(--amber-600)' : 'var(--green-600)')}; font-weight: bold; margin-bottom: var(--space-2);">
                ${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
              </div>
              <div class="manage-item-actions">
                <button class="manage-action-btn">Edit</button>
                <button class="manage-action-btn">Hide</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <button style="width: 100%; padding: 12px; border-radius: var(--radius-lg); background: white; border: 1px dashed var(--primary-500); color: var(--primary-600); font-weight: bold; font-size: var(--text-sm); display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: var(--space-5);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add New Offering
      </button>

      <!-- Opportunities -->
      <div class="dash-card-header" style="margin-bottom: var(--space-2);">
        <h3 class="dash-card-title">Market Opportunities</h3>
        <div class="dash-card-subtitle">Grow your business</div>
      </div>
      
      ${OPPORTUNITIES.map(opp => `
      <div class="opportunity-card">
        <div class="opportunity-badge">High Match</div>
        <div class="opportunity-title">${opp.title}</div>
        <div class="opportunity-desc">${opp.description}</div>
        <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: var(--space-4); font-size: 11px; opacity: 0.9;">
          <div style="display: flex; align-items: center; gap: 6px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${opp.date}</div>
          <div style="display: flex; align-items: center; gap: 6px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px;"><circle cx="12" cy="10" r="3"/><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/></svg> ${opp.location}</div>
        </div>
        <div class="opportunity-actions">
          <button class="opp-btn">Register</button>
          <button class="opp-btn secondary">Remind Me</button>
        </div>
      </div>
      `).join('')}

      <!-- Settings -->
      <div class="dash-card" style="padding: var(--space-4); margin-bottom: 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
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
}
