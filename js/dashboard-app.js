// ============================================
// THE VENDOR — Dashboard App Controller
// ============================================

import { renderDashboardHome } from './screens/dashboard/home.js';
import { renderDashboardLeads } from './screens/dashboard/leads.js';
import { renderDashboardAnalytics } from './screens/dashboard/analytics.js';
import { renderDashboardManage } from './screens/dashboard/manage.js';
import { refreshIcons } from './app.js';
import { supabase } from './lib/supabase.js';

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
    item.addEventListener('click', () => {
      const screen = item.dataset.dashScreen;
      navigateDashboard(screen);
    });
  });
});

export async function enterDashboardMode() {
  document.getElementById('app').classList.add('hidden');
  document.getElementById('dashboard-app').classList.remove('hidden');
  
  // Set theme color for dashboard
  document.querySelector('meta[name="theme-color"]').setAttribute('content', '#ffffff');
  
  // Fetch logged in vendor data
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data: vendor } = await supabase.from('vendors').select('*').eq('user_id', session.user.id).single();
    if (vendor) {
      document.getElementById('dash-header-name').textContent = vendor.businessName;
      document.getElementById('dash-header-logo').textContent = vendor.logoInitials || vendor.businessName.substring(0, 1).toUpperCase();
      if (vendor.verificationStatus === 'verified') {
         document.getElementById('dash-header-verified').classList.remove('hidden');
      }
    } else {
      document.getElementById('dash-header-name').textContent = 'Unregistered Vendor';
    }
  } else {
    document.getElementById('dash-header-name').textContent = 'Guest';
  }

  navigateDashboard('home');
}

export function exitDashboardMode() {
  document.getElementById('dashboard-app').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  
  // Reset theme color
  document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0F2B4C');
}

export function navigateDashboard(screen) {
  state.currentScreen = screen;

  // Update nav UI
  document.querySelectorAll('.dash-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.dashScreen === screen);
  });

  const container = document.getElementById('dash-screen-container');
  container.scrollTop = 0;

  switch (screen) {
    case 'home':
      renderDashboardHome(container);
      break;
    case 'leads':
      renderDashboardLeads(container);
      break;
    case 'analytics':
      renderDashboardAnalytics(container);
      break;
    case 'manage':
      renderDashboardManage(container);
      break;
    default:
      renderDashboardHome(container);
  }

  refreshIcons();
}

// Utility: render trend HTML
export function renderTrend(value) {
  if (value > 0) return `<span class="metric-trend trend-up"><i data-lucide="trending-up" style="width:12px;height:12px;"></i> ${value}%</span>`;
  if (value < 0) return `<span class="metric-trend trend-down"><i data-lucide="trending-down" style="width:12px;height:12px;"></i> ${Math.abs(value)}%</span>`;
  return `<span class="metric-trend trend-neutral">0%</span>`;
}
