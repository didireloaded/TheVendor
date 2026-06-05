// ============================================
// THE VENDOR — Dashboard Analytics Screen
// ============================================

import { renderTrend } from '../../dashboard-app.js';

export function renderDashboardAnalytics(container) {
  container.innerHTML = `
    <div class="dash-card-header" style="margin-bottom: var(--space-3);">
      <h2 class="dash-card-title" style="font-size: 20px;">Analytics</h2>
    </div>

    <!-- Time Filters -->
    <div class="dash-filters">
      <button class="dash-filter-btn">Today</button>
      <button class="dash-filter-btn active">7 Days</button>
      <button class="dash-filter-btn">30 Days</button>
      <button class="dash-filter-btn">90 Days</button>
      <button class="dash-filter-btn">12 Months</button>
    </div>

    <!-- Overview Chart -->
    <div class="dash-card">
      <div class="dash-card-header" style="margin-bottom: 0;">
        <div class="dash-card-title">Performance Overview</div>
      </div>
      <div style="display: flex; gap: var(--space-4); margin: var(--space-3) 0;">
        <div>
          <div style="font-size: var(--text-xs); color: var(--text-tertiary);">Total Views</div>
          <div style="font-size: 18px; font-weight: bold; color: var(--primary-600);">1,248</div>
        </div>
        <div>
          <div style="font-size: var(--text-xs); color: var(--text-tertiary);">Total Leads</div>
          <div style="font-size: 18px; font-weight: bold; color: var(--green-600);">140</div>
        </div>
        <div>
          <div style="font-size: var(--text-xs); color: var(--text-tertiary);">Conversion</div>
          <div style="font-size: 18px; font-weight: bold; color: var(--text-primary);">11.2%</div>
        </div>
      </div>
      <div class="chart-container" style="height: 180px;">
        <canvas id="performanceChart"></canvas>
      </div>
    </div>

    <!-- Location Analytics (Horizontal Bar Chart) -->
    <div class="dash-card">
      <div class="dash-card-header">
        <div class="dash-card-title">Location Analytics</div>
        <div class="dash-card-subtitle">Where your leads are coming from</div>
      </div>
      <div class="data-list">
        <div style="font-size: 13px; color: var(--text-tertiary); text-align: center; padding: 20px 0;">Not enough data to display location analytics yet.</div>
      </div>
    </div>

    <!-- Review Analytics -->
    <div class="dash-card">
      <div class="dash-card-header">
        <div class="dash-card-title">Review Center</div>
        <div class="dash-card-subtitle">Customer sentiment</div>
      </div>
      <div style="display: flex; gap: var(--space-4); margin-bottom: var(--space-4); align-items: center;">
        <div style="text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: var(--text-primary); line-height: 1;">0.0</div>
          <div style="color: var(--gray-300); margin: 4px 0; display: flex; gap: 2px;">
            <i data-lucide="star" style="width: 14px; height: 14px; fill: currentColor;"></i>
            <i data-lucide="star" style="width: 14px; height: 14px; fill: currentColor;"></i>
            <i data-lucide="star" style="width: 14px; height: 14px; fill: currentColor;"></i>
            <i data-lucide="star" style="width: 14px; height: 14px; fill: currentColor;"></i>
            <i data-lucide="star" style="width: 14px; height: 14px; fill: currentColor;"></i>
          </div>
          <div style="font-size: 10px; color: var(--text-tertiary);">0 Reviews</div>
        </div>
      </div>
    </div>

    <!-- Top Performing Services -->
    <div class="dash-card">
      <div class="dash-card-header">
        <div class="dash-card-title">Top Services</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: var(--space-4);">
        <div style="font-size: 13px; color: var(--text-tertiary); text-align: center; padding: 20px 0;">No services added yet.</div>
      </div>
    </div>

    <!-- Search Performance -->
    <div class="dash-card" style="margin-bottom: 0;">
      <div class="dash-card-header">
        <div class="dash-card-title">Search Keywords</div>
        <div class="dash-card-subtitle">What users searched to find you</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: var(--space-3);">
         <div style="font-size: 13px; color: var(--text-tertiary); text-align: center; padding: 20px 0;">Not enough data to display search keywords yet.</div>
      </div>
    </div>
  `;

  // Render Performance Chart
  requestAnimationFrame(() => {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: DASH_METRICS.chartData.labels,
        datasets: [
          {
            label: 'Views',
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(26, 111, 239, 0.8)',
            borderRadius: 4,
            barPercentage: 0.6
          },
          {
            label: 'Leads',
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderRadius: 4,
            barPercentage: 0.6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(15, 43, 76, 0.9)',
            titleFont: { family: 'Inter', size: 13 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: { 
            grid: { display: false, drawBorder: false },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8' }
          },
          y: { 
            display: false,
            min: 0
          }
        },
        interaction: { mode: 'index', axis: 'x', intersect: false }
      }
    });
  });
}
