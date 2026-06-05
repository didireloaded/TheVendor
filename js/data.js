// ============================================
// THE VENDOR — Mock Data
// Realistic Namibian vendors, categories, reviews
// ============================================

import { supabase } from './lib/supabase.js';

export let CATEGORIES = [];
export let VENDORS = [];

export async function initData() {
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
        .filter(v => v.status === 'approved') // Only show approved vendors
        .map(normalizeVendor);
    }
  } catch (e) {
    console.error("Error fetching data from Supabase:", e);
  }
}

function normalizeVendor(v) {
  const name = v.businessName || v.name || 'Unnamed Vendor';
  const categoryName = CATEGORIES.find(c => c.id === v.category)?.name || v.category || 'General';
  const latitude = Number(v.latitude ?? v.lat);
  const longitude = Number(v.longitude ?? v.lng);
  const reviewCount = Number(v.reviewCount ?? v.review_count ?? 0);
  const rating = Number(v.rating ?? 0);
  const logoInitials = v.logoInitials || name.split(/\s+/).map(w => w[0]).join('').substring(0, 2).toUpperCase();

  return {
    ...v,
    name,
    businessName: name,
    categoryName,
    reviewCount,
    rating,
    verifiedLevel: v.verifiedLevel || 'pro',
    verified: v.verificationStatus === 'verified' || v.verified === true,
    featured: Boolean(v.featured) || rating >= 4.7,
    isOpen: v.isOpen ?? v.is_open ?? true,
    distance: Number(v.distance ?? (Math.random() * 15 + 1).toFixed(1)),
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    lat: Number.isFinite(latitude) ? latitude : null,
    lng: Number.isFinite(longitude) ? longitude : null,
    coverGradient: v.coverGradient || v.cover_gradient || 'linear-gradient(135deg, #1A6FEF, #0F2B4C)',
    logoGradient: v.logoGradient || v.logo_gradient || 'linear-gradient(135deg, #1A6FEF, #0F2B4C)',
    logoInitials,
    galleryColors: v.galleryColors || v.gallery_colors || [],
    hours: v.hours || {},
    services: Array.isArray(v.services) ? v.services : [],
    reviews: Array.isArray(v.reviews) ? v.reviews.map(r => ({
      ...r,
      avatar: r.avatar || r.author?.[0] || '?',
      avatarColor: r.avatarColor || r.avatar_color || '#1A6FEF',
      hasPhotos: r.hasPhotos ?? r.has_photos ?? false,
      photoColors: r.photoColors || r.photo_colors || []
    })) : []
  };
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
  const featured = VENDORS.filter(v => v.featured);
  return featured.length ? featured : [...VENDORS].sort((a, b) => b.rating - a.rating).slice(0, 8);
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
    (v.name || '').toLowerCase().includes(q) ||
    (v.categoryName || '').toLowerCase().includes(q) ||
    (v.description || '').toLowerCase().includes(q) ||
    v.services.some(s => (s.name || '').toLowerCase().includes(q))
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

// ============================================
// CONTENT GENERATION (For Instagram/Pinterest Explore)

// ============================================
// CONTENT GENERATION (For Instagram/Pinterest Explore)
// ============================================

export let EXPLORE_POSTS = [];
export let EXPLORE_STORIES = [];
export let EXPLORE_REELS = [];

// Call this after VENDORS are loaded to generate the content feeds
export async function initExploreContent() {
  if (!VENDORS || VENDORS.length === 0) return;
  
  try {
    const [postsRes, storiesRes, reelsRes] = await Promise.all([
      supabase.from('posts').select('*, vendors("businessName", "logoInitials", "logoGradient")'),
      supabase.from('stories').select('*, vendors("businessName", "logoInitials", "logoGradient")'),
      supabase.from('reels').select('*, vendors("businessName", "logoInitials", "logoGradient")')
    ]);

    if (postsRes.data) {
      EXPLORE_POSTS = postsRes.data.map(p => ({
        id: p.id,
        vendorId: p.vendorId,
        vendorName: p.vendors?.businessName || 'Vendor',
        vendorLogo: p.vendors?.logoInitials || 'V',
        vendorColor: p.vendors?.logoGradient || 'var(--primary-500)',
        imageGradient: p.imageGradient,
        height: p.height || 250,
        caption: p.caption,
        likes: p.likes,
        views: p.views
      }));
    }

    if (storiesRes.data) {
      EXPLORE_STORIES = storiesRes.data.map(s => ({
        id: s.id,
        vendorId: s.vendorId,
        vendorName: s.vendors?.businessName || 'Vendor',
        vendorLogo: s.vendors?.logoInitials || 'V',
        vendorColor: s.vendors?.logoGradient || 'var(--primary-500)',
        hasUnseen: s.hasUnseen
      }));
    }

    if (reelsRes.data) {
      EXPLORE_REELS = reelsRes.data.map(r => ({
        id: r.id,
        vendorId: r.vendorId,
        vendorName: r.vendors?.businessName || 'Vendor',
        vendorLogo: r.vendors?.logoInitials || 'V',
        coverGradient: r.coverGradient,
        views: r.views
      }));
    }

    // Shuffle posts
    EXPLORE_POSTS.sort(() => 0.5 - Math.random());
  } catch (err) {
    console.error('Error fetching explore content:', err);
  }
}
