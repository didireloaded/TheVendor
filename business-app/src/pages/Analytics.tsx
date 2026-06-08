import { BarChart3, TrendingUp, Users, Eye, ArrowUpRight } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="p-4 bg-background border-b sticky top-0 z-10">
        <h2 className="text-xl font-bold">Analytics</h2>
        <div className="flex gap-2 mt-3">
          {['7 Days', '30 Days', '12 Months', 'All Time'].map(period => (
            <button key={period} className={`px-3 py-1 rounded-full text-xs font-medium ${period === '30 Days' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Profile Views" value="4,209" trend="+12%" icon={<Eye />} />
          <StatCard title="Leads Generated" value="84" trend="+5%" icon={<Users />} />
          <StatCard title="Conversion Rate" value="14.2%" trend="+2.1%" icon={<TrendingUp />} />
          <StatCard title="Total Revenue" value="N$ 45k" trend="+18%" icon={<BarChart3 />} />
        </div>

        {/* Location Analytics Mock */}
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">Top Locations</h3>
          <div className="space-y-3">
            <LocationBar city="Windhoek" percentage={65} />
            <LocationBar city="Swakopmund" percentage={20} />
            <LocationBar city="Walvis Bay" percentage={10} />
            <LocationBar city="Oshakati" percentage={5} />
          </div>
        </div>

        {/* Search Analytics Mock */}
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">Top Search Keywords</h3>
          <div className="space-y-2">
            {['Wedding Photographer', 'Event Catering', 'Party Decor', 'Corporate DJ'].map((keyword, i) => (
              <div key={keyword} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{i + 1}. {keyword}</span>
                <span className="font-medium">{Math.floor(400 / (i + 1))} searches</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="p-3 bg-card border rounded-xl shadow-sm">
      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
        {icon}
      </div>
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
      <p className="text-xs text-primary font-medium flex items-center mt-1">
        <ArrowUpRight className="w-3 h-3 mr-0.5" /> {trend}
      </p>
    </div>
  );
}

function LocationBar({ city, percentage }: { city: string, percentage: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium">{city}</span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
