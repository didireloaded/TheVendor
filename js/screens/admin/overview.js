// ============================================
// THE VENDOR — Admin Overview Screen
// Dashboard with stats, charts, activity feed
// ============================================

import { store } from '../../store.js';
import { refreshIcons } from '../../app.js';
import { navigateAdmin } from '../../admin-app.js';

let chartInstances = [];

function destroyCharts() {
  chartInstances.forEach(c => { try { c.destroy(); } catch(e) {} });
  chartInstances = [];
}

export async function renderAdminOverview(container) {
  destroyCharts();

  const stats = await store.getStats();
  const history = await store.getSeedingHistory();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  container.innerHTML = `
    <div class="admin-overview">
      <!-- Header -->
      <div class="admin-page-header">
        <div>
          <h1 class="admin-page-title">${greeting}, Admin</h1>
          <p class="admin-page-subtitle">Here's what's happening with The Vendor platform today.</p>
        </div>
        <div class="admin-header-actions">
          <button class="admin-btn admin-btn-outline" id="admin-quick-export">
            <i data-lucide="download" style="width:16px;height:16px;"></i> Export
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="admin-stats-grid">
        <div class="admin-stat-card" data-nav="vendors">
          <div class="admin-stat-icon" style="background: rgba(26,111,239,0.15); color: #1A6FEF;">
            <i data-lucide="store" style="width:22px;height:22px;"></i>
          </div>
          <div class="admin-stat-info">
            <div class="admin-stat-value">${stats.total}</div>
            <div class="admin-stat-label">Total Vendors</div>
          </div>
          <div class="admin-stat-sparkline" style="color: #1A6FEF;">
            <i data-lucide="trending-up" style="width:16px;height:16px;"></i>
          </div>
        </div>

        <div class="admin-stat-card" data-nav="queue">
          <div class="admin-stat-icon" style="background: rgba(245,158,11,0.15); color: #F59E0B;">
            <i data-lucide="clock" style="width:22px;height:22px;"></i>
          </div>
          <div class="admin-stat-info">
            <div class="admin-stat-value">${stats.pending}</div>
            <div class="admin-stat-label">Pending Review</div>
          </div>
          ${stats.pending > 0 ? '<span class="admin-stat-alert">Needs attention</span>' : ''}
        </div>

        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background: rgba(34,197,94,0.15); color: #22C55E;">
            <i data-lucide="check-circle" style="width:22px;height:22px;"></i>
          </div>
          <div class="admin-stat-info">
            <div class="admin-stat-value">${stats.approved}</div>
            <div class="admin-stat-label">Approved</div>
          </div>
        </div>

        <div class="admin-stat-card">
          <div class="admin-stat-icon" style="background: rgba(239,68,68,0.15); color: #EF4444;">
            <i data-lucide="x-circle" style="width:22px;height:22px;"></i>
          </div>
          <div class="admin-stat-info">
            <div class="admin-stat-value">${stats.rejected}</div>
            <div class="admin-stat-label">Rejected</div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="admin-charts-row">
        <div class="admin-card admin-chart-card">
          <div class="admin-card-header">
            <h3 class="admin-card-title"><i data-lucide="bar-chart-3" style="width:18px;height:18px;"></i> Category Distribution</h3>
          </div>
          <div class="admin-chart-wrap">
            <canvas id="admin-category-chart"></canvas>
          </div>
        </div>

        <div class="admin-card admin-chart-card">
          <div class="admin-card-header">
            <h3 class="admin-card-title"><i data-lucide="pie-chart" style="width:18px;height:18px;"></i> City Distribution</h3>
          </div>
          <div class="admin-chart-wrap">
            <canvas id="admin-city-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Quality + Activity Row -->
      <div class="admin-charts-row">
        <div class="admin-card">
          <div class="admin-card-header">
            <h3 class="admin-card-title"><i data-lucide="gauge" style="width:18px;height:18px;"></i> Quality Distribution</h3>
          </div>
          <div class="admin-quality-bars">
            <div class="admin-quality-row">
              <span class="admin-quality-label">High (60+)</span>
              <div class="admin-quality-track">
                <div class="admin-quality-fill high" style="width: ${stats.total ? (stats.qualityDistribution.high / stats.total * 100) : 0}%"></div>
              </div>
              <span class="admin-quality-count">${stats.qualityDistribution.high}</span>
            </div>
            <div class="admin-quality-row">
              <span class="admin-quality-label">Medium (30-60)</span>
              <div class="admin-quality-track">
                <div class="admin-quality-fill medium" style="width: ${stats.total ? (stats.qualityDistribution.medium / stats.total * 100) : 0}%"></div>
              </div>
              <span class="admin-quality-count">${stats.qualityDistribution.medium}</span>
            </div>
            <div class="admin-quality-row">
              <span class="admin-quality-label">Low (<30)</span>
              <div class="admin-quality-track">
                <div class="admin-quality-fill low" style="width: ${stats.total ? (stats.qualityDistribution.low / stats.total * 100) : 0}%"></div>
              </div>
              <span class="admin-quality-count">${stats.qualityDistribution.low}</span>
            </div>
          </div>
          <div class="admin-avg-quality">
            Average Quality Score: <strong>${stats.avgQuality}</strong>/100
          </div>
        </div>

        <div class="admin-card">
          <div class="admin-card-header">
            <h3 class="admin-card-title"><i data-lucide="activity" style="width:18px;height:18px;"></i> Recent Seeding Activity</h3>
          </div>
          <div class="admin-activity-feed">
            ${history.length === 0 ? `
              <div class="admin-empty-state">
                <i data-lucide="inbox" style="width:32px;height:32px;opacity:0.3;"></i>
                <p>No seeding activity yet</p>
              </div>
            ` : history.slice(0, 5).map(h => `
              <div class="admin-activity-item">
                <div class="admin-activity-dot ${h.added > 0 ? 'success' : 'neutral'}"></div>
                <div class="admin-activity-content">
                  <div class="admin-activity-text">
                    <strong>${h.mode}</strong> — Added ${h.added}, Skipped ${h.skipped}
                  </div>
                  <div class="admin-activity-time">${new Date(h.timestamp).toLocaleString()}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="admin-card">
        <div class="admin-card-header">
          <h3 class="admin-card-title"><i data-lucide="zap" style="width:18px;height:18px;"></i> Quick Actions</h3>
        </div>
        <div class="admin-quick-actions">
          <button class="admin-action-tile" id="qa-seed">
            <div class="admin-action-icon" style="background: linear-gradient(135deg, #1A6FEF, #0F54C4);">
              <i data-lucide="database" style="width:24px;height:24px;"></i>
            </div>
            <span>Seed Vendors</span>
          </button>
          <button class="admin-action-tile" id="qa-queue">
            <div class="admin-action-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
              <i data-lucide="list-checks" style="width:24px;height:24px;"></i>
            </div>
            <span>View Queue</span>
          </button>
          <button class="admin-action-tile" id="qa-export">
            <div class="admin-action-icon" style="background: linear-gradient(135deg, #22C55E, #16A34A);">
              <i data-lucide="file-down" style="width:24px;height:24px;"></i>
            </div>
            <span>Export Data</span>
          </button>
          <button class="admin-action-tile" id="qa-vendors">
            <div class="admin-action-icon" style="background: linear-gradient(135deg, #A855F7, #7C3AED);">
              <i data-lucide="users" style="width:24px;height:24px;"></i>
            </div>
            <span>All Vendors</span>
          </button>
        </div>
      </div>
    </div>
  `;

  refreshIcons();

  // Bind quick actions
  container.querySelector('#qa-seed')?.addEventListener('click', () => navigateAdmin('seeding'));
  container.querySelector('#qa-queue')?.addEventListener('click', () => navigateAdmin('queue'));
  container.querySelector('#qa-vendors')?.addEventListener('click', () => navigateAdmin('vendors'));
  container.querySelector('#qa-export')?.addEventListener('click', () => {
    const csv = store.exportData('csv');
    downloadFile(csv, 'vendors-export.csv', 'text/csv');
  });
  container.querySelector('#admin-quick-export')?.addEventListener('click', () => {
    const json = store.exportData('json');
    downloadFile(json, 'vendors-export.json', 'application/json');
  });

  // Stat card nav
  container.querySelectorAll('.admin-stat-card[data-nav]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => navigateAdmin(card.dataset.nav));
  });

  // Render charts
  requestAnimationFrame(() => renderCharts(stats));
}

function renderCharts(stats) {
  // Category chart
  const catCtx = document.getElementById('admin-category-chart');
  if (catCtx) {
    const catLabels = Object.keys(stats.byCategory).slice(0, 10);
    const catData = catLabels.map(k => stats.byCategory[k]);
    const catColors = ['#1A6FEF','#F97316','#A855F7','#EF4444','#EC4899','#78716C','#06B6D4','#10B981','#8B5CF6','#F59E0B'];

    const chart = new Chart(catCtx, {
      type: 'bar',
      data: {
        labels: catLabels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
        datasets: [{
          data: catData,
          backgroundColor: catColors.slice(0, catLabels.length),
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,43,76,0.95)',
            titleFont: { family: 'Inter', size: 13 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 10,
            cornerRadius: 8,
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 10 }, color: '#94a3b8', maxRotation: 45 }
          },
          y: {
            grid: { color: 'rgba(148,163,184,0.1)' },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8', stepSize: 1 },
            beginAtZero: true
          }
        }
      }
    });
    chartInstances.push(chart);
  }

  // City doughnut chart
  const cityCtx = document.getElementById('admin-city-chart');
  if (cityCtx) {
    const cityLabels = Object.keys(stats.byCity).slice(0, 8);
    const cityData = cityLabels.map(k => stats.byCity[k]);
    const cityColors = ['#1A6FEF','#22C55E','#F59E0B','#EF4444','#A855F7','#06B6D4','#EC4899','#6366F1'];

    const chart = new Chart(cityCtx, {
      type: 'doughnut',
      data: {
        labels: cityLabels,
        datasets: [{
          data: cityData,
          backgroundColor: cityColors.slice(0, cityLabels.length),
          borderWidth: 0,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Inter', size: 11 },
              color: '#64748b',
              padding: 12,
              usePointStyle: true,
              pointStyleWidth: 8,
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15,43,76,0.95)',
            titleFont: { family: 'Inter' },
            bodyFont: { family: 'Inter' },
            padding: 10,
            cornerRadius: 8,
          }
        }
      }
    });
    chartInstances.push(chart);
  }
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
