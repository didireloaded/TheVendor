import { Search, MapPin, Calendar, Users, Briefcase, Filter } from 'lucide-react';

export default function Opportunities() {

  const opportunities = [
    { id: 1, title: 'Windhoek Wedding Expo', organizer: 'Namibia Events Co', date: 'Oct 12-14, 2026', location: 'Safari Court', type: 'Wedding Expo', status: 'Open' },
    { id: 2, title: 'Swakopmund Food Festival', organizer: 'Coastal Bites', date: 'Dec 1-3, 2026', location: 'Swakopmund Beach', type: 'Food Festival', status: 'Closing Soon' },
    { id: 3, title: 'Corporate Tech Conference', organizer: 'TechNam', date: 'Nov 20, 2026', location: 'Hilton Hotel', type: 'Corporate Event', status: 'Open' }
  ];

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="p-4 bg-background border-b sticky top-0 z-10 space-y-3">
        <h2 className="text-xl font-bold">Opportunities</h2>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search events & tenders..." 
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="p-2 border rounded-lg bg-card text-foreground">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {opportunities.map(opp => (
          <div key={opp.id} className="bg-card border rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{opp.title}</h3>
                <p className="text-sm text-muted-foreground">{opp.organizer}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${opp.status === 'Closing Soon' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                {opp.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {opp.date}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {opp.location}</span>
              <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {opp.type}</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Apply Now</span>
            </div>

            <div className="flex gap-2 pt-2 border-t mt-1">
              <button className="flex-1 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Apply
              </button>
              <button className="flex-1 py-1.5 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
