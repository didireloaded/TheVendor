// ============================================
// THE VENDOR — Production Data Layer
// Real Namibian vendors with verified public business listings
// Sources: namivents.com, namibiayp.com, business websites
// ============================================

export interface Review {
  id: string;
  author: string;
  avatar: string;
  avatarColor: string;
  rating: number;
  text: string;
  date: string;
  hasPhotos: boolean;
}

export interface Service {
  id: string;
  name: string;
  price: string;
  description?: string;
}

export interface Vendor {
  id: string;
  name: string;
  businessName: string;
  category: string;
  categoryName: string;
  description: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  verifiedLevel: 'basic' | 'pro';
  featured: boolean;
  isOpen?: boolean;
  distance: number;
  latitude: number;
  longitude: number;
  city: string;
  suburb?: string;
  region: string;
  coverGradient: string;
  logoGradient: string;
  logoInitials: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  services: Service[];
  reviews: Review[];
  galleryColors: string[];
  responseTime: string;
  yearsInBusiness: number;
  acceptsEFT: boolean;
  acceptsCash: boolean;
  profileViews?: number;
  quoteRequests?: number;
  saves?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  deadline: string;
  type: 'event' | 'market' | 'fair' | 'networking';
  vendorCount: number;
  image: string;
}

export const NAMIBIAN_CITIES = [
  { name: 'Windhoek', region: 'Khomas', lat: -22.5609, lng: 17.0658, suburbs: ['Khomasdal', 'Eros', 'Kleine Kuppe', 'Pioneers Park', 'Hochland Park', 'Windhoek West', 'Klein Windhoek', 'Auas Valley', 'Ausspannplatz', 'Southern Industrial'] },
  { name: 'Swakopmund', region: 'Erongo', lat: -22.6792, lng: 14.5272, suburbs: ['Vineta', 'Town Centre', 'Mile 4', 'Kramersdorf'] },
  { name: 'Walvis Bay', region: 'Erongo', lat: -22.9576, lng: 14.5053, suburbs: ['Narraville', 'Kuisebmund', 'Town Centre'] },
  { name: 'Oshakati', region: 'Oshana', lat: -17.7833, lng: 15.7000, suburbs: ['Town Centre'] },
  { name: 'Rundu', region: 'Kavango East', lat: -17.9333, lng: 19.7667, suburbs: ['Town Centre'] },
  { name: 'Katima Mulilo', region: 'Zambezi', lat: -17.5000, lng: 24.2667, suburbs: ['Town Centre'] },
  { name: 'Otjiwarongo', region: 'Otjozondjupa', lat: -20.4637, lng: 16.6477, suburbs: ['Town Centre'] },
  { name: 'Keetmanshoop', region: 'ǁKaras', lat: -26.5833, lng: 18.1333, suburbs: ['Town Centre'] },
  { name: 'Okahandja', region: 'Otjozondjupa', lat: -21.9833, lng: 16.9167, suburbs: ['Town Centre'] },
];

export const CATEGORIES: Category[] = [
  { id: 'photography', name: 'Photography', icon: 'Camera', color: '#E91E63', count: 0 },
  { id: 'videography', name: 'Videography', icon: 'Video', color: '#8b5cf6', count: 0 },
  { id: 'catering', name: 'Catering & Food', icon: 'UtensilsCrossed', color: '#FF9800', count: 0 },
  { id: 'beauty', name: 'Beauty & Makeup', icon: 'Sparkles', color: '#9C27B0', count: 0 },
  { id: 'events', name: 'Events & DJs', icon: 'Music', color: '#2196F3', count: 0 },
  { id: 'automotive', name: 'Automotive', icon: 'Car', color: '#607D8B', count: 0 },
  { id: 'home', name: 'Home Services', icon: 'Wrench', color: '#4CAF50', count: 0 },
  { id: 'tech', name: 'Technology', icon: 'Monitor', color: '#3F51B5', count: 0 },
  { id: 'health', name: 'Health & Wellness', icon: 'Heart', color: '#F44336', count: 0 },
  { id: 'fashion', name: 'Fashion & Design', icon: 'Shirt', color: '#E040FB', count: 0 },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#00BCD4', count: 0 },
  { id: 'construction', name: 'Construction', icon: 'HardHat', color: '#795548', count: 0 },
];

// Removed unused mock constants

// ============================================================
// REAL NAMIBIAN vendors
// Sourced from public business listings
// ============================================================



// ============================================================
// CATEGORY COUNT — derived from real vendors above
// ============================================================


// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getCurrentLocationDisplay(): { city: string; suburb: string; full: string } {
  return { city: 'Windhoek', suburb: 'Khomasdal', full: 'Windhoek, Khomasdal' };
}

function isVendorOpen(vendor: Vendor): boolean {
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const now = new Date();
  const today = vendor.hours[dayKeys[now.getDay()]];
  if (!today || /closed/i.test(today)) return false;
  if (/24\/7/i.test(today)) return true;
  const m = today.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!m) return true;
  const cur = now.getHours() * 60 + now.getMinutes();
  const open = parseInt(m[1]) * 60 + parseInt(m[2]);
  const close = parseInt(m[3]) * 60 + parseInt(m[4]);
  return cur >= open && cur <= close;
}

export function getFeaturedVendors(vendors: Vendor[]): Vendor[] {
  return vendors.filter(v => v.featured);
}

export function getTrendingVendors(vendors: Vendor[]): Vendor[] {
  return [...vendors]
    .map(v => ({
      ...v,
      trendingScore: (v.profileViews || 0) * 0.3 + (v.quoteRequests || 0) * 0.4 + (v.saves || 0) * 0.2 + (v.reviewCount || 0) * 0.1,
    }))
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, 10);
}

export function getNearbyVendors(vendors: Vendor[], radius = 10): Vendor[] {
  return [...vendors]
    .filter(v => v.distance > 0 && v.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}

export function getRecentlyAddedVendors(vendors: Vendor[]): Vendor[] {
  return vendors.slice(-5).reverse();
}

export function getRecommendedVendors(vendors: Vendor[]): Vendor[] {
  return [...vendors].filter(v => v.verified && v.rating >= 4.7).sort(() => Math.random() - 0.5).slice(0, 6);
}

export function getOpenNowVendors(vendors: Vendor[]): Vendor[] {
  return vendors.filter(v => isVendorOpen(v)).slice(0, 8);
}

export function searchVendors(vendors: Vendor[], query: string): Vendor[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return vendors.filter(v =>
    v.name.toLowerCase().includes(q) ||
    v.categoryName.toLowerCase().includes(q) ||
    v.description.toLowerCase().includes(q) ||
    v.city.toLowerCase().includes(q) ||
    v.region.toLowerCase().includes(q) ||
    v.services.some(s => s.name.toLowerCase().includes(q))
  );
}

export function getVendorById(vendors: Vendor[], id: string): Vendor | undefined {
  return vendors.find(v => v.id === id);
}

export function getVendorsByCategory(vendors: Vendor[], categoryId: string): Vendor[] {
  return vendors.filter(v => v.category === categoryId);
}

export function getPopularCategories(vendors: Vendor[], limit = 6) {
  const ranked = CATEGORIES.map(cat => {
    const inCat = vendors.filter(v => v.category === cat.id);
    if (inCat.length === 0) return { ...cat, score: 0, liveCount: 0 };
    const reviews = inCat.reduce((s, v) => s + (v.reviewCount || 0), 0);
    const quotes = inCat.reduce((s, v) => s + (v.quoteRequests || 0), 0);
    const verified = inCat.filter(v => v.verified).length;
    const score =
      inCat.length * 0.3 +
      reviews * 0.4 +
      quotes * 0.2 +
      (verified / inCat.length) * 100 * 0.1;
    return { ...cat, score, liveCount: inCat.length };
  });
  return ranked.sort((a, b) => b.score - a.score).slice(0, limit);
}

// Profile feed — placeholder portfolio items
const PROFILE_FEED_SEEDS: any[] = [];

export interface ProfilePost {
  id: string;
  imageUrl: string;
  caption: string;
}

export function getProfileFeedPosts(): ProfilePost[] {
  return PROFILE_FEED_SEEDS.map(seed => ({
    id: seed.id,
    imageUrl: `https://picsum.photos/seed/tv-profile-${seed.id}/400/400`,
    caption: seed.caption,
  }));
}

export const SEARCH_PLACEHOLDERS = [
  'Wedding photographer...',
  'Custom cake...',
  'Mechanic for my Hilux...',
  'DJ for wedding...',
  'Bridal makeup...',
  'Plumber emergency...',
  'Event catering...',
];

export const TRENDING_SEARCHES = [
  'Wedding photographer',
  'Bridal makeup',
  'Wedding catering',
  '4x4 mechanic',
  'Custom birthday cake',
  'Wedding DJ',
  'Emergency plumber',
];

export const POPULAR_NEAR_YOU = [
  'Catering in Windhoek',
  'Photographers in Khomas',
  'Mechanics in Windhoek South',
  'Plumbers 24/7',
];

export function buildWhatsAppUrl(vendor: Vendor, message?: string): string {
  const defaultMsg = `Hi ${vendor.name}, I found you on The Vendor and I'm interested in your services.`;
  const text = encodeURIComponent(message || defaultMsg);
  return `https://wa.me/${vendor.whatsapp}?text=${text}`;
}

export function buildTelUrl(vendor: Vendor): string {
  return `tel:${vendor.phone.replace(/\s/g, '')}`;
}

export function buildDirectionsUrl(vendor: Vendor): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${vendor.latitude},${vendor.longitude}`;
}

// Explore feed — image-first vendor work gallery
export function getExplorePosts(vendors: Vendor[]) {
  return vendors.flatMap(v =>
    v.galleryColors.slice(0, 3).map((_, ci) => ({
      id: `post-${v.id}-${ci}`,
      vendorId: v.id,
      vendorName: v.name,
      vendorLogo: v.logoInitials,
      vendorColor: v.logoGradient,
      height: [240, 300, 260][ci % 3],
      caption: `${v.categoryName} • ${v.city} • Namibia`,
      saves: Math.floor((v.saves || 100) / 3),
      views: Math.floor((v.profileViews || 500) / 3),
      imageSeed: `${v.id}-${ci}`,
    }))
  ).sort(() => Math.random() - 0.5);
}
