import { Bell } from 'lucide-react';

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex h-14 items-center justify-between px-4">
        <h1 className="text-lg font-bold text-primary">The Vendor Business</h1>
        <button className="relative p-2 rounded-full hover:bg-muted text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
