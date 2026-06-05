const fs = require('fs');
let content = fs.readFileSync('js/data.js', 'utf8');

// The VENDORS array starts with "export const VENDORS = ["
// We can match "category: 'something'," and insert fields after it.
content = content.replace(/category: '([^']+)',/g, (match, cat) => {
  return `${match}
    status: 'active',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    verificationDetails: { status: 'verified', date: '2023-01-01' },`;
});

fs.writeFileSync('js/data.js', content, 'utf8');
console.log('Patched data.js');
