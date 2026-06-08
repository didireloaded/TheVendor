import { ArrowUpRight, BarChart3, BriefcaseBusiness, FileText, MessageSquare, Star, TrendingUp, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';

export default function BusinessDashboardScreen() {
  const { setCurrentScreen, conversations, quoteRequests } = useApp();
  const { vendors } = useData();

  const vendor = useMemo(() => vendors.find(v => v.featured) || vendors[0], [vendors]);

  if (!vendor) {
    return (
      <div className="px-5 pt-6 pb-10 flex flex-col h-full">
        <TopBar title="Business Dashboard" onBack={() => setCurrentScreen('profile')} />
        <div className="flex-1 flex flex-col items-center justify-center text-center mt-20">
          <BriefcaseBusiness size={48} className="text-cream-300 mb-4" />
          <h2 className="text-xl font-bold text-ink-900 mb-2">No Active Business</h2>
          <p className="text-ink-600 max-w-xs">You need to register a business or wait for data to sync to view this dashboard.</p>
        </div>
      </div>
    );
  }

  const totalMessages = conversations.filter(c => c.vendorId === vendor.id).length;
  const totalQuotes = quoteRequests.filter(q => q.vendorId === vendor.id).length;
  const views = vendor.profileViews || 0;
  const leads = totalMessages + totalQuotes;

  return (
    <div className="px-5 pt-6 pb-10">
      <TopBar title="Business Dashboard" onBack={() => setCurrentScreen('profile')} />

      <div className="card-ink mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="t-label" style={{ color: '#A5A5B5' }}>Active business</p>
            <h2 className="text-2xl font-bold text-white mt-1 tracking-tight">{vendor.name}</h2>
            <p className="text-xs mt-1" style={{ color: '#A5A5B5' }}>{vendor.categoryName} · {vendor.city}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white flex-shrink-0">
            <BriefcaseBusiness size={18} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <Stat label="Views" value={views.toString()} color="#6FE3C2" />
          <Stat label="Quotes" value={totalQuotes.toString()} color="#FFE082" />
          <Stat label="Leads" value={leads.toString()} color="#FFB199" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <MetricTile icon={<BarChart3 size={16} />} title="Analytics" value={`${views}`} subtitle="Profile views" />
        <MetricTile icon={<MessageSquare size={16} />} title="Messages" value={`${totalMessages}`} subtitle="Active conversations" />
        <MetricTile icon={<FileText size={16} />} title="Quote Requests" value={`${totalQuotes}`} subtitle="Pending & active" />
        <MetricTile icon={<Star size={16} />} title="Reviews" value={`${vendor.reviewCount}`} subtitle={`${vendor.rating} average` } />
      </div>

      <Section title="Business Modules">
        <ActionRow icon={<TrendingUp size={16} />} title="Analytics" subtitle="Views, saves, quotes and engagement" onClick={() => setCurrentScreen('health')} />
        <ActionRow icon={<MessageSquare size={16} />} title="Messages" subtitle="Respond to customer inquiries" onClick={() => setCurrentScreen('chat')} />
        <ActionRow icon={<FileText size={16} />} title="Quote Requests" subtitle="Review and reply to requests" onClick={() => setCurrentScreen('chat')} />
        <ActionRow icon={<Users size={16} />} title="Customer Leads" subtitle="Track and manage interested customers" onClick={() => setCurrentScreen('chat')} />
      </Section>

      <div className="card-soft mt-6">
        <p className="t-body font-semibold">Next step</p>
        <p className="t-meta mt-1">When Supabase is fully connected, this dashboard will show live vendor analytics, customer conversion, and opportunity applications.</p>
      </div>
    </div>
  );
}

function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="flex items-center justify-between mb-6">
      <button onClick={onBack} className="btn-circle" aria-label="Back">
        <ArrowUpRight size={18} className="rotate-180" />
      </button>
      <h1 className="t-h1">{title}</h1>
      <div className="w-11 h-11" />
    </header>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <p className="t-label" style={{ color: '#A5A5B5' }}>{label}</p>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function MetricTile({ icon, title, value, subtitle }: { icon: React.ReactNode; title: string; value: string; subtitle: string }) {
  return (
    <div className="card-tile">
      <div className="w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center text-ink-900 mb-3">{icon}</div>
      <p className="t-meta">{title}</p>
      <p className="text-2xl font-bold text-ink-900 mt-1 leading-none">{value}</p>
      <p className="t-label mt-2">{subtitle}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <p className="t-label mb-2 px-1">{title}</p>
      <div className="card divide-y divide-cream-200" style={{ padding: '4px 0' }}>{children}</div>
    </section>
  );
}

function ActionRow({ icon, title, subtitle, onClick }: { icon: React.ReactNode; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-cream-100 transition">
      <div className="w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center text-ink-900 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="t-body font-semibold truncate">{title}</p>
        <p className="t-meta truncate">{subtitle}</p>
      </div>
    </button>
  );
}
