import { NAMIBIAN_CITIES, type Vendor } from '../data/vendors';

export interface CurrentLocation {
  label: string;
  city: string;
  suburb?: string;
  latitude: number;
  longitude: number;
}

export interface OpenStatus {
  isOpen: boolean;
  label: string;
  detail: string;
}

export interface VendorOpportunity {
  id: string;
  title: string;
  location: string;
  date: string;
  deadline: string;
  registrationStatus: 'Open' | 'Closing Soon' | 'Invite Only';
}

const SUBURB_FALLBACKS = [
  { city: 'Windhoek', suburb: 'Khomasdal', latitude: -22.535, longitude: 17.047 },
  { city: 'Windhoek', suburb: 'Eros', latitude: -22.548, longitude: 17.083 },
  { city: 'Windhoek', suburb: 'Klein Windhoek', latitude: -22.567, longitude: 17.105 },
  { city: 'Windhoek', suburb: 'Pioneers Park', latitude: -22.585, longitude: 17.052 },
  { city: 'Swakopmund', suburb: 'Vineta', latitude: -22.646, longitude: 14.535 },
  { city: 'Walvis Bay', suburb: 'Narraville', latitude: -22.936, longitude: 14.525 },
] as const;

export const DEFAULT_LOCATION: CurrentLocation = {
  label: 'Windhoek, Khomasdal',
  city: 'Windhoek',
  suburb: 'Khomasdal',
  latitude: -22.535,
  longitude: 17.047,
};

export function nearestLocation(latitude: number, longitude: number): CurrentLocation {
  const nearestSuburb = [...SUBURB_FALLBACKS].sort(
    (a, b) => distanceKm(latitude, longitude, a.latitude, a.longitude) - distanceKm(latitude, longitude, b.latitude, b.longitude),
  )[0];
  const nearestCity = [...NAMIBIAN_CITIES].sort(
    (a, b) => distanceKm(latitude, longitude, a.lat, a.lng) - distanceKm(latitude, longitude, b.lat, b.lng),
  )[0];
  if (nearestSuburb && distanceKm(latitude, longitude, nearestSuburb.latitude, nearestSuburb.longitude) < 12) {
    return {
      label: `${nearestSuburb.city}, ${nearestSuburb.suburb}`,
      city: nearestSuburb.city,
      suburb: nearestSuburb.suburb,
      latitude,
      longitude,
    };
  }
  return {
    label: nearestCity?.name || DEFAULT_LOCATION.label,
    city: nearestCity?.name || DEFAULT_LOCATION.city,
    latitude,
    longitude,
  };
}

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

export function vendorsNear(vendors: Vendor[], location: CurrentLocation, radiusKm = 25): Array<Vendor & { computedDistance: number }> {
  return vendors.map(vendor => ({
    ...vendor,
    computedDistance: distanceKm(location.latitude, location.longitude, vendor.latitude, vendor.longitude),
  }))
    .filter(vendor => vendor.computedDistance <= radiusKm)
    .sort((a, b) => a.computedDistance - b.computedDistance);
}

export function getOpenStatus(vendor: Vendor, now = new Date()): OpenStatus {
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const todayKey = dayKeys[now.getDay()];
  const todayHours = vendor.hours[todayKey];

  if (!todayHours || /closed/i.test(todayHours)) {
    const next = findNextOpenDay(vendor, now);
    return { isOpen: false, label: 'Closed', detail: next ? `Opens ${next.dayLabel} at ${next.open}` : 'Hours unavailable' };
  }

  if (/24\/7/i.test(todayHours)) {
    return { isOpen: true, label: 'Open Now', detail: 'Open 24 hours' };
  }

  const times = todayHours.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!times) {
    return { isOpen: true, label: 'Open Now', detail: todayHours };
  }

  const [, open, close] = times;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = toMinutes(open);
  let closeMinutes = toMinutes(close);
  if (closeMinutes < openMinutes) closeMinutes += 24 * 60;

  const isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  if (isOpen) return { isOpen: true, label: 'Open Now', detail: `Closes at ${close}` };

  if (currentMinutes < openMinutes) {
    return { isOpen: false, label: 'Closed', detail: `Opens today at ${open}` };
  }

  const next = findNextOpenDay(vendor, now);
  return { isOpen: false, label: 'Closed', detail: next ? `Opens ${next.dayLabel} at ${next.open}` : 'Hours unavailable' };
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function findNextOpenDay(vendor: Vendor, now: Date): { dayLabel: string; open: string } | null {
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  for (let offset = 1; offset <= 7; offset += 1) {
    const idx = (now.getDay() + offset) % 7;
    const hours = vendor.hours[dayKeys[idx]];
    if (hours && !/closed/i.test(hours)) {
      const match = hours.match(/(\d{1,2}:\d{2})/);
      const dayLabel = offset === 1 ? 'tomorrow' : dayKeys[idx].charAt(0).toUpperCase() + dayKeys[idx].slice(1);
      return { dayLabel, open: match?.[1] || hours };
    }
  }
  return null;
}

export function trendingScore(vendor: Vendor): number {
  const profileViews = vendor.reviewCount * 2.4;
  const quoteRequests = vendor.featured ? 45 : 18;
  const messages = vendor.rating * 12;
  const saves = vendor.verified ? 35 : 10;
  const reviews = vendor.reviewCount * 0.8;
  const activity = vendor.yearsInBusiness > 5 ? 20 : 10;
  return profileViews + quoteRequests + messages + saves + reviews + activity;
}

export function trendingReason(vendor: Vendor): string {
  if (vendor.reviewCount > 200) return 'Most contacted this week';
  if (vendor.rating >= 4.9) return 'Highest rated';
  if (vendor.verifiedLevel === 'pro') return 'Trusted pro vendor';
  return 'Recently popular';
}

export function getTrendingThisWeek(vendors: Vendor[]): Vendor[] {
  return [...vendors].sort((a, b) => trendingScore(b) - trendingScore(a)).slice(0, 8);
}

export function getVendorOfTheWeek(vendors: Vendor[]): Vendor | undefined {
  return [...vendors].filter(v => v.featured && v.verified).sort((a, b) => trendingScore(b) - trendingScore(a))[0] || vendors[0];
}

export function getRecommendedForUser(vendors: Vendor[], recentlyViewed: string[], saved: Set<string>, location: CurrentLocation): Vendor[] {
  const viewedCategories = recentlyViewed
    .map(id => vendors.find(v => v.id === id)?.category)
    .filter((value): value is string => Boolean(value));
  const savedCategories = [...saved]
    .map(id => vendors.find(v => v.id === id)?.category)
    .filter((value): value is string => Boolean(value));
  const preferences = new Set([...viewedCategories, ...savedCategories]);
  const scored = vendors.map(vendor => {
    const nearbyBoost = Math.max(0, 30 - distanceKm(location.latitude, location.longitude, vendor.latitude, vendor.longitude));
    const preferenceBoost = preferences.has(vendor.category) ? 40 : 0;
    return { vendor, score: trendingScore(vendor) + nearbyBoost + preferenceBoost };
  });
  return scored.sort((a, b) => b.score - a.score).map(item => item.vendor).slice(0, 6);
}

export const VENDOR_OPPORTUNITIES: VendorOpportunity[] = [
  {
    id: 'opp-1',
    title: 'Windhoek Wedding Expo',
    location: 'Windhoek Country Club',
    date: '24 Aug 2026',
    deadline: '10 Aug 2026',
    registrationStatus: 'Open',
  },
  {
    id: 'opp-2',
    title: 'Coastal Food Festival',
    location: 'Swakopmund Mole',
    date: '12 Sep 2026',
    deadline: '30 Aug 2026',
    registrationStatus: 'Closing Soon',
  },
  {
    id: 'opp-3',
    title: 'Khomas Business Networking Evening',
    location: 'Windhoek CBD',
    date: '06 Jul 2026',
    deadline: '01 Jul 2026',
    registrationStatus: 'Open',
  },
];
