import { supabase } from '../lib/supabase.js';
import { icons } from '../app.js';

export async function renderAdminScreen(container) {
  const { data: drafts, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('verified', false)
    .neq('verified_level', 'rejected');
    
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
        ${drafts.length === 0 ? `
          <div style="text-align: center; padding: var(--space-8) 0; color: var(--text-tertiary);">
            <div style="margin-bottom: var(--space-3);">${icons.checkCircle}</div>
            <p>The moderation queue is empty.</p>
          </div>
        ` : drafts.map(v => `
          <div class="draft-card" id="draft-${v.id}" style="background: white; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: var(--space-3); margin-bottom: var(--space-3); box-shadow: var(--shadow-sm);">
            <div style="display: flex; gap: var(--space-3); margin-bottom: var(--space-3);">
              <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: ${v.logoGradient || 'var(--primary-100)'}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                ${v.logoInitials || v.name.substring(0, 2).toUpperCase()}
              </div>
              <div style="flex: 1;">
                <h3 style="margin: 0; font-size: var(--text-md); font-weight: var(--font-bold);">${v.name}</h3>
                <p style="margin: 0; font-size: var(--text-xs); color: var(--text-tertiary);">${v.category_name || v.category}</p>
                <div style="margin-top: 4px; font-size: var(--text-xs); color: var(--text-secondary); display: flex; align-items: center; gap: 4px;">
                  <i data-lucide="map-pin" style="width: 12px; height: 12px;"></i> ${v.address || 'Unknown Location'}
                </div>
              </div>
              <span class="badge-pill" style="background: var(--warning-100); color: var(--warning-700); height: fit-content;">Draft</span>
            </div>
            
            <div style="background: var(--bg-secondary); padding: var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-3); font-size: var(--text-sm); color: var(--text-secondary);">
              <strong>Description:</strong> ${v.description || 'No description generated.'}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2);">
              <button class="btn btn-secondary reject-btn" data-id="${v.id}" style="border-color: var(--error-200); color: var(--error-600); background: var(--error-50);">Reject</button>
              <button class="btn btn-primary approve-btn" data-id="${v.id}">Approve & Publish</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Hydrate Lucide icons
  import('../app.js').then(module => {
    if (module.refreshIcons) module.refreshIcons();
  });

  // Attach events
  container.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      const { error } = await supabase
        .from('vendors')
        .update({ verified: true, verified_level: 'standard' })
        .eq('id', id);

      if (!error) {
        document.getElementById(`draft-${id}`)?.remove();
        import('../app.js').then(module => {
          module.showToast(`Vendor has been published.`);
          if (container.querySelectorAll('.draft-card').length === 0) {
            renderAdminScreen(container);
          }
        });
      }
    });
  });

  container.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      const { error } = await supabase
        .from('vendors')
        .update({ verified: false, verified_level: 'rejected' })
        .eq('id', id);

      if (!error) {
        document.getElementById(`draft-${id}`)?.remove();
        import('../app.js').then(module => {
          module.showToast(`Vendor was rejected.`);
          if (container.querySelectorAll('.draft-card').length === 0) {
            renderAdminScreen(container);
          }
        });
      }
    });
  });
}
