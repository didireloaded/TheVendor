import { Heart, Star, BadgeCheck, MessageCircle, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildWhatsAppUrl, buildTelUrl } from '../data/vendors';
import { useData } from '../context/DataContext';

export default function SavedVendorsScreen() {
  const { vendors } = useData();
  const { favorites, setSelectedVendorId, setCurrentScreen, toggleFavorite, addRecentlyViewed } = useApp();
  const savedVendors = vendors.filter(v => favorites.has(v.id));

  return (
    <div className="pb-4">
      <div className="flex items-center gap-3 px-4 py-3 glass-strong border-b border-white/40 sticky top-0 z-20">
        <button onClick={() => setCurrentScreen('profile')} className="w-9 h-9 rounded-full glass flex items-center justify-center text-slate-600">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Heart size={18} className="text-red-500" fill="#ef4444" /> Saved Vendors
          </h1>
          <p className="text-[10px] text-slate-500 font-semibold">
            {savedVendors.length === 0 ? 'Your shortlist will appear here' : `${savedVendors.length} saved`}
          </p>
        </div>
      </div>

      {savedVendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center mb-4">
            <Heart size={32} className="text-red-300" />
          </div>
          <p className="text-base font-black text-slate-700">No saved vendors yet</p>
          <p className="text-sm text-slate-500 mt-1 mb-5 font-medium">Tap the ❤ on any vendor to add them here</p>
          <button
            className="px-5 py-2.5 rounded-2xl bg-primary-500 text-white text-sm font-black"
            onClick={() => setCurrentScreen('explore')}
          >
            Explore Vendors
          </button>
        </div>
      ) : (
        <div className="px-3 pt-3 space-y-2">
          {savedVendors.map(v => (
            <div
              key={v.id}
              className="glass-card rounded-2xl overflow-hidden cursor-pointer active:scale-[0.99] transition"
              onClick={() => { addRecentlyViewed(v.id); setSelectedVendorId(v.id); setCurrentScreen('vendor-profile'); }}
            >
              <div className="flex">
                <div
                  className="w-24 h-24 bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url('https://picsum.photos/seed/${v.id}-s/200/200')` }}
                />
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-black text-slate-900 truncate">{v.name}</span>
                        {v.verified && (
                          <BadgeCheck size={12} className={v.verifiedLevel === 'pro' ? 'text-amber-500' : 'text-primary-500'} />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate font-medium">{v.categoryName}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(v.id); }}
                      className="text-red-500"
                    >
                      <Heart size={16} fill="#ef4444" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                    <span className="flex items-center gap-0.5">
                      <Star size={10} fill="#f59e0b" stroke="#f59e0b" />
                      <span className="font-black">{v.rating}</span>
                      <span className="text-slate-400 font-medium">({v.reviewCount})</span>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 flex items-center gap-0.5 font-medium">
                      <MapPin size={9} /> {v.city}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 border-t border-slate-100/60">
                <a
                  href={buildWhatsAppUrl(v)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-green-600 text-xs font-black border-r border-slate-100/60"
                >
                  <MessageCircle size={13} fill="currentColor" /> WhatsApp
                </a>
                <a
                  href={buildTelUrl(v)}
                  onClick={e => e.stopPropagation()}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-blue-600 text-xs font-black"
                >
                  <Phone size={13} fill="currentColor" /> Call
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
