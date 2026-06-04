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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
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
          <div class="action-item-icon" style="background: rgba(34, 197, 94, 0.2);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="action-item-text">Profile complete (${DASH_METRICS.healthFactors[0].score})</div>
        </div>
        <div class="action-item">
          <div class="action-item-icon" style="background: rgba(245, 158, 11, 0.2); color: #FCD34D;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
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
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
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
            case 'lead': icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'; break;
            case 'bookmark': icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>'; break;
            case 'click': icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"/><path d="M10 14L21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>'; break;
            case 'review': icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'; break;
            case 'share': icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'; break;
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
