import { icons, toggleFavorite, isFavorite } from './app.js';

export function renderVendorCardCompact(vendor, index) {
  const fav = isFavorite(vendor.id);
  return `
    <div class="vendor-card-compact" data-vendor-id="${vendor.id}" style="animation-delay: ${index * 80}ms">
      <div class="card-thumb" style="background: ${vendor.coverImage ? `url('${vendor.coverImage}') center/cover` : vendor.coverGradient};">${vendor.logoImage ? '' : vendor.logoInitials}</div>
      <div class="card-content">
        <div class="card-name">
          ${vendor.name}
          ${vendor.verified ? `<span class="badge-verified ${vendor.verifiedLevel}">${icons.verifiedBadge}</span>` : ''}
        </div>
        <span class="card-category-text">${vendor.categoryName}</span>
        <div class="card-meta">
          <span class="rating">
            <span class="star">${icons.star}</span>
            <span class="rating-text">${vendor.rating}</span>
            <span class="rating-count">(${vendor.reviewCount})</span>
          </span>
          <span class="distance">${icons.location} ${vendor.distance}km</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="card-favorite ${fav ? 'active' : ''}" data-fav-id="${vendor.id}" style="position:static; background: var(--gray-50);">
          ${icons.heart}
        </button>
        <span class="badge-pill ${vendor.isOpen ? 'badge-open' : 'badge-closed'}" style="font-size: 10px;">${vendor.isOpen ? 'Open' : 'Closed'}</span>
      </div>
    </div>
  `;
}

export function renderVendorCardLarge(vendor, index) {
  const fav = isFavorite(vendor.id);
  return `
    <div class="vendor-card-large" data-vendor-id="${vendor.id}" style="animation-delay: ${index * 80}ms">
      <div class="card-image" style="background: ${vendor.coverImage ? `url('${vendor.coverImage}') center/cover` : vendor.coverGradient};">
        <span class="card-category">${vendor.categoryName.split(' ')[0]}</span>
        <button class="card-favorite ${fav ? 'active' : ''}" data-fav-id="${vendor.id}">
          ${icons.heart}
        </button>
      </div>
      <div class="card-body">
        <div class="card-logo" style="background: ${vendor.logoImage ? `url('${vendor.logoImage}') center/cover` : vendor.logoGradient};">${vendor.logoImage ? '' : vendor.logoInitials}</div>
        <div class="card-info">
          <div class="card-name">
            ${vendor.name}
            ${vendor.verified ? `<span class="badge-verified ${vendor.verifiedLevel}">${icons.verifiedBadge}</span>` : ''}
          </div>
          <div class="card-meta">
            <span class="rating">
              <span class="star">${icons.star}</span>
              <span class="rating-text">${vendor.rating}</span>
              <span class="rating-count">(${vendor.reviewCount})</span>
            </span>
            <span class="distance">${icons.location} ${vendor.distance}km</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderEmptyState(iconName, title, message) {
  return `
    <div class="empty-state">
      <i data-lucide="${iconName}" style="width: 80px; height: 80px; color: var(--gray-300); margin-bottom: var(--space-5);"></i>
      <h3>${title}</h3>
      <p>${message}</p>
    </div>
  `;
}

export function renderSkeletonList(count = 3) {
  return Array.from({ length: count }).map(() => `
    <div class="vendor-card-compact" style="border: none; box-shadow: none;">
      <div class="card-thumb skeleton"></div>
      <div class="card-content">
        <div class="skeleton-text w-70 skeleton"></div>
        <div class="skeleton-text w-50 skeleton"></div>
      </div>
    </div>
  `).join('');
}

export function renderVendorCardGrid(vendor, index) {
  const fav = isFavorite(vendor.id);
  return `
    <div class="vendor-card-grid" data-vendor-id="${vendor.id}" style="animation-delay: ${index * 40}ms">
      <div class="grid-image" style="background: ${vendor.coverImage ? `url('${vendor.coverImage}') center/cover` : vendor.coverGradient};">
        <button class="card-favorite ${fav ? 'active' : ''}" data-fav-id="${vendor.id}">
          ${icons.heart}
        </button>
      </div>
      <div class="grid-body">
        <div class="grid-name">
          ${vendor.name}
          ${vendor.verified ? `<span class="badge-verified ${vendor.verifiedLevel}" style="display:inline-flex;">${icons.verifiedBadge}</span>` : ''}
        </div>
        <div class="grid-category">${vendor.categoryName}</div>
        <div class="grid-footer">
          <span class="grid-rating">${icons.star} ${vendor.rating}</span>
          <span class="grid-distance">${vendor.distance}km</span>
        </div>
      </div>
    </div>
  `;
}

export function renderMapDiscoveryCard(vendor) {
  return `
    <div class="discovery-card" data-vendor-id="${vendor.id}">
      <div class="card-cover" style="background: ${vendor.coverImage ? `url('${vendor.coverImage}') center/cover` : vendor.coverGradient};">
        <button class="card-save-btn">
           <i data-lucide="bookmark" style="width: 20px; height: 20px;"></i>
        </button>
      </div>
      <div class="card-logo" style="background: ${vendor.logoImage ? `url('${vendor.logoImage}') center/cover` : (vendor.coverImage ? `url('${vendor.coverImage}') center/cover` : vendor.coverGradient)};">${vendor.logoImage || vendor.coverImage ? '' : vendor.logoInitials}</div>
      <div class="card-content">
        <div class="card-header">
          <div class="card-name-row">
            <h3 class="card-name">${vendor.name}</h3>
            ${vendor.verified ? `<span class="badge-verified ${vendor.verifiedLevel}">${icons.verifiedBadge}</span>` : ''}
          </div>
          <div class="card-cat">${vendor.categoryName}</div>
        </div>
        <div class="card-meta">
          <span class="meta-rating"><i data-lucide="star" style="width: 14px; height: 14px; fill: currentColor; margin-right: 4px; vertical-align: middle;"></i> ${vendor.rating}</span>
          <span class="meta-dot">·</span>
          <span class="meta-distance">${vendor.distance}km</span>
        </div>
        <div class="card-status ${vendor.isOpen ? 'status-open' : 'status-closed'}">
          ${vendor.isOpen ? 'Open Now' : 'Closed'}
          ${vendor.isOpen ? '<span class="status-badge responding">Responds quickly</span>' : ''}
        </div>
        <div class="card-actions">
          <button class="btn-action whatsapp" onclick="event.stopPropagation()">WhatsApp</button>
          <button class="btn-action call" onclick="event.stopPropagation()">Call</button>
          <button class="btn-action primary" onclick="event.stopPropagation(); document.getElementById('app').dispatchEvent(new CustomEvent('openVendorProfile', { detail: { id: '${vendor.id}' } }))">Profile</button>
        </div>
      </div>
    </div>
  `;
}
