// ============================================
// THE VENDOR — Dashboard App Controller
// ============================================

import { renderDashboardHome } from './screens/dashboard/home.js';
import { renderDashboardLeads } from './screens/dashboard/leads.js';
import { renderDashboardAnalytics } from './screens/dashboard/analytics.js';
import { renderDashboardManage } from './screens/dashboard/manage.js';
import { refreshIcons } from './app.js';

const state = {
  currentScreen: 'home'
};

document.addEventListener('DOMContentLoaded', () => {
  // Bind entry to dashboard mode (mocked by clicking 'Become a Vendor' for now)
  const vendorBtn = document.getElementById('become-vendor-btn');
  if (vendorBtn) {
    vendorBtn.addEventListener('click', () => {
      enterDashboardMode();
    });
  }

  // Bind exit
  const exitBtn = document.getElementById('dash-exit-btn');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      exitDashboardMode();
    });
  }

  // Bind nav
  document.querySelectorAll('.dash-nav-item').forEach(item => {
    item.addEventListener('click', async () => {
      const screen = item.dataset.dashScreen;
      await navigateDashboard(screen);
    });
  });
});

export function enterDashboardMode() {
  document.getElementById('app').classList.add('hidden');
  document.getElementById('dashboard-app').classList.remove('hidden');
  
  // Set theme color for dashboard
  document.querySelector('meta[name="theme-color"]').setAttribute('content', '#ffffff');
  
  navigateDashboard('home');
}

export function exitDashboardMode() {
  document.getElementById('dashboard-app').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  
  // Reset theme color
  document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0F2B4C');
}

export async function navigateDashboard(screen) {
  state.currentScreen = screen;

  // Update nav UI
  document.querySelectorAll('.dash-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.dashScreen === screen);
  });

  const container = document.getElementById('dash-screen-container');
  container.scrollTop = 0;

  switch (screen) {
    case 'home':
      await renderDashboardHome(container);
      break;
    case 'leads':
      await renderDashboardLeads(container);
      break;
    case 'analytics':
      await renderDashboardAnalytics(container);
      break;
    case 'manage':
      await renderDashboardManage(container);
      break;
    default:
      await renderDashboardHome(container);
  }

  refreshIcons();
}

// Utility: render trend HTML
export function renderTrend(value) {
  if (value > 0) return `<span class="metric-trend trend-up"><i data-lucide="trending-up" style="width:12px;height:12px;"></i> ${value}%</span>`;
  if (value < 0) return `<span class="metric-trend trend-down"><i data-lucide="trending-down" style="width:12px;height:12px;"></i> ${Math.abs(value)}%</span>`;
  return `<span class="metric-trend trend-neutral">0%</span>`;
}
