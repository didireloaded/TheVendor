import { NavLink } from 'react-router-dom';
import { Home, Inbox, MessageSquare, Image, Briefcase, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export function BottomNavigation() {
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/leads', icon: Inbox, label: 'Leads' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/content', icon: Image, label: 'Content' },
    { to: '/business', icon: Briefcase, label: 'Business' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
