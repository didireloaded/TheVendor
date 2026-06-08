import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

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
  addQuoteRequest: (q: Omit<QuoteRequest, 'id' | 'createdAt' | 'status'>) => Promise<QuoteRequest>;

  conversations: Conversation[];
  getConversationByVendor: (vendorId: string) => Conversation | undefined;
  createOrGetConversation: (data: { vendorId: string; vendorName: string; vendorLogo: string; vendorColor: string; verified: boolean; verifiedLevel: string; type?: Conversation['type'] }) => Promise<Conversation>;
  createSupportConversation: () => Promise<Conversation>;
  sendMessage: (conversationId: string, text: string, sender?: 'user' | 'vendor' | 'system', extras?: Partial<ChatMessage>) => Promise<void>;
  markRead: (conversationId: string) => Promise<void>;

  showToast: (message: string, type?: string) => void;
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  selectedVendorId: string | null;
  setSelectedVendorId: (id: string | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;

  user: User | null;
  session: Session | null;
  isGuest: boolean;
  setGuestMode: (guest: boolean) => void;
  signOut: () => Promise<void>;
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
  
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) setIsGuest(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Messaging Data
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setQuoteRequests([]);
      return;
    }

    const loadMessaging = async () => {
      // Fetch Quotes
      const { data: quotesData } = await supabase
        .from('quote_requests')
        .select('*, vendors(business_name, logo_initials, logo_gradient)')
        .eq('user_id', user.id);

      if (quotesData) {
        setQuoteRequests(quotesData.map(q => ({
          id: q.id,
          vendorId: q.vendor_id as string,
          vendorName: q.vendors?.business_name || 'Vendor',
          vendorLogo: q.vendors?.logo_initials || 'V',
          vendorColor: q.vendors?.logo_gradient || '#1A6FEF',
          service: q.service || '',
          budget: q.budget || '',
          date: q.date || '',
          notes: q.notes || '',
          status: (q.status as any) || 'pending',
          createdAt: new Date(q.created_at || Date.now()).getTime(),
        })));
      }

      // Fetch Conversations & Messages
      const { data: convosData } = await supabase
        .from('conversations')
        .select('*, vendors(business_name, logo_initials, logo_gradient, verified, verified_level), messages(*)')
        .eq('user_id', user.id);

      if (convosData) {
        setConversations(convosData.map(c => ({
          id: c.id,
          vendorId: c.vendor_id as string,
          vendorName: c.vendors?.business_name || 'Vendor',
          vendorLogo: c.vendors?.logo_initials || 'V',
          vendorColor: c.vendors?.logo_gradient || '#1A6FEF',
          verified: c.vendors?.verified || false,
          verifiedLevel: c.vendors?.verified_level || 'basic',
          type: (c.type as any) || "general",
          unread: c.unread_count || 0,
          lastActivity: new Date(c.last_activity || Date.now()).getTime(),
          messages: (c.messages || []).map((m: any) => ({
            id: m.id,
            text: m.text,
            sender: (m.sender_id === user?.id ? "user" : "vendor") as "user" | "vendor" | "system",
            time: new Date(m.created_at || Date.now()).getTime(),
            read: m.read,
            type: m.type,
            quoteId: m.quote_id,
          })).sort((a: any, b: any) => a.time - b.time),
        })));
      }
    };

    loadMessaging();
  }, [user]);

  const setGuestMode = useCallback((guest: boolean) => {
    setIsGuest(guest);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setIsGuest(false);
    setFavorites(new Set());
  }, []);

  // Persist local UI settings
  useEffect(() => { localStorage.setItem('tv_favorites', JSON.stringify([...favorites])); }, [favorites]);
  useEffect(() => { localStorage.setItem('tv_recently_viewed', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);

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

  const createOrGetConversation: AppContextType['createOrGetConversation'] = useCallback(async (data) => {
    const existing = conversations.find(c => c.vendorId === data.vendorId);
    if (existing) return existing;

    if (!user) throw new Error('Must be logged in to create conversation');

    // Insert to DB
    const { data: cData, error } = await supabase.from('conversations').insert({
      user_id: user.id,
      vendor_id: data.vendorId,
      type: data.type || 'general'
    }).select('*').single();

    if (error) {
      showToast(error.message, 'error');
      throw error;
    }

    const newConvo: Conversation = {
      id: cData.id,
      vendorId: data.vendorId,
      vendorName: data.vendorName,
      vendorLogo: data.vendorLogo,
      vendorColor: data.vendorColor,
      verified: data.verified,
      verifiedLevel: data.verifiedLevel,
      type: data.type || 'general',
      messages: [],
      lastActivity: new Date(cData.last_activity || Date.now()).getTime(),
      unread: 0,
    };
    
    setConversations(prev => [newConvo, ...prev]);
    return newConvo;
  }, [conversations, user, showToast]);

  const getConversationByVendor = useCallback((vendorId: string) => {
    return conversations.find(c => c.vendorId === vendorId);
  }, [conversations]);

  const createSupportConversation = useCallback(async () => {
    const existing = conversations.find(c => c.type === 'support' || c.vendorId === 'support');
    if (existing) return existing;
    throw new Error('Support chat requires dynamic DB creation logic which is out of scope.');
  }, [conversations]);

  const sendMessage = useCallback(async (conversationId: string, text: string, sender: 'user' | 'vendor' | 'system' = 'user', extras?: Partial<ChatMessage>) => {
    // Insert into Supabase
    const { data: mData, error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user?.id || "",
      text: text,
      type: extras?.type || 'text',
      quote_id: extras?.quoteId || null,
      read: sender === 'user', // user messages are instantly read locally
    }).select('*').single();

    if (error) {
      showToast('Failed to send message', 'error');
      return;
    }

    // Optimistic UI Update
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      const msg: ChatMessage = {
        id: mData.id,
        text,
        sender,
        time: new Date(mData?.created_at || Date.now()).getTime(),
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

    // Auto-reply mock (Simulated system response for demo)
    if (sender === 'user') {
      setTimeout(async () => {
        const convo = conversations.find(c => c.id === conversationId);
        const isFirstUserMsg = convo?.messages.filter(m => m.sender === 'user').length === 1;
        if (!isFirstUserMsg) return;

        const { data: replyData } = await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: undefined, // cannot easily insert as vendor
          text: 'Thanks for reaching out! I will get back to you with details shortly.',
          read: false,
        } as any).select('*').single();

        if (replyData) {
          setConversations(prev => prev.map(c => {
            if (c.id !== conversationId) return c;
            const replyMsg: ChatMessage = {
              id: replyData?.id || `m-${Date.now()}`,
              text: replyData?.text || 'Thanks for reaching out!',
              sender: 'vendor',
              time: new Date(replyData?.created_at || Date.now()).getTime(),
              read: false,
            };
            return { ...c, messages: [...c.messages, replyMsg], lastActivity: Date.now(), unread: c.unread + 1 };
          }));
        }
      }, 2500);
    }
  }, [conversations, showToast]);

  const markRead = useCallback(async (conversationId: string) => {
    // DB Update
    await supabase.from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      ; // mark vendor messages as read

    // UI Update
    setConversations(prev => prev.map(c => c.id === conversationId
      ? { ...c, unread: 0, messages: c.messages.map(m => ({ ...m, read: true })) }
      : c
    ));
  }, []);

  const addQuoteRequest: AppContextType['addQuoteRequest'] = useCallback(async (q) => {
    if (!user) throw new Error('User required to request quote');

    const { data: qData, error } = await supabase.from('quote_requests').insert({
      user_id: user.id,
      vendor_id: q.vendorId,
      service: q.service,
      budget: q.budget,
      date: q.date,
      notes: q.notes,
      status: 'pending'
    }).select('*').single();

    if (error) {
      showToast(error.message, 'error');
      throw error;
    }

    const quote: QuoteRequest = {
      ...q,
      id: qData.id,
      status: 'pending',
      createdAt: new Date(qData.created_at || Date.now()).getTime(),
    };
    
    setQuoteRequests(prev => [quote, ...prev]);
    return quote;
  }, [user, showToast]);

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
      user, session, isGuest, setGuestMode, signOut,
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
