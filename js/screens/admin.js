import { supabase } from '../lib/supabase.js';
import { icons, refreshIcons, showToast } from '../app.js';
import { escapeHtml, escapeAttr, safeCssColor } from '../lib/sanitize.js';

export async function renderAdminScreen(container) {
  const { data: { session } } = await supabase.auth.getSession();
  const role = session?.user?.app_metadata?.role || session?.user?.user_metadata?.role;

  if (role !== 'admin') {
    container.innerHTML = `
      <div class="screen-header">
        <h1 class="screen-title">Moderation Queue</h1>
      </div>
      <div class="empty-state">
        ${icons.shield}
        <h3>Admin Access Required</h3>
        <p>You need an admin account to review vendor submissions.</p>
      </div>
    `;
    return;
  }

  const { data: drafts, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('status', 'pending_review')
    .neq('verificationStatus', 'rejected');
    
  if (error) {
    console.error('Error fetching drafts:', error);
  }

  container.innerHTML = `
    <div class="screen-header">
      <h1 class="screen-title">Moderation Queue</h1>
    </div>
    
    <div class="screen-content" style="padding-bottom: 100px;">
      <div style="background: var(--primary-50); border: 1px solid var(--primary-200); padding: var(--space-3); border-radius: var(--radius-lg); margin-bottom: var(--space-4);">
        <h3 style="color: var(--primary-700); margin-bottom: var(--space-1); display: flex; align-items: center; gap: var(--space-2);">
          ${icons.shield} Admin Mode Active
        </h3>
        <p style="color: var(--primary-600); font-size: var(--text-sm);">
          Review scraped vendors before they go live on the platform.
        </p>
      </div>

      <div class="draft-list">
        ${(drafts || []).length === 0 ? `
          <div style="text-align: center; padding: var(--space-8) 0; color: var(--text-tertiary);">
            <div style="margin-bottom: var(--space-3);">${icons.checkCircle}</div>
            <p>The moderation queue is empty.</p>
          </div>
        ` : drafts.map(v => `
          <div class="draft-card" id="draft-${escapeAttr(v.id)}" style="background: white; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: var(--space-3); margin-bottom: var(--space-3); box-shadow: var(--shadow-sm);">
            <div style="display: flex; gap: var(--space-3); margin-bottom: var(--space-3);">
              <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: ${safeCssColor(v.logoGradient, 'var(--primary-100)')}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                ${escapeHtml(v.logoInitials || (v.businessName || v.name || '?').substring(0, 2).toUpperCase())}
              </div>
              <div style="flex: 1;">
                <h3 style="margin: 0; font-size: var(--text-md); font-weight: var(--font-bold);">${escapeHtml(v.businessName || v.name || 'Unnamed Vendor')}</h3>
                <p style="margin: 0; font-size: var(--text-xs); color: var(--text-tertiary);">${escapeHtml(v.category || 'Uncategorized')}</p>
                <div style="margin-top: 4px; font-size: var(--text-xs); color: var(--text-secondary); display: flex; align-items: center; gap: 4px;">
                  <i data-lucide="map-pin" style="width: 12px; height: 12px;"></i> ${escapeHtml(v.address || 'Unknown Location')}
                </div>
              </div>
              <span class="badge-pill" style="background: var(--warning-100); color: var(--warning-700); height: fit-content;">Draft</span>
            </div>
            
            <div style="background: var(--bg-secondary); padding: var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-3); font-size: var(--text-sm); color: var(--text-secondary);">
              <strong>Description:</strong> ${escapeHtml(v.description || 'No description generated.')}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2);">
              <button class="btn btn-secondary reject-btn" data-id="${escapeAttr(v.id)}" style="border-color: var(--error-200); color: var(--error-600); background: var(--error-50);">Reject</button>
              <button class="btn btn-primary approve-btn" data-id="${escapeAttr(v.id)}">Approve & Publish</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  refreshIcons();

  // Attach events
  container.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      const { error } = await supabase
        .from('vendors')
        .update({ verificationStatus: 'verified', status: 'approved' })
        .eq('id', id);

      if (!error) {
        document.getElementById(`draft-${id}`)?.remove();
        showToast(`Vendor has been published.`);
        if (container.querySelectorAll('.draft-card').length === 0) {
          renderAdminScreen(container);
        }
      }
    });
  });

  container.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      const { error } = await supabase
        .from('vendors')
        .update({ verificationStatus: 'rejected', status: 'rejected' })
        .eq('id', id);

      if (!error) {
        document.getElementById(`draft-${id}`)?.remove();
        showToast(`Vendor was rejected.`);
        if (container.querySelectorAll('.draft-card').length === 0) {
          renderAdminScreen(container);
        }
      }
    });
  });
}
