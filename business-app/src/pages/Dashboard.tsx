import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, MessageSquare, FileText, Calendar, Eye, Bookmark, 
  Star, Activity, ArrowUpRight, TrendingUp, Clock
} from 'lucide-react';
import { useAuthStore } from '../store/auth';

export default function Dashboard() {
  const { vendorProfile } = useAuthStore();
  const [metrics] = useState({
    leads: 12,
    unreadMessages: 5,
    quoteRequests: 3,
    bookings: 8,
    profileViews: 1240,
    savedByCustomers: 45,
    rating: 4.8,
    healthScore: 85
  });

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back, {vendorProfile?.business_name || 'Vendor'}</p>
      </div>

      {/* Health Score */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-xl border border-primary/20 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-primary flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Business Health
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Your profile is performing well.</p>
        </div>
        <div className="text-3xl font-bold text-primary">{metrics.healthScore}</div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/leads"><MetricCard icon={<Users />} label="Today's Leads" value={metrics.leads} trend="+2" /></Link>
        <Link to="/messages"><MetricCard icon={<MessageSquare />} label="Unread" value={metrics.unreadMessages} alert /></Link>
        <Link to="/leads"><MetricCard icon={<FileText />} label="Quote Requests" value={metrics.quoteRequests} /></Link>
        <Link to="/bookings"><MetricCard icon={<Calendar />} label="Bookings" value={metrics.bookings} trend="+1" /></Link>
      </div>

      {/* Secondary Metrics */}
      <h3 className="font-semibold mt-6 mb-3">Performance Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-card border rounded-lg shadow-sm">
          <Eye className="w-4 h-4 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">Profile Views</p>
          <p className="font-bold text-lg">{metrics.profileViews}</p>
        </div>
        <div className="p-3 bg-card border rounded-lg shadow-sm">
          <Bookmark className="w-4 h-4 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">Saves</p>
          <p className="font-bold text-lg">{metrics.savedByCustomers}</p>
        </div>
        <div className="p-3 bg-card border rounded-lg shadow-sm">
          <Star className="w-4 h-4 text-yellow-500 mb-2" />
          <p className="text-xs text-muted-foreground">Rating</p>
          <p className="font-bold text-lg">{metrics.rating}</p>
        </div>
        <Link to="/analytics" className="p-3 bg-card border rounded-lg shadow-sm block hover:bg-muted/30 transition-colors">
          <TrendingUp className="w-4 h-4 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Conversion</p>
          <p className="font-bold text-lg">24%</p>
        </Link>
      </div>

      {/* Widgets Area */}
      <div className="space-y-4">
        <Widget title="Recent Opportunities" action={<Link to="/opportunities" className="text-sm text-primary font-medium hover:underline">View all</Link>}>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Wedding Expo 2026</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> Closes in 2 days
                  </p>
                </div>
                <button className="text-primary text-sm font-medium">Apply</button>
              </div>
            ))}
          </div>
        </Widget>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, trend, alert }: { icon: React.ReactNode, label: string, value: string | number, trend?: string, alert?: boolean }) {
  const isAlertActive = alert && Number(value) > 0;
  return (
    <div className={`p-4 bg-card border rounded-xl shadow-sm relative ${isAlertActive ? 'border-destructive/50 bg-destructive/5' : ''}`}>
      {isAlertActive && <span className="absolute top-3 right-3 w-2 h-2 bg-destructive rounded-full" />}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${isAlertActive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
        {label}
        {trend && <span className="text-primary font-medium flex items-center"><ArrowUpRight className="w-3 h-3" />{trend}</span>}
      </p>
    </div>
  );
}

function Widget({ title, children, action }: { title: string, children: React.ReactNode, action?: React.ReactNode }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">{title}</h3>
        {action && action}
      </div>
      {children}
    </div>
  );
}
