import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { categorizeVendor } from './categorizer.js';
import { formatVendor } from './formatter.js';

// Configuration
const HEADLESS = true;
const OUTPUT_FILE = path.join(process.cwd(), 'scraped-vendors.json');

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            let distance = 300;
            let timer = setInterval(() => {
                // Find the scrollable list container. This selector changes often on Google Maps
                const scrollContainer = document.querySelector('div[role="feed"]') || document.querySelector('.m6QErb.DxyBCb.kA9KIf.dS8AEf');
                if (scrollContainer) {
                    let scrollHeight = scrollContainer.scrollHeight;
                    scrollContainer.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight || totalHeight > 5000) {
                        clearInterval(timer);
                        resolve();
                    }
                } else {
                    clearInterval(timer);
                    resolve();
                }
            }, 500);
        });
    });
}

async function scrapeGoogleMaps(query, city, region) {
    console.log(`Starting scrape for query: "${query}" in ${city}`);
    const browser = await puppeteer.launch({ headless: HEADLESS, executablePath: puppeteer.executablePath(), args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
        await page.goto(searchUrl, { waitUntil: 'networkidle2' });

        // Wait for the results to load
        await page.waitForSelector('a[href*="/maps/place/"]', { timeout: 10000 }).catch(() => console.log('No initial results found or timeout.'));

        // Scroll to load more
        console.log('Scrolling to load more results...');
        await autoScroll(page);

        // Extract basic data from the list
        console.log('Extracting listings...');
        const listings = await page.evaluate(() => {
            const elements = document.querySelectorAll('a[href*="/maps/place/"]');
            const results = [];
            
            elements.forEach(el => {
                try {
                    // Navigate up to the container to find sibling text
                    const container = el.parentElement;
                    if (!container) return;
                    
                    const name = el.getAttribute('aria-label');
                    if (!name) return;

                    // Try to find rating and reviews
                    let rating = null;
                    let reviewCount = 0;
                    const textContent = container.innerText || '';
                    const ratingMatch = textContent.match(/(\d[\.,]\d)\s*\(([\d,]+)\)/);
                    if (ratingMatch) {
                        rating = parseFloat(ratingMatch[1].replace(',', '.'));
                        reviewCount = parseInt(ratingMatch[2].replace(',', ''), 10);
                    }

                    results.push({
                        businessName: name,
                        scrapedAddress: textContent.includes('Windhoek') ? 'Windhoek' : '',
                        rating,
                        reviewCount,
                        sourceUrl: el.href
                    });
                } catch (e) {
                    // Ignore parsing errors for individual items
                }
            });
            
            // Deduplicate by name
            return results.filter((v, i, a) => a.findIndex(t => t.businessName === v.businessName) === i);
        });

        console.log(`Found ${listings.length} unique listings.`);
        
        // Enhance with AI categorization
        const processedVendors = [];
        for (const listing of listings) {
            console.log(`Processing: ${listing.businessName}...`);
            const aiData = await categorizeVendor(listing.businessName, query);
            
            const vendor = formatVendor({
                ...listing,
                ...aiData,
                city,
                region,
                originalQuery: query
            });
            
            processedVendors.push(vendor);
        }

        return processedVendors;
    } catch (error) {
        console.error('Error during scraping:', error);
        return [];
    } finally {
        await browser.close();
    }
}

async function main() {
    const args = process.argv.slice(2);
    const categoryArg = args.find(a => a.startsWith('--category='))?.split('=')[1] || 'Photographers';
    const cityArg = args.find(a => a.startsWith('--city='))?.split('=')[1] || 'Windhoek';
    const regionArg = args.find(a => a.startsWith('--region='))?.split('=')[1] || 'Khomas';

    const query = `${categoryArg} ${cityArg} Namibia`;
    const vendors = await scrapeGoogleMaps(query, cityArg, regionArg);

    let existingData = [];
    if (fs.existsSync(OUTPUT_FILE)) {
        existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    }

    const newData = [...existingData, ...vendors];
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(newData, null, 2));
    
    console.log(`\n✅ Scrape complete! Saved ${vendors.length} vendors to scraped-vendors.json`);
    console.log(`To upload these, go to your Admin Panel -> Seeding Engine -> Upload JSON`);
}

main();
