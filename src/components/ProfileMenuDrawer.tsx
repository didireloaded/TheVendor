import {
  Bell, Bookmark, ChevronRight, Edit2, FileText, Folder, HelpCircle, LayoutDashboard,
  LogOut, Settings, Shield, X,
} from 'lucide-react';

interface ProfileMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: string) => void;
  onNavigate: (screen: string) => void;
  onSignOut: () => void;
  counts: {
    saved: number;
    collections: number;
    quotes: number;
  };
}

export default function ProfileMenuDrawer({
  open, onClose, onShowToast, onNavigate, onSignOut, counts,
}: ProfileMenuDrawerProps) {
  if (!open) return null;

  const nav = (screen: string) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center"
      style={{ maxWidth: '420px', margin: '0 auto', left: 0, right: 0 }}
    >
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />

      <div
        className="relative w-full bg-cream-50 animate-fadeIn"
        style={{
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
          boxShadow: '0 -12px 40px rgba(11, 11, 18, 0.16)',
        }}
      >
        {/* Handle */}
        <div className="pt-3 pb-2">
          <div className="w-12 h-1 rounded-full bg-ink-900/15 mx-auto" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 flex items-center justify-between">
          <div>
            <h2 className="t-h1">More</h2>
            <p className="t-meta mt-0.5">Account, business, support and settings</p>
          </div>
          <button onClick={onClose} className="btn-circle">
            <X size={16} />
          </button>
        </div>

        {/* Quick tiles */}
        <div className="px-5 grid grid-cols-3 gap-3 pb-5">
          <QuickTile icon={<Folder size={15} />} label="Lists" value={counts.collections} onClick={() => onShowToast('Collections')} />
          <QuickTile icon={<Bookmark size={15} />} label="Saved" value={counts.saved} onClick={() => nav('saved-vendors')} />
          <QuickTile icon={<FileText size={15} />} label="Quotes" value={counts.quotes} onClick={() => nav('chat')} />
        </div>

        {/* Main actions */}
        <div className="px-5 space-y-4 pb-8">
          <Section title="Account">
            <Row icon={<Edit2 size={15} />} label="Profile" onClick={() => { onShowToast('Profile details are shown on the main screen'); onClose(); }} />
            <Row icon={<Bell size={15} />} label="Notifications" onClick={() => nav('notifications')} />
            <Row icon={<Shield size={15} />} label="Privacy & Security" onClick={() => nav('privacy-security')} />
          </Section>

          <Section title="Business">
            <Row icon={<LayoutDashboard size={15} />} label="Business Dashboard" onClick={() => nav('business-dashboard')} />
          </Section>

          <Section title="Support">
            <Row icon={<HelpCircle size={15} />} label="Contact Support" onClick={() => nav('contact-support')} />
            <Row icon={<Shield size={15} />} label="Terms & Privacy" onClick={() => nav('terms-privacy')} />
            <Row icon={<Settings size={15} />} label="App Settings" onClick={() => nav('app-settings')} />
          </Section>

          <button
            onClick={() => { onSignOut(); onClose(); }}
            className="w-full py-3.5 rounded-full bg-cream-100 hover:bg-cream-200 text-red-600 font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="t-label mb-2 px-1">{title}</p>
      <div className="card divide-y divide-cream-200" style={{ padding: '4px 0' }}>
        {children}
      </div>
    </div>
  );
}

function QuickTile({ icon, label, value, onClick }: { icon: React.ReactNode; label: string; value: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card-tile text-center active:scale-[0.98] transition"
    >
      <div className="w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center text-ink-900 mx-auto mb-2">
        {icon}
      </div>
      <p className="text-lg font-bold text-ink-900 leading-none">{value}</p>
      <p className="t-label mt-1">{label}</p>
    </button>
  );
}

function Row({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-cream-100 transition"
    >
      <div className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-ink-900 flex-shrink-0">
        {icon}
      </div>
      <span className="flex-1 t-body font-medium">{label}</span>
      <ChevronRight size={14} className="text-ink-900/30" />
    </button>
  );
}
