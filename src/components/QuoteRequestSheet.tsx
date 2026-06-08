import { useState } from 'react';
import { X, FileText, Calendar, Wallet, CheckCircle2, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Vendor } from '../data/vendors';
import { buildWhatsAppUrl } from '../data/vendors';

interface QuoteRequestSheetProps {
  vendor: Vendor;
  onClose: () => void;
}

export default function QuoteRequestSheet({ vendor, onClose }: QuoteRequestSheetProps) {
  const { showToast, addQuoteRequest, createOrGetConversation, sendMessage, setActiveConversationId, setCurrentScreen } = useApp();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [createdConvoId, setCreatedConvoId] = useState<string | null>(null);
  const [form, setForm] = useState({
    service: vendor.services[0]?.name || '',
    date: '',
    budget: '',
    guests: '',
    location: vendor.city,
    notes: '',
    name: '',
    phone: '',
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.service || !form.name || !form.phone) {
      showToast('Please fill the required fields');
      return;
    }

    setLoading(true);

    try {
      // 1. Create quote request
      const quote = await addQuoteRequest({
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorLogo: vendor.logoInitials,
        vendorColor: vendor.logoGradient,
        service: form.service,
        budget: form.budget,
        date: form.date,
        notes: form.notes,
      });

      // 2. Create or get conversation
      const convo = await createOrGetConversation({
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorLogo: vendor.logoInitials,
        vendorColor: vendor.logoGradient,
        verified: vendor.verified,
        verifiedLevel: vendor.verifiedLevel,
        type: 'quote',
      });

      // 3. Post quote message
      await sendMessage(convo.id, `Quote request created`, 'system', { type: 'quote', quoteId: quote.id });

      // 4. Post user intro
      if (form.notes) {
        await sendMessage(convo.id, form.notes, 'user');
      }

      setCreatedConvoId(convo.id);
      setStep('success');
    } catch (err: any) {
      console.error(err);
      // Toast already shown in context on error
    } finally {
      setLoading(false);
    }
  };

  const openConversation = () => {
    if (createdConvoId) {
      setActiveConversationId(createdConvoId);
      setCurrentScreen('chat');
      onClose();
    }
  };

  const sendOnWhatsApp = () => {
    const msg = `Hi ${vendor.name}! I'd like a quote via The Vendor:\n\n• Service: ${form.service}\n• Date: ${form.date || 'Flexible'}\n• Budget: ${form.budget || 'Open'}\n${form.guests ? `• Guests: ${form.guests}\n` : ''}• Location: ${form.location}\n${form.notes ? `\nNotes: ${form.notes}\n` : ''}\nMy name is ${form.name}, reach me at +264${form.phone}.`;
    window.open(buildWhatsAppUrl(vendor, msg), '_blank');
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center" style={{ maxWidth: '480px', margin: '0 auto', left: 0, right: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeInUp" onClick={onClose} />
      <div className="relative glass-strong rounded-t-3xl w-full max-h-[92vh] overflow-y-auto animate-fadeInUp border-t border-white/60">
        <div className="sticky top-0 glass-strong pt-3 pb-2 z-10">
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto" />
        </div>

        {step === 'form' && (
          <>
            <div className="px-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <FileText size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Request a Quote</h2>
                  <p className="text-xs text-slate-500 font-medium">from {vendor.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full glass flex items-center justify-center">
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="px-5 pb-6 space-y-3.5">
              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block uppercase tracking-wide">
                  Service <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-3 glass rounded-xl text-sm outline-none font-medium"
                  value={form.service}
                  onChange={e => update('service', e.target.value)}
                >
                  {vendor.services.map(s => (
                    <option key={s.id} value={s.name}>{s.name} — {s.price}</option>
                  ))}
                  <option value="Other / Custom">Other / Custom request</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 mb-1.5 block uppercase tracking-wide flex items-center gap-1">
                    <Calendar size={11} /> Event Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-3 glass rounded-xl text-sm outline-none font-medium"
                    value={form.date}
                    onChange={e => update('date', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 mb-1.5 block uppercase tracking-wide flex items-center gap-1">
                    <Wallet size={11} /> Budget (N$)
                  </label>
                  <input
                    type="text"
                    placeholder="5,000"
                    className="w-full px-3 py-3 glass rounded-xl text-sm outline-none font-medium"
                    value={form.budget}
                    onChange={e => update('budget', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 mb-1.5 block uppercase tracking-wide">Guests</label>
                  <input
                    type="number"
                    placeholder="50"
                    className="w-full px-3 py-3 glass rounded-xl text-sm outline-none font-medium"
                    value={form.guests}
                    onChange={e => update('guests', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 mb-1.5 block uppercase tracking-wide">Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-3 glass rounded-xl text-sm outline-none font-medium"
                    value={form.location}
                    onChange={e => update('location', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1.5 block uppercase tracking-wide">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Anything specific the vendor should know..."
                  className="w-full px-3 py-3 glass rounded-xl text-sm outline-none resize-none font-medium"
                  value={form.notes}
                  onChange={e => update('notes', e.target.value)}
                />
              </div>

              <div className="pt-3 border-t border-slate-200/50">
                <p className="text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">Your details</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Your name *"
                    className="w-full px-3 py-3 glass rounded-xl text-sm outline-none font-medium"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                  />
                  <div className="flex items-center glass rounded-xl overflow-hidden">
                    <span className="px-3 py-3 text-sm text-slate-500 font-bold">+264</span>
                    <input
                      type="tel"
                      placeholder="81 234 5678 *"
                      className="flex-1 px-3 py-3 bg-transparent text-sm outline-none font-medium"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={submit}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-700 text-white font-black text-sm shadow-lg shadow-primary-500/30 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Quote Request'}
              </button>
              <p className="text-[10px] text-slate-400 text-center font-medium">
                {vendor.responseTime} · Free, no fees
              </p>
            </div>
          </>
        )}

        {step === 'success' && (
          <div className="px-5 py-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center mx-auto mb-4 animate-scaleIn">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h2 className="text-lg font-black text-slate-900">Quote request sent!</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6 font-medium">
              A conversation has been created with {vendor.name}.
            </p>

            <div className="glass rounded-2xl p-4 text-left text-xs space-y-1.5 mb-5">
              <Row label="Service" value={form.service} />
              {form.date && <Row label="Date" value={form.date} />}
              {form.budget && <Row label="Budget" value={`N$ ${form.budget}`} />}
              <div className="flex justify-between pt-1 mt-1 border-t border-slate-200/50">
                <span className="text-slate-500">Status:</span>
                <span className="font-black text-amber-600">PENDING</span>
              </div>
            </div>

            <button
              onClick={openConversation}
              className="w-full py-3.5 rounded-2xl bg-primary-500 text-white font-black text-sm flex items-center justify-center gap-2 mb-2 shadow-lg"
            >
              <MessageCircle size={14} /> Open Conversation
            </button>
            <button
              onClick={sendOnWhatsApp}
              className="w-full py-3 rounded-2xl bg-green-500 text-white font-black text-sm flex items-center justify-center gap-2 mb-2"
            >
              Also notify via WhatsApp
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl glass text-slate-700 font-bold text-sm"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}:</span>
      <span className="font-black text-slate-900">{value}</span>
    </div>
  );
}
