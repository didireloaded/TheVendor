import { Store, Scissors, Package, Clock, ShieldCheck, ChevronRight, MapPin } from 'lucide-react';

export default function Business() {
  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="p-4 bg-background border-b sticky top-0 z-10">
        <h2 className="text-xl font-bold">Business Management</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Verification Status */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-primary">Verified Business</h3>
            <p className="text-sm text-primary/80 mt-1">Your business is fully verified and visible to customers.</p>
          </div>
        </div>

        {/* Business Settings Items */}
        <div className="space-y-4">
          <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider px-1">Profile & Details</h3>
          <div className="bg-card border rounded-xl overflow-hidden divide-y">
            <MenuButton icon={<Store />} title="Business Information" subtitle="Name, description, categories" />
            <MenuButton icon={<MapPin />} title="Location & Areas" subtitle="Address and service radius" />
            <MenuButton icon={<Clock />} title="Operating Hours" subtitle="Set your weekly availability" />
          </div>

          <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider px-1 pt-2">Offerings</h3>
          <div className="bg-card border rounded-xl overflow-hidden divide-y">
            <MenuButton icon={<Scissors />} title="Services" subtitle="Manage services, pricing, and duration" />
            <MenuButton icon={<Package />} title="Products" subtitle="Manage inventory and products" />
          </div>

          <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider px-1 pt-2">Status</h3>
          <div className="bg-card border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Accepting New Business</p>
              <p className="text-xs text-muted-foreground mt-0.5">Toggle your availability on The Vendor</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuButton({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) {
  return (
    <button className="w-full flex items-center p-4 hover:bg-muted/30 transition-colors text-left">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground mr-4 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}
