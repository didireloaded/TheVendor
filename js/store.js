// ============================================
// THE VENDOR — Centralized Data Store
// Supabase-backed vendor management with CRUD API
// ============================================

import { supabase } from './supabaseClient.js';

const STORAGE_KEYS = {
  seedingHistory: 'tv_seeding_history',
  settings: 'tv_admin_settings',
};

// ---------- Default Settings ----------
const DEFAULT_SETTINGS = {
  qualityThresholds: {
    low: 30,
    medium: 60,
  },
  autoFlagRules: {
    flagNoContact: true,       // Flag vendors with no phone/email/whatsapp
    flagNoDescription: true,   // Flag vendors with empty description
    flagDuplicates: true,      // Auto-flag potential duplicates
  },
};

// ---------- Internal Helpers ----------
function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('[Store] Failed to save:', e);
  }
}

function generateId(name, city) {
  const slug = (name || 'vendor')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const citySlug = (city || 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const rand = Math.random().toString(36).substring(2, 6);
  return `${slug}-${citySlug}-${rand}`;
}

function normalizeUrl(url) {
  if (!url) return null;
  return url.toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '');
}

function normalizePhone(phone) {
  if (!phone) return null;
  return phone.replace(/[\s\-\(\)]/g, '');
}

function levenshteinDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------- Quality Score Calculator ----------
export function calculateQualityScore(vendor) {
  let score = 0;
  if (vendor.website) score += 15;
  if (vendor.facebook) score += 10;
  if (vendor.instagram) score += 10;
  if (vendor.phone) score += 10;
  if (vendor.whatsapp) score += 5;
  if (vendor.email) score += 10;
  if (vendor.address) score += 10;
  if (vendor.description && vendor.description.length > 50) score += 10;
  if (vendor.photos && vendor.photos.length > 0) score += 10;
  if (vendor.rating && vendor.reviewCount > 0) score += 10;
  return Math.min(score, 100);
}

// ---------- Store Class ----------
class VendorStore {
  constructor() {
    this._history = loadFromStorage(STORAGE_KEYS.seedingHistory) || [];
    this._settings = loadFromStorage(STORAGE_KEYS.settings) || { ...DEFAULT_SETTINGS };
    this._cache = null; // Used for duplicate detection during seeding
  }

  // --- Persistence for Local Info ---
  _saveHistory() {
    saveToStorage(STORAGE_KEYS.seedingHistory, this._history);
  }

  _saveSettings() {
    saveToStorage(STORAGE_KEYS.settings, this._settings);
  }

  // --- Cache (Useful for bulk operations) ---
  async preloadCache() {
    const { data } = await supabase.from('vendors').select('*');
    this._cache = data || [];
    return this._cache;
  }

  clearCache() {
    this._cache = null;
  }

  // --- CRUD ---
  async addVendor(vendorData) {
    const id = vendorData.id || generateId(vendorData.businessName, vendorData.city);

    // Check for exact id collision
    const { data: existing } = await supabase.from('vendors').select('id').eq('id', id).maybeSingle();
    if (existing) {
      return { success: false, reason: 'duplicate_id', id };
    }

    const vendor = {
      ...vendorData,
      id,
      vendorQualityScore: calculateQualityScore(vendorData),
      status: vendorData.status || 'pending_review',
      discoveredAt: vendorData.discoveredAt || new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
    };

    const { data, error } = await supabase.from('vendors').insert(vendor).select().single();
    if (error) {
      console.error('[Store] addVendor error:', error);
      return { success: false, reason: 'db_error', error };
    }
    
    return { success: true, id, vendor: data };
  }

  async updateVendor(id, updates) {
    // We need the existing vendor to re-calculate quality score correctly
    const { data: existingVendor } = await supabase.from('vendors').select('*').eq('id', id).single();
    if (!existingVendor) return { success: false, reason: 'not_found' };

    const merged = { ...existingVendor, ...updates };
    const newQuality = calculateQualityScore(merged);

    const { data, error } = await supabase
      .from('vendors')
      .update({ ...updates, vendorQualityScore: newQuality })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, reason: 'db_error', error };
    return { success: true, vendor: data };
  }

  async getVendor(id) {
    if (this._cache) {
      return this._cache.find(v => v.id === id) || null;
    }
    const { data, error } = await supabase.from('vendors').select('*').eq('id', id).maybeSingle();
    if (error) console.error('[Store] getVendor error:', error);
    return data || null;
  }

  async getAllVendors(filters = {}) {
    let query = supabase.from('vendors').select('*');

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.city) query = query.eq('city', filters.city);
    if (filters.region) query = query.eq('region', filters.region);
    
    if (filters.minQuality !== undefined) query = query.gte('vendorQualityScore', filters.minQuality);
    if (filters.maxQuality !== undefined) query = query.lte('vendorQualityScore', filters.maxQuality);

    if (filters.search) {
      const q = `%${filters.search}%`;
      // OR query for text fields
      query = query.or(`businessName.ilike.${q},category.ilike.${q},city.ilike.${q},description.ilike.${q}`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[Store] getAllVendors error:', error);
      return [];
    }

    let results = data || [];

    // Sorting locally since dynamic sorts in PostgREST can be tricky with exact conditions here
    if (filters.sortBy) {
      const dir = filters.sortDir === 'asc' ? 1 : -1;
      results.sort((a, b) => {
        switch (filters.sortBy) {
          case 'name': return dir * (a.businessName || '').localeCompare(b.businessName || '');
          case 'quality': return dir * (a.vendorQualityScore - b.vendorQualityScore);
          case 'date': return dir * (new Date(a.discoveredAt) - new Date(b.discoveredAt));
          case 'category': return dir * (a.category || '').localeCompare(b.category || '');
          default: return 0;
        }
      });
    }

    return results;
  }

  async deleteVendor(id) {
    const { error } = await supabase.from('vendors').delete().eq('id', id);
    if (error) return { success: false, reason: 'db_error', error };
    return { success: true };
  }

  // --- Status Management ---
  async approveVendor(id) {
    return this.updateVendor(id, {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin',
    });
  }

  async rejectVendor(id, reason = '') {
    return this.updateVendor(id, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin',
      notes: reason,
    });
  }

  async flagVendor(id, reason = '') {
    return this.updateVendor(id, {
      status: 'flagged',
      notes: reason,
    });
  }

  // --- Queries ---
  async getVendorsByStatus(status) {
    const { data } = await supabase.from('vendors').select('*').eq('status', status);
    return data || [];
  }

  async getVendorsByCategory(categoryId) {
    const { data } = await supabase.from('vendors').select('*').eq('category', categoryId);
    return data || [];
  }

  async getVendorsByCity(city) {
    const { data } = await supabase.from('vendors').select('*').eq('city', city);
    return data || [];
  }

  async getApprovedVendors() {
    const { data } = await supabase.from('vendors').select('*').eq('status', 'approved');
    return data || [];
  }

  // --- Duplicate Detection ---
  async getDuplicateCandidates(vendor) {
    // If not cached, fetch all to do advanced matching (or just fetch same category/city to optimize)
    let allVendors = this._cache;
    if (!allVendors) {
       // Optimize by only fetching vendors in the same city if we can't use cache
       const { data } = await supabase.from('vendors').select('*');
       allVendors = data || [];
    }

    const candidates = [];
    for (const existing of allVendors) {
      if (existing.id === vendor.id) continue;

      let matchScore = 0;
      const reasons = [];

      if (vendor.businessName && existing.businessName &&
          vendor.businessName.toLowerCase() === existing.businessName.toLowerCase()) {
        matchScore += 50;
        reasons.push('Exact name match');
      } else if (vendor.businessName && existing.businessName) {
        const dist = levenshteinDistance(
          vendor.businessName.toLowerCase(),
          existing.businessName.toLowerCase()
        );
        if (dist <= 3) {
          matchScore += 30;
          reasons.push(`Similar name (distance: ${dist})`);
        }
      }

      const vPhone = normalizePhone(vendor.phone);
      const ePhone = normalizePhone(existing.phone);
      if (vPhone && ePhone && vPhone === ePhone) {
        matchScore += 40;
        reasons.push('Phone number match');
      }

      const vUrl = normalizeUrl(vendor.website);
      const eUrl = normalizeUrl(existing.website);
      if (vUrl && eUrl && vUrl === eUrl) {
        matchScore += 40;
        reasons.push('Website match');
      }

      if (vendor.latitude && vendor.longitude && existing.latitude && existing.longitude) {
        const dist = haversineDistance(
          vendor.latitude, vendor.longitude,
          existing.latitude, existing.longitude
        );
        if (dist < 100) {
          matchScore += 20;
          reasons.push(`GPS proximity (${Math.round(dist)}m)`);
        }
      }

      if (matchScore >= 40) {
        candidates.push({
          vendor: existing,
          matchScore,
          reasons,
        });
      }
    }

    return candidates.sort((a, b) => b.matchScore - a.matchScore);
  }

  async isDuplicate(vendor) {
    const candidates = await this.getDuplicateCandidates(vendor);
    return candidates.some(c => c.matchScore >= 50);
  }

  // --- Statistics ---
  async getStats() {
    const { data } = await supabase.from('vendors').select('*');
    const vendors = data || [];
    
    const stats = {
      total: vendors.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      flagged: 0,
      incomplete: 0,
      byCategory: {},
      byCity: {},
      byRegion: {},
      qualityDistribution: { low: 0, medium: 0, high: 0 },
      avgQuality: 0,
    };

    let totalQuality = 0;

    for (const v of vendors) {
      switch (v.status) {
        case 'pending_review': stats.pending++; break;
        case 'approved': stats.approved++; break;
        case 'rejected': stats.rejected++; break;
        case 'flagged': stats.flagged++; break;
      }

      if (v.vendorQualityScore < 30) stats.incomplete++;

      const cat = v.category || 'uncategorized';
      stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;

      const city = v.city || 'Unknown';
      stats.byCity[city] = (stats.byCity[city] || 0) + 1;

      const region = v.region || 'Unknown';
      stats.byRegion[region] = (stats.byRegion[region] || 0) + 1;

      if (v.vendorQualityScore < 30) stats.qualityDistribution.low++;
      else if (v.vendorQualityScore < 60) stats.qualityDistribution.medium++;
      else stats.qualityDistribution.high++;

      totalQuality += v.vendorQualityScore || 0;
    }

    stats.avgQuality = stats.total > 0 ? Math.round(totalQuality / stats.total) : 0;
    return stats;
  }

  // --- Seeding History ---
  logSeedingRun(run) {
    this._history.unshift({
      ...run,
      timestamp: new Date().toISOString(),
    });
    if (this._history.length > 50) this._history.length = 50;
    this._saveHistory();
  }

  getSeedingHistory() {
    return this._history;
  }

  // --- Settings ---
  getSettings() {
    return { ...this._settings };
  }

  updateSettings(newSettings) {
    this._settings = { ...this._settings, ...newSettings };
    this._saveSettings();
  }

  // --- Export/Import ---
  async exportData(format = 'json') {
    const { data } = await supabase.from('vendors').select('*');
    const vendors = data || [];
    
    if (format === 'csv') {
      if (vendors.length === 0) return '';

      const headers = [
        'id', 'businessName', 'category', 'subcategory', 'description',
        'phone', 'whatsapp', 'email', 'website', 'facebook', 'instagram',
        'address', 'latitude', 'longitude', 'city', 'region',
        'services', 'tags', 'rating', 'reviewCount',
        'verificationStatus', 'vendorQualityScore', 'status',
        'source', 'discoveredAt', 'reviewedAt', 'notes'
      ];

      const escapeCSV = (val) => {
        if (val === null || val === undefined) return '';
        const str = Array.isArray(val) ? val.join('; ') : String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"` : str;
      };

      const rows = vendors.map(v =>
        headers.map(h => escapeCSV(v[h])).join(',')
      );

      return [headers.join(','), ...rows].join('\n');
    }
    return JSON.stringify(vendors, null, 2);
  }

  async importData(jsonString) {
    try {
      const vendors = JSON.parse(jsonString);
      if (!Array.isArray(vendors)) throw new Error('Expected array');

      let added = 0, skipped = 0;
      for (const v of vendors) {
        if (!v.businessName) { skipped++; continue; }
        const result = await this.addVendor(v);
        if (result.success) added++;
        else skipped++;
      }

      return { success: true, added, skipped };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // --- Danger Zone ---
  async clearAllData() {
    await supabase.from('vendors').delete().neq('id', '0'); // Delete all
    this._history = [];
    this._saveHistory();
  }

  async clearSeededOnly() {
    await supabase.from('vendors').delete().eq('source', 'manual_seed');
  }

  // --- Utilities ---
  async getUniqueCities() {
    const { data } = await supabase.from('vendors').select('city');
    if (!data) return [];
    return [...new Set(data.map(v => v.city).filter(Boolean))].sort();
  }

  async getUniqueCategories() {
    const { data } = await supabase.from('vendors').select('category');
    if (!data) return [];
    return [...new Set(data.map(v => v.category).filter(Boolean))].sort();
  }

  async getUniqueRegions() {
    const { data } = await supabase.from('vendors').select('region');
    if (!data) return [];
    return [...new Set(data.map(v => v.region).filter(Boolean))].sort();
  }
}

// Singleton
export const store = new VendorStore();
