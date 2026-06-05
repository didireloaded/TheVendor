// ============================================
// THE VENDOR — Mock Data
// Realistic Namibian vendors, categories, reviews
// ============================================

import { supabase } from './lib/supabase.js';

export let CATEGORIES = [];
export let VENDORS = [];

try {
  const [categoriesRes, vendorsRes] = await Promise.all([
    supabase.from('categories').select('*'),
    supabase.from('vendors').select('*, services(*), reviews(*)')
  ]);

  if (categoriesRes.data) {
    CATEGORIES = categoriesRes.data;
  }
  
  if (vendorsRes.data) {
    VENDORS = vendorsRes.data
      .filter(v => v.verified === true)
      .map(v => ({
      ...v,
      categoryName: v.category_name,
      reviewCount: v.review_count,
      verifiedLevel: v.verified_level,
      isOpen: v.is_open,
      coverGradient: v.cover_gradient,
      logoGradient: v.logo_gradient,
      logoInitials: v.logo_initials,
      galleryColors: v.gallery_colors,
      services: v.services || [],
      reviews: v.reviews ? v.reviews.map(r => ({
        ...r,
        avatarColor: r.avatar_color,
        hasPhotos: r.has_photos,
        photoColors: r.photo_colors
      })) : []
    }));
  }
} catch (e) {
  console.error("Error fetching data from Supabase:", e);
}

// Search suggestions
export const SEARCH_SUGGESTIONS = [
  { text: 'Photographer in Windhoek', category: 'Photography' },
  { text: 'Wedding cake maker', category: 'Food' },
  { text: 'Mechanic near me', category: 'Automotive' },
  { text: 'Wedding DJ', category: 'Events' },
  { text: 'Makeup artist', category: 'Beauty' },
  { text: 'Plumber', category: 'Home Services' },
  { text: 'Web developer', category: 'Technology' },
  { text: 'Car wash', category: 'Automotive' },
  { text: 'Catering service', category: 'Food' },
  { text: 'Hair salon', category: 'Beauty' },
];

// Trending searches
export const TRENDING_SEARCHES = [
  'Wedding photographer',
  'Birthday cake',
  'Car service',
  'Braai catering',
  'Nail artist',
  'DJ for party',
];

// Search placeholder rotation
export const SEARCH_PLACEHOLDERS = [
  'Find a Photographer...',
  'Find a Mechanic...',
  'Find a Cake Maker...',
  'Find a Wedding DJ...',
  'Find a Plumber...',
  'Find a Hair Stylist...',
];

// Helper: get time greeting
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// Helper: get featured vendors
export function getFeaturedVendors() {
  return VENDORS.filter(v => v.featured);
}

// Helper: get trending vendors (highest review count)
export function getTrendingVendors() {
  return [...VENDORS].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 6);
}

// Helper: get new vendors (we'll simulate with last few)
export function getNewVendors() {
  return VENDORS.slice(-4);
}

// Helper: get nearby vendors (sorted by distance)
export function getNearbyVendors(radius = 5) {
  return [...VENDORS].filter(v => v.distance <= radius).sort((a, b) => a.distance - b.distance);
}

// Helper: search vendors
export function searchVendors(query) {
  const q = query.toLowerCase();
  return VENDORS.filter(v =>
    v.name.toLowerCase().includes(q) ||
    v.categoryName.toLowerCase().includes(q) ||
    v.description.toLowerCase().includes(q) ||
    v.services.some(s => s.name.toLowerCase().includes(q))
  );
}

// Helper: get vendor by ID
export function getVendorById(id) {
  return VENDORS.find(v => v.id === id);
}

// Helper: get vendors by category
export function getVendorsByCategory(categoryId) {
  return VENDORS.filter(v => v.category === categoryId);
}
