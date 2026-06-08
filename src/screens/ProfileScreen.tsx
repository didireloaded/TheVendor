import { useMemo, useState } from 'react';
import {
  ArrowUpRight, Folder, Grid3X3, MapPin, MessageSquare, MoreHorizontal, Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VENDORS, getProfileFeedPosts } from '../data/vendors';
import ProfileMenuDrawer from '../components/ProfileMenuDrawer';

export default function ProfileScreen() {
  const {
    showToast, setCurrentScreen, favorites, quoteRequests, conversations,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'messages' | 'collections'>('posts');

  const savedVendors = useMemo(() => VENDORS.filter(v => favorites.has(v.id)), [favorites]);
  const profileFeed = useMemo(() => getProfileFeedPosts(), []);
  const recentConversations = useMemo(() => conversations.slice(0, 5), [conversations]);

  const signOut = () => {
    localStorage.removeItem('tv_authed');
    showToast('Signed out');
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="px-5 pt-6 pb-24">
      {/* Top bar */}
      <header className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrentScreen('home')} className="btn-circle">
          <ArrowUpRight size={18} className="rotate-180" />
        </button>
        <h1 className="t-h1">Profile</h1>
        <button
          onClick={() => setMenuOpen(true)}
          className="pill pill-soft h-11 px-4"
          aria-label="More options"
        >
          <MoreHorizontal size={16} />
          More
        </button>
      </header>

      {/* Identity card */}
      <div className="card mb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
            DR
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="t-h2 truncate">Didi Reloaded</h2>
            <p className="t-meta flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="flex-shrink-0" /> Windhoek · Member since 2024
            </p>
          </div>
        </div>

        {/* Action row */}
        <div className="flex gap-2 mt-5">
          <button
            className="flex-1 py-3 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold transition active:scale-[0.98]"
            onClick={() => showToast('Edit profile')}
          >
            Edit Profile
          </button>
          <button
            className="btn-circle w-12 h-12 flex-shrink-0"
            style={{ background: '#F5F2EC' }}
            onClick={() => showToast('Link copied', 'success')}
            aria-label="Share"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatTile value={profileFeed.length} label="Work" />
        <StatTile value={conversations.length} label="Chats" />
        <StatTile value={savedVendors.length} label="Saved" />
      </div>

      {/* Tabs */}
      <div className="card-soft flex gap-1 mb-4" style={{ padding: '4px' }}>
        <TabButton active={activeTab === 'posts'} icon={<Grid3X3 size={14} />} label="Work" onClick={() => setActiveTab('posts')} />
        <TabButton active={activeTab === 'messages'} icon={<MessageSquare size={14} />} label="Messages" onClick={() => setActiveTab('messages')} />
        <TabButton active={activeTab === 'collections'} icon={<Folder size={14} />} label="Lists" onClick={() => setActiveTab('collections')} />
      </div>

      {/* Feed grid */}
      {activeTab === 'posts' && (
        profileFeed.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5">
            {profileFeed.map(post => (
              <button
                key={post.id}
                className="aspect-square bg-cover bg-center rounded-2xl bg-cream-100"
                style={{ backgroundImage: `url('${post.imageUrl}')` }}
                onClick={() => showToast(post.caption)}
                aria-label={post.caption}
              />
            ))}
          </div>
        ) : (
          <EmptyTab title="No work yet" subtitle="Your projects will appear here." />
        )
      )}

      {/* Messages tab */}
      {activeTab === 'messages' && (
        recentConversations.length > 0 ? (
          <div className="space-y-2">
            {recentConversations.map(c => (
              <button
                key={c.id}
                className="card w-full flex items-center gap-3 text-left active:scale-[0.99] transition"
                style={{ padding: '14px 16px' }}
                onClick={() => setCurrentScreen('chat')}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: c.vendorColor }}
                  >
                    {c.vendorLogo}
                  </div>
                  {c.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold border-2 border-white">
                      {c.unread}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="t-body font-semibold truncate">{c.vendorName}</span>
                    <span className="text-[10px] text-ink-900/40 flex-shrink-0">Now</span>
                  </div>
                  <p className="t-meta truncate mt-0.5">
                    {c.messages[c.messages.length - 1]?.text || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))}
            <button
              className="w-full py-3 text-center text-sm font-semibold text-primary-500"
              onClick={() => setCurrentScreen('chat')}
            >
              View all conversations
            </button>
          </div>
        ) : (
          <EmptyTab
            title="No messages yet"
            subtitle="Start a conversation with a vendor."
            ctaLabel="Explore vendors"
            onCta={() => setCurrentScreen('explore')}
          />
        )
      )}

      {activeTab === 'collections' && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Wedding Vendors', count: savedVendors.filter(v => ['photography', 'events', 'catering', 'beauty'].includes(v.category)).length, color: '#FFB199' },
            { label: 'Creative Services', count: savedVendors.filter(v => ['photography', 'tech', 'fashion'].includes(v.category)).length, color: '#C9B6FF' },
            { label: 'Food Vendors', count: savedVendors.filter(v => v.category === 'catering').length, color: '#FFE082' },
            { label: 'My Shortlist', count: savedVendors.length, color: '#6FE3C2' },
          ].map(c => (
            <button
              key={c.label}
              className="card-tile h-28 flex flex-col justify-between text-left active:scale-[0.98] transition"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: c.color }}>
                <Folder size={14} className="text-ink-900" />
              </div>
              <div>
                <p className="t-body font-semibold truncate">{c.label}</p>
                <p className="t-meta">{c.count} vendors</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Become a vendor — dark CTA card */}
      <button
        className="card-ink mt-6 w-full text-left active:scale-[0.99] transition"
        onClick={() => setCurrentScreen('vendor-registration')}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="t-label" style={{ color: '#A5A5B5' }}>For business</p>
            <p className="text-lg font-bold text-white mt-1">List your business</p>
            <p className="text-xs mt-1" style={{ color: '#A5A5B5' }}>Reach customers across Namibia</p>
          </div>
          <div className="btn-circle btn-circle-mint w-10 h-10 flex-shrink-0">
            <ArrowUpRight size={16} />
          </div>
        </div>
      </button>

      <ProfileMenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onShowToast={showToast}
        onNavigate={setCurrentScreen}
        onSignOut={signOut}
        counts={{
          saved: savedVendors.length,
          collections: 4,
          quotes: quoteRequests.length,
        }}
      />
    </div>
  );
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="card-tile text-center">
      <p className="text-2xl font-bold text-ink-900">{value}</p>
      <p className="t-label mt-1">{label}</p>
    </div>
  );
}

function TabButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold transition ${
        active ? 'bg-ink-900 text-white' : 'text-ink-900/60'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function EmptyTab({ title, subtitle, ctaLabel, onCta }: { title: string; subtitle: string; ctaLabel?: string; onCta?: () => void }) {
  return (
    <div className="card text-center py-12">
      <div className="w-14 h-14 rounded-full bg-cream-100 mx-auto flex items-center justify-center mb-3">
        <Grid3X3 size={20} className="text-ink-900/40" />
      </div>
      <p className="t-body font-semibold">{title}</p>
      <p className="t-meta mt-1">{subtitle}</p>
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="mt-4 px-5 py-2.5 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-xs font-semibold transition"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
