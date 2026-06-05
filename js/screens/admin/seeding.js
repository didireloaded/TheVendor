// ============================================
// THE VENDOR — Admin Seeding Screen
// Batch seeding controls with progress & history
// ============================================

import { seedingEngine } from '../../seeding-engine.js';
import { store } from '../../store.js';
import { refreshIcons } from '../../app.js';
import { showAdminToast } from '../../admin-app.js';

export function renderAdminSeeding(container) {
  const categories = seedingEngine.getCategories();
  const cities = seedingEngine.getCities();
  const regions = seedingEngine.getRegions();
  const history = store.getSeedingHistory();
  const catCounts = seedingEngine.getCategoryCounts();
  const cityCounts = seedingEngine.getCityCounts();
  const catalogSize = seedingEngine.getCatalogSize();

  container.innerHTML = `
    <div class="admin-seeding">
      <!-- Header -->
      <div class="admin-page-header">
        <div>
          <h1 class="admin-page-title">
            <i data-lucide="database" style="width:28px;height:28px;"></i>
            Vendor Seeding Engine
          </h1>
          <p class="admin-page-subtitle">Batch import vendors from the seed catalog. ${catalogSize} vendors available.</p>
        </div>
      </div>

      <!-- Seeding Mode Cards -->
      <div class="admin-seed-grid">
        <!-- Seed by Category -->
        <div class="admin-card admin-seed-card">
          <div class="admin-seed-card-header">
            <div class="admin-seed-icon" style="background: linear-gradient(135deg, #1A6FEF, #0F54C4);">
              <i data-lucide="layers" style="width:28px;height:28px;"></i>
            </div>
            <div>
              <h3>Seed by Category</h3>
              <p>Import vendors from a specific category</p>
            </div>
          </div>
          <div class="admin-seed-card-body">
            <select id="seed-category" class="admin-select admin-select-lg">
              <option value="">Select a category...</option>
              ${categories.map(c => `<option value="${c.id}">${c.name} ${catCounts[c.id] ? `(${catCounts[c.id]})` : ''}</option>`).join('')}
            </select>
            <button class="admin-btn admin-btn-primary admin-btn-lg" id="run-seed-category" disabled>
              <i data-lucide="play" style="width:16px;height:16px;"></i>
              Run Seeding
            </button>
          </div>
        </div>

        <!-- Seed by City -->
        <div class="admin-card admin-seed-card">
          <div class="admin-seed-card-header">
            <div class="admin-seed-icon" style="background: linear-gradient(135deg, #22C55E, #16A34A);">
              <i data-lucide="map-pin" style="width:28px;height:28px;"></i>
            </div>
            <div>
              <h3>Seed by City</h3>
              <p>Import all vendors from a Namibian city</p>
            </div>
          </div>
          <div class="admin-seed-card-body">
            <select id="seed-city" class="admin-select admin-select-lg">
              <option value="">Select a city...</option>
              ${cities.map(c => `<option value="${c}">${c} ${cityCounts[c] ? `(${cityCounts[c]})` : ''}</option>`).join('')}
            </select>
            <button class="admin-btn admin-btn-success admin-btn-lg" id="run-seed-city" disabled>
              <i data-lucide="play" style="width:16px;height:16px;"></i>
              Run Seeding
            </button>
          </div>
        </div>

        <!-- Seed All -->
        <div class="admin-card admin-seed-card admin-seed-card-danger">
          <div class="admin-seed-card-header">
            <div class="admin-seed-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
              <i data-lucide="globe" style="width:28px;height:28px;"></i>
            </div>
            <div>
              <h3>Seed All Namibia</h3>
              <p>Import entire vendor catalog (${catalogSize} vendors)</p>
            </div>
          </div>
          <div class="admin-seed-card-body">
            <div class="admin-seed-warning">
              <i data-lucide="alert-triangle" style="width:16px;height:16px;"></i>
              <span>This will import all available vendors. Duplicates will be detected and flagged automatically.</span>
            </div>
            <button class="admin-btn admin-btn-warning admin-btn-lg" id="run-seed-all">
              <i data-lucide="zap" style="width:16px;height:16px;"></i>
              Seed All Vendors
            </button>
          </div>
        </div>

        <!-- Upload Scraper JSON -->
        <div class="admin-card admin-seed-card" style="border: 1px dashed var(--border-medium);">
          <div class="admin-seed-card-header">
            <div class="admin-seed-icon" style="background: linear-gradient(135deg, #8B5CF6, #6D28D9);">
              <i data-lucide="upload-cloud" style="width:28px;height:28px;"></i>
            </div>
            <div>
              <h3>Upload Scraper Data</h3>
              <p>Import vendors from scraped-vendors.json</p>
            </div>
          </div>
          <div class="admin-seed-card-body">
            <input type="file" id="upload-json-file" accept="application/json" style="display: none;" />
            <button class="admin-btn admin-btn-outline admin-btn-lg" id="run-upload-json" style="width: 100%; border-color: var(--primary-500); color: var(--primary-600);">
              <i data-lucide="file-json" style="width:16px;height:16px;"></i>
              Select JSON File
            </button>
          </div>
        </div>
      </div>

      <!-- Progress Bar (hidden by default) -->
      <div class="admin-card admin-seed-progress hidden" id="seed-progress">
        <div class="admin-seed-progress-header">
          <i data-lucide="loader" style="width:18px;height:18px;" class="admin-spin"></i>
          <span id="seed-progress-text">Seeding in progress...</span>
        </div>
        <div class="admin-progress-bar">
          <div class="admin-progress-fill" id="seed-progress-fill"></div>
        </div>
      </div>

      <!-- Results Card (hidden by default) -->
      <div class="admin-card admin-seed-results hidden" id="seed-results">
        <div class="admin-card-header">
          <h3 class="admin-card-title"><i data-lucide="check-circle" style="width:18px;height:18px;"></i> Seeding Results</h3>
        </div>
        <div class="admin-seed-results-grid" id="seed-results-grid"></div>
      </div>

      <!-- Seeding History -->
      <div class="admin-card">
        <div class="admin-card-header">
          <h3 class="admin-card-title"><i data-lucide="history" style="width:18px;height:18px;"></i> Seeding History</h3>
        </div>
        ${history.length === 0 ? `
          <div class="admin-empty-state">
            <i data-lucide="inbox" style="width:32px;height:32px;opacity:0.2;"></i>
            <p>No seeding runs yet. Use the controls above to start importing vendors.</p>
          </div>
        ` : `
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Mode</th>
                  <th>Added</th>
                  <th>Skipped</th>
                  <th>Dupes</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                ${history.slice(0, 15).map(h => `
                  <tr>
                    <td>${new Date(h.timestamp).toLocaleDateString()} ${new Date(h.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</td>
                    <td><span class="admin-badge admin-badge-category">${h.mode}</span></td>
                    <td><span style="color:#22C55E;font-weight:600;">${h.added}</span></td>
                    <td><span style="color:#94a3b8;">${h.skipped}</span></td>
                    <td><span style="color:#F59E0B;">${h.duplicates || 0}</span></td>
                    <td>${h.duration}ms</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;

  refreshIcons();
  bindSeedingEvents(container);
}

function bindSeedingEvents(container) {
  // Enable/disable run buttons based on select
  const catSelect = container.querySelector('#seed-category');
  const catBtn = container.querySelector('#run-seed-category');
  catSelect?.addEventListener('change', () => {
    catBtn.disabled = !catSelect.value;
  });

  const citySelect = container.querySelector('#seed-city');
  const cityBtn = container.querySelector('#run-seed-city');
  citySelect?.addEventListener('change', () => {
    cityBtn.disabled = !citySelect.value;
  });

  // Seed by category
  catBtn?.addEventListener('click', async () => {
    if (!catSelect.value) return;
    await runSeeding(container, () => seedingEngine.seedByCategory(catSelect.value));
  });

  // Seed by city
  cityBtn?.addEventListener('click', async () => {
    if (!citySelect.value) return;
    await runSeeding(container, () => seedingEngine.seedByCity(citySelect.value));
  });

  // Seed all
  container.querySelector('#run-seed-all')?.addEventListener('click', async () => {
    if (!confirm('This will seed ALL vendors from the catalog. Continue?')) return;
    await runSeeding(container, () => seedingEngine.seedAll());
  });

  // JSON Upload
  const uploadBtn = container.querySelector('#run-upload-json');
  const fileInput = container.querySelector('#upload-json-file');
  
  uploadBtn?.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        await runSeeding(container, () => seedingEngine.importJsonBatch(json, 'scraper_upload'));
      } catch (err) {
        showAdminToast('Invalid JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    
    // Reset input so the same file can be uploaded again if needed
    fileInput.value = '';
  });
}

async function runSeeding(container, seedFn) {
  const progressEl = container.querySelector('#seed-progress');
  const progressFill = container.querySelector('#seed-progress-fill');
  const progressText = container.querySelector('#seed-progress-text');
  const resultsEl = container.querySelector('#seed-results');
  const resultsGrid = container.querySelector('#seed-results-grid');

  // Show progress
  progressEl?.classList.remove('hidden');
  resultsEl?.classList.add('hidden');
  progressFill.style.width = '0%';
  progressText.textContent = 'Seeding in progress...';

  // Animate progress bar
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress = Math.min(progress + Math.random() * 15, 90);
    progressFill.style.width = progress + '%';
  }, 100);

  // Small delay for visual effect
  await new Promise(r => setTimeout(r, 300));

  try {
    const result = await seedFn();

    clearInterval(progressInterval);
    progressFill.style.width = '100%';
    progressText.textContent = 'Seeding complete!';

    // Show results
    setTimeout(() => {
      progressEl?.classList.add('hidden');
      resultsEl?.classList.remove('hidden');

      resultsGrid.innerHTML = `
        <div class="admin-seed-result-item success">
          <div class="admin-seed-result-value">${result.added}</div>
          <div class="admin-seed-result-label">Added</div>
        </div>
        <div class="admin-seed-result-item warning">
          <div class="admin-seed-result-value">${result.skipped}</div>
          <div class="admin-seed-result-label">Skipped</div>
        </div>
        <div class="admin-seed-result-item info">
          <div class="admin-seed-result-value">${result.duplicates || 0}</div>
          <div class="admin-seed-result-label">Duplicates</div>
        </div>
        <div class="admin-seed-result-item neutral">
          <div class="admin-seed-result-value">${result.duration}ms</div>
          <div class="admin-seed-result-label">Duration</div>
        </div>
      `;

      refreshIcons();
      showAdminToast(`Seeding complete: ${result.added} added, ${result.skipped} skipped`);
    }, 500);

  } catch (err) {
    clearInterval(progressInterval);
    progressFill.style.width = '100%';
    progressFill.style.background = '#EF4444';
    progressText.textContent = `Error: ${err.message}`;
    showAdminToast(`Seeding failed: ${err.message}`, 'error');
  }
}
