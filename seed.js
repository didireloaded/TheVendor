import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { CATEGORIES, VENDORS } from './js/data.js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log('Seeding categories...');
  for (const cat of CATEGORIES) {
    const { error } = await supabase.from('categories').upsert({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      count: cat.count
    });
    if (error) console.error('Error inserting category', cat.id, error);
  }

  console.log('Seeding vendors, services and reviews...');
  for (const v of VENDORS) {
    const { error } = await supabase.from('vendors').upsert({
      id: v.id,
      name: v.name,
      category: v.category,
      category_name: v.categoryName,
      description: v.description,
      rating: v.rating,
      review_count: v.reviewCount,
      verified: v.verified,
      verified_level: v.verifiedLevel,
      featured: v.featured,
      premium: v.premium,
      lat: v.lat,
      lng: v.lng,
      address: v.address,
      distance: v.distance,
      is_open: v.isOpen,
      phone: v.phone,
      whatsapp: v.whatsapp,
      email: v.email,
      website: v.website,
      instagram: v.instagram,
      facebook: v.facebook,
      cover_gradient: v.coverGradient,
      logo_gradient: v.logoGradient,
      logo_initials: v.logoInitials,
      gallery_colors: v.galleryColors,
      hours: v.hours
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
        color: s.color
      }));
      const { error: sError } = await supabase.from('services').insert(servicesData);
      if (sError) console.error('Error inserting services for vendor', v.id, sError);
    }

    // Insert reviews
    if (v.reviews && v.reviews.length > 0) {
      const reviewsData = v.reviews.map(r => ({
        vendor_id: v.id,
        author: r.author,
        avatar: r.avatar,
        avatar_color: r.avatarColor,
        rating: r.rating,
        date: r.date,
        text: r.text,
        reply: r.reply,
        has_photos: r.hasPhotos,
        photo_colors: r.photoColors
      }));
      const { error: rError } = await supabase.from('reviews').insert(reviewsData);
      if (rError) console.error('Error inserting reviews for vendor', v.id, rError);
    }
  }

  console.log('Seeding complete.');
}

seed().catch(console.error);
