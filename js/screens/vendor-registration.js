// ============================================
// THE VENDOR — Vendor Registration Wizard
// 4-step onboarding for new vendors
// ============================================

import { CATEGORIES } from '../data.js';
import { supabase } from '../lib/supabase.js';
import { navigateTo, refreshIcons, showToast } from '../app.js';
import { escapeHtml, escapeAttr, safeHexColor } from '../lib/sanitize.js';

let currentStep = 0;
const totalSteps = 4;
const formData = {
  businessName: '',
  category: '',
  description: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  services: [],
  coverColor: '#1A6FEF',
  logoInitials: '',
};

export function renderVendorRegistration(container) {
  container.innerHTML = `
    <div class="reg-screen">
      <div class="reg-header">
        <button class="reg-back-btn" id="reg-back">
          <i data-lucide="arrow-left"></i>
        </button>
        <div class="reg-progress">
          <div class="reg-progress-bar" style="width: ${((currentStep + 1) / totalSteps) * 100}%"></div>
        </div>
        <span class="reg-step-label">Step ${currentStep + 1} of ${totalSteps}</span>
      </div>

      <div class="reg-body" id="reg-body">
        <!-- Step content injected here -->
      </div>

      <div class="reg-footer">
        ${currentStep > 0 ? '<button class="btn btn-secondary reg-prev-btn" id="reg-prev">Previous</button>' : '<div></div>'}
        <button class="btn btn-primary reg-next-btn" id="reg-next">
          ${currentStep === totalSteps - 1 ? 'Submit Application' : 'Continue'}
        </button>
      </div>
    </div>
  `;

  renderStep(document.getElementById('reg-body'));

  // Back button (exit)
  document.getElementById('reg-back')?.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      renderVendorRegistration(container);
    } else {
      currentStep = 0;
      navigateTo('profile');
    }
  });

  // Previous
  document.getElementById('reg-prev')?.addEventListener('click', () => {
    currentStep--;
    renderVendorRegistration(container);
  });

  // Next
  document.getElementById('reg-next')?.addEventListener('click', async () => {
    if (!validateStep()) return;
    saveStepData();

    if (currentStep < totalSteps - 1) {
      currentStep++;
      renderVendorRegistration(container);
    } else {
      // Submit
      const btn = document.getElementById('reg-next');
      const originalText = btn.textContent;
      btn.textContent = 'Submitting...';
      btn.disabled = true;

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          showToast('Please sign in to register a business', 'error');
          navigateTo('auth');
          return;
        }

        const vendorId = formData.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
        
        const { error: vendorError } = await supabase.from('vendors').insert({
          id: vendorId,
          user_id: session.user.id,
          businessName: formData.businessName,
          category: formData.category,
          description: formData.description,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          email: formData.email,
          address: formData.address,
          coverGradient: formData.coverColor,
          logoInitials: formData.logoInitials,
          verificationStatus: 'draft',
          status: 'pending_review'
        });

        if (vendorError) throw vendorError;

        if (formData.services.length > 0) {
          const servicesData = formData.services.map(s => ({
            vendor_id: vendorId,
            name: s.name,
            description: s.description,
            price: s.price
          }));
          const { error: svcError } = await supabase.from('services').insert(servicesData);
          if (svcError) throw svcError;
        }

        currentStep = 0;
        showToast('Application submitted! We will review your business profile.', 'success');
        navigateTo('profile');
      } catch (e) {
        console.error('Registration error:', e);
        showToast('Error submitting application. Please try again.', 'error');
        btn.textContent = originalText;
        btn.disabled = false;
      }
    }
  });

  refreshIcons();
}

function renderStep(body) {
  if (!body) return;

  switch (currentStep) {
    case 0:
      body.innerHTML = `
        <div class="reg-step">
          <div class="reg-step-icon">
            <i data-lucide="briefcase" style="width: 32px; height: 32px; color: var(--primary-500);"></i>
          </div>
          <h2 class="reg-step-title">Business Basics</h2>
          <p class="reg-step-desc">Tell us about your business</p>

          <div class="form-group">
            <label class="form-label">Business Name</label>
            <input class="form-input" type="text" id="reg-biz-name" placeholder="e.g. VisionHaus Media" value="${escapeAttr(formData.businessName)}" />
          </div>

          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-input form-select" id="reg-category">
              <option value="">Select a category</option>
              ${CATEGORIES.map(c => `<option value="${escapeAttr(c.id)}" ${formData.category === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-input" id="reg-description" placeholder="Describe what your business does..." rows="3">${escapeHtml(formData.description)}</textarea>
          </div>
        </div>
      `;
      break;

    case 1:
      body.innerHTML = `
        <div class="reg-step">
          <div class="reg-step-icon">
            <i data-lucide="map-pin" style="width: 32px; height: 32px; color: var(--primary-500);"></i>
          </div>
          <h2 class="reg-step-title">Contact & Location</h2>
          <p class="reg-step-desc">How can customers reach you?</p>

          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <div class="auth-input-wrap">
              <span class="auth-phone-prefix">+264</span>
              <input class="form-input auth-input auth-phone-input" type="tel" id="reg-phone" placeholder="81 234 5678" value="${escapeAttr(formData.phone)}" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">WhatsApp (if different)</label>
            <div class="auth-input-wrap">
              <span class="auth-phone-prefix">+264</span>
              <input class="form-input auth-input auth-phone-input" type="tel" id="reg-whatsapp" placeholder="81 234 5678" value="${escapeAttr(formData.whatsapp)}" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Business Email</label>
            <input class="form-input" type="email" id="reg-email" placeholder="info@mybusiness.na" value="${escapeAttr(formData.email)}" />
          </div>

          <div class="form-group">
            <label class="form-label">Business Address</label>
            <input class="form-input" type="text" id="reg-address" placeholder="e.g. Plot 23, Windhoek West" value="${escapeAttr(formData.address)}" />
          </div>

          <div class="reg-map-placeholder">
            <i data-lucide="map" style="width: 24px; height: 24px; color: var(--text-tertiary);"></i>
            <span>Tap to pin your location on the map</span>
          </div>
        </div>
      `;
      break;

    case 2:
      body.innerHTML = `
        <div class="reg-step">
          <div class="reg-step-icon">
            <i data-lucide="tag" style="width: 32px; height: 32px; color: var(--primary-500);"></i>
          </div>
          <h2 class="reg-step-title">Services & Pricing</h2>
          <p class="reg-step-desc">Add the services you offer</p>

          <div id="reg-services-list">
            ${formData.services.length > 0 ? formData.services.map((s, i) => renderServiceCard(s, i)).join('') : ''}
          </div>

          <button class="reg-add-service-btn" id="reg-add-service">
            <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
            Add a Service
          </button>

          <div class="reg-service-form hidden" id="reg-service-form">
            <div class="form-group">
              <label class="form-label">Service Name</label>
              <input class="form-input" type="text" id="reg-svc-name" placeholder="e.g. Wedding Photography" />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <input class="form-input" type="text" id="reg-svc-desc" placeholder="Brief description" />
            </div>
            <div class="form-group">
              <label class="form-label">Starting Price</label>
              <div class="auth-input-wrap">
                <span class="auth-phone-prefix" style="font-size: 13px;">N$</span>
                <input class="form-input auth-input auth-phone-input" type="number" id="reg-svc-price" placeholder="0" />
              </div>
            </div>
            <div class="reg-service-form-actions">
              <button class="btn btn-secondary btn-sm" id="reg-svc-cancel">Cancel</button>
              <button class="btn btn-primary btn-sm" id="reg-svc-save">Save Service</button>
            </div>
          </div>
        </div>
      `;

      // Add service toggle
      document.getElementById('reg-add-service')?.addEventListener('click', () => {
        document.getElementById('reg-service-form')?.classList.remove('hidden');
        document.getElementById('reg-add-service')?.classList.add('hidden');
      });

      document.getElementById('reg-svc-cancel')?.addEventListener('click', () => {
        document.getElementById('reg-service-form')?.classList.add('hidden');
        document.getElementById('reg-add-service')?.classList.remove('hidden');
      });

      document.getElementById('reg-svc-save')?.addEventListener('click', () => {
        const name = document.getElementById('reg-svc-name')?.value;
        const desc = document.getElementById('reg-svc-desc')?.value;
        const price = document.getElementById('reg-svc-price')?.value;
        if (!name) return;

        formData.services.push({ name, description: desc || '', price: price ? `From N$${price}` : 'Contact for pricing' });
        renderStep(body);
        refreshIcons();
      });

      // Delete service
      body.querySelectorAll('.reg-svc-delete')?.forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index);
          formData.services.splice(idx, 1);
          renderStep(body);
          refreshIcons();
        });
      });
      break;

    case 3:
      body.innerHTML = `
        <div class="reg-step">
          <div class="reg-step-icon">
            <i data-lucide="image" style="width: 32px; height: 32px; color: var(--primary-500);"></i>
          </div>
          <h2 class="reg-step-title">Photos & Branding</h2>
          <p class="reg-step-desc">Make your profile stand out</p>

          <div class="form-group">
            <label class="form-label">Cover Photo</label>
            <div class="reg-upload-zone" id="reg-cover-upload">
              <i data-lucide="upload" style="width: 24px; height: 24px; color: var(--text-tertiary);"></i>
              <span>Tap to upload cover image</span>
              <span class="reg-upload-hint">Recommended: 1200 x 400px</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Logo / Profile Photo</label>
            <div class="reg-logo-upload" id="reg-logo-upload">
              <div class="reg-logo-preview" style="background: linear-gradient(135deg, ${safeHexColor(formData.coverColor)}, ${safeHexColor(formData.coverColor)}99);">
                ${escapeHtml(formData.logoInitials || (formData.businessName ? formData.businessName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'TV'))}
              </div>
              <div>
                <div class="reg-logo-label">Business Initials</div>
                <div class="reg-logo-hint">Or tap to upload a logo</div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Brand Color</label>
            <div class="reg-color-grid">
              ${['#1A6FEF', '#22C55E', '#D4A853', '#A855F7', '#EC4899', '#F97316', '#EF4444', '#06B6D4'].map(c => `
                <button class="reg-color-swatch ${formData.coverColor === c ? 'active' : ''}" style="background: ${c};" data-color="${c}"></button>
              `).join('')}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Portfolio Gallery</label>
            <div class="reg-gallery-grid">
              <div class="reg-gallery-add">
                <i data-lucide="plus" style="width: 20px; height: 20px; color: var(--text-tertiary);"></i>
              </div>
              <div class="reg-gallery-add">
                <i data-lucide="plus" style="width: 20px; height: 20px; color: var(--text-tertiary);"></i>
              </div>
              <div class="reg-gallery-add">
                <i data-lucide="plus" style="width: 20px; height: 20px; color: var(--text-tertiary);"></i>
              </div>
            </div>
          </div>

          <div class="reg-review-notice">
            <i data-lucide="info" style="width: 16px; height: 16px;"></i>
            <span>Your profile will be reviewed within 24-48 hours before going live.</span>
          </div>
        </div>
      `;

      // Color picker
      body.querySelectorAll('.reg-color-swatch')?.forEach(swatch => {
        swatch.addEventListener('click', () => {
          formData.coverColor = swatch.dataset.color;
          body.querySelectorAll('.reg-color-swatch').forEach(s => s.classList.remove('active'));
          swatch.classList.add('active');
          const preview = body.querySelector('.reg-logo-preview');
          if (preview) preview.style.background = `linear-gradient(135deg, ${safeHexColor(formData.coverColor)}, ${safeHexColor(formData.coverColor)}99)`;
        });
      });
      break;
  }

  refreshIcons();
}

function renderServiceCard(service, index) {
  return `
    <div class="reg-service-card">
      <div class="reg-svc-info">
        <div class="reg-svc-name">${escapeHtml(service.name)}</div>
        <div class="reg-svc-price">${escapeHtml(service.price)}</div>
      </div>
      <button class="reg-svc-delete" data-index="${index}">
        <i data-lucide="x" style="width: 16px; height: 16px;"></i>
      </button>
    </div>
  `;
}

function validateStep() {
  switch (currentStep) {
    case 0:
      const name = document.getElementById('reg-biz-name')?.value;
      const cat = document.getElementById('reg-category')?.value;
      if (!name) { shakeEl('reg-biz-name'); return false; }
      if (!cat) { shakeEl('reg-category'); return false; }
      return true;
    case 1:
      const phone = document.getElementById('reg-phone')?.value;
      if (!phone) { shakeEl('reg-phone'); return false; }
      return true;
    default:
      return true;
  }
}

function saveStepData() {
  switch (currentStep) {
    case 0:
      formData.businessName = document.getElementById('reg-biz-name')?.value || '';
      formData.category = document.getElementById('reg-category')?.value || '';
      formData.description = document.getElementById('reg-description')?.value || '';
      formData.logoInitials = formData.businessName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      break;
    case 1:
      formData.phone = document.getElementById('reg-phone')?.value || '';
      formData.whatsapp = document.getElementById('reg-whatsapp')?.value || '';
      formData.email = document.getElementById('reg-email')?.value || '';
      formData.address = document.getElementById('reg-address')?.value || '';
      break;
  }
}

function shakeEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = 'var(--error-500)';
  el.classList.add('shake');
  setTimeout(() => {
    el.classList.remove('shake');
    el.style.borderColor = '';
  }, 600);
}
