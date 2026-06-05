// ============================================
// THE VENDOR — Dashboard Analytics Screen
// ============================================

import { DASH_METRICS, SEARCH_PERFORMANCE, TOP_SERVICES, LOCATION_ANALYTICS, REVIEWS_SUMMARY } from '../../dashboard-data.js';
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
        ${LOCATION_ANALYTICS.map(loc => `
          <div style="margin-bottom: var(--space-3);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: var(--text-sm); font-weight: 500;">${loc.region}</span>
              <span style="font-size: var(--text-sm); font-weight: bold;">${loc.percentage}%</span>
            </div>
            <div style="width: 100%; height: 8px; background: var(--gray-100); border-radius: 4px; overflow: hidden;">
              <div style="width: ${loc.percentage}%; height: 100%; background: var(--primary-500); border-radius: 4px;"></div>
            </div>
            <div style="font-size: 10px; color: var(--text-tertiary); margin-top: 4px;">${loc.views.toLocaleString()} views</div>
          </div>
        `).join('')}
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
          <div style="font-size: 32px; font-weight: bold; color: var(--text-primary); line-height: 1;">${REVIEWS_SUMMARY.rating}</div>
          <div style="color: var(--gold-400); font-size: 14px; margin: 4px 0;">★★★★★</div>
          <div style="font-size: 10px; color: var(--text-tertiary);">${REVIEWS_SUMMARY.total} Reviews</div>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
          ${Object.entries(REVIEWS_SUMMARY.distribution).reverse().map(([stars, count]) => `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 10px; color: var(--text-secondary); width: 12px;">${stars}</span>
              <svg viewBox="0 0 24 24" fill="currentColor" style="width: 10px; height: 10px; color: var(--gold-400);"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <div style="flex: 1; height: 4px; background: var(--gray-100); border-radius: 2px; overflow: hidden;">
                <div style="width: ${(count / REVIEWS_SUMMARY.total) * 100}%; height: 100%; background: var(--gold-400); border-radius: 2px;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Top Performing Services -->
    <div class="dash-card">
      <div class="dash-card-header">
        <div class="dash-card-title">Top Services</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: var(--space-4);">
        ${TOP_SERVICES.map(s => `
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: var(--text-sm); font-weight: bold;">${s.name}</span>
              <span style="font-size: var(--text-sm); color: var(--green-600); font-weight: bold;">${s.revenue}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-tertiary); margin-bottom: 8px;">
              <span>${s.views} Views · ${s.inquiries} Inquiries · ${s.bookings} Bookings</span>
              <span>${s.conversion}% Conv.</span>
            </div>
            <div style="width: 100%; height: 6px; background: var(--gray-100); border-radius: 3px; overflow: hidden;">
              <div style="width: ${(s.inquiries / s.views) * 100 * 2}%; height: 100%; background: var(--primary-500); border-radius: 3px;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Search Performance -->
    <div class="dash-card" style="margin-bottom: 0;">
      <div class="dash-card-header">
        <div class="dash-card-title">Search Keywords</div>
        <div class="dash-card-subtitle">What users searched to find you</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: var(--space-3);">
        ${SEARCH_PERFORMANCE.map(k => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--gray-100);">
            <div style="font-size: var(--text-sm); color: var(--text-secondary);">${k.keyword}</div>
            <div style="text-align: right;">
              <div style="font-size: var(--text-sm); font-weight: bold;">${k.volume}</div>
              <div style="font-size: 10px; color: var(--text-tertiary);">${k.conversion}% conv</div>
            </div>
          </div>
        `).join('')}
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
            data: DASH_METRICS.chartData.views,
            backgroundColor: 'rgba(26, 111, 239, 0.8)',
            borderRadius: 4,
            barPercentage: 0.6
          },
          {
            label: 'Leads',
            data: DASH_METRICS.chartData.leads,
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
