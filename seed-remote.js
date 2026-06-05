import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { SEED_CATEGORIES, SEED_VENDORS } from './js/seed-vendors-expanded.js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CATEGORY_DETAILS = {
  "photography": { name: "Photography", icon: "camera", color: "#10b981", count: 120 },
  "videography": { name: "Videography", icon: "video", color: "#3b82f6", count: 85 },
  "graphic-design": { name: "Design", icon: "pen-tool", color: "#8b5cf6", count: 95 },
  "web-development": { name: "Web Dev", icon: "code", color: "#f59e0b", count: 45 },
  "djs": { name: "DJs", icon: "music", color: "#ec4899", count: 110 },
  "event-planning": { name: "Events", icon: "calendar", color: "#f43f5e", count: 65 },
  "catering": { name: "Catering", icon: "coffee", color: "#d97706", count: 200 },
  "hair-stylists": { name: "Hair Stylists", icon: "scissors", color: "#c026d3", count: 150 },
  "barbers": { name: "Barbers", icon: "scissors", color: "#1d4ed8", count: 130 },
  "makeup-artists": { name: "Makeup", icon: "sparkles", color: "#be185d", count: 180 },
  "mechanics": { name: "Mechanics", icon: "tool", color: "#475569", count: 90 },
  "plumbers": { name: "Plumbers", icon: "droplet", color: "#0ea5e9", count: 70 },
  "electricians": { name: "Electricians", icon: "zap", color: "#eab308", count: 80 },
  "cleaning-services": { name: "Cleaning", icon: "wind", color: "#06b6d4", count: 105 },
  "it-services": { name: "IT Services", icon: "monitor", color: "#3b82f6", count: 60 },
  "accommodation": { name: "Accommodation", icon: "home", color: "#14b8a6", count: 250 },
  "guest-houses": { name: "Guest Houses", icon: "home", color: "#0d9488", count: 180 },
  "fitness-trainers": { name: "Fitness", icon: "activity", color: "#22c55e", count: 115 }
};

async function seed() {
  console.log('Seeding categories...');
  for (const catId of SEED_CATEGORIES) {
    const details = CATEGORY_DETAILS[catId] || { name: catId, icon: "circle", color: "#94a3b8", count: 0 };
    const { error } = await supabase.from('categories').upsert({
      id: catId,
      slug: catId,
      name: details.name,
      icon: details.icon,
      color: details.color,
      count: details.count
    });
    if (error) console.error('Error inserting category', catId, error);
  }

  console.log(`Seeding ${SEED_VENDORS.length} vendors, services and reviews...`);
  for (let i = 0; i < SEED_VENDORS.length; i++) {
    const v = SEED_VENDORS[i];
    const { error } = await supabase.from('vendors').upsert({
      id: v.id,
      "businessName": v.businessName || v.name,
      category: v.category,
      subcategory: v.subcategory,
      description: v.description,
      rating: v.rating,
      "reviewCount": v.reviewCount,
      "verificationStatus": v.verificationStatus || (Math.random() > 0.3 ? 'verified' : 'unverified'),
      status: v.status || 'approved',
      source: 'manual_seed',
      latitude: v.latitude,
      longitude: v.longitude,
      address: v.address,
      city: v.city,
      region: v.region,
      phone: v.phone,
      whatsapp: v.whatsapp,
      email: v.email,
      website: v.website,
      "coverGradient": v.coverGradient,
      "logoGradient": v.logoGradient,
      "logoInitials": (v.businessName || v.name).substring(0, 2).toUpperCase(),
      "galleryColors": v.galleryColors || []
    });
    if (error) {
      console.error('Error inserting vendor', v.id, error);
      continue;
    }

    // Insert services
    if (v.services && v.services.length > 0) {
      const servicesData = v.services.map(s => ({
        vendor_id: v.id,
        name: s.name,
        description: s.description,
        price: s.price,
        color: null
      }));
      const { error: sError } = await supabase.from('services').insert(servicesData);
      if (sError) console.error('Error inserting services for vendor', v.id, sError);
    }

    // Insert reviews
    if (v.reviews && v.reviews.length > 0) {
      const reviewsData = v.reviews.map(r => ({
        vendor_id: v.id,
        author: r.author,
        rating: r.rating,
        date: r.date,
        text: r.text,
        reply: null,
        "hasPhotos": false,
        "avatarColor": null,
        "photoColors": []
      }));
      const { error: rError } = await supabase.from('reviews').insert(reviewsData);
      if (rError) console.error('Error inserting reviews for vendor', v.id, rError);
    }
    
    if (i % 25 === 0 && i > 0) {
        console.log(`Seeded ${i} vendors...`);
    }
  }

  console.log('Seeding complete.');
}

seed().catch(console.error);
