// ============================================
// THE VENDOR — Admin Vendors Screen
// Full vendor list with search, filters, sort, pagination
// ============================================

import { store } from '../../store.js';
import { refreshIcons } from '../../app.js';
import { showAdminToast } from '../../admin-app.js';

const PAGE_SIZE = 20;
let filters = { search: '', status: '', category: '', sortBy: 'name', sortDir: 'asc' };
let currentPage = 1;

export async function renderAdminVendors(container) {
  currentPage = 1;
  await renderVendorsList(container);
}

async function renderVendorsList(container) {
  const allVendors = await store.getAllVendors({
    status: filters.status || undefined,
    category: filters.category || undefined,
    search: filters.search || undefined,
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
  });

  const totalPages = Math.max(1, Math.ceil(allVendors.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageVendors = allVendors.slice(start, start + PAGE_SIZE);

  const categories = await store.getUniqueCategories();
  const statuses = ['pending_review', 'approved', 'rejected', 'flagged'];

  container.innerHTML = `
    <div class="admin-vendors">
      <!-- Search Bar -->
      <div class="admin-search-bar">
        <div class="admin-search-input-wrap">
          <i data-lucide="search" style="width:18px;height:18px;"></i>
          <input type="text" id="vendor-search" placeholder="Search by name, category, or description..." value="${filters.search}" />
          ${filters.search ? '<button class="admin-search-clear" id="clear-search"><i data-lucide="x" style="width:14px;height:14px;"></i></button>' : ''}
        </div>
      </div>

      <!-- Filters Row -->
      <div class="admin-filters-row">
        <div class="admin-filter-group">
          <select id="filter-status" class="admin-select">
            <option value="">All Statuses</option>
            ${statuses.map(s => `<option value="${s}" ${filters.status === s ? 'selected' : ''}>${s.replace('_', ' ')}</option>`).join('')}
          </select>

          <select id="filter-category" class="admin-select">
            <option value="">All Categories</option>
            ${categories.map(c => `<option value="${c}" ${filters.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>

          <select id="filter-sort" class="admin-select">
            <option value="name" ${filters.sortBy === 'name' ? 'selected' : ''}>Sort: Name</option>
            <option value="quality" ${filters.sortBy === 'quality' ? 'selected' : ''}>Sort: Quality Score</option>
            <option value="date" ${filters.sortBy === 'date' ? 'selected' : ''}>Sort: Date Added</option>
            <option value="category" ${filters.sortBy === 'category' ? 'selected' : ''}>Sort: Category</option>
          </select>

          <button class="admin-btn admin-btn-icon" id="toggle-sort-dir" title="Toggle sort direction">
            <i data-lucide="${filters.sortDir === 'asc' ? 'arrow-up-narrow-wide' : 'arrow-down-wide-narrow'}" style="width:16px;height:16px;"></i>
          </button>
        </div>

        <div class="admin-results-count">
          <i data-lucide="database" style="width:14px;height:14px;"></i>
          <span>${allVendors.length} vendor${allVendors.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <!-- Vendor Table -->
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Category</th>
              <th>City</th>
              <th>Status</th>
              <th>Quality</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="vendor-tbody">
            ${pageVendors.length === 0 ? `
              <tr><td colspan="6" class="admin-table-empty">
                <div class="admin-empty-state">
                  <i data-lucide="search-x" style="width:32px;height:32px;opacity:0.2;"></i>
                  <p>No vendors match your filters</p>
                </div>
              </td></tr>
            ` : pageVendors.map(v => {
              const name = v.businessName || v.name || 'Unnamed';
              const quality = v.vendorQualityScore || 0;
              const qualityColor = quality < 30 ? '#EF4444' : quality < 60 ? '#F59E0B' : '#22C55E';
              const statusClass = v.status === 'approved' ? 'approved' : v.status === 'rejected' ? 'rejected' : v.status === 'flagged' ? 'flagged' : 'pending';

              return `
                <tr class="admin-vendor-row" data-id="${v.id}">
                  <td>
                    <div class="admin-vendor-cell">
                      <div class="admin-vendor-avatar-sm" style="background: ${v.logoGradient || 'linear-gradient(135deg, #1A6FEF, #0F2B4C)'}">
                        ${name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div class="admin-vendor-cell-name">${name}</div>
                        <div class="admin-vendor-cell-sub">${v.source || 'manual'}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="admin-badge admin-badge-category">${v.category || '—'}</span></td>
                  <td>${v.city || v.address || '—'}</td>
                  <td><span class="admin-status-badge ${statusClass}">${v.status?.replace('_', ' ') || 'pending'}</span></td>
                  <td>
                    <div class="admin-quality-mini">
                      <div class="admin-quality-mini-track">
                        <div class="admin-quality-mini-fill" style="width:${quality}%;background:${qualityColor};"></div>
                      </div>
                      <span style="color:${qualityColor};font-weight:600;font-size:12px;">${quality}</span>
                    </div>
                  </td>
                  <td>
                    <div class="admin-table-actions">
                      ${v.status !== 'approved' ? `<button class="admin-tbl-btn approve" data-action="approve" data-id="${v.id}" title="Approve"><i data-lucide="check" style="width:14px;height:14px;"></i></button>` : ''}
                      ${v.status !== 'rejected' ? `<button class="admin-tbl-btn reject" data-action="reject" data-id="${v.id}" title="Reject"><i data-lucide="x" style="width:14px;height:14px;"></i></button>` : ''}
                      <button class="admin-tbl-btn edit" data-action="edit" data-id="${v.id}" title="Edit"><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
                      <button class="admin-tbl-btn delete" data-action="delete" data-id="${v.id}" title="Delete"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      ${totalPages > 1 ? `
        <div class="admin-pagination">
          <button class="admin-btn admin-btn-sm admin-btn-outline" id="page-prev" ${currentPage <= 1 ? 'disabled' : ''}>
            <i data-lucide="chevron-left" style="width:14px;height:14px;"></i> Prev
          </button>
          <span class="admin-page-info">Page ${currentPage} of ${totalPages}</span>
          <button class="admin-btn admin-btn-sm admin-btn-outline" id="page-next" ${currentPage >= totalPages ? 'disabled' : ''}>
            Next <i data-lucide="chevron-right" style="width:14px;height:14px;"></i>
          </button>
        </div>
      ` : ''}
    </div>
  `;

  refreshIcons();
  bindVendorsEvents(container);
}

function bindVendorsEvents(container) {
  // Search
  const searchInput = container.querySelector('#vendor-search');
  let searchTimeout;
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filters.search = searchInput.value;
      currentPage = 1;
      renderVendorsList(container);
    }, 300);
  });

  container.querySelector('#clear-search')?.addEventListener('click', () => {
    filters.search = '';
    currentPage = 1;
    renderVendorsList(container);
  });

  // Filters
  container.querySelector('#filter-status')?.addEventListener('change', (e) => {
    filters.status = e.target.value;
    currentPage = 1;
    renderVendorsList(container);
  });

  container.querySelector('#filter-category')?.addEventListener('change', (e) => {
    filters.category = e.target.value;
    currentPage = 1;
    renderVendorsList(container);
  });

  container.querySelector('#filter-sort')?.addEventListener('change', (e) => {
    filters.sortBy = e.target.value;
    currentPage = 1;
    renderVendorsList(container);
  });

  container.querySelector('#toggle-sort-dir')?.addEventListener('click', () => {
    filters.sortDir = filters.sortDir === 'asc' ? 'desc' : 'asc';
    currentPage = 1;
    renderVendorsList(container);
  });

  // Pagination
  container.querySelector('#page-prev')?.addEventListener('click', async () => {
    if (currentPage > 1) { currentPage--; await renderVendorsList(container); }
  });

  container.querySelector('#page-next')?.addEventListener('click', async () => {
    currentPage++;
    await renderVendorsList(container);
  });

  // Row actions
  container.querySelectorAll('.admin-tbl-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      const v = await store.getVendor(id);
      const name = v?.businessName || v?.name || 'this vendor';

      switch (action) {
        case 'approve':
          await store.approveVendor(id);
          showAdminToast(`"${name}" approved`);
          await renderVendorsList(container);
          break;
        case 'reject': {
          const reason = prompt('Reason for rejection:') || '';
          await store.rejectVendor(id, reason);
          showAdminToast(`"${name}" rejected`, 'error');
          await renderVendorsList(container);
          break;
        }
        case 'edit':
          await showEditModal(container, id);
          break;
        case 'delete':
          if (confirm(`Delete "${name}" permanently?`)) {
            await store.deleteVendor(id);
            showAdminToast(`"${name}" deleted`, 'error');
            await renderVendorsList(container);
          }
          break;
      }
    });
  });

  // Row click (not on action buttons) => expand/edit
  container.querySelectorAll('.admin-vendor-cell-name').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', async () => {
      const row = el.closest('.admin-vendor-row');
      if (row) await showEditModal(container, row.dataset.id);
    });
  });
}

async function showEditModal(container, vendorId) {
  const v = await store.getVendor(vendorId);
  if (!v) return;

  const name = v.businessName || v.name || '';
  document.getElementById('admin-edit-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'admin-edit-modal';
  modal.className = 'admin-modal-overlay';
  modal.innerHTML = `
    <div class="admin-modal admin-modal-lg">
      <div class="admin-modal-header">
        <h2><i data-lucide="pencil" style="width:18px;height:18px;"></i> Edit Vendor</h2>
        <button class="admin-modal-close" id="close-edit-modal">
          <i data-lucide="x" style="width:20px;height:20px;"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <form id="edit-vendor-form" class="admin-form">
          <div class="admin-form-grid">
            <div class="admin-form-group">
              <label>Business Name</label>
              <input type="text" name="businessName" value="${name}" />
            </div>
            <div class="admin-form-group">
              <label>Category</label>
              <input type="text" name="category" value="${v.category || ''}" />
            </div>
            <div class="admin-form-group">
              <label>City</label>
              <input type="text" name="city" value="${v.city || ''}" />
            </div>
            <div class="admin-form-group">
              <label>Region</label>
              <input type="text" name="region" value="${v.region || ''}" />
            </div>
            <div class="admin-form-group">
              <label>Phone</label>
              <input type="text" name="phone" value="${v.phone || ''}" />
            </div>
            <div class="admin-form-group">
              <label>Email</label>
              <input type="email" name="email" value="${v.email || ''}" />
            </div>
            <div class="admin-form-group">
              <label>WhatsApp</label>
              <input type="text" name="whatsapp" value="${v.whatsapp || ''}" />
            </div>
            <div class="admin-form-group">
              <label>Website</label>
              <input type="url" name="website" value="${v.website || ''}" />
            </div>
            <div class="admin-form-group full-width">
              <label>Address</label>
              <input type="text" name="address" value="${v.address || ''}" />
            </div>
            <div class="admin-form-group full-width">
              <label>Description</label>
              <textarea name="description" rows="3">${v.description || ''}</textarea>
            </div>
          </div>
        </form>
      </div>
      <div class="admin-modal-footer">
        <button class="admin-btn admin-btn-outline" id="edit-cancel">Cancel</button>
        <button class="admin-btn admin-btn-primary" id="edit-save">
          <i data-lucide="save" style="width:14px;height:14px;"></i> Save Changes
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  refreshIcons();

  modal.querySelector('#close-edit-modal')?.addEventListener('click', () => modal.remove());
  modal.querySelector('#edit-cancel')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  modal.querySelector('#edit-save')?.addEventListener('click', async () => {
    const form = modal.querySelector('#edit-vendor-form');
    const formData = new FormData(form);
    const data = {};
    formData.forEach((val, key) => { if (val) data[key] = val; });

    await store.updateVendor(vendorId, data);
    showAdminToast('Vendor updated');
    modal.remove();
    await renderVendorsList(container);
  });
}
