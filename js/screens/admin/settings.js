import { refreshIcons } from '../../app.js';
import { store } from '../../store.js';

export async function renderAdminSettings(container) {
  const settings = store.getSettings();
  
  const html = `
    <div class="admin-settings-screen" style="max-width: 800px; margin: 0 auto; animation: fadeIn 0.3s ease-out;">
      <header style="margin-bottom: 32px;">
        <h1 style="font-size: 28px; font-weight: bold; color: var(--text-primary);">Settings</h1>
        <p style="color: var(--text-secondary);">Configure platform thresholds and data management.</p>
      </header>
      
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Quality Thresholds -->
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: var(--shadow-sm);">
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="sliders" style="color: var(--primary-500);"></i> Quality Score Thresholds
          </h2>
          <div style="display: grid; gap: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px;">Minimum Score for Auto-Approval</label>
              <input type="number" value="80" style="width: 100%; max-width: 200px; padding: 8px 12px; border: 1px solid var(--border-medium); border-radius: 6px;" disabled>
              <p style="font-size: 12px; color: var(--text-tertiary); margin-top: 4px;">Currently disabled. All vendors require manual approval.</p>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px;">Flag Threshold</label>
              <input type="number" value="${settings.qualityThresholds.low}" style="width: 100%; max-width: 200px; padding: 8px 12px; border: 1px solid var(--border-medium); border-radius: 6px;">
              <p style="font-size: 12px; color: var(--text-tertiary); margin-top: 4px;">Vendors scoring below this will be marked as incomplete.</p>
            </div>
          </div>
        </div>

        <!-- Data Management -->
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: var(--shadow-sm);">
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="database" style="color: var(--primary-500);"></i> Data Management
          </h2>
          <div style="display: flex; gap: 16px;">
            <button id="btn-export-json" class="btn btn-outline" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid var(--border-medium); border-radius: 6px; background: white; cursor: pointer;">
              <i data-lucide="download"></i> Export JSON
            </button>
            <button id="btn-export-csv" class="btn btn-outline" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid var(--border-medium); border-radius: 6px; background: white; cursor: pointer;">
              <i data-lucide="download"></i> Export CSV
            </button>
          </div>
        </div>

        <!-- Danger Zone -->
        <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 24px;">
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: var(--error-600);">
            <i data-lucide="alert-triangle"></i> Danger Zone
          </h2>
          <p style="font-size: 14px; color: var(--error-600); margin-bottom: 16px;">These actions cannot be undone. Please be certain.</p>
          <div style="display: flex; gap: 16px;">
            <button id="btn-clear-seeded" style="background: var(--error-600); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 500; cursor: pointer;">
              Clear Seeded Data Only
            </button>
            <button id="btn-clear-all" style="background: var(--error-800); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 500; cursor: pointer;">
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  refreshIcons();

  container.querySelector('#btn-clear-seeded').addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete all seeded vendors? This cannot be undone.')) {
      await store.clearSeededOnly();
      alert('Seeded data cleared successfully.');
    }
  });

  container.querySelector('#btn-clear-all').addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete ALL data? This will empty the database.')) {
      await store.clearAllData();
      alert('All data cleared successfully.');
    }
  });
  
  container.querySelector('#btn-export-json').addEventListener('click', async () => {
    const data = await store.exportData('json');
    downloadFile(data, 'vendors-export.json', 'application/json');
  });

  container.querySelector('#btn-export-csv').addEventListener('click', async () => {
    const data = await store.exportData('csv');
    downloadFile(data, 'vendors-export.csv', 'text/csv');
  });
}

function downloadFile(content, fileName, contentType) {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}
