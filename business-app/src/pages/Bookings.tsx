import { useState } from 'react';
import { Calendar, MapPin, Clock, MoreVertical, CreditCard } from 'lucide-react';

export default function Bookings() {
  const [activeTab, setActiveTab] = useState('Upcoming');

  const bookings = [
    { id: 1, customer: 'Alice Smith', service: 'Wedding Photography (Full Day)', date: 'Oct 24, 2026', time: '08:00 AM', location: 'Safari Court, Windhoek', status: 'Confirmed', amount: 'N$ 12,000' },
    { id: 2, customer: 'John Doe', service: 'Corporate Event Coverage', date: 'Nov 12, 2026', time: '14:00 PM', location: 'Hilton Hotel', status: 'Pending', amount: 'N$ 5,500' }
  ];

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="p-4 bg-background border-b sticky top-0 z-10 space-y-3">
        <h2 className="text-xl font-bold">Bookings</h2>
        
        <div className="flex bg-muted rounded-lg p-0.5">
          {['Upcoming', 'Pending', 'Past'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {bookings.filter(b => activeTab === 'All' || b.status === (activeTab === 'Upcoming' ? 'Confirmed' : activeTab)).length > 0 ? (
          bookings.map(booking => (
            <div key={booking.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h3 className="font-semibold text-lg">{booking.customer}</h3>
                  <p className="text-sm font-medium text-primary mt-0.5">{booking.service}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${booking.status === 'Confirmed' ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-700'}`}>
                    {booking.status}
                  </span>
                  <button className="text-muted-foreground"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {booking.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {booking.time}</span>
                <span className="flex items-center gap-1.5 col-span-2"><MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {booking.location}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t mt-1">
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <CreditCard className="w-4 h-4 text-muted-foreground" /> {booking.amount}
                </span>
                <button className="text-sm text-primary font-medium hover:underline">View Details</button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No {activeTab.toLowerCase()} bookings found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
