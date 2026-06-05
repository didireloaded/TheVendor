import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { SEED_VENDORS } from './js/seed-vendors-expanded.js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedSocial() {
  console.log('Fetching existing vendors...');
  const { data: vendors, error: vError } = await supabase.from('vendors').select('id, businessName, coverGradient, logoGradient');
  if (vError || !vendors || vendors.length === 0) {
    console.error('Failed to fetch vendors', vError);
    return;
  }

  console.log(`Found ${vendors.length} vendors. Generating social content...`);
  
  const contentTypes = ['Behind the scenes', 'New Project', 'Client Review', 'Special Offer'];
  const tags = ['#wedding', '#windhoek', '#localbusiness', '#design', '#namibia'];
  
  const posts = [];
  const stories = [];
  const reels = [];

  vendors.forEach((v, index) => {
    const numPosts = (index % 3) + 1;
    for (let i = 0; i < numPosts; i++) {
      posts.push({
        vendorId: v.id,
        imageGradient: v.coverGradient,
        height: 150 + Math.floor(Math.random() * 200),
        caption: `Check out our latest work! ${contentTypes[i % contentTypes.length]} ${tags[Math.floor(Math.random()*tags.length)]}`,
        likes: Math.floor(Math.random() * 500) + 10,
        views: Math.floor(Math.random() * 2000) + 100,
      });
    }
    
    if (index % 2 === 0) {
      stories.push({
        vendorId: v.id,
        hasUnseen: true,
      });
    }
    
    if (index % 3 === 0) {
      reels.push({
        vendorId: v.id,
        coverGradient: v.coverGradient,
        views: Math.floor(Math.random() * 10000) + 1000,
      });
    }
  });

  console.log(`Inserting ${posts.length} posts, ${stories.length} stories, ${reels.length} reels...`);
  
  // Clear old data first
  await supabase.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('stories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('reels').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Insert in chunks to avoid payload too large
  const chunkSize = 100;
  for (let i = 0; i < posts.length; i += chunkSize) {
    const { error } = await supabase.from('posts').insert(posts.slice(i, i + chunkSize));
    if (error) console.error('Error inserting posts chunk', error);
  }
  for (let i = 0; i < stories.length; i += chunkSize) {
    const { error } = await supabase.from('stories').insert(stories.slice(i, i + chunkSize));
    if (error) console.error('Error inserting stories chunk', error);
  }
  for (let i = 0; i < reels.length; i += chunkSize) {
    const { error } = await supabase.from('reels').insert(reels.slice(i, i + chunkSize));
    if (error) console.error('Error inserting reels chunk', error);
  }

  console.log('Social seeding complete!');
}

seedSocial().catch(console.error);
