// ============================================
// THE VENDOR — Admin Moderation Queue
// Tabbed queue with vendor cards and actions
// ============================================

import { store } from '../../store.js';
import { refreshIcons } from '../../app.js';
import { showAdminToast } from '../../admin-app.js';

let currentTab = 'pending_review';
let selectedIds = new Set();

export async function renderAdminQueue(container) {
  selectedIds.clear();
  await renderQueue(container);
}

async function renderQueue(container) {
  const stats = await store.getStats();
  const allVendors = await store.getAllVendors();
  const lowQuality = allVendors.filter(v => (v.vendorQualityScore || 0) < 30);
  const duplicates = allVendors.filter(v => v.notes && v.notes.toLowerCase().includes('duplicate'));

  const tabs = [
    { id: 'pending_review', label: 'New', count: stats.pending, icon: 'inbox' },
    { id: 'duplicates', label: 'Duplicates', count: duplicates.length, icon: 'copy' },
    { id: 'incomplete', label: 'Incomplete', count: lowQuality.length, icon: 'alert-triangle' },
    { id: 'flagged', label: 'Flagged', count: stats.flagged, icon: 'flag' },
    { id: 'rejected', label: 'Rejected', count: stats.rejected, icon: 'x-circle' },
    { id: 'approved', label: 'Approved', count: stats.approved, icon: 'check-circle' },
  ];

  let vendors = [];
  switch (currentTab) {
    case 'pending_review': vendors = await store.getVendorsByStatus('pending_review'); break;
    case 'duplicates': vendors = duplicates; break;
    case 'incomplete': vendors = lowQuality; break;
    case 'flagged': vendors = await store.getVendorsByStatus('flagged'); break;
    case 'rejected': vendors = await store.getVendorsByStatus('rejected'); break;
    case 'approved': vendors = await store.getVendorsByStatus('approved'); break;
  }

  container.innerHTML = `
    <div class="admin-queue">
      <!-- Tab Bar -->
      <div class="admin-tabs-scroll">
        <div class="admin-tabs">
          ${tabs.map(t => `
            <button class="admin-tab ${currentTab === t.id ? 'active' : ''}" data-tab="${t.id}">
              <i data-lucide="${t.icon}" style="width:14px;height:14px;"></i>
              ${t.label}
              <span class="admin-tab-badge ${t.count > 0 && t.id === 'pending_review' ? 'alert' : ''}">${t.count}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Bulk Actions -->
      <div class="admin-bulk-bar" id="admin-bulk-bar">
        <div class="admin-bulk-left">
          <label class="admin-checkbox-wrap">
            <input type="checkbox" id="queue-select-all" />
            <span>Select All</span>
          </label>
          <span class="admin-bulk-count" id="bulk-count">0 selected</span>
        </div>
        <div class="admin-bulk-actions">
          <button class="admin-btn admin-btn-sm admin-btn-success" id="bulk-approve" disabled>
            <i data-lucide="check" style="width:14px;height:14px;"></i> Approve
          </button>
          <button class="admin-btn admin-btn-sm admin-btn-danger" id="bulk-reject" disabled>
            <i data-lucide="x" style="width:14px;height:14px;"></i> Reject
          </button>
        </div>
      </div>

      <!-- Search Filter -->
      <div class="admin-queue-search">
        <i data-lucide="search" style="width:16px;height:16px;"></i>
        <input type="text" placeholder="Search vendors in queue..." id="queue-search" />
      </div>

      <!-- Vendor Cards -->
      <div class="admin-queue-list" id="queue-list">
        ${vendors.length === 0 ? `
          <div class="admin-empty-state">
            <i data-lucide="check-circle-2" style="width:48px;height:48px;opacity:0.2;"></i>
            <h3>Queue is empty</h3>
            <p>No vendors in this category. You're all caught up!</p>
          </div>
        ` : vendors.map(v => renderVendorCard(v)).join('')}
      </div>
    </div>
  `;

  refreshIcons();
  bindQueueEvents(container, vendors);
}

function renderVendorCard(v) {
  const quality = v.vendorQualityScore || 0;
  const qualityClass = quality < 30 ? 'low' : quality < 60 ? 'medium' : 'high';
  const qualityColor = quality < 30 ? '#EF4444' : quality < 60 ? '#F59E0B' : '#22C55E';
  const statusClass = v.status === 'approved' ? 'approved' : v.status === 'rejected' ? 'rejected' : v.status === 'flagged' ? 'flagged' : 'pending';
  const name = v.businessName || v.name || 'Unnamed Vendor';

  return `
    <div class="admin-vendor-card" data-id="${v.id}">
      <div class="admin-vendor-card-top">
        <label class="admin-checkbox-wrap card-check">
          <input type="checkbox" class="vendor-check" data-id="${v.id}" ${selectedIds.has(v.id) ? 'checked' : ''} />
        </label>
        <div class="admin-vendor-avatar" style="background: ${v.logoGradient || 'linear-gradient(135deg, #1A6FEF, #0F2B4C)'}">
          ${(name).substring(0, 2).toUpperCase()}
        </div>
        <div class="admin-vendor-info">
          <div class="admin-vendor-name" data-id="${v.id}">${name}</div>
          <div class="admin-vendor-meta">
            <span class="admin-badge admin-badge-category">${v.category || 'uncategorized'}</span>
            <span class="admin-vendor-city"><i data-lucide="map-pin" style="width:12px;height:12px;"></i> ${v.city || v.address || 'Unknown'}</span>
          </div>
        </div>
        <div class="admin-vendor-status">
          <span class="admin-status-badge ${statusClass}">${v.status?.replace('_', ' ') || 'pending'}</span>
        </div>
      </div>

      <div class="admin-vendor-card-bottom">
        <div class="admin-quality-meter">
          <div class="admin-quality-meter-track">
            <div class="admin-quality-meter-fill" style="width: ${quality}%; background: ${qualityColor};"></div>
          </div>
          <span class="admin-quality-meter-label ${qualityClass}">${quality}</span>
        </div>

        ${v.source ? `<span class="admin-source-tag"><i data-lucide="tag" style="width:10px;height:10px;"></i> ${v.source}</span>` : ''}

        <div class="admin-vendor-actions">
          ${v.status !== 'approved' ? `
            <button class="admin-action-btn approve" data-action="approve" data-id="${v.id}" title="Approve">
              <i data-lucide="check" style="width:16px;height:16px;"></i>
            </button>
          ` : ''}
          ${v.status !== 'rejected' ? `
            <button class="admin-action-btn reject" data-action="reject" data-id="${v.id}" title="Reject">
              <i data-lucide="x" style="width:16px;height:16px;"></i>
            </button>
          ` : ''}
          <button class="admin-action-btn edit" data-action="edit" data-id="${v.id}" title="View/Edit">
            <i data-lucide="pencil" style="width:16px;height:16px;"></i>
          </button>
          ${v.status !== 'flagged' ? `
            <button class="admin-action-btn flag" data-action="flag" data-id="${v.id}" title="Flag">
              <i data-lucide="flag" style="width:16px;height:16px;"></i>
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function bindQueueEvents(container, vendors) {
  // Tab switching
  container.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      currentTab = tab.dataset.tab;
      selectedIds.clear();
      await renderQueue(container);
    });
  });

  // Search
  const searchInput = container.querySelector('#queue-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      container.querySelectorAll('.admin-vendor-card').forEach(card => {
        const name = card.querySelector('.admin-vendor-name')?.textContent.toLowerCase() || '';
        const meta = card.querySelector('.admin-vendor-meta')?.textContent.toLowerCase() || '';
        card.style.display = (name.includes(q) || meta.includes(q)) ? '' : 'none';
      });
    });
  }

  // Select all
  const selectAll = container.querySelector('#queue-select-all');
  if (selectAll) {
    selectAll.addEventListener('change', () => {
      const checks = container.querySelectorAll('.vendor-check');
      checks.forEach(c => {
        c.checked = selectAll.checked;
        if (selectAll.checked) selectedIds.add(c.dataset.id);
        else selectedIds.delete(c.dataset.id);
      });
      updateBulkBar(container);
    });
  }

  // Individual checks
  container.querySelectorAll('.vendor-check').forEach(c => {
    c.addEventListener('change', () => {
      if (c.checked) selectedIds.add(c.dataset.id);
      else selectedIds.delete(c.dataset.id);
      updateBulkBar(container);
    });
  });

  // Bulk approve
  container.querySelector('#bulk-approve')?.addEventListener('click', async () => {
    for (const id of selectedIds) await store.approveVendor(id);
    showAdminToast(`${selectedIds.size} vendor(s) approved`);
    selectedIds.clear();
    await renderQueue(container);
  });

  // Bulk reject
  container.querySelector('#bulk-reject')?.addEventListener('click', async () => {
    const reason = prompt('Reason for rejection (optional):') || '';
    for (const id of selectedIds) await store.rejectVendor(id, reason);
    showAdminToast(`${selectedIds.size} vendor(s) rejected`, 'error');
    selectedIds.clear();
    await renderQueue(container);
  });

  // Action buttons
  container.querySelectorAll('.admin-action-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const id = btn.dataset.id;

      switch (action) {
        case 'approve':
          await store.approveVendor(id);
          showAdminToast('Vendor approved');
          await renderQueue(container);
          break;
        case 'reject': {
          const reason = prompt('Reason for rejection (optional):') || '';
          await store.rejectVendor(id, reason);
          showAdminToast('Vendor rejected', 'error');
          await renderQueue(container);
          break;
        }
        case 'flag': {
          const reason = prompt('Reason for flagging:') || 'Flagged by admin';
          await store.flagVendor(id, reason);
          showAdminToast('Vendor flagged', 'warning');
          await renderQueue(container);
          break;
        }
        case 'edit':
          await showDetailModal(container, id);
          break;
      }
    });
  });

  // Vendor name click => detail modal
  container.querySelectorAll('.admin-vendor-name').forEach(el => {
    el.addEventListener('click', async () => {
      await showDetailModal(container, el.dataset.id);
    });
  });
}

function updateBulkBar(container) {
  const count = selectedIds.size;
  const countEl = container.querySelector('#bulk-count');
  if (countEl) countEl.textContent = `${count} selected`;

  const approveBtn = container.querySelector('#bulk-approve');
  const rejectBtn = container.querySelector('#bulk-reject');
  if (approveBtn) approveBtn.disabled = count === 0;
  if (rejectBtn) rejectBtn.disabled = count === 0;
}

async function showDetailModal(container, vendorId) {
  const v = await store.getVendor(vendorId);
  if (!v) return;

  const name = v.businessName || v.name || 'Unnamed';
  const quality = v.vendorQualityScore || 0;
  const qualityColor = quality < 30 ? '#EF4444' : quality < 60 ? '#F59E0B' : '#22C55E';

  // Remove any existing modal
  document.getElementById('admin-detail-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'admin-detail-modal';
  modal.className = 'admin-modal-overlay';
  modal.innerHTML = `
    <div class="admin-modal">
      <div class="admin-modal-header">
        <h2>${name}</h2>
        <button class="admin-modal-close" id="close-detail-modal">
          <i data-lucide="x" style="width:20px;height:20px;"></i>
        </button>
      </div>
      <div class="admin-modal-body">
        <div class="admin-detail-grid">
          <div class="admin-detail-section">
            <h4><i data-lucide="info" style="width:14px;height:14px;"></i> Basic Info</h4>
            <div class="admin-detail-row"><span>Category</span><span>${v.category || '—'}</span></div>
            <div class="admin-detail-row"><span>Subcategory</span><span>${v.subcategory || '—'}</span></div>
            <div class="admin-detail-row"><span>City</span><span>${v.city || '—'}</span></div>
            <div class="admin-detail-row"><span>Region</span><span>${v.region || '—'}</span></div>
            <div class="admin-detail-row"><span>Address</span><span>${v.address || '—'}</span></div>
            <div class="admin-detail-row"><span>Status</span><span class="admin-status-badge ${v.status === 'approved' ? 'approved' : v.status === 'rejected' ? 'rejected' : v.status === 'flagged' ? 'flagged' : 'pending'}">${v.status?.replace('_', ' ') || 'pending'}</span></div>
          </div>
          <div class="admin-detail-section">
            <h4><i data-lucide="phone" style="width:14px;height:14px;"></i> Contact</h4>
            <div class="admin-detail-row"><span>Phone</span><span>${v.phone || '—'}</span></div>
            <div class="admin-detail-row"><span>WhatsApp</span><span>${v.whatsapp || '—'}</span></div>
            <div class="admin-detail-row"><span>Email</span><span>${v.email || '—'}</span></div>
            <div class="admin-detail-row"><span>Website</span><span>${v.website || '—'}</span></div>
            <div class="admin-detail-row"><span>Instagram</span><span>${v.instagram || '—'}</span></div>
            <div class="admin-detail-row"><span>Facebook</span><span>${v.facebook || '—'}</span></div>
          </div>
        </div>
        <div class="admin-detail-section">
          <h4><i data-lucide="file-text" style="width:14px;height:14px;"></i> Description</h4>
          <p class="admin-detail-desc">${v.description || 'No description provided.'}</p>
        </div>
        <div class="admin-detail-section">
          <h4><i data-lucide="gauge" style="width:14px;height:14px;"></i> Quality Score</h4>
          <div class="admin-quality-meter" style="max-width:300px;">
            <div class="admin-quality-meter-track">
              <div class="admin-quality-meter-fill" style="width: ${quality}%; background: ${qualityColor};"></div>
            </div>
            <span class="admin-quality-meter-label" style="color:${qualityColor};font-weight:700;">${quality}/100</span>
          </div>
        </div>
        ${v.notes ? `
          <div class="admin-detail-section">
            <h4><i data-lucide="message-square" style="width:14px;height:14px;"></i> Notes</h4>
            <p class="admin-detail-desc">${v.notes}</p>
          </div>
        ` : ''}
      </div>
      <div class="admin-modal-footer">
        ${v.status !== 'approved' ? `<button class="admin-btn admin-btn-success" id="modal-approve"><i data-lucide="check" style="width:14px;height:14px;"></i> Approve</button>` : ''}
        ${v.status !== 'rejected' ? `<button class="admin-btn admin-btn-danger" id="modal-reject"><i data-lucide="x" style="width:14px;height:14px;"></i> Reject</button>` : ''}
        <button class="admin-btn admin-btn-outline" id="modal-delete"><i data-lucide="trash-2" style="width:14px;height:14px;"></i> Delete</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  refreshIcons();

  // Bind modal events
  modal.querySelector('#close-detail-modal')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  modal.querySelector('#modal-approve')?.addEventListener('click', async () => {
    await store.approveVendor(vendorId);
    showAdminToast('Vendor approved');
    modal.remove();
    await renderQueue(container);
  });

  modal.querySelector('#modal-reject')?.addEventListener('click', async () => {
    const reason = prompt('Reason for rejection:') || '';
    await store.rejectVendor(vendorId, reason);
    showAdminToast('Vendor rejected', 'error');
    modal.remove();
    await renderQueue(container);
  });

  modal.querySelector('#modal-delete')?.addEventListener('click', async () => {
    if (confirm(`Delete "${name}" permanently?`)) {
      await store.deleteVendor(vendorId);
      showAdminToast('Vendor deleted', 'error');
      modal.remove();
      await renderQueue(container);
    }
  });
}
