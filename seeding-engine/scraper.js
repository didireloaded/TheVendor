/**
 * Web Scraper Module
 * Note: In a production environment, this would use Puppeteer to scrape
 * real directories (like YellowPages Namibia or Google Maps).
 * For this demo, it simulates a scraping delay and returns mock scraped data
 * that looks like raw HTML text extraction.
 */

export async function scrapeVendors(category, location, limit) {
  // Simulate network delay and scraping
  await new Promise(resolve => setTimeout(resolve, 2500));

  // Generate some raw "scraped" looking data based on the category
  const rawData = [];
  
  for (let i = 1; i <= limit; i++) {
    const rawName = `${category.split(' ')[0]} Pro Services ${i}`;
    rawData.push({
      name: rawName,
      rawAddress: `Plot ${Math.floor(Math.random() * 100)}, ${location}`,
      rawPhone: `+264 81 ${Math.floor(1000000 + Math.random() * 9000000)}`,
      rawDescription: `We are a top ${category.toLowerCase()} company located in ${location}. We offer the best prices and quality work. Open Mon-Fri 8am-5pm. Contact us today for a quote! We do everything related to ${category}.`
    });
  }

  return rawData;
}
