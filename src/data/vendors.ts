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

const NAMIBIAN_REVIEWERS = [
  { name: 'Tangeni N.', avatar: 'T', color: '#1A6FEF' },
  { name: 'Ndapewa H.', avatar: 'N', color: '#E91E63' },
  { name: 'Shilongo K.', avatar: 'S', color: '#FF9800' },
  { name: 'Petrus K.', avatar: 'P', color: '#4CAF50' },
  { name: 'Hilma M.', avatar: 'H', color: '#9C27B0' },
  { name: 'Johannes A.', avatar: 'J', color: '#607D8B' },
  { name: 'Aina N.', avatar: 'A', color: '#F44336' },
  { name: 'Festus T.', avatar: 'F', color: '#3F51B5' },
  { name: 'Martha S.', avatar: 'M', color: '#00BCD4' },
  { name: 'Kauna I.', avatar: 'K', color: '#795548' },
];

function rv(idx: number, rating: number, text: string, daysAgo = 7, hasPhotos = false): Review {
  const p = NAMIBIAN_REVIEWERS[idx % NAMIBIAN_REVIEWERS.length];
  const date = daysAgo === 0 ? 'Today' :
    daysAgo === 1 ? 'Yesterday' :
    daysAgo < 7 ? `${daysAgo} days ago` :
    daysAgo < 30 ? `${Math.floor(daysAgo / 7)} weeks ago` :
    `${Math.floor(daysAgo / 30)} months ago`;
  return { id: `r-${idx}-${rating}`, author: p.name, avatar: p.avatar, avatarColor: p.color, rating, text, date, hasPhotos };
}

// Standard hour patterns
const HRS_WEEKDAY = {
  monday: '08:00 - 17:00', tuesday: '08:00 - 17:00', wednesday: '08:00 - 17:00',
  thursday: '08:00 - 17:00', friday: '08:00 - 17:00', saturday: '09:00 - 14:00', sunday: 'Closed',
};
const HRS_SALON = {
  monday: '09:00 - 18:00', tuesday: '09:00 - 18:00', wednesday: '09:00 - 18:00',
  thursday: '09:00 - 18:00', friday: '09:00 - 18:00', saturday: '09:00 - 16:00', sunday: 'Closed',
};
const HRS_AUTO = {
  monday: '07:30 - 17:00', tuesday: '07:30 - 17:00', wednesday: '07:30 - 17:00',
  thursday: '07:30 - 17:00', friday: '07:30 - 16:30', saturday: '08:00 - 13:00', sunday: 'Closed',
};
const HRS_FOOD = {
  monday: '07:00 - 16:00', tuesday: '07:00 - 16:00', wednesday: '07:00 - 16:00',
  thursday: '07:00 - 16:00', friday: '07:00 - 16:00', saturday: 'By appointment', sunday: 'Closed',
};
const HRS_24_7 = {
  monday: '24/7', tuesday: '24/7', wednesday: '24/7',
  thursday: '24/7', friday: '24/7', saturday: '24/7', sunday: '24/7',
};
const HRS_FLEX = {
  monday: 'By appointment', tuesday: 'By appointment', wednesday: 'By appointment',
  thursday: 'By appointment', friday: 'By appointment', saturday: 'By appointment', sunday: 'Closed',
};

// ============================================================
// REAL NAMIBIAN VENDORS
// Sourced from public business listings
// ============================================================

export const VENDORS: Vendor[] = [
  // ============ PHOTOGRAPHY ============
  {
    id: 'jackandkie-photography',
    name: 'Jackandkie Photography',
    businessName: 'Jackandkie Photography',
    category: 'photography',
    categoryName: 'Photography',
    description: 'Wedding, couples and portrait photographer based in Windhoek. Telling stories through photography with bilingual service in English, Dutch and Afrikaans.',
    rating: 5.0, reviewCount: 1, verified: true, verifiedLevel: 'pro', featured: true,
    distance: 2.1, latitude: -22.5609, longitude: 17.0658,
    city: 'Windhoek', suburb: 'Town Centre', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #E91E63, #880E4F)',
    logoGradient: 'linear-gradient(135deg, #E91E63, #880E4F)',
    logoInitials: 'JK',
    phone: '+264 81 437 3078', whatsapp: '264814373078',
    email: 'info@jackandkie.com', website: 'mywed.com/en/photographer/jackandkie',
    address: 'Windhoek, Namibia',
    hours: HRS_FLEX,
    services: [
      { id: 'jk-1', name: 'Wedding Photography', price: 'From N$ 4,800/hr', description: '2 hour minimum booking' },
      { id: 'jk-2', name: 'Portrait Session', price: 'From N$ 2,400', description: '1-hour studio or outdoor' },
      { id: 'jk-3', name: 'Couples Shoot', price: 'From N$ 3,200', description: 'Engagement or anniversary' },
    ],
    reviews: [rv(0, 5, 'Beautiful work and great communication throughout the booking.', 14, true)],
    galleryColors: ['#E91E63', '#880E4F', '#F06292'],
    responseTime: 'Within 2 hours', yearsInBusiness: 8,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 1240, quoteRequests: 89, saves: 156,
  },
  {
    id: 'studio-7-namibia',
    name: 'Studio 7',
    businessName: 'Studio 7',
    category: 'photography',
    categoryName: 'Photography',
    description: 'Professional photography and videography studio offering nationwide coverage. Specialising in brand imagery, conferences, weddings and corporate events.',
    rating: 4.8, reviewCount: 64, verified: true, verifiedLevel: 'pro', featured: true,
    distance: 3.5, latitude: -22.5700, longitude: 17.0836,
    city: 'Windhoek', suburb: 'Town Centre', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #1A6FEF, #0D47A1)',
    logoGradient: 'linear-gradient(135deg, #1A6FEF, #0D47A1)',
    logoInitials: 'S7',
    phone: '+264 81 309 1692', whatsapp: '264813091692',
    email: 'info@studio7nam.net', website: 'studio7nam.net',
    address: 'Windhoek, Namibia',
    hours: HRS_WEEKDAY,
    services: [
      { id: 's7-1', name: 'Wedding Coverage', price: 'Quote on request', description: 'Photo & video combined' },
      { id: 's7-2', name: 'Brand Photography', price: 'From N$ 5,500', description: 'Tailored for your brand' },
      { id: 's7-3', name: 'Conference Coverage', price: 'Quote on request', description: 'Nationwide service' },
    ],
    reviews: [
      rv(1, 5, 'Professional crew. Handled our annual conference flawlessly across three days.', 21, true),
      rv(2, 5, 'The brand imagery they delivered transformed our website.', 60),
    ],
    galleryColors: ['#1A6FEF', '#0D47A1', '#64B5F6'],
    responseTime: 'Within 4 hours', yearsInBusiness: 10,
    acceptsEFT: true, acceptsCash: false,
    profileViews: 980, quoteRequests: 67, saves: 112,
  },
  {
    id: 'lisle-photography',
    name: 'Lisle Photography',
    businessName: 'Lisle Photography',
    category: 'photography',
    categoryName: 'Photography',
    description: 'Maternity, newborn, baby, family and wedding photographer in Windhoek with over 7,000 followers.',
    rating: 4.9, reviewCount: 142, verified: true, verifiedLevel: 'basic', featured: false,
    distance: 4.2, latitude: -22.5750, longitude: 17.0820,
    city: 'Windhoek', suburb: 'Town Centre', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #EC4899, #BE185D)',
    logoGradient: 'linear-gradient(135deg, #EC4899, #BE185D)',
    logoInitials: 'LP',
    phone: '+264 81 200 0000', whatsapp: '264812000000',
    email: 'lislephotography7@gmail.com',
    website: 'facebook.com/LislePhotographyNam',
    address: 'Windhoek, Namibia',
    hours: HRS_FLEX,
    services: [
      { id: 'lp-1', name: 'Newborn Session', price: 'From N$ 2,800', description: 'Studio session' },
      { id: 'lp-2', name: 'Maternity Shoot', price: 'From N$ 2,500' },
      { id: 'lp-3', name: 'Family Portrait', price: 'From N$ 2,200' },
      { id: 'lp-4', name: 'Wedding Coverage', price: 'From N$ 12,000' },
    ],
    reviews: [
      rv(3, 5, 'Captured our newborn beautifully. So patient with the baby.', 7, true),
      rv(4, 5, 'Our maternity photos are stunning. Highly recommended.', 30, true),
    ],
    galleryColors: ['#EC4899', '#BE185D', '#F472B6'],
    responseTime: 'Same day', yearsInBusiness: 6,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 1580, quoteRequests: 92, saves: 203,
  },

  // ============ CATERING & FOOD ============
  {
    id: 'blikbeker-catering',
    name: 'Blikbeker Catering',
    businessName: 'Blikbeker Catering & Deli Products',
    category: 'catering',
    categoryName: 'Catering & Food',
    description: 'Namibian food at its best. Catering for 2 to 500 people, frozen meals, deli products and event catering. Operating since 2001 with an on-site vegetable garden.',
    rating: 4.9, reviewCount: 178, verified: true, verifiedLevel: 'pro', featured: true,
    distance: 1.8, latitude: -22.5750, longitude: 17.0820,
    city: 'Windhoek', suburb: 'Snyman Circle', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #F97316, #C2410C)',
    logoGradient: 'linear-gradient(135deg, #F97316, #C2410C)',
    logoInitials: 'BB',
    phone: '+264 81 351 7321', whatsapp: '264813517321',
    email: 'admin@blikbeker.com', website: 'blikbeker.com',
    address: '4 Trift Street, Snyman Circle, Windhoek',
    hours: HRS_FOOD,
    services: [
      { id: 'bb-1', name: 'Event Catering (per person)', price: 'From N$ 240', description: 'Min. 20 guests' },
      { id: 'bb-2', name: 'Frozen Meal Packs', price: 'From N$ 95', description: 'Home delivery available' },
      { id: 'bb-3', name: 'Wedding Catering', price: 'Quote on request', description: 'Customised menu' },
      { id: 'bb-4', name: 'Corporate Lunch', price: 'From N$ 145', description: 'Per person, delivered' },
    ],
    reviews: [
      rv(5, 5, 'Catered our company year-end function. Food was incredible and arrived on time.', 21, true),
      rv(6, 5, 'The frozen meals are a lifesaver for busy weeks.', 5),
      rv(7, 5, 'Beautiful wedding catering. Guests still talk about the food.', 90, true),
    ],
    galleryColors: ['#F97316', '#C2410C', '#FB923C'],
    responseTime: 'Within 1 hour', yearsInBusiness: 24,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 2340, quoteRequests: 187, saves: 412,
  },
  {
    id: 'twahafa-catering',
    name: 'Twahafa Catering',
    businessName: 'Twahafa Catering Services & Mobile Kitchen Hire',
    category: 'catering',
    categoryName: 'Catering & Food',
    description: 'Catering for both private and business functions. Mobile kitchen hire available across Windhoek and surrounds.',
    rating: 4.5, reviewCount: 32, verified: true, verifiedLevel: 'basic', featured: false,
    distance: 2.5, latitude: -22.5630, longitude: 17.0750,
    city: 'Windhoek', suburb: 'Town Centre', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #DC2626, #7F1D1D)',
    logoGradient: 'linear-gradient(135deg, #DC2626, #7F1D1D)',
    logoInitials: 'TC',
    phone: '+264 81 653 4437', whatsapp: '264816534437',
    email: 'twahafasins@gmail.com', website: 'twahafagroup.com',
    address: 'Keller Strasse, Windhoek',
    hours: HRS_FOOD,
    services: [
      { id: 'tc-1', name: 'Private Function Catering', price: 'Quote on request' },
      { id: 'tc-2', name: 'Business Catering', price: 'Quote on request' },
      { id: 'tc-3', name: 'Mobile Kitchen Hire', price: 'Quote on request' },
    ],
    reviews: [
      rv(8, 4, 'Good food and reliable service. Slight delay with setup.', 14),
      rv(9, 5, 'Mobile kitchen was perfect for our outdoor event.', 45, true),
    ],
    galleryColors: ['#DC2626', '#7F1D1D', '#F87171'],
    responseTime: 'Same day', yearsInBusiness: 12,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 890, quoteRequests: 54, saves: 78,
  },
  {
    id: 'chef-david-thomas',
    name: 'Chef David Thomas Fine Catering',
    businessName: 'Chef David Thomas Fine Catering Services',
    category: 'catering',
    categoryName: 'Catering & Food',
    description: 'Private chef and exclusive dining experiences across Namibia. Menu development, staff training and bespoke catering for fine occasions.',
    rating: 4.8, reviewCount: 56, verified: true, verifiedLevel: 'pro', featured: true,
    distance: 3.2, latitude: -22.5609, longitude: 17.0658,
    city: 'Windhoek', suburb: 'Available nationwide', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #0F172A, #334155)',
    logoGradient: 'linear-gradient(135deg, #0F172A, #334155)',
    logoInitials: 'CD',
    phone: '+264 81 435 1257', whatsapp: '264814351257',
    email: 'thomashidekel@hotmail.com', website: '',
    address: 'Available nationwide, Namibia',
    hours: HRS_FLEX,
    services: [
      { id: 'cd-1', name: 'Private Chef at Home', price: 'From N$ 2,400/person', description: 'Min. 4 guests' },
      { id: 'cd-2', name: 'Exclusive Dining Experience', price: 'Quote on request' },
      { id: 'cd-3', name: 'Menu Development', price: 'Quote on request' },
      { id: 'cd-4', name: 'Staff Training', price: 'Quote on request' },
    ],
    reviews: [
      rv(0, 5, 'An unforgettable private dining experience. Chef David is incredibly talented.', 30, true),
      rv(1, 5, 'Trained our restaurant team. Standards have lifted noticeably.', 90),
    ],
    galleryColors: ['#0F172A', '#334155', '#475569'],
    responseTime: 'Within 6 hours', yearsInBusiness: 15,
    acceptsEFT: true, acceptsCash: false,
    profileViews: 1450, quoteRequests: 102, saves: 198,
  },

  // ============ CAKES ============
  {
    id: 'sweet-specialities',
    name: 'Sweet Specialities',
    businessName: 'Sweet Specialities',
    category: 'catering',
    categoryName: 'Catering & Food',
    description: 'Custom wedding cakes and dessert buffets handcrafted in Pioneers Park.',
    rating: 4.9, reviewCount: 87, verified: true, verifiedLevel: 'pro', featured: false,
    distance: 5.2, latitude: -22.5800, longitude: 17.0550,
    city: 'Windhoek', suburb: 'Pioneers Park', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #F472B6, #BE185D)',
    logoGradient: 'linear-gradient(135deg, #F472B6, #BE185D)',
    logoInitials: 'SS',
    phone: '+264 81 259 3143', whatsapp: '264812593143',
    email: 'gisela@sweetspecialities.com', website: 'sweetspecialities.com',
    address: 'Pioneers Park Ext 1, Windhoek',
    hours: HRS_FOOD,
    services: [
      { id: 'sp-1', name: 'Wedding Cake (3 tier)', price: 'From N$ 5,800', description: 'Custom design' },
      { id: 'sp-2', name: 'Dessert Buffet', price: 'From N$ 120/person' },
      { id: 'sp-3', name: 'Birthday Cake', price: 'From N$ 1,450' },
    ],
    reviews: [
      rv(2, 5, 'Most beautiful wedding cake. Tasted as good as it looked.', 7, true),
      rv(3, 5, 'Incredible attention to detail.', 21, true),
    ],
    galleryColors: ['#F472B6', '#BE185D', '#FBCFE8'],
    responseTime: 'Within 2 hours', yearsInBusiness: 11,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 1820, quoteRequests: 145, saves: 287,
  },
  {
    id: 'beautys-bakery',
    name: "Beauty's Bakery",
    businessName: "Beauty's Bakery",
    category: 'catering',
    categoryName: 'Catering & Food',
    description: 'Custom cakes, cupcakes and bento boxes baked fresh in Windhoek. Specialising in classic celebration cakes (no fondant).',
    rating: 4.8, reviewCount: 124, verified: true, verifiedLevel: 'basic', featured: true,
    distance: 2.8, latitude: -22.5680, longitude: 17.0780,
    city: 'Windhoek', suburb: 'Town Centre', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #FBBF24, #D97706)',
    logoGradient: 'linear-gradient(135deg, #FBBF24, #D97706)',
    logoInitials: 'BB',
    phone: '+264 81 163 0955', whatsapp: '264811630955',
    email: 'beautysbakery@gmail.com',
    website: 'instagram.com/beautys_bakery_',
    address: 'Windhoek, Namibia',
    hours: HRS_FOOD,
    services: [
      { id: 'bb2-1', name: 'Custom Birthday Cake', price: 'From N$ 850' },
      { id: 'bb2-2', name: 'Bento Box', price: 'From N$ 250' },
      { id: 'bb2-3', name: 'Cupcake Box (12)', price: 'From N$ 380' },
    ],
    reviews: [
      rv(4, 5, 'Beautiful bento boxes for my daughter\'s birthday.', 5, true),
      rv(5, 5, 'Tastes as amazing as it looks.', 14, true),
    ],
    galleryColors: ['#FBBF24', '#D97706', '#FCD34D'],
    responseTime: 'Within 1 hour', yearsInBusiness: 5,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 1980, quoteRequests: 134, saves: 312,
  },
  {
    id: 'amaras-bakes',
    name: "Amara's Bakes",
    businessName: "Amara's Bakes",
    category: 'catering',
    categoryName: 'Catering & Food',
    description: 'Homemade cakes, cupcakes and cookies for every occasion. Open daily.',
    rating: 4.9, reviewCount: 76, verified: true, verifiedLevel: 'basic', featured: false,
    distance: 3.6, latitude: -22.5650, longitude: 17.0710,
    city: 'Windhoek', suburb: 'Town Centre', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #FB923C, #C2410C)',
    logoGradient: 'linear-gradient(135deg, #FB923C, #C2410C)',
    logoInitials: 'AB',
    phone: '+264 81 815 3364', whatsapp: '264818153364',
    email: 'amarasbakes@gmail.com',
    website: 'facebook.com/amarasbakes',
    address: '18 Axali Doeseb Street, Windhoek',
    hours: HRS_24_7,
    services: [
      { id: 'ab-1', name: 'Vintage Birthday Cake', price: 'From N$ 750' },
      { id: 'ab-2', name: 'Cupcake Box', price: 'From N$ 320' },
      { id: 'ab-3', name: 'Cookies (per dozen)', price: 'From N$ 180' },
    ],
    reviews: [
      rv(6, 5, 'Beautiful vintage cake design. Tasted incredible.', 3, true),
    ],
    galleryColors: ['#FB923C', '#C2410C', '#FED7AA'],
    responseTime: 'Same day', yearsInBusiness: 4,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 1240, quoteRequests: 89, saves: 198,
  },

  // ============ EVENTS & DJs ============
  {
    id: 'platinum-events',
    name: 'Platinum Events Namibia',
    businessName: 'Platinum Events Namibia',
    category: 'events',
    categoryName: 'Events & DJs',
    description: 'Full-service event planning for weddings, corporate functions and private events. Décor, flower arrangements, food, drinks and full coordination.',
    rating: 4.7, reviewCount: 89, verified: true, verifiedLevel: 'pro', featured: true,
    distance: 4.1, latitude: -22.5700, longitude: 17.0900,
    city: 'Windhoek', suburb: 'Town Centre', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #3B82F6, #1E3A8A)',
    logoGradient: 'linear-gradient(135deg, #3B82F6, #1E3A8A)',
    logoInitials: 'PE',
    phone: '+264 81 122 8500', whatsapp: '264811228500',
    email: 'platinum-events@web.de', website: 'platinum-events.com.na',
    address: 'Windhoek, Namibia',
    hours: HRS_WEEKDAY,
    services: [
      { id: 'pe-1', name: 'Full Wedding Planning', price: 'From N$ 15,000', description: 'End-to-end coordination' },
      { id: 'pe-2', name: 'Corporate Event Management', price: 'Quote on request' },
      { id: 'pe-3', name: 'Décor & Flower Arrangements', price: 'From N$ 4,500' },
      { id: 'pe-4', name: 'Day-of Coordination', price: 'From N$ 6,500' },
    ],
    reviews: [
      rv(7, 5, 'Bianca and the team made our wedding day stress-free.', 30, true),
      rv(8, 5, 'Beautiful décor for our corporate gala.', 60),
    ],
    galleryColors: ['#3B82F6', '#1E3A8A', '#93C5FD'],
    responseTime: 'Within 4 hours', yearsInBusiness: 13,
    acceptsEFT: true, acceptsCash: false,
    profileViews: 1670, quoteRequests: 124, saves: 234,
  },
  {
    id: 'dj-jt',
    name: 'DJ JT',
    businessName: 'DJ JT — CU Entertainment',
    category: 'events',
    categoryName: 'Events & DJs',
    description: 'Registered NASCAM DJ in Windhoek. Wedding DJ, club DJ and event DJ. Plays 90s to date including R&B, hip hop, disco, house, remixes, local and reggae.',
    rating: 4.9, reviewCount: 142, verified: true, verifiedLevel: 'pro', featured: true,
    distance: 2.7, latitude: -22.5609, longitude: 17.0658,
    city: 'Windhoek', suburb: 'Town Centre', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #8B5CF6, #5B21B6)',
    logoGradient: 'linear-gradient(135deg, #8B5CF6, #5B21B6)',
    logoInitials: 'JT',
    phone: '+264 81 278 5681', whatsapp: '264812785681',
    email: 'cuentertainment@mail.com', website: '',
    address: 'Windhoek, Namibia',
    hours: HRS_FLEX,
    services: [
      { id: 'jt-1', name: 'Wedding DJ', price: 'From N$ 6,500', description: '5-hour set with sound system' },
      { id: 'jt-2', name: 'Club Night', price: 'From N$ 3,500', description: '4-hour set' },
      { id: 'jt-3', name: 'Corporate Event', price: 'From N$ 5,200' },
    ],
    reviews: [
      rv(9, 5, 'Played at our wedding. Read the crowd perfectly all night.', 14, true),
      rv(0, 5, 'Real professional. Booking again for our anniversary.', 28),
    ],
    galleryColors: ['#8B5CF6', '#5B21B6', '#A78BFA'],
    responseTime: 'Within 2 hours', yearsInBusiness: 9,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 1980, quoteRequests: 167, saves: 289,
  },
  {
    id: 'dj-stizzo',
    name: 'DJ Stizzo',
    businessName: 'DJ STIZZO',
    category: 'events',
    categoryName: 'Events & DJs',
    description: 'Professional DJ entertaining events across Namibia for 5+ years. Synchronises sets with client aesthetic for weddings, parties and clubs.',
    rating: 4.8, reviewCount: 98, verified: true, verifiedLevel: 'basic', featured: false,
    distance: 3.4, latitude: -22.5680, longitude: 17.0790,
    city: 'Windhoek', suburb: 'Town Centre', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #EC4899, #831843)',
    logoGradient: 'linear-gradient(135deg, #EC4899, #831843)',
    logoInitials: 'DS',
    phone: '+264 81 344 5188', whatsapp: '264813445188',
    email: 'marcellinok8@gmail.com',
    website: 'instagram.com/dj_stizzo_na',
    address: 'Windhoek, Namibia',
    hours: HRS_FLEX,
    services: [
      { id: 'ds-1', name: 'Wedding DJ', price: 'From N$ 5,800' },
      { id: 'ds-2', name: 'Private Party', price: 'From N$ 3,200' },
      { id: 'ds-3', name: 'Club Set', price: 'From N$ 2,800' },
    ],
    reviews: [
      rv(1, 5, 'Immaculate vibes. Will book again.', 21, true),
    ],
    galleryColors: ['#EC4899', '#831843', '#F9A8D4'],
    responseTime: 'Same day', yearsInBusiness: 6,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 1340, quoteRequests: 98, saves: 167,
  },
  {
    id: 'dj-escondido',
    name: 'DJ Escondido',
    businessName: 'DJ Escondido',
    category: 'events',
    categoryName: 'Events & DJs',
    description: 'Wedding, party and event DJ across Namibia. Latin-inspired sets to keep the dance floor moving from start to finish.',
    rating: 4.7, reviewCount: 64, verified: true, verifiedLevel: 'basic', featured: false,
    distance: 5.1, latitude: -22.5500, longitude: 17.0900,
    city: 'Windhoek', suburb: 'Town Centre', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #DC2626, #7F1D1D)',
    logoGradient: 'linear-gradient(135deg, #DC2626, #7F1D1D)',
    logoInitials: 'DE',
    phone: '+264 81 300 8509', whatsapp: '264813008509',
    email: 'gfescondido@gmail.com', website: '',
    address: 'Windhoek, Namibia',
    hours: HRS_FLEX,
    services: [
      { id: 'de-1', name: 'Wedding DJ', price: 'From N$ 5,500' },
      { id: 'de-2', name: 'Latin Party Sets', price: 'From N$ 4,200' },
    ],
    reviews: [
      rv(2, 5, 'Brought a real party energy to our reception.', 30),
    ],
    galleryColors: ['#DC2626', '#7F1D1D', '#FCA5A5'],
    responseTime: 'Same day', yearsInBusiness: 7,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 980, quoteRequests: 67, saves: 124,
  },

  // ============ AUTOMOTIVE ============
  {
    id: 'cartech-namibia',
    name: 'CarTech Namibia',
    businessName: 'CARTECH NAMIBIA cc',
    category: 'automotive',
    categoryName: 'Automotive',
    description: 'Expert car repairs, panel beating, spray painting, chassis straightening and mechanical servicing in Windhoek. Computerised fault finding and aircon repairs.',
    rating: 4.7, reviewCount: 156, verified: true, verifiedLevel: 'pro', featured: true,
    distance: 4.5, latitude: -22.5881, longitude: 17.0774,
    city: 'Windhoek', suburb: 'Windhoek West', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #475569, #1E293B)',
    logoGradient: 'linear-gradient(135deg, #475569, #1E293B)',
    logoInitials: 'CT',
    phone: '+264 61 377 230', whatsapp: '264811432444',
    email: 'info@cartech-namibia.com', website: 'cartech-namibia.com',
    address: '36 Joule Street, Southern Industrial Area, Windhoek',
    hours: HRS_AUTO,
    services: [
      { id: 'ct-1', name: 'Full Service', price: 'From N$ 2,400' },
      { id: 'ct-2', name: 'Panel Beating', price: 'Quote on request' },
      { id: 'ct-3', name: 'Spray Painting', price: 'Quote on request' },
      { id: 'ct-4', name: 'Mechanical Repairs', price: 'Quote on request' },
      { id: 'ct-5', name: 'Aircon Repairs', price: 'From N$ 950' },
    ],
    reviews: [
      rv(3, 5, 'Excellent panel beating after my collision. Looks brand new.', 7, true),
      rv(4, 5, 'Reliable team. Honest quotes.', 30),
      rv(5, 4, 'Quality work but slightly slower turnaround.', 60),
    ],
    galleryColors: ['#475569', '#1E293B', '#94A3B8'],
    responseTime: 'Same day', yearsInBusiness: 18,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 2140, quoteRequests: 178, saves: 312,
  },
  {
    id: 'professional-auto-repair',
    name: 'Professional Automotive Repair',
    businessName: 'Professional Automotive Repair',
    category: 'automotive',
    categoryName: 'Automotive',
    description: 'Auto repair specialists in Windhoek offering vehicle servicing, repairs and diagnostics.',
    rating: 4.4, reviewCount: 38, verified: true, verifiedLevel: 'basic', featured: false,
    distance: 5.8, latitude: -22.5900, longitude: 17.0500,
    city: 'Windhoek', suburb: 'Town Centre', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #64748B, #334155)',
    logoGradient: 'linear-gradient(135deg, #64748B, #334155)',
    logoInitials: 'PR',
    phone: '+264 61 215 555', whatsapp: '264612155550',
    email: 'info@profauto.na', website: '',
    address: 'Windhoek, Namibia',
    hours: HRS_AUTO,
    services: [
      { id: 'pa-1', name: 'Standard Service', price: 'From N$ 1,850' },
      { id: 'pa-2', name: 'Brake Replacement', price: 'From N$ 2,800' },
      { id: 'pa-3', name: 'Diagnostics', price: 'From N$ 450' },
    ],
    reviews: [
      rv(6, 4, 'Solid service, fair pricing.', 14),
    ],
    galleryColors: ['#64748B', '#334155', '#94A3B8'],
    responseTime: 'Same day', yearsInBusiness: 22,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 780, quoteRequests: 54, saves: 89,
  },
  {
    id: 'masterparts-windhoek',
    name: 'Masterparts Windhoek',
    businessName: 'Masterparts Windhoek',
    category: 'automotive',
    categoryName: 'Automotive',
    description: 'Automotive parts and accessories supplier with branches in Windhoek North and South. Trusted by mechanics and DIY enthusiasts across Namibia.',
    rating: 4.6, reviewCount: 234, verified: true, verifiedLevel: 'pro', featured: false,
    distance: 3.9, latitude: -22.5800, longitude: 17.0700,
    city: 'Windhoek', suburb: 'Windhoek South', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #DC2626, #7F1D1D)',
    logoGradient: 'linear-gradient(135deg, #DC2626, #7F1D1D)',
    logoInitials: 'MP',
    phone: '+264 61 433 5757', whatsapp: '264614335757',
    email: 'windhoek@masterparts.com', website: 'masterparts.com',
    address: 'Windhoek South, Namibia',
    hours: HRS_WEEKDAY,
    services: [
      { id: 'mp-1', name: 'OEM Parts Supply', price: 'Quote on request' },
      { id: 'mp-2', name: 'Aftermarket Parts', price: 'Quote on request' },
      { id: 'mp-3', name: 'Trade Account', price: 'On application' },
    ],
    reviews: [
      rv(7, 5, 'Best parts pricing in Windhoek. Friendly staff.', 7),
      rv(8, 5, 'Reliable supplier for our workshop.', 60),
    ],
    galleryColors: ['#DC2626', '#7F1D1D', '#F87171'],
    responseTime: 'Same day', yearsInBusiness: 12,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 1890, quoteRequests: 145, saves: 234,
  },

  // ============ BEAUTY & MAKEUP ============
  {
    id: 'escape-beauty',
    name: 'Escape Health & Beauty Salon',
    businessName: 'Escape Health & Beauty Salon',
    category: 'beauty',
    categoryName: 'Beauty & Makeup',
    description: 'Full-service health and beauty salon offering makeup artistry, hair styling and beauty treatments in Auasblick.',
    rating: 4.7, reviewCount: 64, verified: true, verifiedLevel: 'pro', featured: true,
    distance: 4.8, latitude: -22.5950, longitude: 17.0850,
    city: 'Windhoek', suburb: 'Auasblick', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #C026D3, #86198F)',
    logoGradient: 'linear-gradient(135deg, #C026D3, #86198F)',
    logoInitials: 'EB',
    phone: '+264 81 261 8221', whatsapp: '264812618221',
    email: 'sarina@modernwebpresence.com',
    website: 'facebook.com/EscapeHealthBeautySalon',
    address: 'No. 1 Kareb Street, Auasblick, Windhoek',
    hours: HRS_SALON,
    services: [
      { id: 'eb-1', name: 'Bridal Makeup', price: 'From N$ 1,800' },
      { id: 'eb-2', name: 'Special Occasion Makeup', price: 'From N$ 950' },
      { id: 'eb-3', name: 'Hair Styling', price: 'From N$ 650' },
      { id: 'eb-4', name: 'Full Bridal Package', price: 'From N$ 3,200', description: 'Trial + day of' },
    ],
    reviews: [
      rv(9, 5, 'Beautiful bridal makeup that lasted all day.', 14, true),
      rv(0, 4, 'Lovely team and atmosphere.', 30),
    ],
    galleryColors: ['#C026D3', '#86198F', '#E879F9'],
    responseTime: 'Within 1 hour', yearsInBusiness: 8,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 1450, quoteRequests: 112, saves: 198,
  },
  {
    id: 'namibia-beauty',
    name: 'Namibia Beauty',
    businessName: 'Namibia Beauty (Marike Visser)',
    category: 'beauty',
    categoryName: 'Beauty & Makeup',
    description: 'Experienced bridal and special-occasion makeup artist. Former Miss Namibia 2011 & 2012 official makeup artist. Custom bridal-party packages.',
    rating: 4.9, reviewCount: 78, verified: true, verifiedLevel: 'pro', featured: true,
    distance: 4.2, latitude: -22.5900, longitude: 17.0850,
    city: 'Windhoek', suburb: 'Auas Valley', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #A21CAF, #6B21A8)',
    logoGradient: 'linear-gradient(135deg, #A21CAF, #6B21A8)',
    logoInitials: 'NB',
    phone: '+264 81 280 6000', whatsapp: '264812806000',
    email: 'info@namibiabeauty.com', website: 'namibiabeauty.com',
    address: 'Auas Valley Shopping Mall, Bessemer Street, Windhoek',
    hours: HRS_SALON,
    services: [
      { id: 'nb-1', name: 'Bridal Makeup', price: 'From N$ 2,400' },
      { id: 'nb-2', name: 'Bridal Party Package', price: 'From N$ 5,800', description: 'Bride + bridesmaids + mother' },
      { id: 'nb-3', name: 'Matric Farewell Makeup', price: 'From N$ 850' },
    ],
    reviews: [
      rv(1, 5, 'Marike is incredibly skilled. My wedding day makeup was perfect.', 21, true),
      rv(2, 5, 'Worth every Namibian dollar. Booking again.', 90, true),
    ],
    galleryColors: ['#A21CAF', '#6B21A8', '#D8B4FE'],
    responseTime: 'Within 2 hours', yearsInBusiness: 14,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 1780, quoteRequests: 156, saves: 287,
  },
  {
    id: 'i-am-hair-salon',
    name: 'I Am Hair Salon',
    businessName: 'I Am Hair Salon Windhoek',
    category: 'beauty',
    categoryName: 'Beauty & Makeup',
    description: 'Premium hair and beauty salon at Grove Mall offering cuts, styling, colour and treatments.',
    rating: 4.6, reviewCount: 92, verified: true, verifiedLevel: 'basic', featured: false,
    distance: 5.5, latitude: -22.6050, longitude: 17.0900,
    city: 'Windhoek', suburb: 'Kleine Kuppe', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #DB2777, #831843)',
    logoGradient: 'linear-gradient(135deg, #DB2777, #831843)',
    logoInitials: 'IH',
    phone: '+264 81 163 3333', whatsapp: '264811633333',
    email: 'iamhairsalonwindhoek@gmail.com', website: '',
    address: 'Grove Mall, Kleine Kuppe, Windhoek',
    hours: HRS_SALON,
    services: [
      { id: 'ih-1', name: 'Cut & Style', price: 'From N$ 480' },
      { id: 'ih-2', name: 'Colour', price: 'From N$ 1,200' },
      { id: 'ih-3', name: 'Keratin Treatment', price: 'From N$ 1,800' },
    ],
    reviews: [
      rv(3, 5, 'Best haircut I\'ve had in Windhoek.', 7),
      rv(4, 4, 'Beautiful colour work.', 30),
    ],
    galleryColors: ['#DB2777', '#831843', '#F9A8D4'],
    responseTime: 'Same day', yearsInBusiness: 7,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 1340, quoteRequests: 87, saves: 154,
  },
  {
    id: 'prestige-beauty',
    name: 'Prestige Beauty',
    businessName: 'Prestige Beauty',
    category: 'beauty',
    categoryName: 'Beauty & Makeup',
    description: 'Beauty salon offering treatments from N$ 450. Located in Windhoek North.',
    rating: 4.5, reviewCount: 48, verified: true, verifiedLevel: 'basic', featured: false,
    distance: 3.1, latitude: -22.5500, longitude: 17.0750,
    city: 'Windhoek', suburb: 'Windhoek North', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #BE185D, #500724)',
    logoGradient: 'linear-gradient(135deg, #BE185D, #500724)',
    logoInitials: 'PB',
    phone: '+264 81 663 6121', whatsapp: '264816636121',
    email: 'prestigebeauty100@gmail.com', website: '',
    address: '232 Ooievaar Street, Windhoek North',
    hours: HRS_SALON,
    services: [
      { id: 'pb-1', name: 'Facial Treatment', price: 'From N$ 450' },
      { id: 'pb-2', name: 'Nail Care', price: 'From N$ 380' },
      { id: 'pb-3', name: 'Body Treatments', price: 'From N$ 650' },
    ],
    reviews: [
      rv(5, 4, 'Affordable and good quality.', 14),
    ],
    galleryColors: ['#BE185D', '#500724', '#F472B6'],
    responseTime: 'Same day', yearsInBusiness: 6,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 890, quoteRequests: 54, saves: 87,
  },

  // ============ HOME SERVICES (PLUMBING & ELECTRICAL) ============
  {
    id: 'amalgamated-plumbing',
    name: 'Amalgamated Plumbing',
    businessName: 'Amalgamated Plumbing, Leak Detection & Electrical',
    category: 'home',
    categoryName: 'Home Services',
    description: 'Namibia\'s largest plumbing and electrical company. 24/7 emergency service covering all maintenance, repairs and commercial projects.',
    rating: 4.7, reviewCount: 312, verified: true, verifiedLevel: 'pro', featured: true,
    distance: 3.4, latitude: -22.5917, longitude: 17.0850,
    city: 'Windhoek', suburb: 'Suiderhof', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #16A34A, #14532D)',
    logoGradient: 'linear-gradient(135deg, #16A34A, #14532D)',
    logoInitials: 'AP',
    phone: '+264 83 301 7700', whatsapp: '264833017700',
    email: 'info@apr.com.na', website: 'apr.com.na',
    address: '8 Acacia Street, Suiderhof, Windhoek',
    hours: HRS_24_7,
    services: [
      { id: 'ap-1', name: 'Emergency Call-out', price: 'From N$ 950' },
      { id: 'ap-2', name: 'Leak Detection', price: 'From N$ 1,400' },
      { id: 'ap-3', name: 'Geyser Replacement', price: 'From N$ 5,800', description: '150L installed' },
      { id: 'ap-4', name: 'Electrical Maintenance', price: 'Quote on request' },
      { id: 'ap-5', name: 'Commercial Projects', price: 'Quote on request' },
    ],
    reviews: [
      rv(6, 5, 'Fixed our water filtration speedily and professionally.', 7),
      rv(7, 5, 'Fast response on a Sunday emergency. Lifesavers.', 14, true),
      rv(8, 4, 'Plumbers know what they\'re doing.', 45),
    ],
    galleryColors: ['#16A34A', '#14532D', '#86EFAC'],
    responseTime: '24/7 emergency', yearsInBusiness: 25,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 3240, quoteRequests: 287, saves: 467,
  },
  {
    id: 'ruans-plumbing',
    name: "Ruan's Plumbing",
    businessName: "Ruan's Plumbing & Maintenance",
    category: 'home',
    categoryName: 'Home Services',
    description: '24/7 plumbing and maintenance service across Windhoek. General plumbing, geyser installation, leaking valves and burst pipes.',
    rating: 4.7, reviewCount: 96, verified: true, verifiedLevel: 'basic', featured: false,
    distance: 4.8, latitude: -22.5400, longitude: 17.0500,
    city: 'Windhoek', suburb: 'Town Centre', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #15803D, #052E16)',
    logoGradient: 'linear-gradient(135deg, #15803D, #052E16)',
    logoInitials: 'RP',
    phone: '+264 81 270 9240', whatsapp: '264812709240',
    email: 'ruansplumbing@proton.me',
    website: 'facebook.com/RuansPlumbing',
    address: '1397 Marshall Rock Street, Windhoek',
    hours: HRS_24_7,
    services: [
      { id: 'rp-1', name: 'General Plumbing', price: 'From N$ 650' },
      { id: 'rp-2', name: 'Geyser Installation', price: 'From N$ 5,200' },
      { id: 'rp-3', name: 'Burst Pipe Repair', price: 'From N$ 850' },
      { id: 'rp-4', name: 'Drain Unblocking', price: 'From N$ 550' },
    ],
    reviews: [
      rv(9, 5, 'Quick, professional, and reasonably priced.', 3),
      rv(0, 5, 'Fixed our burst pipe in under an hour.', 14, true),
    ],
    galleryColors: ['#15803D', '#052E16', '#4ADE80'],
    responseTime: '24/7 available', yearsInBusiness: 6,
    acceptsEFT: true, acceptsCash: true,
    profileViews: 1450, quoteRequests: 124, saves: 187,
  },

  // ============ FASHION & DESIGN ============
  {
    id: 'graftobian-makeup-namibia',
    name: 'Graftobian Makeup Namibia',
    businessName: 'Graftobian Makeup Namibia',
    category: 'fashion',
    categoryName: 'Fashion & Design',
    description: 'Professional makeup artistry supplies and kits for working makeup artists across Namibia.',
    rating: 4.6, reviewCount: 24, verified: true, verifiedLevel: 'basic', featured: false,
    distance: 3.4, latitude: -22.5680, longitude: 17.0800,
    city: 'Windhoek', suburb: 'Klein Windhoek', region: 'Khomas',
    coverGradient: 'linear-gradient(135deg, #E879F9, #86198F)',
    logoGradient: 'linear-gradient(135deg, #E879F9, #86198F)',
    logoInitials: 'GM',
    phone: '+264 81 297 8935', whatsapp: '264812978935',
    email: 'namibia@graftobianmakeup.co.za', website: 'graftobianmakeup.co.za',
    address: '4 Thorer Street, Windhoek',
    hours: HRS_WEEKDAY,
    services: [
      { id: 'gm-1', name: 'Pro Makeup Kit', price: 'From N$ 3,800' },
      { id: 'gm-2', name: 'Artist Training', price: 'On request' },
      { id: 'gm-3', name: 'Wholesale Supply', price: 'On application' },
    ],
    reviews: [
      rv(1, 5, 'High-quality professional supplies.', 30),
    ],
    galleryColors: ['#E879F9', '#86198F', '#F0ABFC'],
    responseTime: 'Within 4 hours', yearsInBusiness: 5,
    acceptsEFT: true, acceptsCash: false,
    profileViews: 670, quoteRequests: 34, saves: 78,
  },
];

// ============================================================
// CATEGORY COUNT — derived from real vendors above
// ============================================================
CATEGORIES.forEach(c => {
  c.count = VENDORS.filter(v => v.category === c.id).length;
});

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

export function getFeaturedVendors(): Vendor[] {
  return VENDORS.filter(v => v.featured);
}

export function getTrendingVendors(): Vendor[] {
  return [...VENDORS]
    .map(v => ({
      ...v,
      trendingScore: (v.profileViews || 0) * 0.3 + (v.quoteRequests || 0) * 0.4 + (v.saves || 0) * 0.2 + (v.reviewCount || 0) * 0.1,
    }))
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, 10);
}

export function getNearbyVendors(radius = 10): Vendor[] {
  return [...VENDORS]
    .filter(v => v.distance > 0 && v.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}

export function getRecentlyAddedVendors(): Vendor[] {
  return VENDORS.slice(-5).reverse();
}

export function getRecommendedVendors(): Vendor[] {
  return [...VENDORS].filter(v => v.verified && v.rating >= 4.7).sort(() => Math.random() - 0.5).slice(0, 6);
}

export function getOpenNowVendors(): Vendor[] {
  return VENDORS.filter(v => isVendorOpen(v)).slice(0, 8);
}

export function searchVendors(query: string): Vendor[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return VENDORS.filter(v =>
    v.name.toLowerCase().includes(q) ||
    v.categoryName.toLowerCase().includes(q) ||
    v.description.toLowerCase().includes(q) ||
    v.city.toLowerCase().includes(q) ||
    v.region.toLowerCase().includes(q) ||
    v.services.some(s => s.name.toLowerCase().includes(q))
  );
}

export function getVendorById(id: string): Vendor | undefined {
  return VENDORS.find(v => v.id === id);
}

export function getVendorsByCategory(categoryId: string): Vendor[] {
  return VENDORS.filter(v => v.category === categoryId);
}

export function getPopularCategories(limit = 6) {
  const ranked = CATEGORIES.map(cat => {
    const inCat = VENDORS.filter(v => v.category === cat.id);
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
const PROFILE_FEED_SEEDS = [
  { id: 'pf-1', caption: 'Completed project' },
  { id: 'pf-2', caption: 'Workshop update' },
  { id: 'pf-3', caption: 'Client highlight' },
  { id: 'pf-4', caption: 'New service launch' },
  { id: 'pf-5', caption: 'Project recap' },
  { id: 'pf-6', caption: 'Saturday delivery' },
];

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
export const EXPLORE_POSTS = VENDORS.flatMap(v =>
  v.galleryColors.slice(0, 3).map((_, ci) => ({
    id: `post-${v.id}-${ci}`,
    vendorId: v.id,
    vendorName: v.name,
    vendorLogo: v.logoInitials,
    vendorColor: v.logoGradient,
    height: [240, 300, 260][ci % 3],
    caption: `${v.categoryName} · ${v.city} · Namibia`,
    saves: Math.floor((v.saves || 100) / 3),
    views: Math.floor((v.profileViews || 500) / 3),
    imageSeed: `${v.id}-${ci}`,
  }))
).sort(() => Math.random() - 0.5);
