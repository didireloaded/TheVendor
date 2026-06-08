import { User, Settings, Shield, Bell, HelpCircle, LogOut, ChevronRight, Star, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function Profile() {
  const { vendorProfile, signOut } = useAuthStore();

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="p-6 bg-background border-b sticky top-0 z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-2xl font-bold mb-3 border-2 border-primary shadow-sm">
          {vendorProfile?.business_name ? vendorProfile.business_name.charAt(0) : 'V'}
        </div>
        <h2 className="text-xl font-bold">{vendorProfile?.business_name || 'My Business'}</h2>
        <p className="text-sm text-muted-foreground mt-1">Vendor ID: {vendorProfile?.id?.substring(0, 8) || 'Unknown'}</p>
        <div className="mt-3 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
          Member since {vendorProfile?.created_at ? new Date(vendorProfile.created_at).getFullYear() : '2026'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider px-1">Account settings</h3>
          <div className="bg-card border rounded-xl overflow-hidden divide-y">
            <MenuButton icon={<User className="w-5 h-5" />} title="Personal Information" />
            <MenuButton icon={<Settings className="w-5 h-5" />} title="Preferences" />
            <MenuButton icon={<Shield className="w-5 h-5" />} title="Security & Password" />
            <MenuButton icon={<Bell className="w-5 h-5" />} title="Push Notifications" />
          </div>

          <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider px-1 pt-2">Business Health</h3>
          <div className="bg-card border rounded-xl overflow-hidden divide-y">
            <Link to="/reviews"><MenuButton icon={<Star className="w-5 h-5 text-yellow-500" />} title="Reviews & Ratings" /></Link>
            <Link to="/analytics"><MenuButton icon={<Activity className="w-5 h-5 text-primary" />} title="Performance Analytics" /></Link>
          </div>

          <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider px-1 pt-2">Support</h3>
          <div className="bg-card border rounded-xl overflow-hidden divide-y">
            <MenuButton icon={<HelpCircle className="w-5 h-5" />} title="Help Center & FAQs" />
          </div>

          <button 
            onClick={() => signOut()}
            className="w-full bg-card border border-destructive/20 rounded-xl p-4 flex items-center justify-center gap-2 text-destructive font-semibold hover:bg-destructive/5 transition-colors mt-6"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuButton({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <button className="w-full flex items-center p-4 hover:bg-muted/30 transition-colors text-left group">
      <div className="text-muted-foreground group-hover:text-foreground transition-colors mr-4">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{title}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
