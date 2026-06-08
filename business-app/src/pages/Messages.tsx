import { Search, Image as ImageIcon } from 'lucide-react';

export default function Messages() {
  const conversations = [
    { id: 1, name: 'Alice Smith', message: 'Hi, are you available for a wedding on the 24th?', time: '10:42 AM', unread: 2 },
    { id: 2, name: 'John Doe', message: 'Thanks for the quote. Can we negotiate the price?', time: 'Yesterday', unread: 0 },
    { id: 3, name: 'Emma Johnson', message: 'Sent an attachment', type: 'attachment', time: 'Mon', unread: 0 },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background sticky top-0 z-10">
        <h2 className="text-xl font-bold mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="w-full pl-9 pr-4 py-2 bg-muted/50 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map(conv => (
          <div key={conv.id} className="flex items-center p-4 border-b hover:bg-muted/30 cursor-pointer transition-colors">
            <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-lg font-bold text-muted-foreground">
              {conv.name.charAt(0)}
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className={`font-medium text-sm truncate ${conv.unread > 0 ? 'text-foreground' : 'text-foreground/90'}`}>{conv.name}</h3>
                <span className={`text-[10px] whitespace-nowrap ml-2 ${conv.unread > 0 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{conv.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className={`text-sm truncate mr-2 ${conv.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {conv.type === 'attachment' ? (
                    <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {conv.message}</span>
                  ) : conv.message}
                </p>
                {conv.unread > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
