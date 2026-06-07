import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Bookmark, FileText, MapPin, MessageCircle, Search, Share2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, EXPLORE_POSTS, VENDORS, buildWhatsAppUrl } from '../data/vendors';
import type { Vendor } from '../data/vendors';
import QuoteRequestSheet from '../components/QuoteRequestSheet';

type ExplorePost = (typeof EXPLORE_POSTS)[number];

export default function ExploreScreen() {
  const { selectedCategory, setSelectedCategory, setCurrentScreen, setSelectedVendorId, addRecentlyViewed, showToast } = useApp();
  const [selectedPost, setSelectedPost] = useState<ExplorePost | null>(null);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [quoteVendor, setQuoteVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    localStorage.removeItem('tv_explore_filter');
  }, []);

  const openVendor = (vendorId: string) => {
    addRecentlyViewed(vendorId);
    setSelectedVendorId(vendorId);
    setCurrentScreen('vendor-profile');
  };

  const category = selectedCategory ? CATEGORIES.find(c => c.id === selectedCategory) : null;

  const posts = useMemo(() => {
    const base = selectedCategory ? EXPLORE_POSTS.filter(post => post.caption.toLowerCase().includes(selectedCategory)) : EXPLORE_POSTS;
    return base.slice(0, 40);
  }, [selectedCategory]);

  return (
    <div className="px-5 pt-6">
      {/* Top bar */}
      <header className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrentScreen('home')} className="btn-circle">
          <ArrowUpRight size={18} className="rotate-180" />
        </button>
        <h1 className="t-h1">Explore</h1>
        <button onClick={() => setCurrentScreen('search')} className="btn-circle">
          <Search size={18} />
        </button>
      </header>

      {/* Active category */}
      {category && (
        <button
          className="card flex items-center justify-between mb-5 w-full"
          onClick={() => setSelectedCategory(null)}
          style={{ padding: '14px 18px' }}
        >
          <div className="text-left">
            <p className="t-label">Showing</p>
            <p className="text-base font-bold text-ink-900">{category.name}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center">
            <X size={14} />
          </div>
        </button>
      )}

      {/* Category pills if none selected */}
      {!category && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
          {CATEGORIES.slice(0, 8).map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className="pill pill-soft"
            >
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {/* Masonry feed */}
      <div className="masonry-grid">
        {posts.map(post => {
          const vendor = VENDORS.find(v => v.id === post.vendorId);
          if (!vendor) return null;
          return (
            <article key={post.id} className="masonry-card" onClick={() => setSelectedPost(post)}>
              <div
                className="masonry-image bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://picsum.photos/seed/${post.id}/420/${Math.floor(post.height * 1.6)}')`,
                  height: post.height,
                }}
              >
                <div className="masonry-overlay">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold border border-white/40"
                      style={{ background: vendor.logoGradient }}
                    >
                      {vendor.logoInitials}
                    </div>
                    <span className="text-white text-[11px] font-semibold truncate">{vendor.name}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {selectedPost && (
        <ContentDetailOverlay
          post={selectedPost}
          vendor={VENDORS.find(v => v.id === selectedPost.vendorId)!}
          saved={savedPosts.has(selectedPost.id)}
          onClose={() => setSelectedPost(null)}
          onSave={() => setSavedPosts(prev => {
            const next = new Set(prev);
            if (next.has(selectedPost.id)) next.delete(selectedPost.id);
            else next.add(selectedPost.id);
            return next;
          })}
          onShare={() => showToast('Link copied', 'success')}
          onViewVendor={() => { setSelectedPost(null); openVendor(selectedPost.vendorId); }}
          onRequestQuote={() => {
            setSelectedPost(null);
            setQuoteVendor(VENDORS.find(v => v.id === selectedPost.vendorId) || null);
          }}
        />
      )}

      {quoteVendor && <QuoteRequestSheet vendor={quoteVendor} onClose={() => setQuoteVendor(null)} />}
    </div>
  );
}

function ContentDetailOverlay({
  post, vendor, saved, onClose, onSave, onShare, onViewVendor, onRequestQuote,
}: {
  post: ExplorePost; vendor: Vendor; saved: boolean;
  onClose: () => void; onSave: () => void; onShare: () => void;
  onViewVendor: () => void; onRequestQuote: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] bg-black/50 flex items-end justify-center"
      style={{ maxWidth: '420px', margin: '0 auto', left: 0, right: 0 }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-cream-50 w-full max-h-[92vh] overflow-y-auto animate-fadeIn"
        style={{ borderTopLeftRadius: '32px', borderTopRightRadius: '32px' }}
      >
        <div className="sticky top-0 bg-cream-50 pt-3 pb-2 z-10">
          <div className="w-12 h-1 bg-ink-900/15 rounded-full mx-auto" />
        </div>

        <div className="px-5 pb-6">
          {/* Vendor row */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={onViewVendor} className="flex items-center gap-3 min-w-0">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: vendor.logoGradient }}
              >
                {vendor.logoInitials}
              </div>
              <div className="min-w-0 text-left">
                <p className="t-body font-semibold truncate">{vendor.name}</p>
                <p className="t-meta truncate">{vendor.categoryName} · {vendor.city}</p>
              </div>
            </button>
            <button onClick={onClose} className="btn-circle btn-circle-dark w-9 h-9">
              <X size={14} />
            </button>
          </div>

          {/* Image */}
          <div className="rounded-3xl overflow-hidden bg-cream-100">
            <img
              src={`https://picsum.photos/seed/${post.id}/900/1200`}
              alt={vendor.name}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <ActionBtn icon={<Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />} label="Save" active={saved} onClick={onSave} />
            <ActionBtn icon={<Share2 size={16} />} label="Share" onClick={onShare} />
            <ActionBtn icon={<MapPin size={16} />} label="View" onClick={onViewVendor} />
            <ActionBtn icon={<FileText size={16} />} label="Quote" onClick={onRequestQuote} primary />
          </div>

          <a
            href={buildWhatsAppUrl(vendor)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full py-3.5 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
          >
            <MessageCircle size={15} />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick, active, primary }: {
  icon: React.ReactNode; label: string; onClick: () => void; active?: boolean; primary?: boolean;
}) {
  const classes = primary
    ? 'bg-accent-mint text-ink-900'
    : active
      ? 'bg-ink-900 text-white'
      : 'bg-cream-100 text-ink-900';
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl py-3.5 flex flex-col items-center gap-1 transition active:scale-95 ${classes}`}
    >
      {icon}
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
}
