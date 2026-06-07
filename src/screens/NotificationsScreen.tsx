import { ArrowUpRight, Bell, Star, Heart, MessageCircle, BadgeCheck, Gift, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Notification {
  id: string;
  type: 'review' | 'favorite' | 'message' | 'promo' | 'verified' | 'quote';
  title: string;
  body: string;
  time: string;
  read: boolean;
  accent: string;
}

const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'message', title: 'New Message', body: 'Namibia Lens Studio replied to your inquiry', time: '2m ago', read: false, accent: '#C9B6FF' },
  { id: 'n2', type: 'quote', title: 'Quote Response', body: 'Sweet Specialities sent you a quote for N$ 5,800', time: '15m ago', read: false, accent: '#FFE082' },
  { id: 'n3', type: 'promo', title: 'Special Offer', body: 'Blikbeker Catering is offering 20% off wedding packages this month', time: '1h ago', read: false, accent: '#FFB199' },
  { id: 'n4', type: 'review', title: 'Review Reminder', body: 'How was your experience with Glow Beauty Studio?', time: '3h ago', read: true, accent: '#6FE3C2' },
  { id: 'n5', type: 'verified', title: 'Vendor Verified', body: 'DJ JT has been verified as a Pro vendor', time: 'Yesterday', read: true, accent: '#6FE3C2' },
  { id: 'n6', type: 'favorite', title: 'Price Update', body: 'A saved vendor updated their pricing', time: '2 days ago', read: true, accent: '#FFB199' },
];

const ICONS: Record<string, React.ReactNode> = {
  review: <Star size={16} />,
  favorite: <Heart size={16} />,
  message: <MessageCircle size={16} />,
  promo: <Gift size={16} />,
  verified: <BadgeCheck size={16} />,
  quote: <FileText size={16} />,
};

export default function NotificationsScreen() {
  const { setCurrentScreen } = useApp();
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="px-5 pt-6">
      <header className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrentScreen('home')} className="btn-circle">
          <ArrowUpRight size={18} className="rotate-180" />
        </button>
        <h1 className="t-h1">Notifications</h1>
        <div className="w-11 h-11" />
      </header>

      {unreadCount > 0 && (
        <div className="card-soft mb-5 flex items-center gap-3" style={{ padding: '14px 18px' }}>
          <div className="w-9 h-9 rounded-full bg-ink-900 flex items-center justify-center text-white">
            <Bell size={15} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-ink-900">{unreadCount} new notification{unreadCount > 1 ? 's' : ''}</p>
            <p className="t-meta">Mark all as read</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {NOTIFICATIONS.map(notif => (
          <button
            key={notif.id}
            className="card w-full flex items-start gap-3 text-left active:scale-[0.99] transition"
            style={{ padding: '14px 16px' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-ink-900"
              style={{ background: notif.accent }}
            >
              {ICONS[notif.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`t-body ${!notif.read ? 'font-bold' : 'font-semibold'} truncate`}>
                  {notif.title}
                </span>
                <span className="text-[10px] text-ink-900/40 flex-shrink-0 font-medium">{notif.time}</span>
              </div>
              <p className="t-meta mt-0.5 line-clamp-2">{notif.body}</p>
            </div>
            {!notif.read && <div className="w-2 h-2 rounded-full bg-ink-900 flex-shrink-0 mt-2" />}
          </button>
        ))}
      </div>

      {NOTIFICATIONS.length === 0 && (
        <div className="card text-center py-14">
          <Bell size={28} className="text-ink-900/30 mx-auto mb-3" />
          <p className="t-body font-semibold">No notifications</p>
          <p className="t-meta mt-1">We'll notify you about updates</p>
        </div>
      )}
    </div>
  );
}
