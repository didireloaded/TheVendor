import { useState, useEffect, useRef } from 'react';
import {
  Search, Send, ArrowUpRight, MoreHorizontal, Check, CheckCheck, Phone, FileText,
  Plus, Inbox, Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Conversation, ChatMessage, QuoteRequest } from '../context/AppContext';

export default function ChatScreen() {
  const {
    conversations, activeConversationId, setActiveConversationId,
    sendMessage, markRead, quoteRequests, setCurrentScreen,
    setSelectedVendorId, addRecentlyViewed,
  } = useApp();

  const [search, setSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConvo = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    if (activeConvo) markRead(activeConvo.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvo?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvo?.messages.length]);

  const filtered = conversations
    .filter(c => !search || c.vendorName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.lastActivity - a.lastActivity);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConvo) return;
    const msg = newMessage;
    setNewMessage(''); // optimistic clear
    await sendMessage(activeConvo.id, msg);
  };

  // Stats calculation
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);
  const activeQuotes = conversations.filter(c => c.type === 'quote').length;
  const waitingForReply = conversations.filter(c =>
    c.messages.length > 0 && c.messages[c.messages.length - 1].sender === 'user'
  ).length;

  // ============ CONVERSATION VIEW ============
  if (activeConvo) {
    return (
      <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 100px)' }}>
        {/* Header */}
        <div className="px-5 pt-6 pb-4 bg-cream-50">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setActiveConversationId(null)}
              className="btn-circle"
              aria-label="Back"
            >
              <ArrowUpRight size={18} className="rotate-180" />
            </button>
            <button className="btn-circle" aria-label="More">
              <MoreHorizontal size={18} />
            </button>
          </div>

          <button
            className="card flex items-center gap-3 w-full mt-3"
            style={{ padding: '14px 16px' }}
            onClick={() => {
              if (activeConvo.type === 'support') return;
              addRecentlyViewed(activeConvo.vendorId);
              setSelectedVendorId(activeConvo.vendorId);
              setCurrentScreen('vendor-profile');
            }}
          >
            <div className="relative flex-shrink-0">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: activeConvo.vendorColor }}
              >
                {activeConvo.vendorLogo}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-accent-mint border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="t-body font-semibold truncate">{activeConvo.vendorName}</p>
              <p className="t-meta">Online</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button className="btn-circle w-10 h-10" style={{ background: '#F5F2EC' }} aria-label="Call">
                <Phone size={14} />
              </button>
            </div>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-cream-50">
          {activeConvo.messages.length === 0 ? (
            <div className="text-center py-10">
              <p className="t-meta">No messages yet. Send the first message.</p>
            </div>
          ) : (
            activeConvo.messages.map(msg => <MessageBubble key={msg.id} msg={msg} quotes={quoteRequests} />)
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 bg-cream-50">
          <div className="card flex items-end gap-2" style={{ padding: '8px 8px 8px 16px' }}>
            <button className="text-ink-900/60 p-1.5" aria-label="Attach">
              <Plus size={18} />
            </button>
            <textarea
              placeholder="Message"
              rows={1}
              className="flex-1 bg-transparent text-sm outline-none resize-none py-2"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              className="btn-circle btn-circle-dark w-10 h-10 flex-shrink-0"
              onClick={handleSend}
              aria-label="Send"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ LIST VIEW ============
  return (
    <div className="px-5 pt-6 pb-24">
      <header className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrentScreen('home')} className="btn-circle">
          <ArrowUpRight size={18} className="rotate-180" />
        </button>
        <h1 className="t-h1">Messages</h1>
        <div className="w-11 h-11" />
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatTile value={totalUnread} label="Unread" color="#7C5BFF" />
        <StatTile value={activeQuotes} label="Active Quotes" color="#FFB199" />
        <StatTile value={waitingForReply} label="Waiting" color="#6FE3C2" />
      </div>

      {/* Search */}
      <div className="card flex items-center gap-3 mb-5" style={{ padding: '14px 18px' }}>
        <Search size={16} className="text-ink-900/40" />
        <input
          type="text"
          placeholder="Search conversations"
          className="flex-1 text-sm outline-none bg-transparent"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="card text-center py-14">
          <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mx-auto mb-4">
            <Inbox size={26} className="text-ink-900/40" />
          </div>
          <p className="t-body font-semibold">No conversations yet</p>
          <p className="t-meta mt-1 max-w-xs mx-auto">
            Start chatting with vendors by requesting a quote or sending an inquiry.
          </p>
          <button
            className="mt-5 px-5 py-2.5 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold flex items-center gap-2 mx-auto transition"
            onClick={() => setCurrentScreen('explore')}
          >
            <Compass size={14} /> Explore vendors
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-2.5">
        {filtered.map(c => (
          <ConversationItem key={c.id} convo={c} onOpen={() => setActiveConversationId(c.id)} />
        ))}
      </div>
    </div>
  );
}

function StatTile({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="card-tile text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <p className="t-label">{label}</p>
      </div>
      <p className="text-2xl font-bold text-ink-900">{value}</p>
    </div>
  );
}

function ConversationItem({ convo, onOpen }: { convo: Conversation; onOpen: () => void }) {
  const lastMsg = convo.messages[convo.messages.length - 1];
  const lastText = lastMsg
    ? lastMsg.type === 'quote' ? 'Quote request' : lastMsg.text
    : 'No messages yet';

  const timeStr = lastMsg ? formatTime(lastMsg.time) : formatTime(convo.lastActivity);

  return (
    <button
      className="card w-full flex items-center gap-3 text-left active:scale-[0.99] transition"
      style={{ padding: '14px 16px' }}
      onClick={onOpen}
    >
      <div className="relative flex-shrink-0">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: convo.vendorColor }}
        >
          {convo.vendorLogo}
        </div>
        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-accent-mint border-2 border-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="t-body font-semibold truncate">{convo.vendorName}</span>
          <span className="text-[11px] text-ink-900/40 flex-shrink-0">{timeStr}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5 gap-2">
          <span className={`text-xs truncate ${convo.unread > 0 ? 'text-ink-900 font-semibold' : 'text-ink-900/50'}`}>
            {lastText}
          </span>
          {convo.unread > 0 && (
            <span className="w-5 h-5 rounded-full bg-ink-900 text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
              {convo.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ msg, quotes }: { msg: ChatMessage; quotes: QuoteRequest[] }) {
  if (msg.type === 'quote') {
    const quote = quotes.find(q => q.id === msg.quoteId);
    return (
      <div className="card max-w-[90%] self-start" style={{ padding: '14px 16px' }}>
        <div className="flex items-center gap-2 text-ink-900 text-xs font-semibold mb-2">
          <FileText size={13} /> Quote Request
        </div>
        {quote && (
          <div className="space-y-1.5 text-xs">
            <Row label="Service" value={quote.service} />
            {quote.date && <Row label="Date" value={quote.date} />}
            {quote.budget && <Row label="Budget" value={`N$ ${quote.budget}`} />}
            <div className="flex justify-between pt-2 mt-2 border-t border-cream-200">
              <span className="text-ink-900/50">Status</span>
              <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase bg-accent-butter text-ink-900">
                {quote.status}
              </span>
            </div>
          </div>
        )}
        <div className="text-[10px] text-ink-900/40 mt-2">{formatTime(msg.time)}</div>
      </div>
    );
  }

  if (msg.sender === 'system') {
    return (
      <div className="text-center text-[10px] text-ink-900/40 my-1">
        <span className="bg-white px-3 py-1 rounded-full">{msg.text}</span>
      </div>
    );
  }

  return (
    <div className={`max-w-[80%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
      <div
        className={`px-4 py-2.5 text-sm ${
          msg.sender === 'user'
            ? 'bg-ink-900 text-white'
            : 'bg-white text-ink-900'
        }`}
        style={{
          borderRadius: msg.sender === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
        }}
      >
        {msg.text}
      </div>
      <div className={`flex items-center gap-1 mt-1 text-[10px] ${msg.sender === 'user' ? 'justify-end text-ink-900/40' : 'text-ink-900/40'}`}>
        {formatTime(msg.time)}
        {msg.sender === 'user' && (
          msg.read ? <CheckCheck size={11} className="text-ink-900/60" /> : <Check size={11} />
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-900/50">{label}</span>
      <span className="font-semibold text-ink-900">{value}</span>
    </div>
  );
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h`;
  if (diff < 604800_000) return `${Math.floor(diff / 86400_000)}d`;
  return new Date(ts).toLocaleDateString();
}
