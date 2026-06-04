// ============================================
// THE VENDOR — Dashboard Data
// Mock analytics, leads, and activity data
// ============================================

export const DASH_METRICS = {
  healthScore: 89,
  healthFactors: [
    { name: 'Profile completeness', score: '95%', status: 'good' },
    { name: 'Response rate', score: '92%', status: 'good' },
    { name: 'Review quality', score: '4.9', status: 'good' },
    { name: 'Customer engagement', score: 'Average', status: 'warning' }
  ],
  snapshots: {
    views: { current: 1248, growth: 12.5, label: 'Profile Views' },
    whatsapp: { current: 142, growth: 8.2, label: 'WhatsApp Clicks' },
    calls: { current: 86, growth: -2.4, label: 'Call Clicks' },
    quotes: { current: 34, growth: 15.0, label: 'Quote Requests' },
    directions: { current: 215, growth: 5.1, label: 'Direction Requests' },
    bookmarks: { current: 89, growth: 22.4, label: 'Saves/Bookmarks' }
  },
  chartData: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    views: [120, 150, 180, 140, 210, 250, 198],
    leads: [12, 18, 15, 10, 25, 32, 28]
  }
};

export const ACTIVITY_FEED = [
  { type: 'lead', title: 'New Quote Request', text: 'Sarah M. requested a quote for <strong>Wedding Photography</strong>.', time: '10 mins ago', colorClass: 'bg-green' },
  { type: 'bookmark', title: 'Profile Saved', text: 'Someone bookmarked your business.', time: '1 hour ago', colorClass: 'bg-purple' },
  { type: 'click', title: 'WhatsApp Click', text: 'A customer in <strong>Windhoek</strong> clicked your WhatsApp.', time: '3 hours ago', colorClass: 'bg-blue' },
  { type: 'review', title: 'New 5-Star Review', text: 'David K. posted a new review on your profile.', time: 'Yesterday', colorClass: 'bg-amber' },
  { type: 'share', title: 'Profile Shared', text: 'Your profile was shared via link.', time: 'Yesterday', colorClass: 'bg-pink' }
];

export const RECOMMENDATIONS = [
  { text: 'Customers searching for photographers often search for videographers. <strong>Consider adding videography services.</strong>' },
  { text: 'Your profile receives the most traffic on Fridays. <strong>Update your portfolio every Friday.</strong>' },
  { text: 'Profiles with 20+ photos receive 40% more inquiries. <strong>Add 8 more photos to improve visibility.</strong>' }
];

export const LEADS_DATA = [
  { id: 'L-1042', customer: 'Sarah M.', service: 'Wedding Photography', location: 'Windhoek', budget: 'N$ 15,000', date: 'Today, 09:45 AM', status: 'New', quality: 'High' },
  { id: 'L-1041', customer: 'Thomas K.', service: 'Corporate Event', location: 'Swakopmund', budget: 'N$ 8,000', date: 'Yesterday', status: 'Contacted', quality: 'Medium' },
  { id: 'L-1040', customer: 'Anna P.', service: 'Drone Coverage', location: 'Windhoek', budget: 'N$ 3,500', date: 'Oct 12', status: 'Quoted', quality: 'High' },
  { id: 'L-1039', customer: 'Michael B.', service: 'Livestream', location: 'Walvis Bay', budget: 'N$ 5,000', date: 'Oct 10', status: 'Booked', quality: 'High' },
  { id: 'L-1038', customer: 'Emily R.', service: 'Wedding Photography', location: 'Otjiwarongo', budget: 'N$ 10,000', date: 'Oct 08', status: 'Completed', quality: 'Medium' }
];

export const SEARCH_PERFORMANCE = [
  { keyword: 'Photographer Windhoek', volume: 450, conversion: 8.2 },
  { keyword: 'Wedding Photographer', volume: 320, conversion: 12.5 },
  { keyword: 'Drone Services Namibia', volume: 180, conversion: 5.4 },
  { keyword: 'Videographer Near Me', volume: 145, conversion: 4.1 }
];

export const TOP_SERVICES = [
  { name: 'Wedding Photography', views: 540, inquiries: 72, bookings: 21, revenue: 'N$ 252,000', conversion: 13.3 },
  { name: 'Event Videography', views: 320, inquiries: 45, bookings: 12, revenue: 'N$ 102,000', conversion: 14.0 },
  { name: 'Drone Coverage', views: 210, inquiries: 18, bookings: 8, revenue: 'N$ 28,000', conversion: 8.5 }
];

export const TOP_PRODUCTS = [
  { name: 'Photo Book Premium', stock: 12, price: 'N$ 1,200', views: 145, sales: 24, status: 'In Stock' },
  { name: 'Canvas Print (Large)', stock: 2, price: 'N$ 850', views: 320, sales: 45, status: 'Low Stock' },
  { name: 'USB Drive (Custom)', stock: 0, price: 'N$ 250', views: 89, sales: 12, status: 'Out of Stock' }
];

export const LOCATION_ANALYTICS = [
  { region: 'Windhoek', views: 1240, percentage: 65 },
  { region: 'Swakopmund', views: 420, percentage: 22 },
  { region: 'Walvis Bay', views: 180, percentage: 9 },
  { region: 'Other', views: 76, percentage: 4 }
];

export const OPPORTUNITIES = [
  { id: 'O-01', title: 'Windhoek Wedding Expo', date: 'Nov 15-17, 2026', location: 'SKW Hall, Windhoek', description: 'Major wedding exhibition. High lead generation potential for photographers and caterers.', deadline: 'Apply by Oct 30' },
  { id: 'O-02', title: 'Corporate End-of-Year Market', date: 'Dec 05, 2026', location: 'Wanderers Club', description: 'Great for corporate gifting vendors, DJs, and event planners.', deadline: 'Apply by Nov 15' }
];

export const REVIEWS_SUMMARY = {
  rating: 4.8,
  total: 124,
  growth: 12,
  distribution: { 5: 98, 4: 15, 3: 8, 2: 2, 1: 1 }
};
