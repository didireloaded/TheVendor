export function formatVendor(raw) {
    const cleanName = raw.businessName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const uniqueId = `scraped-${cleanName}-${Math.floor(Math.random() * 10000)}`;

    return {
        id: uniqueId,
        businessName: raw.businessName,
        category: raw.category || 'business',
        subcategory: raw.subcategory || 'General Service',
        description: `Automatically discovered ${raw.subcategory || 'business'} via Google Maps. (${raw.originalQuery})`,
        phone: raw.phone || null,
        whatsapp: null,
        email: null,
        website: raw.website || null,
        facebook: null,
        instagram: null,
        address: raw.scrapedAddress || `Central ${raw.city}`,
        latitude: raw.latitude || -22.56,
        longitude: raw.longitude || 17.06,
        city: raw.city,
        region: raw.region,
        operatingHours: {
            monday: '08:00 - 17:00',
            tuesday: '08:00 - 17:00',
            wednesday: '08:00 - 17:00',
            thursday: '08:00 - 17:00',
            friday: '08:00 - 17:00',
            saturday: '09:00 - 13:00',
            sunday: 'Closed'
        },
        photos: [],
        logo: null,
        services: [raw.subcategory || 'General Service'],
        products: [],
        tags: raw.tags || [],
        keywords: raw.keywords || [],
        rating: raw.rating || null,
        reviewCount: raw.reviewCount || 0,
        verificationStatus: 'unverified',
        vendorQualityScore: calculateQualityScore(raw),
        status: 'pending_review',
        source: 'google_maps_scraper',
        sourceUrl: raw.sourceUrl || null,
        discoveredAt: new Date().toISOString(),
        reviewedAt: null,
        reviewedBy: null,
        notes: ''
    };
}

function calculateQualityScore(raw) {
    let score = 20; // Base score for existing on Google Maps
    if (raw.rating && raw.rating >= 4.0) score += 15;
    if (raw.reviewCount > 10) score += 10;
    if (raw.reviewCount > 50) score += 10;
    if (raw.phone) score += 20;
    if (raw.website) score += 25;
    return Math.min(score, 100);
}
