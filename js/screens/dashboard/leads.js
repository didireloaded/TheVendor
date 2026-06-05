// ============================================
// THE VENDOR — Dashboard Leads Screen
// ============================================

import { supabase } from '../../lib/supabase.js';

export async function renderDashboardLeads(container) {
  container.innerHTML = `
    <div class="dash-card-header" style="margin-bottom: var(--space-3);">
      <h2 class="dash-card-title" style="font-size: 20px;">Leads Center</h2>
    </div>
    <div style="text-align: center; padding: 40px 0; color: var(--text-tertiary);">
      <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>
      <p>Loading leads...</p>
    </div>
  `;

  // Hydrate Lucide icons for loader
  import('../../app.js').then(module => {
    if (module.refreshIcons) module.refreshIcons();
  });

  // Fetch live leads
  const { data: leadsData, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
  }

  const leads = leadsData || [];

  container.innerHTML = `
    <div class="dash-card-header" style="margin-bottom: var(--space-3);">
      <h2 class="dash-card-title" style="font-size: 20px;">Leads Center</h2>
    </div>

    <!-- Filters -->
    <div class="dash-filters">
      <button class="dash-filter-btn active">All Leads</button>
      <button class="dash-filter-btn">New <span style="background: var(--primary-500); color: white; padding: 2px 6px; border-radius: 10px; font-size: 9px; margin-left: 4px;">1</span></button>
      <button class="dash-filter-btn">Contacted</button>
      <button class="dash-filter-btn">Quoted</button>
      <button class="dash-filter-btn">Booked</button>
    </div>

    <div style="display: flex; flex-direction: column; gap: var(--space-3); padding-bottom: var(--space-4);">
      ${leads.length === 0 ? `
        <div style="text-align: center; padding: 40px 0; color: var(--text-tertiary);">
          <div style="margin-bottom: 12px;"><i data-lucide="inbox" style="width: 48px; height: 48px;"></i></div>
          <p>No quote requests yet.</p>
        </div>
      ` : leads.map(lead => renderLeadCard(lead)).join('')}
    </div>
  `;

  // Hydrate Lucide icons
  import('../../app.js').then(module => {
    if (module.refreshIcons) module.refreshIcons();
  });
}

function renderLeadCard(lead) {
  let statusClass = 'status-new';
  if (lead.status === 'Contacted') statusClass = 'status-contacted';
  if (lead.status === 'Quoted') statusClass = 'status-quoted';
  if (lead.status === 'Booked') statusClass = 'status-booked';
  if (lead.status === 'Completed') statusClass = 'status-completed';

  const isHighQuality = lead.quality === 'High' ? 'high-quality' : '';

  return `
    <div class="lead-card ${isHighQuality}">
      <div class="lead-header">
        <div>
          <div class="lead-customer">${lead.customer_name}</div>
          <div class="data-sub">${lead.customer_contact} · ${new Date(lead.created_at).toLocaleDateString()}</div>
        </div>
        <div class="lead-badge ${statusClass}">
          ${lead.status}
        </div>
      </div>
      
      <div class="lead-details">
        <div class="lead-detail-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          ${lead.service_requested || 'General Request'}
        </div>
        <div class="lead-detail-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${lead.location || 'Not specified'}
        </div>
        <div class="lead-detail-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span style="color: var(--green-600); font-weight: 600;">${lead.budget || 'Not specified'}</span>
        </div>
        ${lead.message ? `
        <div class="lead-detail-item" style="margin-top: 8px; font-style: italic; color: var(--text-secondary);">
          "${lead.message}"
        </div>
        ` : ''}
      </div>

      <div class="lead-actions">
        <button class="lead-btn">View Details</button>
        <button class="lead-btn primary" style="background: #25D366; border-color: #25D366;">
          <svg viewBox="0 0 24 24" fill="currentColor" style="width:14px; height:14px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Reply
      </button>
      </div>
    </div>
  `;
}
