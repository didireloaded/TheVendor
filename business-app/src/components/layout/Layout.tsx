import { Outlet } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { TopBar } from './TopBar';

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-16">
      <TopBar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
