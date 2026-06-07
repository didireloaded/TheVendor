import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface Toast {
  id: number;
  message: string;
  type: string;
}

export interface QuoteRequest {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorLogo: string;
  vendorColor: string;
  service: string;
  budget: string;
  date: string;
  notes: string;
  status: 'pending' | 'viewed' | 'responded' | 'accepted' | 'declined' | 'completed';
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'vendor' | 'system';
  time: number;
  read: boolean;
  type?: 'text' | 'quote';
  quoteId?: string;
}

export interface Conversation {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorLogo: string;
  vendorColor: string;
  verified: boolean;
  verifiedLevel: string;
  type: 'quote' | 'booking' | 'general' | 'support';
  messages: ChatMessage[];
  lastActivity: number;
  unread: number;
}

interface AppContextType {
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;

  quoteRequests: QuoteRequest[];
  addQuoteRequest: (q: Omit<QuoteRequest, 'id' | 'createdAt' | 'status'>) => QuoteRequest;

  conversations: Conversation[];
  getConversationByVendor: (vendorId: string) => Conversation | undefined;
  createOrGetConversation: (data: { vendorId: string; vendorName: string; vendorLogo: string; vendorColor: string; verified: boolean; verifiedLevel: string; type?: Conversation['type'] }) => Conversation;
  createSupportConversation: () => Conversation;
  sendMessage: (conversationId: string, text: string, sender?: 'user' | 'vendor' | 'system', extras?: Partial<ChatMessage>) => void;
  markRead: (conversationId: string) => void;

  showToast: (message: string, type?: string) => void;
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  selectedVendorId: string | null;
  setSelectedVendorId: (id: string | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch { /* noop */ }
  return fallback;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(loadFromStorage<string[]>('tv_favorites', [])));
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => loadFromStorage('tv_recently_viewed', []));
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>(() => loadFromStorage('tv_quotes', []));
  const [conversations, setConversations] = useState<Conversation[]>(() => loadFromStorage('tv_conversations', []));

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Persist
  useEffect(() => { localStorage.setItem('tv_favorites', JSON.stringify([...favorites])); }, [favorites]);
  useEffect(() => { localStorage.setItem('tv_recently_viewed', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);
  useEffect(() => { localStorage.setItem('tv_quotes', JSON.stringify(quoteRequests)); }, [quoteRequests]);
  useEffect(() => { localStorage.setItem('tv_conversations', JSON.stringify(conversations)); }, [conversations]);

  const showToast = useCallback((message: string, type = '') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); showToast('Removed from saved'); }
      else { next.add(id); showToast('Saved to your collection', 'success'); }
      return next;
    });
  }, [showToast]);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  const addRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewed(prev => {
      const next = [id, ...prev.filter(v => v !== id)].slice(0, 12);
      return next;
    });
  }, []);

  const createOrGetConversation: AppContextType['createOrGetConversation'] = useCallback((data) => {
    const existing = conversations.find(c => c.vendorId === data.vendorId);
    if (existing) return existing;
    const newConvo: Conversation = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      vendorId: data.vendorId,
      vendorName: data.vendorName,
      vendorLogo: data.vendorLogo,
      vendorColor: data.vendorColor,
      verified: data.verified,
      verifiedLevel: data.verifiedLevel,
      type: data.type || 'general',
      messages: [],
      lastActivity: Date.now(),
      unread: 0,
    };
    setConversations(prev => [newConvo, ...prev]);
    return newConvo;
  }, [conversations]);

  const getConversationByVendor = useCallback((vendorId: string) => {
    return conversations.find(c => c.vendorId === vendorId);
  }, [conversations]);

  const createSupportConversation = useCallback(() => {
    const existing = conversations.find(c => c.type === 'support' || c.vendorId === 'support');
    if (existing) return existing;
    const supportConvo: Conversation = {
      id: `c-support-${Date.now()}`,
      vendorId: 'support',
      vendorName: 'The Vendor Support',
      vendorLogo: 'TV',
      vendorColor: 'linear-gradient(135deg, #1A6FEF, #0F2B4C)',
      verified: true,
      verifiedLevel: 'pro',
      type: 'support',
      messages: [
        {
          id: `m-support-${Date.now()}`,
          text: 'Welcome to The Vendor Support. Tell us what you need help with.',
          sender: 'system',
          time: Date.now(),
          read: true,
        },
      ],
      lastActivity: Date.now(),
      unread: 0,
    };
    setConversations(prev => [supportConvo, ...prev]);
    return supportConvo;
  }, [conversations]);

  const sendMessage = useCallback((conversationId: string, text: string, sender: 'user' | 'vendor' | 'system' = 'user', extras?: Partial<ChatMessage>) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      const msg: ChatMessage = {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text,
        sender,
        time: Date.now(),
        read: sender === 'user',
        ...extras,
      };
      return {
        ...c,
        messages: [...c.messages, msg],
        lastActivity: Date.now(),
        unread: sender === 'vendor' ? c.unread + 1 : c.unread,
      };
    }));

    // Simulate vendor auto-reply for first user message
    if (sender === 'user') {
      setTimeout(() => {
        setConversations(prev => prev.map(c => {
          if (c.id !== conversationId) return c;
          const isFirstUserMsg = c.messages.filter(m => m.sender === 'user').length <= 1;
          if (!isFirstUserMsg) return c;
          const replyMsg: ChatMessage = {
            id: `m-${Date.now()}-r`,
            text: 'Thanks for reaching out! I will get back to you with details shortly.',
            sender: 'vendor',
            time: Date.now(),
            read: false,
          };
          return { ...c, messages: [...c.messages, replyMsg], lastActivity: Date.now(), unread: c.unread + 1 };
        }));
      }, 2500);
    }
  }, []);

  const markRead = useCallback((conversationId: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId
      ? { ...c, unread: 0, messages: c.messages.map(m => ({ ...m, read: true })) }
      : c
    ));
  }, []);

  const addQuoteRequest: AppContextType['addQuoteRequest'] = useCallback((q) => {
    const quote: QuoteRequest = {
      ...q,
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      status: 'pending',
      createdAt: Date.now(),
    };
    setQuoteRequests(prev => [quote, ...prev]);
    return quote;
  }, []);

  return (
    <AppContext.Provider value={{
      favorites, toggleFavorite, isFavorite,
      recentlyViewed, addRecentlyViewed,
      quoteRequests, addQuoteRequest,
      conversations, getConversationByVendor, createOrGetConversation, createSupportConversation, sendMessage, markRead,
      showToast,
      currentScreen, setCurrentScreen,
      selectedVendorId, setSelectedVendorId,
      selectedCategory, setSelectedCategory,
      activeConversationId, setActiveConversationId,
    }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
        ))}
      </div>
    </AppContext.Provider>
  );
}
