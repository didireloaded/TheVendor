import { useState } from 'react';
import { ArrowLeft, ArrowRight, Briefcase, MapPin, Tag, Palette } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { supabase } from '../lib/supabase';

const TOTAL_STEPS = 4;

const STEPS = [
  { icon: Briefcase, title: 'Business Basics', desc: 'Tell us about your business' },
  { icon: MapPin, title: 'Contact & Location', desc: 'How can customers reach you?' },
  { icon: Tag, title: 'Services & Pricing', desc: 'What do you offer?' },
  { icon: Palette, title: 'Branding', desc: 'Customize your look' },
];

export default function VendorRegistrationScreen() {
  const { showToast, setCurrentScreen, user } = useApp();
  const { categories: CATEGORIES } = useData();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '', category: '', description: '',
    phone: '', whatsapp: '', email: '', address: '', city: 'Windhoek',
    services: [{ name: '', price: '' }], brandColor: '#1A6FEF'
  });

  const update = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  const updateService = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const services = [...prev.services];
      services[index] = { ...services[index], [field]: value };
      return { ...prev, services };
    });
  };
  const addService = () => setFormData(prev => ({ ...prev, services: [...prev.services, { name: '', price: '' }] }));

  const next = () => step < TOTAL_STEPS - 1 ? setStep(step + 1) : submit();
  const prev = () => step > 0 && setStep(step - 1);
  const submit = async () => {
    if (!user) {
      showToast('You must be logged in to register a business', 'error');
      return;
    }

    setLoading(true);
    
    // We can compute initials based on name
    const initials = formData.businessName ? formData.businessName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'VN';
    const logoGradient = `linear-gradient(135deg, ${formData.brandColor}, #0F2B4C)`;

    const { error } = await supabase.from('vendors').insert({
      user_id: user.id,
      business_name: formData.businessName,
      category: formData.category,
      description: formData.description,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      logo_initials: initials,
      logo_gradient: logoGradient,
      cover_gradient: logoGradient,
      verified: false,
    });

    setLoading(false);

    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Application submitted! Welcome aboard.', 'success');
      setCurrentScreen('business-dashboard');
    }
  };

  const CurrentIcon = STEPS[step].icon;

  return (
    <div className="fixed inset-0 z-[65] overflow-y-auto flex flex-col glass-strong" style={{ maxWidth: '480px', margin: '0 auto', left: 0, right: 0 }}>
      <div className="px-4 py-3 flex items-center gap-3 border-b border-white/40">
        <button
          className="w-9 h-9 rounded-full glass flex items-center justify-center"
          onClick={() => step > 0 ? prev() : setCurrentScreen('profile')}
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="h-2 glass rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-amber-500 rounded-full transition-all"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
        <span className="text-[10px] text-slate-600 font-black uppercase tracking-wider whitespace-nowrap">
          {step + 1} / {TOTAL_STEPS}
        </span>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl">
            <CurrentIcon size={36} className="text-white" />
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-900 text-center">{STEPS[step].title}</h2>
        <p className="text-sm text-slate-500 text-center mt-1 mb-6 font-medium">{STEPS[step].desc}</p>

        {step === 0 && (
          <div className="space-y-3.5">
            <FormField label="Business Name">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. VisionHaus Media"
                value={formData.businessName}
                onChange={e => update('businessName', e.target.value)}
              />
            </FormField>
            <FormField label="Category">
              <select className="form-input" value={formData.category} onChange={e => update('category', e.target.value)}>
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Description">
              <textarea
                className="form-input resize-none"
                placeholder="Describe what your business does..."
                rows={3}
                value={formData.description}
                onChange={e => update('description', e.target.value)}
              />
            </FormField>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3.5">
            <FormField label="Phone Number">
              <div className="flex items-center glass rounded-xl overflow-hidden">
                <span className="px-3 py-3 text-sm text-slate-500 font-bold border-r border-slate-200/50">+264</span>
                <input
                  type="tel"
                  className="flex-1 px-3 py-3 bg-transparent text-sm outline-none font-medium"
                  placeholder="81 234 5678"
                  value={formData.phone}
                  onChange={e => update('phone', e.target.value)}
                />
              </div>
            </FormField>
            <FormField label="WhatsApp (if different)">
              <div className="flex items-center glass rounded-xl overflow-hidden">
                <span className="px-3 py-3 text-sm text-slate-500 font-bold border-r border-slate-200/50">+264</span>
                <input
                  type="tel"
                  className="flex-1 px-3 py-3 bg-transparent text-sm outline-none font-medium"
                  placeholder="81 234 5678"
                  value={formData.whatsapp}
                  onChange={e => update('whatsapp', e.target.value)}
                />
              </div>
            </FormField>
            <FormField label="Business Email">
              <input
                type="email"
                className="form-input"
                placeholder="info@mybusiness.na"
                value={formData.email}
                onChange={e => update('email', e.target.value)}
              />
            </FormField>
            <FormField label="Business Address">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Plot 23, Windhoek West"
                value={formData.address}
                onChange={e => update('address', e.target.value)}
              />
            </FormField>
            <FormField label="City">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Windhoek"
                value={formData.city}
                onChange={e => update('city', e.target.value)}
              />
            </FormField>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-medium">Add the services you offer with pricing</p>
            {formData.services.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  className="form-input flex-1"
                  placeholder="Service name"
                  value={s.name}
                  onChange={e => updateService(i, 'name', e.target.value)}
                />
                <input
                  type="text"
                  className="form-input w-28"
                  placeholder="N$ 500"
                  value={s.price}
                  onChange={e => updateService(i, 'price', e.target.value)}
                />
              </div>
            ))}
            <button onClick={addService} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-sm font-black text-primary-600">
              + Add another service
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-800 text-white text-center shadow-xl">
              <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur mx-auto mb-3 flex items-center justify-center text-2xl font-black">
                {formData.businessName ? formData.businessName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'VN'}
              </div>
              <p className="font-black">{formData.businessName || 'Your Business'}</p>
              <p className="text-xs opacity-80 font-medium">{CATEGORIES.find(c => c.id === formData.category)?.name || 'Category'}</p>
            </div>
            <FormField label="Brand Color">
              <div className="grid grid-cols-6 gap-2">
                {['#1A6FEF', '#E91E63', '#16A34A', '#F59E0B', '#A855F7', '#06B6D4'].map(color => (
                  <button
                    key={color}
                    onClick={() => update('brandColor', color)}
                    className={`h-10 rounded-xl shadow-sm transition-all ${formData.brandColor === color ? 'ring-2 ring-offset-2 ring-primary-500 scale-105' : ''}`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </FormField>
            <div className="p-4 glass-card rounded-2xl border-green-200/60">
              <h4 className="font-black text-green-800 text-sm">Ready to submit!</h4>
              <p className="text-xs text-green-700/80 mt-1 font-medium">Your application will be reviewed within 24-48 hours.</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-white/40 flex gap-2 glass-strong">
        {step > 0 && (
          <button onClick={prev} className="flex-1 py-3 rounded-2xl glass text-slate-700 font-black text-sm">
            Previous
          </button>
        )}
        <button
          onClick={next}
          disabled={loading}
          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-700 text-white font-black text-sm flex items-center justify-center gap-1 shadow-lg shadow-primary-500/30 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : step === TOTAL_STEPS - 1 ? 'Submit Application' : 'Continue'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          border-color: rgb(96, 165, 250);
        }
      `}</style>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-black text-slate-600 mb-1.5 block uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
