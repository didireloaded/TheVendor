import { ArrowUpRight, Briefcase, FileText, MessageSquare, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VENDORS } from '../data/vendors';

export default function BusinessDashboardScreen() {
  const { setCurrentScreen, conversations, quoteRequests } = useApp();
  const vendor = VENDORS.find(v => v.featured) || VENDORS[0];
  const totalMessages = conversations.reduce((s, c) => s + c.messages.length, 0);
  const totalQuotes = quoteRequests.length;
  const views = vendor.profileViews || 2450;
  const leads = totalMessages + totalQuotes;

  return (
    <div className="pb-20">
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <button onClick={() => setCurrentScreen('profile')} className="btn-circle">
          <ArrowUpRight size={18} className="rotate-180" />
        </button>
        <h1 className="t-h1">Dashboard</h1>
        <div className="w-11 h-11" />
      </header>

      {/* Hero Stats */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-6">
        <StatCard title="Total Leads" value={leads.toString()} icon={<Target size={18} className="text-primary-500" />} />
        <StatCard title="Revenue" value={`N$ ${(views * 18.5).toLocaleString()}`} icon={<DollarSign size={18} className="text-green-500" />} />
      </div>

      <section className="px-5 mb-6">
        <h2 className="t-h2 mb-3">Insights</h2>
        <div className="card space-y-4">
          <InsightRow icon={<Users size={16} />} title="Profile Views" value={views.toString()} change="+12%" />
          <InsightRow icon={<MessageSquare size={16} />} title="Messages" value={totalMessages.toString()} change="+5%" />
          <InsightRow icon={<FileText size={16} />} title="Quote Requests" value={totalQuotes.toString()} change="-2%" />
          <InsightRow icon={<TrendingUp size={16} />} title="Conversion Rate" value="14.2%" change="+8%" />
        </div>
      </section>

      <section className="px-5">
        <h2 className="t-h2 mb-3">Management</h2>
        <div className="grid grid-cols-2 gap-3">
          <ActionTile title="Leads" icon={<Users />} />
          <ActionTile title="Messages" icon={<MessageSquare />} />
          <ActionTile title="Products" icon={<Briefcase />} />
          <ActionTile title="Opportunities" icon={<FileText />} />
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="card text-left p-4">
      <div className="mb-2">{icon}</div>
      <p className="t-label">{title}</p>
      <p className="text-xl font-black text-ink-900 mt-0.5">{value}</p>
    </div>
  );
}

function InsightRow({ icon, title, value, change }: { icon: React.ReactNode; title: string; value: string; change: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center text-ink-900">{icon}</div>
      <div className="flex-1">
        <p className="t-body font-semibold">{title}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-black text-ink-900">{value}</p>
        <p className={`text-[10px] font-bold ${change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{change}</p>
      </div>
    </div>
  );
}

function ActionTile({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <button className="card-tile flex items-center gap-2 p-4 text-left active:scale-[0.98] transition">
      <div className="text-ink-900/60">{icon}</div>
      <span className="t-body font-semibold">{title}</span>
    </button>
  );
}
