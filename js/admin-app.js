import { refreshIcons } from './app.js';
import { renderAdminOverview } from './screens/admin/overview.js';
import { renderAdminQueue } from './screens/admin/queue.js';
import { renderAdminVendors } from './screens/admin/vendors.js';
import { renderAdminSeeding } from './screens/admin/seeding.js';
import { renderAdminSettings } from './screens/admin/settings.js';

let currentScreen = 'overview';
let adminContainer = null;
let appContainer = null;

export function enterAdminMode() {
  appContainer = document.getElementById('app-container');
  adminContainer = document.getElementById('admin-container');
  
  if (appContainer) appContainer.classList.add('hidden');
  if (adminContainer) {
    adminContainer.classList.remove('hidden');
    initAdminApp();
  }
}

export function exitAdminMode() {
  if (adminContainer) adminContainer.classList.add('hidden');
  if (appContainer) appContainer.classList.remove('hidden');
}

function initAdminApp() {
  if (!adminContainer) return;
  adminContainer.innerHTML = `
    <div class="admin-layout" style="display: flex; height: 100vh; background: var(--bg-secondary);">
      <aside class="admin-sidebar" style="width: 280px; background: var(--primary-800); color: white; display: flex; flex-direction: column;">
        <div style="padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
            <div style="width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, var(--gold-400), var(--gold-600)); display: flex; align-items: center; justify-content: center; color: var(--primary-900); font-weight: bold; font-size: 20px;">V</div>
            <div>
              <h2 style="font-size: 18px; font-weight: bold; line-height: 1.2;">The Vendor</h2>
              <span style="font-size: 12px; color: var(--gold-400);">Admin Portal</span>
            </div>
          </div>
        </div>
        <nav style="flex: 1; padding: 24px 16px; display: flex; flex-direction: column; gap: 8px;">
          <button class="admin-nav-item active" data-target="overview" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; color: white; background: rgba(255,255,255,0.1); border: none; text-align: left; cursor: pointer;">
            <i data-lucide="layout-dashboard"></i> Overview
          </button>
          <button class="admin-nav-item" data-target="queue" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; color: rgba(255,255,255,0.7); background: transparent; border: none; text-align: left; cursor: pointer;">
            <i data-lucide="list-checks"></i> Moderation Queue
          </button>
          <button class="admin-nav-item" data-target="vendors" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; color: rgba(255,255,255,0.7); background: transparent; border: none; text-align: left; cursor: pointer;">
            <i data-lucide="store"></i> All Vendors
          </button>
          <button class="admin-nav-item" data-target="seeding" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; color: rgba(255,255,255,0.7); background: transparent; border: none; text-align: left; cursor: pointer;">
            <i data-lucide="database"></i> Seeding Engine
          </button>
          <button class="admin-nav-item" data-target="settings" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; color: rgba(255,255,255,0.7); background: transparent; border: none; text-align: left; cursor: pointer;">
            <i data-lucide="settings"></i> Settings
          </button>
        </nav>
        <div style="padding: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
          <button id="exit-admin-btn" style="width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; color: rgba(255,255,255,0.7); background: transparent; border: none; text-align: left; cursor: pointer; transition: all 0.2s;">
            <i data-lucide="log-out"></i> Exit Admin
          </button>
        </div>
      </aside>
      <main id="admin-main-content" style="flex: 1; overflow-y: auto; padding: 32px;"></main>
    </div>
  `;
  refreshIcons();

  document.querySelectorAll('.admin-nav-item').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget.dataset.target;
      await navigateAdmin(target);
      document.querySelectorAll('.admin-nav-item').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = 'rgba(255,255,255,0.7)';
      });
      e.currentTarget.classList.add('active');
      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
      e.currentTarget.style.color = 'white';
    });
  });

  document.getElementById('exit-admin-btn').addEventListener('click', exitAdminMode);

  navigateAdmin('overview');
}

export async function navigateAdmin(screen) {
  currentScreen = screen;
  const content = document.getElementById('admin-main-content');
  if (!content) return;
  
  content.innerHTML = '';
  
  switch (screen) {
    case 'overview':
      await renderAdminOverview(content);
      break;
    case 'queue':
      await renderAdminQueue(content);
      break;
    case 'vendors':
      await renderAdminVendors(content);
      break;
    case 'seeding':
      await renderAdminSeeding(content);
      break;
    case 'settings':
      await renderAdminSettings(content);
      break;
  }
}

// Add Keyboard Shortcut (Ctrl+Shift+A)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    adminContainer = document.getElementById('admin-container');
    if (adminContainer && adminContainer.classList.contains('hidden')) {
      enterAdminMode();
    } else {
      exitAdminMode();
    }
  }
});

// URL Param entry
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('admin') === 'true') {
    // Wait slightly for DOM to be fully ready
    setTimeout(enterAdminMode, 100);
  }
});
