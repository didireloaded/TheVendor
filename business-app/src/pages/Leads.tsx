import { useState } from 'react';
import { Search, Filter, Phone, MessageSquare, MoreVertical, FileText } from 'lucide-react';

type LeadStatus = 'New' | 'Contacted' | 'Quoted' | 'Negotiating' | 'Booked' | 'Completed' | 'Lost';

interface Lead {
  id: string;
  customerName: string;
  service: string;
  status: LeadStatus;
  date: string;
  budget?: string;
  location?: string;
}

const MOCK_LEADS: Lead[] = [
  { id: '1', customerName: 'Alice Smith', service: 'Wedding Photography', status: 'New', date: 'Just now', location: 'Windhoek' },
  { id: '2', customerName: 'John Doe', service: 'Corporate Event Catering', status: 'Quoted', date: '2h ago', budget: 'N$ 5,000' },
  { id: '3', customerName: 'Emma Johnson', service: 'Birthday Cake', status: 'Negotiating', date: '1d ago', location: 'Swakopmund' },
];

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Quoted', 'Negotiating', 'Booked', 'Completed', 'Lost'];

export default function Leads() {
  const [activeTab, setActiveTab] = useState<LeadStatus | 'All'>('All');

  const filteredLeads = activeTab === 'All' 
    ? MOCK_LEADS 
    : MOCK_LEADS.filter(lead => lead.status === activeTab);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background sticky top-0 z-10 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="p-2 border rounded-lg bg-card text-foreground">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
          <button
            onClick={() => setActiveTab('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'All' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All Leads
          </button>
          {STATUSES.map(status => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === status ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredLeads.length > 0 ? (
          filteredLeads.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No leads found in this status.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const statusColors: Record<string, string> = {
    'New': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Contacted': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Quoted': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Negotiating': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Booked': 'bg-primary/20 text-primary-dark dark:bg-primary/20 dark:text-primary',
    'Completed': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    'Lost': 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{lead.customerName}</h3>
          <p className="text-sm text-muted-foreground">{lead.service}</p>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[lead.status] || 'bg-muted text-muted-foreground'}`}>
          {lead.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>{lead.date}</span>
        {lead.location && <span>• {lead.location}</span>}
        {lead.budget && <span className="font-medium text-foreground">• {lead.budget}</span>}
      </div>

      <div className="flex gap-2 pt-2 border-t mt-1">
        <button className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
          <MessageSquare className="w-4 h-4" /> Message
        </button>
        <button className="flex items-center justify-center p-1.5 bg-muted rounded-lg text-foreground hover:bg-muted/80 transition-colors">
          <Phone className="w-4 h-4" />
        </button>
        <button className="flex items-center justify-center p-1.5 bg-muted rounded-lg text-foreground hover:bg-muted/80 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
