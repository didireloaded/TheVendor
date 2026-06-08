import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  vendorProfile: any | null;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  vendorProfile: null,
  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Fetch vendor profile
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      set({ session, user: session.user, vendorProfile: vendorData, loading: false });
    } else {
      set({ session: null, user: null, vendorProfile: null, loading: false });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        set({ session, user: session.user, vendorProfile: vendorData });
      } else {
        set({ session: null, user: null, vendorProfile: null });
      }
    });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, vendorProfile: null });
  }
}));
