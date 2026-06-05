// ============================================
// THE VENDOR — Map Screen (Mapbox GL JS)
// ============================================

import { VENDORS, CATEGORIES } from '../data.js';
import { icons, refreshIcons } from '../app.js';
import { escapeHtml, escapeAttr, safeCssColor } from '../lib/sanitize.js';

let map = null;
let activeCategory = 'all';
let markersOnScreen = {};
let searchPlaceholderInterval = null;

// Mapbox Token (Provide via .env)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGV2IiwiYSI6ImNsaW11YnF1bjAwYzgzZm12cHRic3M4dGkifQ.dummy_token_for_testing';

export function renderMapScreen(container) {
  container.innerHTML = `
    <div class="screen-map">
      <div class="map-container" id="mapbox-map"></div>

      <!-- Floating Top Header -->
      <div class="map-floating-header">
        <div class="map-search-container">
          <div class="search-bar">
            ${icons.search}
            <input type="text" placeholder="Search vendors..." id="map-search-input" />
          </div>
          <button class="map-icon-btn" id="map-filter-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          </button>
        </div>

        <!-- Quick Filters -->
        <div class="map-quick-filters hide-scrollbar">
          <button class="filter-chip active" data-cat="all">All</button>
          ${CATEGORIES.map(c => `
            <button class="filter-chip" data-cat="${c.id}">${c.icon} ${c.name.split(' ')[0]}</button>
          `).join('')}
        </div>
      </div>

      <!-- Map Controls -->
      <div class="map-controls">
        <button class="map-btn map-near-me-btn" id="map-near-btn" title="Near Me">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
        </button>
        <button class="map-btn map-locate-btn" id="map-locate" title="My Location">
          ${icons.crosshair}
        </button>
      </div>

      <!-- Search Area Button -->
      <button class="map-area-btn" id="map-area-btn">
        ${icons.search} Search this area
      </button>

    </div>
  `;

  initMap();
  bindMapEvents(container);
  startSearchPlaceholderRotation();
}

function startSearchPlaceholderRotation() {
  const placeholders = ["Photographer near me", "Cake maker", "Mechanic", "Videographer", "DJ"];
  const input = document.getElementById('map-search-input');
  if (!input) return;

  let index = 0;
  searchPlaceholderInterval = setInterval(() => {
    if (document.activeElement !== input && input.value === '') {
      input.placeholder = placeholders[index];
      index = (index + 1) % placeholders.length;
    }
  }, 3000);
}

function initMap() {
  mapboxgl.accessToken = MAPBOX_TOKEN;

  map = new mapboxgl.Map({
    container: 'mapbox-map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [17.0658, -22.5609], // Windhoek
    zoom: 12,
    pitch: 45,
    attributionControl: false
  });

  map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

  map.on('load', () => {
    // Hide default POIs to reduce clutter
    const layers = map.getStyle().layers;
    for (const layer of layers) {
      if (layer.id.includes('poi') || layer.id.includes('transit')) {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
      }
    }

    // Add Heatmap layer source
    const geojson = getVendorsGeoJSON(VENDORS);
    
    map.addSource('vendors', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 60
    });

    // Subtle Heatmap layer for zoomed out view
    map.addLayer({
      id: 'vendors-heat',
      type: 'heatmap',
      source: 'vendors',
      maxzoom: 13,
      paint: {
        'heatmap-weight': 1,
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 10, 1, 13, 3],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(26,111,239,0)',
          0.2, 'rgba(26,111,239,0.2)',
          0.4, 'rgba(168,85,247,0.4)',
          0.6, 'rgba(236,72,153,0.6)',
          0.8, 'rgba(249,115,22,0.8)',
          1, 'rgba(239,68,68,1)'
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 15, 13, 40],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0.6, 13, 0]
      }
    });

    map.on('render', updateMarkers);
    updateMarkers();

    // Map drag event for "Search Area"
    map.on('dragend', () => {
      const btn = document.getElementById('map-area-btn');
      if (btn) btn.style.transform = 'translate(-50%, 0) scale(1)';
    });
  });
}

function getVendorsGeoJSON(vendorsData) {
  return {
    type: 'FeatureCollection',
    features: vendorsData
      .filter(v => Number.isFinite(Number(v.lng)) && Number.isFinite(Number(v.lat)))
      .map(v => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [Number(v.lng), Number(v.lat)] },
        properties: { ...v }
      }))
  };
}

function getCategoryColor(category) {
  const map = {
    'photography': '#1A6FEF', 'food': '#F97316', 'automotive': '#EF4444',
    'beauty': '#A855F7', 'events': '#EC4899', 'construction': '#78716C',
    'technology': '#06B6D4'
  };
  return map[category] || '#1A6FEF';
}

function getCategoryIcon(category) {
  const map = {
    'photography': 'camera', 'food': 'chef-hat', 'automotive': 'car',
    'beauty': 'sparkles', 'events': 'music', 'construction': 'hammer',
    'technology': 'monitor'
  };
  return map[category] || 'map-pin';
}

function updateMarkers() {
  if (!map.getSource('vendors')) return;

  const features = map.querySourceFeatures('vendors');
  const newMarkers = {};

  const zoom = map.getZoom();

  for (const feature of features) {
    const coords = feature.geometry.coordinates;
    const props = feature.properties;
    
    // Cluster ID or Vendor ID
    const id = props.cluster ? `cluster-${props.cluster_id}` : props.id;
    let marker = markersOnScreen[id];

    if (!marker) {
      const el = document.createElement('div');
      
      if (props.cluster) {
        // Area Cluster Card
        el.className = 'area-cluster-card';
        // Mock a category for the cluster based on random dominant (simplified)
        el.innerHTML = `
          <div class="area-cluster-title">
            <i data-lucide="map-pin"></i> ${props.point_count} Vendors
          </div>
          <div class="area-cluster-count">Explore Area</div>
        `;
        el.addEventListener('click', () => {
          map.flyTo({ center: coords, zoom: map.getZoom() + 2 });
        });
      } else {
        // Progressive Disclosure logic for individual vendors
        if (zoom > 14.5) {
          // Airbnb-style Pricing / Rating Pin
          el.className = 'price-pin';
          el.innerHTML = `
            ${escapeHtml((props.name || '').split(' ')[0])}
            <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ${escapeHtml(props.rating)}
          `;
        } else {
          // Custom SVG Category Pin
          el.className = 'elegant-pin';
          const color = getCategoryColor(props.category);
          el.style.backgroundColor = color;
          el.style.borderColor = 'white';
          el.innerHTML = `<div class="pin-inner" style="display:flex;align-items:center;justify-content:center;color:white;"><i data-lucide="${getCategoryIcon(props.category)}" style="width:10px;height:10px;"></i></div>`;
        }

        el.addEventListener('click', () => openVendorBottomSheet(props));
      }

      marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coords)
        .addTo(map);

      // Refresh lucide icons inside marker
      if (window.lucide) window.lucide.createIcons({ root: el });
    }

    newMarkers[id] = marker;
  }

  // Remove markers that are no longer visible
  for (const id in markersOnScreen) {
    if (!newMarkers[id]) markersOnScreen[id].remove();
  }

  markersOnScreen = newMarkers;
}

function openVendorBottomSheet(vendor) {
  // Center map slightly offset
  const lat = Number(vendor.lat);
  const lng = Number(vendor.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    map.flyTo({ center: [lng, lat - 0.01], zoom: 15, duration: 800 });
  }

  // Highlight marker
  document.querySelectorAll('.price-pin, .elegant-pin').forEach(el => el.classList.remove('active-pin'));
  const marker = markersOnScreen[vendor.id];
  if (marker) marker.getElement().classList.add('active-pin');

  const html = `
    <div class="vendor-preview-sheet">
      <div class="vendor-preview-header">
        <div class="vendor-preview-cover" style="background: ${safeCssColor(vendor.coverGradient)};">
           <div class="vendor-preview-logo" style="background: ${safeCssColor(vendor.logoGradient || vendor.coverGradient)}">${escapeHtml(vendor.logoInitials)}</div>
        </div>
        <div class="vendor-preview-info">
          <div class="vendor-preview-name">
            ${escapeHtml(vendor.name)} ${vendor.verified ? `<span style="color:var(--primary-500)">${icons.verifiedBadge}</span>` : ''}
          </div>
          <div class="vendor-preview-cat">${escapeHtml(vendor.categoryName)}</div>
          <div class="vendor-preview-meta">
            <span style="display:flex;align-items:center;gap:2px;"><svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:var(--gold-400);color:var(--gold-400)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> ${escapeHtml(vendor.rating)}</span>
            <span>·</span>
            <span>${escapeHtml(vendor.distance)}km</span>
            <span>·</span>
            <span style="color:${vendor.isOpen ? 'var(--success-600)' : 'var(--error-500)'}">${vendor.isOpen ? 'Open Now' : 'Closed'}</span>
          </div>
        </div>
      </div>
      <div class="vendor-preview-actions">
        <button class="btn btn-sm btn-whatsapp" data-map-action="whatsapp" style="flex:1"><i data-lucide="message-circle"></i> WhatsApp</button>
        <button class="btn btn-sm btn-secondary" data-map-action="call" style="flex:1"><i data-lucide="phone"></i> Call</button>
        <button class="btn btn-sm btn-primary" data-profile-vendor="${escapeAttr(vendor.id)}" style="flex:1">Profile</button>
      </div>
      
      <!-- Drag handle area hint -->
      <div style="text-align:center; color:var(--gray-400); font-size:10px; margin-top:10px; opacity:0.5;">Swipe up for details</div>
    </div>
  `;

  // Use the main app bottom sheet logic
  document.getElementById('app').dispatchEvent(new CustomEvent('openBottomSheet', { detail: { html, state: 'collapsed' } }));
  const content = document.getElementById('bottom-sheet-content');
  content?.querySelector('[data-profile-vendor]')?.addEventListener('click', (e) => {
    document.getElementById('app').dispatchEvent(new CustomEvent('openVendorProfile', {
      detail: { id: e.currentTarget.dataset.profileVendor }
    }));
  });
  content?.querySelector('[data-map-action="whatsapp"]')?.addEventListener('click', () => {
    const phone = String(vendor.whatsapp || vendor.phone || '').replace(/\D/g, '');
    if (phone) window.open(`https://wa.me/${phone}`);
  });
  content?.querySelector('[data-map-action="call"]')?.addEventListener('click', () => {
    const phone = String(vendor.phone || '').replace(/\D/g, '');
    if (phone) window.open(`tel:${phone}`);
  });
  
  // Custom Logic to handle bottom sheet states in app.js or here
  const sheet = document.getElementById('bottom-sheet');
  sheet.classList.remove('state-half', 'state-full');
  sheet.classList.add('state-collapsed');

  // Add simple touch drag logic for the sheet
  setupBottomSheetDrag(sheet);
}

function setupBottomSheetDrag(sheet) {
  let startY = 0;
  let currentY = 0;
  
  const handleTouchStart = (e) => {
    startY = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e) => {
    currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    // Simple state machine: Collapsed -> Half -> Full
    if (diff > 50 && sheet.classList.contains('state-collapsed')) {
      sheet.classList.remove('state-collapsed');
      sheet.classList.add('state-half');
      startY = currentY; // reset
    } else if (diff > 50 && sheet.classList.contains('state-half')) {
      sheet.classList.remove('state-half');
      sheet.classList.add('state-full');
      startY = currentY;
    } else if (diff < -50 && sheet.classList.contains('state-full')) {
      sheet.classList.remove('state-full');
      sheet.classList.add('state-half');
      startY = currentY;
    } else if (diff < -50 && sheet.classList.contains('state-half')) {
      sheet.classList.remove('state-half');
      sheet.classList.add('state-collapsed');
      startY = currentY;
    } else if (diff < -100 && sheet.classList.contains('state-collapsed')) {
      // Close completely
      document.getElementById('bottom-sheet-backdrop').click();
    }
  };

  // Clean up old listeners first to avoid duplicates
  const handle = sheet.querySelector('.bottom-sheet-handle');
  if (handle) {
    const newHandle = handle.cloneNode(true);
    handle.parentNode.replaceChild(newHandle, handle);
    newHandle.addEventListener('touchstart', handleTouchStart);
    newHandle.addEventListener('touchmove', handleTouchMove);
  }
}

function bindMapEvents(container) {
  // Category filter
  container.querySelectorAll('.filter-chip[data-cat]').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.filter-chip[data-cat]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.cat;
      const filtered = activeCategory === 'all' ? VENDORS : VENDORS.filter(v => v.category === activeCategory);
      map.getSource('vendors').setData(getVendorsGeoJSON(filtered));
    });
  });

  // Locate button
  document.getElementById('map-locate')?.addEventListener('click', () => {
    map.flyTo({ center: [17.0658, -22.5609], zoom: 14 });
  });

  // Near me button
  document.getElementById('map-near-btn')?.addEventListener('click', () => {
    map.flyTo({ center: [17.0658, -22.5609], zoom: 15, pitch: 60 });
  });

  // Search area button
  document.getElementById('map-area-btn')?.addEventListener('click', () => {
    const btn = document.getElementById('map-area-btn');
    if (btn) btn.style.transform = 'translate(-50%, 0) scale(0)'; // Hide it
    // Logic to fetch new vendors based on map.getBounds() would go here
  });
}

export function destroyMap() {
  if (searchPlaceholderInterval) clearInterval(searchPlaceholderInterval);
  if (map) {
    map.remove();
    map = null;
  }
  markersOnScreen = {};
}
