import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ArrowUpRight, TrendingUp, Clock, X, MapPin, Star, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import {
  TRENDING_SEARCHES, POPULAR_NEAR_YOU, searchVendors, buildWhatsAppUrl,
} from '../data/vendors';
import type { Vendor } from '../data/vendors';

export default function SearchScreen() {
  const { setCurrentScreen, setSelectedVendorId, setSelectedCategory, addRecentlyViewed } = useApp();
  const { vendors, categories: CATEGORIES } = useData();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('tv_recent_searches') || '[]'); }
    catch { return []; }
  });

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    if (query.length < 1) return { vendors: [] as Vendor[], categories: [] as typeof CATEGORIES, cities: [] as string[] };
    const q = query.toLowerCase();
    const matchedVendors = searchVendors(vendors, query).slice(0, 10);
    const categories = CATEGORIES.filter(c => c.name.toLowerCase().includes(q)).slice(0, 4);
    const cities = Array.from(new Set(vendors.filter(v => v.city.toLowerCase().includes(q)).map(v => v.city))).slice(0, 4);
    return { vendors: matchedVendors, categories, cities };
  }, [query, vendors, CATEGORIES]);

  const addRecent = (text: string) => {
    const updated = [text, ...recentSearches.filter(s => s !== text)].slice(0, 8);
    setRecentSearches(updated);
    localStorage.setItem('tv_recent_searches', JSON.stringify(updated));
  };

  const openVendor = (id: string) => {
    addRecent(query || results.vendors.find(v => v.id === id)?.name || '');
    addRecentlyViewed(id);
    setSelectedVendorId(id);
    setCurrentScreen('vendor-profile');
  };

  const openCategory = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentScreen('explore');
  };

  const totalResults = results.vendors.length + results.categories.length + results.cities.length;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-cream-50"
      style={{ maxWidth: '420px', margin: '0 auto', left: 0, right: 0 }}
    >
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentScreen('home')} className="btn-circle">
            <ArrowUpRight size={18} className="rotate-180" />
          </button>
          <h1 className="t-h1">Search</h1>
          <div className="w-11 h-11" />
        </div>

        <div className="card flex items-center gap-3" style={{ padding: '14px 18px' }}>
          <Search size={16} className="text-ink-900/40 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Find vendors, services, cities..."
            className="flex-1 text-sm outline-none bg-transparent"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && query && addRecent(query)}
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear">
              <X size={15} className="text-ink-900/40" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {query.length >= 1 ? (
          <>
            <p className="t-meta mb-3">{totalResults} results</p>

            {totalResults === 0 ? (
              <div className="card text-center py-12">
                <p className="t-body font-semibold">No vendors found</p>
                <p className="t-meta mt-1">Try a different keyword</p>
              </div>
            ) : (
              <>
                {results.categories.length > 0 && (
                  <div className="mb-6">
                    <p className="t-label mb-2">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {results.categories.map(cat => (
                        <button key={cat.id} onClick={() => openCategory(cat.id)} className="pill pill-soft">
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results.cities.length > 0 && (
                  <div className="mb-6">
                    <p className="t-label mb-2">Cities</p>
                    <div className="flex flex-wrap gap-2">
                      {results.cities.map(city => (
                        <button
                          key={city}
                          onClick={() => { setQuery(city); inputRef.current?.focus(); }}
                          className="pill pill-soft flex items-center gap-1.5"
                        >
                          <MapPin size={11} /> {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results.vendors.length > 0 && (
                  <>
                    <p className="t-label mb-2">Vendors</p>
                    <div className="space-y-2">
                      {results.vendors.map(v => (
                        <button
                          key={v.id}
                          className="card w-full flex items-center gap-3 text-left active:scale-[0.99] transition"
                          style={{ padding: '14px 16px' }}
                          onClick={() => openVendor(v.id)}
                        >
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ background: v.logoGradient }}
                          >
                            {v.logoInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="t-body font-semibold truncate">{highlight(v.name, query)}</p>
                            <p className="t-meta truncate">{v.categoryName} · {v.city}</p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-ink-900/60">
                              <Star size={9} fill="#FFB199" stroke="#FFB199" />
                              <span className="font-semibold">{v.rating}</span>
                              <span>·</span>
                              <span>{v.distance.toFixed(1)} km</span>
                            </div>
                          </div>
                          <a
                            href={buildWhatsAppUrl(v)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="btn-circle w-10 h-10 flex-shrink-0"
                            style={{ background: '#6FE3C2' }}
                          >
                            <MessageCircle size={14} />
                          </a>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="t-label">Recent</p>
                  <button
                    className="t-label text-primary-500"
                    onClick={() => { setRecentSearches([]); localStorage.removeItem('tv_recent_searches'); }}
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((s, i) => (
                    <button key={i} className="flex items-center gap-3 w-full py-2 text-left" onClick={() => setQuery(s)}>
                      <div className="w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center">
                        <Clock size={13} className="text-ink-900/40" />
                      </div>
                      <span className="t-body">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="t-label flex items-center gap-1 mb-2">
                <TrendingUp size={11} /> Trending
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((s, i) => (
                  <button key={i} className="pill pill-soft" onClick={() => setQuery(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="t-label flex items-center gap-1 mb-2">
                <MapPin size={11} /> Popular near you
              </p>
              <div className="space-y-1">
                {POPULAR_NEAR_YOU.map((s, i) => (
                  <button key={i} className="flex items-center gap-3 w-full py-2 text-left" onClick={() => setQuery(s)}>
                    <div className="w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center">
                      <MapPin size={13} className="text-ink-900/40" />
                    </div>
                    <span className="t-body">{s}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pb-8">
              <p className="t-label mb-3">Browse categories</p>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.slice(0, 8).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => openCategory(cat.id)}
                    className="card-tile flex items-center gap-2.5 text-left active:scale-95 transition"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-ink-900 text-xs font-bold flex-shrink-0"
                      style={{ background: '#F5F2EC' }}
                    >
                      {cat.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{cat.name.split(' ')[0]}</p>
                      <p className="text-[10px] text-ink-900/40">{cat.count} vendors</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.substring(0, idx)}
      <span className="bg-accent-butter text-ink-900 rounded px-0.5">
        {text.substring(idx, idx + query.length)}
      </span>
      {text.substring(idx + query.length)}
    </>
  );
}
