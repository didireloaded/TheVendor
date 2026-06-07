import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight, Bell, ChevronDown, MapPin, Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  SEARCH_PLACEHOLDERS, getPopularCategories,
} from '../data/vendors';
import type { Vendor } from '../data/vendors';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import {
  getOpenStatus, getTrendingThisWeek, getVendorOfTheWeek, vendorsNear,
} from '../utils/business';

type FilterKey = 'near' | 'top' | 'verified' | 'open' | 'trending';

const FILTERS: { id: FilterKey; label: string }[] = [
  { id: 'near', label: 'Near Me' },
  { id: 'top', label: 'Top Rated' },
  { id: 'verified', label: 'Verified' },
  { id: 'open', label: 'Open Now' },
  { id: 'trending', label: 'Trending' },
];

export default function HomeScreen() {
  const { setCurrentScreen, setSelectedVendorId, addRecentlyViewed, setSelectedCategory } = useApp();
  const { location } = useCurrentLocation();
  const [placeholder, setPlaceholder] = useState(SEARCH_PLACEHOLDERS[0]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('near');

  const vendorOfWeek = useMemo(() => getVendorOfTheWeek(), []);
  const popularCategories = useMemo(() => getPopularCategories(4), []);

  // Filtered feed
  const feed = useMemo<(Vendor & { computedDistance?: number })[]>(() => {
    const nearby = vendorsNear(location, 50);
    switch (activeFilter) {
      case 'near': return nearby;
      case 'top': return [...nearby].sort((a, b) => b.rating - a.rating);
      case 'verified': return nearby.filter(v => v.verified);
      case 'open': return nearby.filter(v => getOpenStatus(v).isOpen);
      case 'trending': return getTrendingThisWeek();
      default: return nearby;
    }
  }, [location, activeFilter]);

  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % SEARCH_PLACEHOLDERS.length;
      setPlaceholder(SEARCH_PLACEHOLDERS[i]);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  const openVendor = (id: string) => {
    addRecentlyViewed(id);
    setSelectedVendorId(id);
    setCurrentScreen('vendor-profile');
  };

  return (
    <div className="px-5 pt-6">
      {/* Top bar */}
      <header className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrentScreen('profile')} className="btn-circle">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-700" />
        </button>
        <div className="text-center">
          <p className="t-label">Current location</p>
          <button
            onClick={() => setCurrentScreen('map')}
            className="flex items-center justify-center gap-1 mt-0.5"
          >
            <MapPin size={14} />
            <span className="text-sm font-bold text-ink-900">{location.label}</span>
            <ChevronDown size={14} className="text-ink-900/50" />
          </button>
        </div>
        <button
          onClick={() => setCurrentScreen('notifications')}
          className="btn-circle relative"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </header>

      {/* Greeting heading */}
      <h1 className="t-display mb-1">Find vendors</h1>
      <h1 className="t-display mb-5">across <span className="italic font-light">Namibia</span>.</h1>

      {/* Search pill */}
      <button
        className="card flex items-center gap-3 py-4 mb-5 hover:scale-[1.005] transition"
        onClick={() => setCurrentScreen('search')}
        style={{ padding: '14px 20px' }}
      >
        <div className="w-9 h-9 rounded-full bg-ink-900 flex items-center justify-center text-white flex-shrink-0">
          <Search size={15} />
        </div>
        <span className="text-sm text-ink-900/50 flex-1 text-left truncate">{placeholder}</span>
        <ArrowUpRight size={18} className="text-ink-900 flex-shrink-0" />
      </button>

      {/* Vendor of the Week — dark hero card */}
      <VendorOfWeekCard
        vendor={vendorOfWeek}
        onOpen={() => openVendor(vendorOfWeek.id)}
      />

      {/* Categories — 4 tile grid */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="t-h2">Categories</h2>
          <button onClick={() => setCurrentScreen('explore')} className="t-label">See all</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {popularCategories.map(cat => (
            <button
              key={cat.id}
              className="card-tile text-left active:scale-[0.98] transition"
              onClick={() => { setSelectedCategory(cat.id); setCurrentScreen('explore'); }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: '#F5F2EC' }}
                >
                  <span className="text-sm font-bold text-ink-900">{cat.name.charAt(0)}</span>
                </div>
                <span className="t-label">{cat.liveCount} items</span>
              </div>
              <p className="t-meta mb-1">{cat.name.split(' ')[0]}</p>
              <p className="text-xl font-bold text-ink-900">{cat.liveCount}<span className="text-base font-medium text-ink-900/40 ml-1">vendors</span></p>
            </button>
          ))}
        </div>
      </section>

      {/* Filter chips */}
      <section className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="t-h2">Discover</h2>
          <button onClick={() => setCurrentScreen('explore')} className="t-label">See all</button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`pill ${activeFilter === f.id ? 'pill-active' : 'pill-soft'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* The feed */}
      <section className="mt-4 space-y-3">
        {feed.length === 0 ? (
          <div className="card text-center py-12">
            <p className="t-meta">No vendors match this filter</p>
          </div>
        ) : (
          feed.slice(0, 8).map(v => (
            <VendorRow key={v.id} vendor={v} onOpen={() => openVendor(v.id)} />
          ))
        )}
      </section>

      {feed.length > 8 && (
        <button
          className="card-soft w-full py-3.5 mt-3 text-sm font-semibold text-ink-900 transition active:scale-[0.99]"
          onClick={() => setCurrentScreen('explore')}
        >
          Show all vendors
        </button>
      )}
    </div>
  );
}

// ============ VENDOR OF THE WEEK — dark "data" card ============
function VendorOfWeekCard({ vendor, onOpen }: { vendor: Vendor; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="card-ink relative text-left w-full active:scale-[0.99] transition overflow-hidden">
      {/* Floating "Featured" handle like the inspiration */}
      <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-ink-900 px-5 py-1.5 rounded-b-2xl">
        <span className="text-[10px] text-white font-semibold uppercase tracking-[0.15em]">Featured</span>
      </div>

      <div className="flex items-start justify-between mt-4">
        <div>
          <p className="t-label" style={{ color: '#A5A5B5' }}>Vendor of the week</p>
          <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">{vendor.name}</h3>
        </div>
        <button
          className="btn-circle btn-circle-mint w-10 h-10 flex-shrink-0"
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
        >
          <ArrowUpRight size={16} />
        </button>
      </div>

      {/* Stats row — like the inspiration's pie chart card */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Stat label="Rating" value={vendor.rating.toString()} color="#6FE3C2" />
        <Stat label="Reviews" value={vendor.reviewCount.toString()} color="#FFB199" />
        <Stat label="Years" value={`${vendor.yearsInBusiness}y`} color="#C9B6FF" />
      </div>

      <p className="text-sm mt-5 leading-relaxed" style={{ color: '#A5A5B5' }}>
        {vendor.categoryName} · {vendor.city}
      </p>
    </button>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#A5A5B5' }}>{label}</p>
      </div>
      <p className="text-xl font-bold text-white mt-1.5">{value}</p>
    </div>
  );
}

// ============ VENDOR ROW ============
function VendorRow({
  vendor, onOpen,
}: { vendor: Vendor & { computedDistance?: number }; onOpen: () => void }) {
  const status = getOpenStatus(vendor);
  const distance = vendor.computedDistance ?? vendor.distance;

  return (
    <button
      onClick={onOpen}
      className="card flex items-center gap-3 active:scale-[0.99] transition w-full"
      style={{ padding: '14px 16px' }}
    >
      <div
        className="w-12 h-12 rounded-full bg-cream-100 flex items-center justify-center text-ink-900 font-bold text-sm flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #F5F2EC, #EDE9E1)' }}
      >
        {vendor.logoInitials}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <h3 className="t-body font-semibold truncate">{vendor.name}</h3>
        <p className="t-meta truncate">{vendor.categoryName}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-ink-900">★ {vendor.rating}</p>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          <span className={status.isOpen ? 'dot-open' : 'dot-closed'} />
          <span className="text-[11px] text-ink-900/60 font-medium">{distance.toFixed(1)} km</span>
        </div>
      </div>
    </button>
  );
}
