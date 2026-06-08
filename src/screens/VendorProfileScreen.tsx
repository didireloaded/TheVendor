import { useState } from 'react';
import {
  ArrowUpRight, Heart, Star, MapPin, Phone, MessageCircle, Share2, BadgeCheck, Globe, Mail,
  Navigation, Edit2, FileText, Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getVendorById, VENDORS, buildWhatsAppUrl, buildTelUrl, buildDirectionsUrl } from '../data/vendors';
import { getOpenStatus } from '../utils/business';
import QuoteRequestSheet from '../components/QuoteRequestSheet';

export default function VendorProfileScreen() {
  const {
    selectedVendorId, setCurrentScreen, isFavorite, toggleFavorite, showToast, setSelectedVendorId,
  } = useApp();
  const vendor = selectedVendorId ? getVendorById(selectedVendorId) : null;
  const [showQuote, setShowQuote] = useState(false);

  if (!vendor) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <p className="t-meta">Vendor not found</p>
      </div>
    );
  }

  const fav = isFavorite(vendor.id);
  const seed = encodeURIComponent(vendor.id);
  const today = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
  const status = getOpenStatus(vendor);

  const related = VENDORS
    .filter(v => v.category === vendor.category && v.id !== vendor.id)
    .sort((a, b) => (b.rating - a.rating))
    .slice(0, 4);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: vendor.name, url: window.location.href });
      } catch { /* cancelled */ }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Link copied', 'success');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-cream-50"
      style={{ maxWidth: '420px', margin: '0 auto', left: 0, right: 0 }}
    >
      {/* Cover with rounded corners + floating top buttons */}
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentScreen('home')} className="btn-circle">
            <ArrowUpRight size={18} className="rotate-180" />
          </button>
          <div className="flex gap-2">
            <button
              className={`btn-circle ${fav ? 'btn-circle-dark' : ''}`}
              onClick={() => toggleFavorite(vendor.id)}
              style={fav ? { background: '#FFB199', color: '#0B0B12' } : {}}
              aria-label="Save"
            >
              <Heart size={16} fill={fav ? '#0B0B12' : 'none'} />
            </button>
            <button className="btn-circle" onClick={handleShare} aria-label="Share">
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Hero image */}
        <div
          className="rounded-3xl bg-cover bg-center h-56 mb-5"
          style={{ backgroundImage: `url('https://picsum.photos/seed/${seed}-cover/800/400')` }}
        />

        {/* Identity */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow"
            style={{ background: vendor.logoGradient }}
          >
            {vendor.logoInitials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="t-h1 flex items-center gap-1.5">
              <span className="truncate">{vendor.name}</span>
              {vendor.verified && (
                <BadgeCheck size={16} className="text-primary-500 flex-shrink-0" />
              )}
            </h1>
            <p className="t-meta mt-0.5">{vendor.categoryName} · {vendor.city}</p>
          </div>
        </div>

        {/* Quick stats — single horizontal line */}
        <div className="card flex items-center justify-around mb-5" style={{ padding: '16px 20px' }}>
          <Stat value={vendor.rating.toString()} label="Rating" color="#6FE3C2" />
          <div className="w-px h-8 bg-cream-200" />
          <Stat value={vendor.reviewCount.toString()} label="Reviews" color="#FFB199" />
          <div className="w-px h-8 bg-cream-200" />
          <Stat value={`${vendor.yearsInBusiness}y`} label="Active" color="#C9B6FF" />
        </div>

        {/* Open status */}
        <div className="flex items-center gap-2 mb-5 px-2">
          <span className={status.isOpen ? 'dot-open' : 'dot-closed'} />
          <span className={`text-sm font-semibold ${status.isOpen ? 'text-emerald-600' : 'text-rose-500'}`}>
            {status.isOpen ? 'Open now' : 'Closed'}
          </span>
          <span className="text-ink-900/30">·</span>
          <span className="t-meta">{vendor.responseTime}</span>
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => setShowQuote(true)}
          className="w-full py-4 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition mb-2 active:scale-[0.99]"
        >
          <FileText size={15} /> Request a Quote
        </button>

        {/* Secondary actions */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <a
            href={buildWhatsAppUrl(vendor)}
            target="_blank"
            rel="noopener noreferrer"
            className="card-tile py-3 flex flex-col items-center gap-1 text-xs font-semibold transition active:scale-95"
          >
            <MessageCircle size={16} className="text-emerald-500" />
            WhatsApp
          </a>
          <a
            href={buildTelUrl(vendor)}
            className="card-tile py-3 flex flex-col items-center gap-1 text-xs font-semibold transition active:scale-95"
          >
            <Phone size={16} className="text-primary-500" />
            Call
          </a>
          <a
            href={buildDirectionsUrl(vendor)}
            target="_blank"
            rel="noopener noreferrer"
            className="card-tile py-3 flex flex-col items-center gap-1 text-xs font-semibold transition active:scale-95"
          >
            <Navigation size={16} className="text-ink-900" />
            Directions
          </a>
        </div>
      </div>

      {/* About */}
      <Section title="About">
        <p className="t-body text-ink-900/70 leading-relaxed">{vendor.description}</p>
      </Section>

      {/* Portfolio */}
      <Section title="Portfolio">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="aspect-square rounded-2xl bg-cover bg-center bg-cream-100"
              style={{ backgroundImage: `url('https://picsum.photos/seed/${seed}-gal${i}/300/300')` }}
            />
          ))}
        </div>
      </Section>

      {/* Services */}
      {vendor.services.length > 0 && (
        <Section title="Services">
          <div className="card divide-y divide-cream-200">
            {vendor.services.map(s => (
              <div key={s.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <p className="t-body font-semibold truncate">{s.name}</p>
                  {s.description && <p className="t-meta truncate">{s.description}</p>}
                </div>
                <span className="text-sm font-bold text-ink-900 flex-shrink-0">{s.price}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Reviews */}
      <Section title={`Reviews · ${vendor.reviewCount}`}>
        <div className="card mb-3 flex items-center gap-3">
          <span className="text-3xl font-bold text-ink-900">{vendor.rating}</span>
          <div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < Math.floor(vendor.rating) ? '#FFB199' : 'none'}
                  stroke={i < Math.floor(vendor.rating) ? '#FFB199' : '#DDD7CA'}
                />
              ))}
            </div>
            <p className="t-meta mt-0.5">based on {vendor.reviewCount} reviews</p>
          </div>
        </div>

        {vendor.reviews.length === 0 ? (
          <p className="t-meta text-center py-4">No reviews yet</p>
        ) : (
          <div className="space-y-3">
            {vendor.reviews.slice(0, 3).map(review => (
              <div key={review.id} className="card">
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs"
                    style={{ background: review.avatarColor }}
                  >
                    {review.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="t-body font-semibold truncate">{review.author}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            size={9}
                            fill={j < review.rating ? '#FFB199' : 'none'}
                            stroke={j < review.rating ? '#FFB199' : '#DDD7CA'}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-ink-900/40">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="t-body text-ink-900/70 leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        )}

        <button className="w-full py-3.5 mt-3 rounded-full bg-cream-100 hover:bg-cream-200 text-ink-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition">
          <Edit2 size={12} /> Write a review
        </button>
      </Section>

      {/* Hours */}
      <Section title="Hours">
        <div className="card">
          {Object.entries(vendor.hours).map(([day, hours], i, arr) => {
            const isToday = day.toLowerCase() === today;
            return (
              <div
                key={day}
                className={`flex items-center justify-between py-2 ${i < arr.length - 1 ? 'border-b border-cream-200' : ''}`}
              >
                <span className={`text-sm capitalize ${isToday ? 'text-ink-900 font-bold' : 'text-ink-900/60'}`}>
                  {day}
                  {isToday && <span className="ml-2 text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Today</span>}
                </span>
                <span className={`text-sm ${isToday ? 'text-ink-900 font-semibold' : 'text-ink-900/60'}`}>{hours}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5 mt-3 px-1">
          <Clock size={12} className="text-ink-900/40" />
          <span className="t-meta">{vendor.responseTime}</span>
        </div>
      </Section>

      {/* Location */}
      <Section title="Location">
        <a
          href={buildDirectionsUrl(vendor)}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-40 rounded-3xl relative overflow-hidden mb-3 bg-cream-100"
          style={{ backgroundImage: `url('https://picsum.photos/seed/${seed}-map/600/300')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full text-ink-900 text-sm font-semibold shadow-md">
              <Navigation size={13} />
              Get directions
            </div>
          </div>
        </a>
        <div className="flex items-start gap-2 t-body text-ink-900/70 px-1">
          <MapPin size={14} className="text-ink-900/40 mt-0.5 flex-shrink-0" />
          <span>{vendor.address}</span>
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact">
        <div className="card divide-y divide-cream-200">
          {vendor.phone && <ContactRow icon={<Phone size={14}/>} value={vendor.phone} href={buildTelUrl(vendor)} />}
          {vendor.email && <ContactRow icon={<Mail size={14}/>} value={vendor.email} href={`mailto:${vendor.email}`} />}
          {vendor.website && <ContactRow icon={<Globe size={14}/>} value={vendor.website} href={`https://${vendor.website}`} />}
        </div>
      </Section>

      {/* Related */}
      {related.length > 0 && (
        <Section title={`More in ${vendor.categoryName.toLowerCase()}`}>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
            {related.map(v => (
              <button
                key={v.id}
                className="flex-shrink-0 w-36 text-left"
                onClick={() => { setSelectedVendorId(v.id); window.scrollTo(0, 0); }}
              >
                <div
                  className="w-full h-24 rounded-2xl bg-cover bg-center bg-cream-100 mb-2"
                  style={{ backgroundImage: `url('https://picsum.photos/seed/${encodeURIComponent(v.id)}-r/400/200')` }}
                />
                <p className="t-body font-semibold truncate">{v.name}</p>
                <p className="t-meta">★ {v.rating} · {v.city}</p>
              </button>
            ))}
          </div>
        </Section>
      )}

      <div className="h-24" />

      {/* Sticky bottom CTA */}
      <div className="sticky bottom-0 left-0 right-0 bg-cream-50/95 backdrop-blur-md px-4 py-4 flex gap-2 border-t border-cream-200">
        <a
          href={buildWhatsAppUrl(vendor)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3.5 rounded-full bg-cream-100 hover:bg-cream-200 text-ink-900 text-sm font-semibold flex items-center justify-center gap-2 transition"
        >
          <MessageCircle size={14} /> WhatsApp
        </a>
        <button
          onClick={() => setShowQuote(true)}
          className="flex-1 py-3.5 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
        >
          <FileText size={14} /> Get Quote
        </button>
      </div>

      {showQuote && <QuoteRequestSheet vendor={vendor} onClose={() => setShowQuote(false)} />}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 mt-8">
      <h3 className="text-xs font-semibold text-ink-900/50 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center flex-1">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <p className="t-label">{label}</p>
      </div>
      <p className="text-lg font-bold text-ink-900">{value}</p>
    </div>
  );
}

function ContactRow({ icon, value, href }: { icon: React.ReactNode; value: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 transition"
    >
      <span className="text-ink-900/40 flex-shrink-0">{icon}</span>
      <span className="t-body text-ink-900/80 truncate">{value}</span>
    </a>
  );
}
