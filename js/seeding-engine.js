// ============================================
// THE VENDOR — Seeding Engine
// Quality scoring, duplicate detection, batch seeding
// ============================================

import { store } from './store.js';
import { SEED_VENDORS, SEED_CATEGORIES, SEED_CITIES, SEED_REGIONS } from './seed-vendors.js';

// ---------- Seeding Engine ----------
class SeedingEngine {
  constructor() {
    this._catalog = SEED_VENDORS;
  }

  // --- Batch Seeding ---
  async seedByCategory(categoryId) {
    const vendors = this._catalog.filter(v => v.category === categoryId);
    return this._seedBatch(vendors, `category:${categoryId}`);
  }

  async seedByCity(city) {
    const vendors = this._catalog.filter(v =>
      v.city && v.city.toLowerCase() === city.toLowerCase()
    );
    return this._seedBatch(vendors, `city:${city}`);
  }

  async seedByRegion(region) {
    const vendors = this._catalog.filter(v =>
      v.region && v.region.toLowerCase() === region.toLowerCase()
    );
    return this._seedBatch(vendors, `region:${region}`);
  }

  async seedAll() {
    return this._seedBatch(this._catalog, 'all');
  }

  async importJsonBatch(vendors, mode = 'json_upload') {
    if (!Array.isArray(vendors)) throw new Error('Invalid JSON format: expected an array of vendors.');
    return this._seedBatch(vendors, mode);
  }

  async _seedBatch(vendors, mode) {
    const startTime = Date.now();
    let added = 0;
    let skipped = 0;
    const duplicates = [];
    const errors = [];

    // Preload cache to avoid a database roundtrip for every single duplicate check
    await store.preloadCache();

    for (const vendorData of vendors) {
      try {
        // Check if already in store (by id)
        const existing = await store.getVendor(vendorData.id);
        if (existing) {
          skipped++;
          duplicates.push(vendorData.id);
          continue;
        }

        // Check for duplicates by content
        const isDuplicate = await store.isDuplicate(vendorData);
        if (isDuplicate) {
          // Still add but flag as potential duplicate
          const result = await store.addVendor({
            ...vendorData,
            status: 'flagged',
            notes: 'Potential duplicate detected during seeding',
          });
          if (result.success) {
            added++;
            duplicates.push(result.id);
          } else {
            skipped++;
          }
          continue;
        }

        // Auto-flag based on settings
        const settings = store.getSettings();
        let status = 'pending_review';
        let notes = '';

        if (settings.autoFlagRules.flagNoContact &&
            !vendorData.phone && !vendorData.email && !vendorData.whatsapp) {
          status = 'flagged';
          notes = 'No contact information available';
        }

        if (settings.autoFlagRules.flagNoDescription &&
            (!vendorData.description || vendorData.description.length < 10)) {
          status = 'flagged';
          notes = notes ? notes + '; No description' : 'No description available';
        }

        const result = await store.addVendor({
          ...vendorData,
          status,
          notes,
        });

        if (result.success) {
          added++;
        } else {
          skipped++;
          if (result.reason === 'duplicate_id') {
            duplicates.push(vendorData.id);
          }
        }
      } catch (e) {
        errors.push({ id: vendorData.id, error: e.message });
      }
    }

    store.clearCache();

    const duration = Date.now() - startTime;

    // Log the run
    const run = {
      mode,
      totalInCatalog: vendors.length,
      added,
      skipped,
      duplicates: duplicates.length,
      errors: errors.length,
      duration,
    };
    store.logSeedingRun(run);

    return {
      ...run,
      duplicateIds: duplicates,
      errorDetails: errors,
    };
  }

  // --- Catalog Info ---
  getCatalogSize() {
    return this._catalog.length;
  }

  getCategories() {
    return SEED_CATEGORIES;
  }

  getCities() {
    return SEED_CITIES;
  }

  getRegions() {
    return SEED_REGIONS;
  }

  getCategoryCounts() {
    const counts = {};
    for (const v of this._catalog) {
      counts[v.category] = (counts[v.category] || 0) + 1;
    }
    return counts;
  }

  getCityCounts() {
    const counts = {};
    for (const v of this._catalog) {
      counts[v.city] = (counts[v.city] || 0) + 1;
    }
    return counts;
  }

  getRegionCounts() {
    const counts = {};
    for (const v of this._catalog) {
      counts[v.region] = (counts[v.region] || 0) + 1;
    }
    return counts;
  }

  // --- Preview (without inserting) ---
  async previewSeedByCategory(categoryId) {
    await store.preloadCache();
    const vendors = this._catalog.filter(v => v.category === categoryId);
    const results = [];
    
    for (const v of vendors) {
      results.push({
        id: v.id,
        businessName: v.businessName,
        category: v.category,
        city: v.city,
        alreadyInStore: !!(await store.getVendor(v.id)),
        isDuplicate: await store.isDuplicate(v),
      });
    }
    
    store.clearCache();
    return results;
  }

  async previewSeedByCity(city) {
    await store.preloadCache();
    const vendors = this._catalog.filter(v =>
      v.city && v.city.toLowerCase() === city.toLowerCase()
    );
    const results = [];
    
    for (const v of vendors) {
      results.push({
        id: v.id,
        businessName: v.businessName,
        category: v.category,
        city: v.city,
        alreadyInStore: !!(await store.getVendor(v.id)),
        isDuplicate: await store.isDuplicate(v),
      });
    }

    store.clearCache();
    return results;
  }
}

// Singleton
export const seedingEngine = new SeedingEngine();
