// ============================================
// THE VENDOR — Map Screen
// Interactive Leaflet map with vendor pins & clustering
// ============================================

import { VENDORS, CATEGORIES, SEARCH_PLACEHOLDERS } from '../data.js';
import { icons, openVendorProfileById, refreshIcons } from '../app.js';

let map = null;
let markerCluster = null;
let currentMarkers = {}; // Store markers by vendor ID
let activeCategory = 'all';
let searchPlaceholderInterval = null;

export function renderMapScreen(container) {
  container.innerHTML = `
    <div class="screen-map">
      <div class="map-container" id="leaflet-map"></div>

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
          <button class="map-icon-btn" id="map-notif-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span class="notif-dot"></span>
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
        <button class="map-btn map-near-btn" id="map-near-btn" title="Near Me">
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

      <!-- Vendor Discovery Cards Carousel -->
      <div class="map-discovery-carousel hide-scrollbar" id="map-discovery-carousel">
        <!-- Cards injected here -->
      </div>
    </div>
  `;

  initMap();
  bindMapEvents(container);
  startSearchPlaceholderRotation();
}

function startSearchPlaceholderRotation() {
  const placeholders = [
    "Photographer near me",
    "Cake maker",
    "Mechanic",
    "Videographer",
    "DJ",
    "Car wash",
    "Graphic designer",
    "Makeup artist"
  ];
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
  // Center on Windhoek, Namibia
  map = L.map('leaflet-map', {
    center: [-22.5609, 17.0658],
    zoom: 13,
    zoomControl: false,
    attributionControl: false,
  });

  // CartoDB Positron tiles (clean, minimal, Google Maps-like style)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
  }).addTo(map);

  // Initialize marker cluster group
  markerCluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    maxClusterRadius: 50,
    iconCreateFunction: function(cluster) {
      const count = cluster.getChildCount();
      return L.divIcon({
        html: `<div class="cluster-icon"><span>${count}</span></div>`,
        className: 'custom-cluster',
        iconSize: L.point(40, 40)
      });
    }
  });

  map.addLayer(markerCluster);

  plotVendors(VENDORS);

  // Show "search area" button when map is dragged
  map.on('dragend', () => {
    const btn = document.getElementById('map-area-btn');
    if (btn) btn.style.transform = 'translate(-50%, 0) scale(1)';
  });
}

function plotVendors(vendors) {
  markerCluster.clearLayers();
  currentMarkers = {};

  const colorMap = {
    'photography': '#1A6FEF',
    'food': '#F97316',
    'automotive': '#EF4444',
    'beauty': '#A855F7',
    'events': '#EC4899',
    'construction': '#78716C',
    'technology': '#06B6D4',
    'retail': '#10B981',
    'accommodation': '#8B5CF6',
    'health': '#14B8A6',
    'home': '#F59E0B',
    'business': '#6366F1',
  };

  const markersArray = vendors.map(v => {
    // Elegant dot pin
    const pinColor = colorMap[v.category] || '#1A6FEF';
    const isGold = v.verifiedLevel === 'gold';
    
    const iconHtml = `
      <div class="elegant-pin ${isGold ? 'is-gold' : ''}" style="background-color: ${isGold ? '#D4A853' : pinColor};">
        <div class="pin-inner"></div>
      </div>
    `;

    const icon = L.divIcon({
      className: 'leaflet-custom-div-icon',
      html: iconHtml,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const marker = L.marker([v.lat, v.lng], { icon });
    marker.vendorId = v.id;

    marker.on('click', () => {
      highlightVendorCard(v.id);
    });

    currentMarkers[v.id] = marker;
    return marker;
  });

  markerCluster.addLayers(markersArray);
  renderDiscoveryCards(vendors);
}

function renderDiscoveryCards(vendors) {
  const container = document.getElementById('map-discovery-carousel');
  if (!container) return;

  if (vendors.length === 0) {
    container.innerHTML = '<div class="no-vendors-msg">No vendors found in this area.</div>';
    return;
  }

  container.innerHTML = vendors.map(v => `
    <div class="discovery-card" data-vendor-id="${v.id}">
      <div class="card-cover" style="background: ${v.coverGradient};">
        <button class="card-save-btn">
           <i data-lucide="bookmark" style="width: 20px; height: 20px;"></i>
        </button>
      </div>
      <div class="card-logo" style="background: ${v.coverGradient};">${v.logoInitials}</div>
      <div class="card-content">
        <div class="card-header">
          <div class="card-name-row">
            <h3 class="card-name">${v.name}</h3>
            ${v.verified ? `<span class="badge-verified ${v.verifiedLevel}">${icons.verifiedBadge}</span>` : ''}
          </div>
          <div class="card-cat">${v.categoryName}</div>
        </div>
        <div class="card-meta">
          <span class="meta-rating"><i data-lucide="star" style="width: 14px; height: 14px; fill: currentColor; margin-right: 4px; vertical-align: middle;"></i> ${v.rating} (${Math.floor(Math.random() * 200 + 10)})</span>
          <span class="meta-dot">·</span>
          <span class="meta-distance">${v.distance}km</span>
        </div>
        <div class="card-status ${v.isOpen ? 'status-open' : 'status-closed'}">
          ${v.isOpen ? 'Open Now' : 'Closed'}
          ${v.isOpen ? '<span class="status-badge responding">Responds quickly</span>' : ''}
        </div>
        <div class="card-actions">
          <button class="btn-action whatsapp" onclick="event.stopPropagation()">WhatsApp</button>
          <button class="btn-action call" onclick="event.stopPropagation()">Call</button>
          <button class="btn-action primary" onclick="event.stopPropagation(); document.getElementById('app').dispatchEvent(new CustomEvent('openVendorProfile', { detail: { id: '${v.id}' } }))">Profile</button>
        </div>
      </div>
    </div>
  `).join('');

  // Add intersection observer to highlight pins when cards scroll into view
  const cards = container.querySelectorAll('.discovery-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        const id = entry.target.dataset.vendorId;
        focusMarker(id);
      }
    });
  }, {
    root: container,
    threshold: 0.5
  });

  cards.forEach(card => observer.observe(card));

  // Click card to open profile
  cards.forEach(card => {
    card.addEventListener('click', () => {
       const id = card.dataset.vendorId;
       document.getElementById('app').dispatchEvent(new CustomEvent('openVendorProfile', { detail: { id } }));
    });
  });

  // Render newly added Lucide icons
  refreshIcons();
}

function highlightVendorCard(vendorId) {
  const container = document.getElementById('map-discovery-carousel');
  if (!container) return;
  const card = container.querySelector(`.discovery-card[data-vendor-id="${vendorId}"]`);
  if (card) {
    // Scroll card into view
    container.scrollTo({
      left: card.offsetLeft - 16, // offset for padding
      behavior: 'smooth'
    });
    focusMarker(vendorId);
  }
}

function focusMarker(vendorId) {
  const marker = currentMarkers[vendorId];
  if (!marker) return;
  
  // Highlight pin visually (could add a class to the marker's icon)
  document.querySelectorAll('.elegant-pin').forEach(el => el.classList.remove('active-pin'));
  if (marker._icon) {
    const pin = marker._icon.querySelector('.elegant-pin');
    if (pin) pin.classList.add('active-pin');
  }

  // Pan to marker slightly offset to account for bottom cards
  const latlng = marker.getLatLng();
  map.panTo([latlng.lat - 0.005, latlng.lng], { animate: true });
}

function bindMapEvents(container) {
  // Category filter
  container.querySelectorAll('.filter-chip[data-cat]').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.filter-chip[data-cat]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.cat;
      const filtered = activeCategory === 'all' ? VENDORS : VENDORS.filter(v => v.category === activeCategory);
      plotVendors(filtered);
    });
  });

  // Locate button
  document.getElementById('map-locate')?.addEventListener('click', () => {
    // Add pulsing user location marker if it doesn't exist
    const userLat = -22.5609;
    const userLng = 17.0658;
    
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `<div class="pulse-ring"></div><div class="pulse-core"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    
    L.marker([userLat, userLng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
    map.setView([userLat, userLng], 14, { animate: true });
  });

  // Near me button
  document.getElementById('map-near-btn')?.addEventListener('click', () => {
    // Simulate finding nearest vendors within 5km
    const nearby = VENDORS.filter(v => v.distance <= 5).sort((a,b) => a.distance - b.distance);
    plotVendors(nearby);
    if(nearby.length > 0) {
      const group = L.featureGroup(nearby.map(r => currentMarkers[r.id]));
      map.fitBounds(group.getBounds().pad(0.1), { animate: true });
    }
  });

  // Filter button
  document.getElementById('map-filter-btn')?.addEventListener('click', () => {
    const filterHTML = `
      <div class="filter-sheet">
        <h3 class="filter-title">Advanced Filters</h3>
        
        <div class="filter-group">
          <label class="filter-label">Sort By</label>
          <div class="filter-options">
            <button class="filter-opt active">Distance</button>
            <button class="filter-opt">Rating</button>
            <button class="filter-opt">Popularity</button>
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Distance</label>
          <div class="filter-options">
            <button class="filter-opt active">1km</button>
            <button class="filter-opt">5km</button>
            <button class="filter-opt">10km</button>
            <button class="filter-opt">20km</button>
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Vendor Status</label>
          <div class="filter-options">
            <button class="filter-opt active">Open Now</button>
            <button class="filter-opt">Verified Only</button>
          </div>
        </div>

        <div class="filter-actions">
          <button class="btn btn-outline" id="filter-reset-btn">Reset</button>
          <button class="btn btn-primary" id="filter-apply-btn" onclick="document.getElementById('bottom-sheet-backdrop').click()">Apply Filters</button>
        </div>
      </div>
    `;
    document.getElementById('app').dispatchEvent(new CustomEvent('openBottomSheet', { detail: { html: filterHTML } }));
  });

  // Search area button
  document.getElementById('map-area-btn')?.addEventListener('click', () => {
    const btn = document.getElementById('map-area-btn');
    if (btn) btn.style.transform = 'translate(-50%, 0) scale(0)'; // Hide it

    const bounds = map.getBounds();
    const visible = VENDORS.filter(v => bounds.contains([v.lat, v.lng]));
    const filtered = activeCategory === 'all' ? visible : visible.filter(v => v.category === activeCategory);
    plotVendors(filtered);
  });

  // Search input
  document.getElementById('map-search-input')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    if (q.length < 2) {
      plotVendors(activeCategory === 'all' ? VENDORS : VENDORS.filter(v => v.category === activeCategory));
      return;
    }
    const results = VENDORS.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.categoryName.toLowerCase().includes(q)
    );
    plotVendors(results);
    if (results.length > 0) {
      const group = L.featureGroup(results.map(r => currentMarkers[r.id]));
      map.fitBounds(group.getBounds().pad(0.1), { animate: true });
    }
  });
}

export function destroyMap() {
  if (searchPlaceholderInterval) {
    clearInterval(searchPlaceholderInterval);
  }
  if (map) {
    map.remove();
    map = null;
  }
  markerCluster = null;
  currentMarkers = {};
}
