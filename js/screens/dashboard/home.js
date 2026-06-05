// ============================================
// THE VENDOR — Dashboard Home Screen
// ============================================

import { DASH_METRICS, ACTIVITY_FEED, RECOMMENDATIONS } from '../../dashboard-data.js';
import { renderTrend } from '../../dashboard-app.js';

export function renderDashboardHome(container) {
  container.innerHTML = `
    <!-- 1. Smart Recommendations (Invisible Intelligence) -->
    <div style="margin-bottom: var(--space-4);">
      ${RECOMMENDATIONS.slice(0, 2).map(rec => `
        <div class="insight-card">
          <div class="insight-icon">
            <i data-lucide="lightbulb" style="width: 20px; height: 20px;"></i>
          </div>
          <div class="insight-text">${rec.text}</div>
        </div>
      `).join('')}
    </div>

    <!-- 2. Business Health Card (Hero) -->
    <div class="dash-card health-card">
      <div class="health-score-ring">
        <div class="score-circle">
          <span>${DASH_METRICS.healthScore}</span>
        </div>
        <div class="score-details">
          <h3>Business Health</h3>
          <p>Your profile is performing excellently. Keep it up!</p>
        </div>
      </div>
      
      <div class="action-list">
        <div class="action-item">
          <div class="action-item-icon" style="background: rgba(34, 197, 94, 0.2); color: var(--success-600);">
            <i data-lucide="check" style="width: 16px; height: 16px;"></i>
          </div>
          <div class="action-item-text">Profile complete (${DASH_METRICS.healthFactors[0].score})</div>
        </div>
        <div class="action-item">
          <div class="action-item-icon" style="background: rgba(245, 158, 11, 0.2); color: #F59E0B;">
            <i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i>
          </div>
          <div class="action-item-text">Respond to 2 new inquiries</div>
        </div>
      </div>
    </div>

    <!-- 3. Today's Snapshot -->
    <div class="dash-card-header" style="margin-top: var(--space-6);">
      <div class="dash-card-title">Today's Snapshot</div>
      <button class="dash-filter-btn active">Today</button>
    </div>
    
    <div class="metrics-grid">
      <!-- Profile Views -->
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Views</span>
          <div class="metric-icon" style="background: var(--blue-50); color: var(--blue-600);">
            <i data-lucide="eye" style="width: 18px; height: 18px;"></i>
          </div>
        </div>
        <div class="metric-value">${DASH_METRICS.snapshots.views.current.toLocaleString()}</div>
        ${renderTrend(DASH_METRICS.snapshots.views.growth)}
      </div>

      <!-- Quote Requests -->
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Leads</span>
          <div class="metric-icon" style="background: var(--green-50); color: var(--green-600);">
            <i data-lucide="inbox" style="width: 18px; height: 18px;"></i>
          </div>
        </div>
        <div class="metric-value">${DASH_METRICS.snapshots.quotes.current.toLocaleString()}</div>
        ${renderTrend(DASH_METRICS.snapshots.quotes.growth)}
      </div>

      <!-- WhatsApp Clicks -->
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">WhatsApp</span>
          <div class="metric-icon" style="background: var(--green-50); color: #25D366;">
            <i data-lucide="message-circle" style="width: 18px; height: 18px; fill: currentColor;"></i>
          </div>
        </div>
        <div class="metric-value">${DASH_METRICS.snapshots.whatsapp.current.toLocaleString()}</div>
        ${renderTrend(DASH_METRICS.snapshots.whatsapp.growth)}
      </div>

      <!-- Bookmarks -->
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Saves</span>
          <div class="metric-icon" style="background: var(--purple-50); color: var(--purple-600);">
            <i data-lucide="bookmark" style="width: 18px; height: 18px;"></i>
          </div>
        </div>
        <div class="metric-value">${DASH_METRICS.snapshots.bookmarks.current.toLocaleString()}</div>
        ${renderTrend(DASH_METRICS.snapshots.bookmarks.growth)}
      </div>
    </div>

    <!-- 4. Quick Chart (Weekly Overview) -->
    <div class="dash-card">
      <div class="dash-card-header" style="margin-bottom: 0;">
        <div class="dash-card-title">Views vs Leads</div>
      </div>
      <div class="chart-container">
        <canvas id="overviewChart"></canvas>
      </div>
    </div>

    <!-- 5. Customer Activity Feed -->
    <div class="dash-card">
      <div class="dash-card-header">
        <div class="dash-card-title">Live Activity</div>
      </div>
      <div class="activity-feed">
        ${ACTIVITY_FEED.map(activity => {
          let icon = '';
          switch(activity.type) {
            case 'lead': icon = '<i data-lucide="inbox" style="width: 16px; height: 16px;"></i>'; break;
            case 'bookmark': icon = '<i data-lucide="bookmark" style="width: 16px; height: 16px;"></i>'; break;
            case 'click': icon = '<i data-lucide="mouse-pointer-click" style="width: 16px; height: 16px;"></i>'; break;
            case 'review': icon = '<i data-lucide="star" style="width: 16px; height: 16px; fill: currentColor;"></i>'; break;
            case 'share': icon = '<i data-lucide="share-2" style="width: 16px; height: 16px;"></i>'; break;
          }

          return `
            <div class="activity-item">
              <div class="activity-icon ${activity.colorClass}">
                ${icon}
              </div>
              <div class="activity-content">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Render Chart.js
  requestAnimationFrame(() => {
    const ctx = document.getElementById('overviewChart');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: DASH_METRICS.chartData.labels,
        datasets: [
          {
            label: 'Profile Views',
            data: DASH_METRICS.chartData.views,
            borderColor: '#1A6FEF',
            backgroundColor: 'rgba(26, 111, 239, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHitRadius: 10
          },
          {
            label: 'Leads',
            data: DASH_METRICS.chartData.leads,
            borderColor: '#22C55E',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            pointHitRadius: 10
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
        interaction: { mode: 'nearest', axis: 'x', intersect: false }
      }
    });
  });
}
