/**
 * Deduplication Module
 * Checks if a raw scraped vendor is already in the database
 * or already in the queue.
 */

// In a real implementation, this would query Supabase or the existing local dataset
// to check if phone numbers or normalized names match.
const knownPhones = new Set(['+264 81 234 5678', '+264 81 345 6789']);

export async function isDuplicate(rawVendor) {
  // Simulate DB lookup delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Clean phone number for comparison
  const cleanPhone = rawVendor.rawPhone.replace(/\D/g, '');
  
  // Dummy check: roughly 10% chance it's a duplicate
  if (Math.random() < 0.1) {
    return true;
  }

  return false;
}
