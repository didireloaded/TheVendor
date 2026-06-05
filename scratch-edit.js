import fs from 'fs';

const dataPath = 'c:/Users/PC/.gemini/antigravity-ide/scratch/the-vendor/js/data.js';
let content = fs.readFileSync(dataPath, 'utf-8');

// Undo the mangled search suggestions
content = content.replace(/export const SEARCH_SUGGESTIONS = \[\s+.*?\s+\];/s, `export const SEARCH_SUGGESTIONS = [
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
];`);

// Now add status: 'published' to all vendors
content = content.replace(/name: (.*?),(\r?\n)\s+category: /g, `name: $1,$2    status: 'published',$2    category: `);

// Set the last one to draft
content = content.replace(/name: 'Discover Namibia Tours',(\r?\n)\s+status: 'published',/g, `name: 'Discover Namibia Tours',$1    status: 'draft',`);

fs.writeFileSync(dataPath, content);
console.log('Fixed data.js');
