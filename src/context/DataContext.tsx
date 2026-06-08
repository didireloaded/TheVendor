import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Vendor, Category } from '../data/vendors';
import { CATEGORIES as INITIAL_CATEGORIES } from '../data/vendors';




interface DataContextType {
  vendors: Vendor[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('vendors')
        .select('*');
        
      if (fetchError) throw fetchError;
      
      if (data) {
        // Map Supabase rows to our frontend Vendor type
        const mappedVendors: Vendor[] = data.map((row) => {
          const categoryName = INITIAL_CATEGORIES.find(c => c.id === row.category)?.name || row.category || 'Unknown';
          
          return {
            id: row.id,
            name: row.business_name,
            businessName: row.business_name,
            category: row.category || '',
            categoryName: categoryName,
            description: row.description || '',
            rating: row.rating || 0,
            reviewCount: row.review_count || 0,
            verified: row.verified || false,
            verifiedLevel: (row.verified_level as any) || 'basic',
            featured: row.featured || false,
            distance: 0, // Computed dynamically later
            latitude: row.latitude || 0,
            longitude: row.longitude || 0,
            city: row.city || '',
            region: row.region || '',
            coverGradient: row.cover_gradient || 'linear-gradient(135deg, #1A6FEF, #0D47A1)',
            logoGradient: row.logo_gradient || 'linear-gradient(135deg, #1A6FEF, #0D47A1)',
            logoInitials: row.logo_initials || row.business_name.substring(0, 2).toUpperCase(),
            phone: row.phone || '',
            whatsapp: row.whatsapp || '',
            email: row.email || '',
            website: row.website || '',
            address: row.address || '',
            hours: (row.hours as any) || {
              monday: 'Closed', tuesday: 'Closed', wednesday: 'Closed',
              thursday: 'Closed', friday: 'Closed', saturday: 'Closed', sunday: 'Closed'
            },
            services: [], // Missing in schema, defaulting to empty
            reviews: [], // Missing in schema, defaulting to empty
            galleryColors: [row.cover_gradient || '#1A6FEF', row.logo_gradient || '#0D47A1', '#FFFFFF'],
            responseTime: row.response_time || 'Within 24 hours',
            yearsInBusiness: row.years_in_business || 1,
            acceptsEFT: row.accepts_eft ?? true,
            acceptsCash: row.accepts_cash ?? true,
          };
        });
        
        setVendors(mappedVendors);
        
        // Update category counts
        const updatedCategories = INITIAL_CATEGORIES.map(cat => ({
          ...cat,
          count: mappedVendors.filter(v => v.category === cat.id).length
        }));
        setCategories(updatedCategories);
      }
    } catch (err: any) {
      console.error('Failed to fetch vendors:', err);
      setError(err.message || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <DataContext.Provider value={{ vendors, categories, loading, error, refreshData: fetchVendors }}>
      {children}
    </DataContext.Provider>
  );
}
