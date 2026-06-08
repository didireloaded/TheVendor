import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  ArrowUpRight, BadgeCheck, ChevronLeft, ChevronRight, Crosshair, Heart, MessageCircle,
  Navigation, Phone, Search, Star, X, Filter,
} from 'lucide-react';
import { CATEGORIES, VENDORS, buildDirectionsUrl, buildTelUrl, buildWhatsAppUrl } from '../data/vendors';
import type { Vendor } from '../data/vendors';
import { useApp } from '../context/AppContext';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { distanceKm, getOpenStatus } from '../utils/business';

const MAPBOX_TOKEN = (import.meta as any).env?.VITE_MAPBOX_TOKEN as string | undefined;
if (MAPBOX_TOKEN) mapboxgl.accessToken = MAPBOX_TOKEN;

const CATEGORY_COLORS: Record<string, string> = {
  photography: '#7C5BFF',
  catering: '#FFB199',
  beauty: '#C9B6FF',
  events: '#FFE082',
  automotive: '#0B0B12',
  home: '#6FE3C2',
  tech: '#7C5BFF',
  health: '#FFB199',
  fashion: '#C9B6FF',
  education: '#6FE3C2',
  construction: '#FFE082',
  transport: '#0B0B12',
};

// Build the Spotlas-style pin: rounded pill with vendor name + initials inside a colored circle.
function makeVendorPin(vendor: Vendor, isActive: boolean) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'tv-marker' + (isActive ? ' tv-marker-active' : '');
  const color = CATEGORY_COLORS[vendor.category] || '#7C5BFF';
  el.style.setProperty('--marker-color', color);
  el.innerHTML = `
    <span class="tv-marker-inner">
      <span class="tv-marker-avatar">${escapeHtml(vendor.logoInitials)}</span>
      <span class="tv-marker-name">${escapeHtml(vendor.name)}</span>
    </span>
  `;
  return el;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export default function MapScreen() {
  const { setSelectedVendorId, setCurrentScreen, addRecentlyViewed, isFavorite, toggleFavorite } = useApp();
  const { location } = useCurrentLocation();
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const cardScrollRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [showResults, setShowResults] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return VENDORS
      .filter(v => v.latitude && v.longitude)
      .filter(v => activeFilter === 'all' || v.category === activeFilter)
      .filter(v => !search
        || v.name.toLowerCase().includes(search.toLowerCase())
        || v.categoryName.toLowerCase().includes(search.toLowerCase())
        || v.city.toLowerCase().includes(search.toLowerCase()))
      .map(v => ({
        ...v,
        computedDistance: distanceKm(location.latitude, location.longitude, v.latitude, v.longitude),
      }))
      .sort((a, b) => a.computedDistance - b.computedDistance);
  }, [activeFilter, search, location]);

  const activeVendor = filtered[activeIndex] || null;

  // Init map
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapNodeRef.current || mapRef.current) return;
    const map = new mapboxgl.Map({
      container: mapNodeRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [location.longitude, location.latitude],
      zoom: 12,
      attributionControl: false,
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when filtered list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    filtered.forEach((v, i) => {
      const el = makeVendorPin(v, i === activeIndex);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveIndex(i);
        setShowResults(true);
        map.flyTo({ center: [v.longitude, v.latitude], zoom: 14, duration: 700, essential: true });
      });
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([v.longitude, v.latitude])
        .addTo(map);
      markersRef.current.push(marker);
    });

    // Fit bounds if there are markers and no active selection
    if (filtered.length > 1 && activeIndex === 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filtered.forEach(v => bounds.extend([v.longitude, v.latitude]));
      map.fitBounds(bounds, { padding: { top: 160, bottom: 320, left: 60, right: 60 }, duration: 600, maxZoom: 14 });
    }
  }, [filtered, activeIndex]);

  // Reset active vendor when filter changes
  useEffect(() => { setActiveIndex(0); }, [activeFilter, search]);

  // When active vendor changes via card swipe, fly to it
  useEffect(() => {
    if (!mapRef.current || !activeVendor) return;
    mapRef.current.flyTo({
      center: [activeVendor.longitude, activeVendor.latitude],
      zoom: 14,
      duration: 600,
      essential: true,
    });
  }, [activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const recenter = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center: [location.longitude, location.latitude], zoom: 13, duration: 800 });
  };

  const openVendor = (id: string) => {
    addRecentlyViewed(id);
    setSelectedVendorId(id);
    setCurrentScreen('vendor-profile');
  };

  const goToCard = (delta: number) => {
    const next = Math.max(0, Math.min(filtered.length - 1, activeIndex + delta));
    setActiveIndex(next);
    if (cardScrollRef.current) {
      const cardWidth = cardScrollRef.current.children[0]?.clientWidth || 280;
      cardScrollRef.current.scrollTo({ left: next * (cardWidth + 12), behavior: 'smooth' });
    }
  };

  const onCardScroll = () => {
    if (!cardScrollRef.current) return;
    const cardWidth = (cardScrollRef.current.children[0]?.clientWidth || 280) + 12;
    const idx = Math.round(cardScrollRef.current.scrollLeft / cardWidth);
    if (idx !== activeIndex && idx >= 0 && idx < filtered.length) setActiveIndex(idx);
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-8 text-center bg-cream-50">
        <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mb-4">
          <Navigation size={24} className="text-ink-900/40" />
        </div>
        <h2 className="t-h1 mb-2">Map unavailable</h2>
        <p className="t-meta">VITE_MAPBOX_TOKEN is not set.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden bg-cream-100">
      {/* Map canvas */}
      <div ref={mapNodeRef} className="absolute inset-0" />

      {/* TOP — Search + Filters button */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-5 pb-3 pointer-events-none">
        <div className="flex items-center gap-2 mb-3 pointer-events-auto">
          <button onClick={() => setCurrentScreen('home')} className="btn-circle">
            <ChevronLeft size={18} />
          </button>
          <div className="card flex items-center gap-2.5 flex-1" style={{ padding: '10px 14px' }}>
            <Search size={15} className="text-ink-900/40 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search vendors, areas..."
              className="flex-1 text-sm outline-none bg-transparent min-w-0"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} aria-label="Clear">
                <X size={14} className="text-ink-900/40" />
              </button>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen(true)}
            className={`btn-circle ${activeFilter !== 'all' ? 'btn-circle-dark' : ''}`}
            aria-label="Filters"
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* RIGHT — floating controls */}
      <div className="absolute right-4 z-10 flex flex-col gap-2" style={{ bottom: showResults && filtered.length > 0 ? 280 : 120 }}>
        <button onClick={recenter} className="btn-circle btn-circle-dark w-11 h-11" aria-label="Recenter">
          <Crosshair size={16} />
        </button>
        <button
          onClick={() => setShowResults(s => !s)}
          className="btn-circle w-11 h-11"
          aria-label="Toggle list"
        >
          <span className="text-xs font-bold">{filtered.length}</span>
        </button>
      </div>

      {/* BOTTOM — Swipeable vendor card carousel */}
      {showResults && filtered.length > 0 && (
        <div className="absolute left-0 right-0 bottom-0 z-10 pb-24 pointer-events-none">
          {/* Pager */}
          <div className="flex items-center justify-between px-4 mb-3 pointer-events-auto">
            <div className="card flex items-center gap-3" style={{ padding: '8px 14px' }}>
              <button
                onClick={() => goToCard(-1)}
                disabled={activeIndex === 0}
                className="text-ink-900 disabled:text-ink-900/20"
                aria-label="Previous"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-ink-900 min-w-[44px] text-center">
                {activeIndex + 1} / {filtered.length}
              </span>
              <button
                onClick={() => goToCard(1)}
                disabled={activeIndex === filtered.length - 1}
                className="text-ink-900 disabled:text-ink-900/20"
                aria-label="Next"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <button
              onClick={() => setShowResults(false)}
              className="btn-circle"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Carousel */}
          <div
            ref={cardScrollRef}
            onScroll={onCardScroll}
            className="flex gap-3 overflow-x-auto px-4 snap-x snap-mandatory pointer-events-auto"
            style={{ scrollPaddingLeft: '16px' }}
          >
            {filtered.map((v) => (
              <VendorMapCard
                key={v.id}
                vendor={v}
                isFav={isFavorite(v.id)}
                onFav={() => toggleFavorite(v.id)}
                onOpen={() => openVendor(v.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {showResults && filtered.length === 0 && (
        <div className="absolute left-4 right-4 bottom-28 z-10">
          <div className="card text-center py-8">
            <p className="t-body font-semibold">No vendors match</p>
            <p className="t-meta mt-1">Try a different filter or search</p>
          </div>
        </div>
      )}

      {/* Filters Bottom Sheet */}
      {filtersOpen && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-black/30" onClick={() => setFiltersOpen(false)}>
          <div
            className="relative w-full bg-cream-50 animate-fadeIn"
            style={{
              borderTopLeftRadius: '32px',
              borderTopRightRadius: '32px',
              boxShadow: '0 -12px 40px rgba(11, 11, 18, 0.16)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="pt-3 pb-2">
              <div className="w-12 h-1 rounded-full bg-ink-900/15 mx-auto" />
            </div>
            <div className="px-5 py-3 flex items-center justify-between">
              <h2 className="t-h1">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} className="btn-circle">
                <X size={16} />
              </button>
            </div>
            <div className="px-5 pb-8">
              <p className="t-label mb-3">Categories</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setActiveFilter('all'); setFiltersOpen(false); }}
                  className={`pill ${activeFilter === 'all' ? 'pill-active' : 'pill-soft'}`}
                >
                  All Vendors
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveFilter(cat.id); setFiltersOpen(false); }}
                    className={`pill ${activeFilter === cat.id ? 'pill-active' : 'pill-soft'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spotlas-style marker CSS */}
      <style>{`
        .tv-marker {
          background: none;
          border: 0;
          padding: 0;
          cursor: pointer;
          transform: translateY(-4px);
        }
        .tv-marker-inner {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FFFFFF;
          color: #0B0B12;
          padding: 4px 12px 4px 4px;
          border-radius: 100px;
          box-shadow: 0 4px 12px rgba(11, 11, 18, 0.18), 0 0 0 2px rgba(11, 11, 18, 0.04);
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .tv-marker-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--marker-color);
          color: #FFFFFF;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .tv-marker-name {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: -0.01em;
          max-width: 130px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tv-marker-active .tv-marker-inner {
          background: #0B0B12;
          color: #FFFFFF;
          transform: scale(1.05);
          box-shadow: 0 8px 20px rgba(11, 11, 18, 0.35), 0 0 0 3px rgba(11, 11, 18, 0.06);
        }
        .tv-marker-active .tv-marker-avatar {
          background: #FFFFFF;
          color: #0B0B12;
        }
        .tv-marker:hover .tv-marker-inner {
          transform: scale(1.03);
        }
        .mapboxgl-canvas-container { cursor: grab; }
        .mapboxgl-canvas-container.mapboxgl-interactive:active { cursor: grabbing; }
      `}</style>
    </div>
  );
}

// ============ Vendor card in the Spotlas-style carousel ============
function VendorMapCard({
  vendor, isFav, onFav, onOpen,
}: {
  vendor: Vendor & { computedDistance: number };
  isFav: boolean;
  onFav: () => void;
  onOpen: () => void;
}) {
  const status = getOpenStatus(vendor);
  return (
    <article
      className="snap-start flex-shrink-0 card overflow-hidden"
      style={{ width: 'calc(100vw - 64px)', maxWidth: '340px', padding: 0 }}
      onClick={onOpen}
    >
      <div className="flex gap-3 p-3">
        {/* Cover image */}
        <div
          className="w-24 h-24 rounded-2xl bg-cover bg-center bg-cream-100 flex-shrink-0"
          style={{ backgroundImage: `url('https://picsum.photos/seed/${vendor.id}-map/300/300')` }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="t-body font-bold truncate flex items-center gap-1">
                {vendor.name}
                {vendor.verified && (
                  <BadgeCheck size={13} className="text-primary-500 flex-shrink-0" />
                )}
              </h3>
              <p className="t-meta truncate">{vendor.categoryName}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onFav(); }}
              className={`btn-circle w-8 h-8 flex-shrink-0 ${isFav ? '' : ''}`}
              style={isFav ? { background: '#FFB199' } : { background: '#F5F2EC' }}
              aria-label="Save"
            >
              <Heart size={12} fill={isFav ? '#0B0B12' : 'none'} />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2 text-[11px]">
            <span className="flex items-center gap-0.5 font-semibold text-ink-900">
              <Star size={10} fill="#FFB199" stroke="#FFB199" /> {vendor.rating}
            </span>
            <span className="text-ink-900/30">·</span>
            <span className="text-ink-900/60">{vendor.computedDistance.toFixed(1)} km</span>
            <span className="text-ink-900/30">·</span>
            <span className="flex items-center gap-1">
              <span className={status.isOpen ? 'dot-open' : 'dot-closed'} />
              <span className={`font-semibold ${status.isOpen ? 'text-emerald-600' : 'text-rose-500'}`}>
                {status.isOpen ? 'Open' : 'Closed'}
              </span>
            </span>
          </div>

          <p className="t-meta mt-1 line-clamp-1">{vendor.address}</p>
        </div>
      </div>

      {/* Action bar */}
      <div className="grid grid-cols-4 border-t border-cream-200">
        <a
          href={buildWhatsAppUrl(vendor)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="py-2.5 flex items-center justify-center text-emerald-600 hover:bg-cream-100 transition"
          aria-label="WhatsApp"
        >
          <MessageCircle size={15} />
        </a>
        <a
          href={buildTelUrl(vendor)}
          onClick={e => e.stopPropagation()}
          className="py-2.5 flex items-center justify-center text-primary-500 hover:bg-cream-100 transition border-l border-cream-200"
          aria-label="Call"
        >
          <Phone size={15} />
        </a>
        <a
          href={buildDirectionsUrl(vendor)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="py-2.5 flex items-center justify-center text-ink-900 hover:bg-cream-100 transition border-l border-cream-200"
          aria-label="Directions"
        >
          <Navigation size={15} />
        </a>
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="py-2.5 flex items-center justify-center bg-ink-900 text-white font-semibold text-xs gap-1"
        >
          View <ArrowUpRight size={12} />
        </button>
      </div>
    </article>
  );
}
