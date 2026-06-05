const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  { id: 'photography', sub: ['Wedding', 'Corporate', 'Portrait'] },
  { id: 'videography', sub: ['Wedding Video', 'Corporate Video', 'Music Video'] },
  { id: 'drone-services', sub: ['Aerial Photography', 'Surveying'] },
  { id: 'graphic-design', sub: ['Branding', 'Logo Design'] },
  { id: 'web-development', sub: ['Websites', 'E-Commerce'] },
  { id: 'digital-marketing', sub: ['Social Media', 'SEO'] },
  { id: 'printing-services', sub: ['Business Cards', 'Banners'] },
  { id: 'djs', sub: ['Wedding DJ', 'Club DJ', 'Corporate DJ'] },
  { id: 'mcs', sub: ['Wedding MC', 'Corporate MC'] },
  { id: 'event-planning', sub: ['Weddings', 'Corporate'] },
  { id: 'decor', sub: ['Wedding Decor', 'Event Decor'] },
  { id: 'sound-lighting', sub: ['PA Systems', 'Stage Lighting'] },
  { id: 'catering', sub: ['Wedding Catering', 'Braai Catering'] },
  { id: 'cake-makers', sub: ['Wedding Cakes', 'Birthday Cakes'] },
  { id: 'restaurants', sub: ['Fine Dining', 'Casual Dining'] },
  { id: 'kapana-vendors', sub: ['Kapana', 'Street BBQ'] },
  { id: 'food-trucks', sub: ['Burgers', 'Pizza', 'Ice Cream'] },
  { id: 'hair-stylists', sub: ['Braiding', 'Coloring', 'Extensions'] },
  { id: 'barbers', sub: ['Haircuts', 'Beard Trim', 'Fades'] },
  { id: 'makeup-artists', sub: ['Bridal', 'Everyday Glam'] },
  { id: 'nail-technicians', sub: ['Gel Nails', 'Acrylic'] },
  { id: 'fashion-designers', sub: ['Custom Outfits', 'Traditional Wear'] },
  { id: 'tailors', sub: ['Suits', 'Alterations'] },
  { id: 'mechanics', sub: ['General Service', 'Engine Repair'] },
  { id: 'auto-electricians', sub: ['Wiring', 'Starters'] },
  { id: 'car-washes', sub: ['Hand Wash', 'Detailing'] },
  { id: 'towing-services', sub: ['Flatbed', 'Roadside Assist'] },
  { id: 'plumbers', sub: ['Repairs', 'Installation'] },
  { id: 'electricians', sub: ['Wiring', 'Solar', 'Fault Finding'] },
  { id: 'builders', sub: ['New Builds', 'Renovations'] },
  { id: 'painters', sub: ['Interior', 'Exterior'] },
  { id: 'cleaning-services', sub: ['Domestic', 'Office'] },
  { id: 'security-services', sub: ['Guards', 'CCTV', 'Alarms'] },
  { id: 'it-services', sub: ['IT Support', 'Networking'] },
  { id: 'computer-repairs', sub: ['Laptop Repair', 'Data Recovery'] },
  { id: 'lawyers', sub: ['Corporate', 'Family Law', 'Property'] },
  { id: 'accountants', sub: ['Tax Returns', 'Bookkeeping'] },
  { id: 'business-consultants', sub: ['Strategy', 'Management'] },
  { id: 'real-estate-agents', sub: ['Sales', 'Rentals'] },
  { id: 'accommodation', sub: ['Hotels', 'Camping'] },
  { id: 'guest-houses', sub: ['Self-Catering', 'B&B'] },
  { id: 'lodges', sub: ['Safari Lodge', 'Eco Lodge'] },
  { id: 'tour-guides', sub: ['City Tours', 'Safari Tours'] },
  { id: 'fitness-trainers', sub: ['Personal Training', 'Group Fitness'] },
  { id: 'gyms', sub: ['Commercial Gym', 'CrossFit'] },
  { id: 'transport-services', sub: ['Shuttle', 'Airport Transfer'] },
  { id: 'courier-services', sub: ['Same Day', 'Express'] }
];

const LOCATIONS = [
  { city: 'Windhoek', region: 'Khomas', lat: -22.5597, lng: 17.0832, weight: 10 },
  { city: 'Swakopmund', region: 'Erongo', lat: -22.6784, lng: 14.5270, weight: 4 },
  { city: 'Walvis Bay', region: 'Erongo', lat: -22.9576, lng: 14.5053, weight: 3 },
  { city: 'Oshakati', region: 'Oshana', lat: -17.7884, lng: 15.6941, weight: 2 },
  { city: 'Rundu', region: 'Kavango East', lat: -17.9157, lng: 19.7661, weight: 2 },
  { city: 'Katima Mulilo', region: 'Zambezi', lat: -17.4988, lng: 24.2750, weight: 1 },
  { city: 'Otjiwarongo', region: 'Otjozondjupa', lat: -20.4616, lng: 16.6477, weight: 1 },
  { city: 'Tsumeb', region: 'Oshikoto', lat: -19.2333, lng: 17.7167, weight: 1 },
  { city: 'Keetmanshoop', region: 'Karas', lat: -26.5785, lng: 18.1333, weight: 1 },
  { city: 'Gobabis', region: 'Omaheke', lat: -22.4491, lng: 18.9723, weight: 1 },
  { city: 'Ondangwa', region: 'Oshana', lat: -17.9100, lng: 15.9754, weight: 1 },
  { city: 'Outjo', region: 'Kunene', lat: -20.1084, lng: 16.1557, weight: 1 },
  { city: 'Mariental', region: 'Hardap', lat: -24.6300, lng: 17.9667, weight: 1 },
  { city: 'Rehoboth', region: 'Hardap', lat: -23.3134, lng: 17.0818, weight: 1 },
  { city: 'Lüderitz', region: 'Karas', lat: -26.6481, lng: 15.1594, weight: 1 },
  { city: 'Okahandja', region: 'Otjozondjupa', lat: -21.9830, lng: 16.9167, weight: 1 }
];

const ADJECTIVES = ['Namibia', 'Desert', 'Oshana', 'Savanna', 'Coastal', 'Premium', 'Elite', 'Dune', 'Atlantic', 'Windhoek', 'Safari', 'Etosha', 'Zambezi', 'Welwitschia', 'Omajowa', 'Kalahari', 'Erongo', 'Sunshine', 'Golden', 'Royal', 'Eagle', 'Oryx', 'Springbok'];
const NAMES = ['Nangula', 'Amadhila', 'Shipanga', 'Mouton', 'Van Zyl', 'Ithana', 'Johannes', 'Ndlovu', 'Beukes', 'Venter', 'Kisting', 'Haikali', 'Nekwaya', 'Shikongo', 'Burger'];
const NOUNS = ['Solutions', 'Services', 'Studios', 'Express', 'Pro', 'Hub', 'Masters', 'Works', 'Group', 'Creations', 'Crafts', 'Kings', 'Gurus', 'Specialists'];

function randomEl(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function weightedRandomLoc() {
  const totalWeight = LOCATIONS.reduce((sum, loc) => sum + loc.weight, 0);
  let random = Math.random() * totalWeight;
  for (const loc of LOCATIONS) {
    if (random < loc.weight) return loc;
    random -= loc.weight;
  }
  return LOCATIONS[0];
}

function generateBusinessName(category) {
  const r = Math.random();
  const cleanCat = category.replace(/-/g, ' ');
  if (r < 0.3) return `${randomEl(ADJECTIVES)} ${randomEl(NOUNS)}`;
  if (r < 0.6) return `${randomEl(NAMES)} ${cleanCat} ${randomEl(NOUNS)}`;
  if (r < 0.8) return `${randomEl(ADJECTIVES)} ${cleanCat}`;
  return `${randomEl(NAMES)} & Co ${cleanCat}`;
}

const vendors = [];
let idCounter = 100;

for (let i = 0; i < 250; i++) {
  const cat = randomEl(CATEGORIES);
  const loc = weightedRandomLoc();
  const name = generateBusinessName(cat.id).replace(/\b\w/g, c => c.toUpperCase());
  
  vendors.push({
    id: `seed-${cat.id}-${idCounter++}`,
    businessName: name,
    category: cat.id,
    subcategory: randomEl(cat.sub),
    description: `Professional ${cat.id.replace(/-/g, ' ')} services located in ${loc.city}. We provide top quality service to all our clients across the ${loc.region} region. Let us help you with your next project.`,
    phone: `+264 81 ${Math.floor(100 + Math.random() * 899)} ${Math.floor(1000 + Math.random() * 8999)}`,
    whatsapp: Math.random() > 0.3 ? `+26481${Math.floor(1000000 + Math.random() * 8999999)}` : null,
    email: Math.random() > 0.2 ? `info@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.na` : null,
    website: Math.random() > 0.5 ? `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.na` : null,
    facebook: Math.random() > 0.4 ? `${name.replace(/[^a-zA-Z0-9]/g, '')}Namibia` : null,
    instagram: Math.random() > 0.4 ? `@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}_na` : null,
    address: `Central, ${loc.city}`,
    city: loc.city,
    region: loc.region,
    latitude: loc.lat + (Math.random() - 0.5) * 0.05,
    longitude: loc.lng + (Math.random() - 0.5) * 0.05,
    rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 120),
    source: 'manual_seed'
  });
}

const outFile = path.join(__dirname, 'js', 'seed-vendors-expanded.js');
let exportStr = `// ============================================
// THE VENDOR — Seed Vendor Catalog
// Generated realistic Namibian mock businesses for platform seeding
// ============================================

export const SEED_CATEGORIES = ${JSON.stringify(CATEGORIES.map(c => c.id))};
export const SEED_CITIES = ${JSON.stringify(LOCATIONS.map(l => l.city))};
export const SEED_REGIONS = ${JSON.stringify([...new Set(LOCATIONS.map(l => l.region))])};

export const SEED_VENDORS = ${JSON.stringify(vendors, null, 2)};
`;

fs.writeFileSync(outFile, exportStr);
console.log('Successfully generated ' + vendors.length + ' vendors in seed-vendors-expanded.js');
