// ============================================
// THE VENDOR — Reactive State Store
// Centralized state container with caching
// ============================================

import { supabase } from '../lib/supabase.js';

class StateStore {
  constructor() {
    this.state = {
      userLocation: { lat: -22.5594, lng: 17.0628 }, // Default: Windhoek
      searchQuery: '',
      activeCategory: null,
      vendors: {
        featured: [],
        trending: [],
        nearby: [],
        search: [],
        cache: new Map() // ID -> vendor object
      },
      isLoading: false,
      error: null
    };

    this.listeners = new Set();
  }

  // Reactive subscription
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (e) {
        console.error('Listener error:', e);
      }
    }
  }

  _setState(updates) {
    this.state = { ...this.state, ...updates };
    this._notify();
  }

  // Actions
  setLoading(isLoading) {
    this._setState({ isLoading });
  }

  setError(error) {
    this._setState({ error });
  }

  setUserLocation(lat, lng) {
    this._setState({ userLocation: { lat, lng } });
    // Refetch nearby when location changes
    this.fetchNearbyVendors(lat, lng);
  }

  async fetchFeaturedVendors() {
    this.setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('status', 'approved')
        .order('rating', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      const featured = data || [];
      this._updateCache(featured);
      
      this._setState({ 
        vendors: { ...this.state.vendors, featured },
        isLoading: false,
        error: null
      });
      return featured;
    } catch (error) {
      console.error('Failed to fetch featured vendors:', error);
      this.setError(error.message);
      this.setLoading(false);
      return [];
    }
  }

  async fetchTrendingVendors() {
    this.setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('status', 'approved')
        .order('reviewCount', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      const trending = data || [];
      this._updateCache(trending);
      
      this._setState({ 
        vendors: { ...this.state.vendors, trending },
        isLoading: false
      });
      return trending;
    } catch (error) {
      this.setError(error.message);
      this.setLoading(false);
      return [];
    }
  }

  async fetchNearbyVendors(lat = this.state.userLocation.lat, lng = this.state.userLocation.lng, radius = 50) {
    this.setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_vendors_nearby', {
          user_lat: lat,
          user_lng: lng,
          radius_meters: radius * 1000
        });

      if (error) throw error;

      const nearby = data || [];
      this._updateCache(nearby);

      this._setState({ 
        vendors: { ...this.state.vendors, nearby },
        isLoading: false
      });
      return nearby;
    } catch (error) {
      this.setError(error.message);
      this.setLoading(false);
      return [];
    }
  }

  async searchVendors(query) {
    if (!query.trim()) {
      this._setState({ vendors: { ...this.state.vendors, search: [] }, searchQuery: query });
      return [];
    }

    this.setLoading(true);
    this._setState({ searchQuery: query });

    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('status', 'approved')
        .limit(100);

      if (error) throw error;

      const needle = query.trim().toLowerCase();
      const searchResults = (data || []).filter(v =>
        (v.businessName || '').toLowerCase().includes(needle) ||
        (v.description || '').toLowerCase().includes(needle) ||
        (v.category || '').toLowerCase().includes(needle) ||
        (v.city || '').toLowerCase().includes(needle) ||
        (v.region || '').toLowerCase().includes(needle)
      );
      this._updateCache(searchResults);

      this._setState({ 
        vendors: { ...this.state.vendors, search: searchResults },
        isLoading: false
      });
      return searchResults;
    } catch (error) {
      this.setError(error.message);
      this.setLoading(false);
      return [];
    }
  }

  async getVendorById(id) {
    // Check cache first
    if (this.state.vendors.cache.has(id)) {
      return this.state.vendors.cache.get(id);
    }

    this.setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendors') // Fallback to raw table for full details if view lacks something, or use view
        .select('*')
        .eq('status', 'approved')
        .eq('id', id)
        .single();

      if (error) throw error;

      this._updateCache([data]);
      this.setLoading(false);
      return data;
    } catch (error) {
      this.setError(error.message);
      this.setLoading(false);
      return null;
    }
  }

  _updateCache(vendorsArray) {
    const newCache = new Map(this.state.vendors.cache);
    for (const v of vendorsArray) {
      if (v?.id) newCache.set(v.id, v);
    }
    this.state.vendors.cache = newCache;
  }
}

export const appStore = new StateStore();
