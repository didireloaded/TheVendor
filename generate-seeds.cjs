const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  { id: 'photography', sub: ['Wedding', 'Corporate', 'Portrait'] },
  { id: 'videography', sub: ['Wedding Video', 'Corporate Video', 'Music Video'] },
  { id: 'graphic-design', sub: ['Branding', 'Logo Design'] },
  { id: 'web-development', sub: ['Websites', 'E-Commerce'] },
  { id: 'djs', sub: ['Wedding DJ', 'Club DJ', 'Corporate DJ'] },
  { id: 'event-planning', sub: ['Weddings', 'Corporate'] },
  { id: 'catering', sub: ['Wedding Catering', 'Braai Catering'] },
  { id: 'hair-stylists', sub: ['Braiding', 'Coloring', 'Extensions'] },
  { id: 'barbers', sub: ['Haircuts', 'Beard Trim', 'Fades'] },
  { id: 'makeup-artists', sub: ['Bridal', 'Everyday Glam'] },
  { id: 'mechanics', sub: ['General Service', 'Engine Repair'] },
  { id: 'plumbers', sub: ['Repairs', 'Installation'] },
  { id: 'electricians', sub: ['Wiring', 'Solar', 'Fault Finding'] },
  { id: 'cleaning-services', sub: ['Domestic', 'Office'] },
  { id: 'it-services', sub: ['IT Support', 'Networking'] },
  { id: 'accommodation', sub: ['Hotels', 'Camping'] },
  { id: 'guest-houses', sub: ['Self-Catering', 'B&B'] },
  { id: 'fitness-trainers', sub: ['Personal Training', 'Group Fitness'] }
];

const LOCATIONS = [
  { city: 'Windhoek', region: 'Khomas', lat: -22.5597, lng: 17.0832, weight: 10 },
  { city: 'Swakopmund', region: 'Erongo', lat: -22.6784, lng: 14.5270, weight: 4 },
  { city: 'Walvis Bay', region: 'Erongo', lat: -22.9576, lng: 14.5053, weight: 3 },
  { city: 'Oshakati', region: 'Oshana', lat: -17.7884, lng: 15.6941, weight: 2 },
  { city: 'Rundu', region: 'Kavango East', lat: -17.9157, lng: 19.7661, weight: 2 }
];

const ADJECTIVES = ['Namibia', 'Desert', 'Oshana', 'Savanna', 'Coastal', 'Premium', 'Elite', 'Dune', 'Atlantic', 'Windhoek', 'Safari', 'Etosha'];
const NAMES = ['Nangula', 'Amadhila', 'Shipanga', 'Mouton', 'Van Zyl', 'Ithana', 'Johannes', 'Ndlovu', 'Beukes', 'Venter'];
const NOUNS = ['Solutions', 'Services', 'Studios', 'Express', 'Pro', 'Hub', 'Masters', 'Works', 'Group', 'Creations'];

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

function generateServices(catId) {
    return [
        { name: 'Basic ' + catId.split('-')[0] + ' Service', description: 'Affordable and reliable ' + catId.replace('-', ' ') + ' service.', price: 'N$ 500' },
        { name: 'Premium ' + catId.split('-')[0] + ' Package', description: 'High end full-day ' + catId.replace('-', ' ') + ' solutions.', price: 'N$ 2500' }
    ];
}

function generateReviews() {
    const reviewers = ['Kudzi', 'Meme Maria', 'Oom Piet', 'Tangeni', 'Johan', 'Ndapandula'];
    const praises = ['Amazing work!', 'Highly recommended.', 'Punctual and professional.', 'Will definitely hire again.', 'Great value for money.'];
    const reviews = [];
    for(let i=0; i<Math.floor(Math.random()*4); i++) {
        reviews.push({
            author: randomEl(reviewers),
            rating: Math.floor(3 + Math.random()*3), // 3, 4, 5
            text: randomEl(praises),
            date: Math.floor(1 + Math.random()*30) + ' days ago'
        });
    }
    return reviews;
}

function generateColors() {
    const palettes = [
        ['#ef4444', '#f87171', '#fca5a5'],
        ['#3b82f6', '#60a5fa', '#93c5fd'],
        ['#10b981', '#34d399', '#6ee7b7'],
        ['#f59e0b', '#fbbf24', '#fcd34d'],
        ['#8b5cf6', '#a78bfa', '#c4b5fd']
    ];
    return randomEl(palettes);
}

const vendors = [];
let idCounter = 100;

for (let i = 0; i < 250; i++) {
  const cat = randomEl(CATEGORIES);
  const loc = weightedRandomLoc();
  const name = generateBusinessName(cat.id).replace(/\b\w/g, c => c.toUpperCase());
  const rating = Number((3.5 + Math.random() * 1.5).toFixed(1));
  const rCount = Math.floor(Math.random() * 120);
  
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
    address: `Central, ${loc.city}`,
    city: loc.city,
    region: loc.region,
    latitude: loc.lat + (Math.random() - 0.5) * 0.05,
    longitude: loc.lng + (Math.random() - 0.5) * 0.05,
    rating: rating,
    display_rating: rating,
    reviewCount: rCount,
    source: 'manual_seed',
    services: generateServices(cat.id),
    reviews: generateReviews(),
    galleryColors: generateColors(),
    coverGradient: `linear-gradient(135deg, ${generateColors()[0]}, ${generateColors()[1]})`,
    logoGradient: `linear-gradient(135deg, ${generateColors()[0]}, ${generateColors()[1]})`,
    verificationStatus: Math.random() > 0.3 ? 'verified' : 'unverified',
    is_verified: Math.random() > 0.3,
    status: 'approved'
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
