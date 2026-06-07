import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TermsPrivacyScreen() {
  const { setCurrentScreen } = useApp();
  const [tab, setTab] = useState<'terms' | 'privacy'>('terms');

  return (
    <div className="px-5 pt-6 pb-10">
      <TopBar title="Terms & Privacy" onBack={() => setCurrentScreen('profile')} />

      <div className="card-soft flex gap-1 mb-4" style={{ padding: '4px' }}>
        <Tab active={tab === 'terms'} label="Terms" onClick={() => setTab('terms')} />
        <Tab active={tab === 'privacy'} label="Privacy" onClick={() => setTab('privacy')} />
      </div>

      <div className="card prose-reset">
        {tab === 'terms' ? (
          <>
            <h2 className="t-body font-semibold">Terms of Service</h2>
            <p className="t-meta mt-3">The Vendor connects customers with local vendors in Namibia. By using the platform, you agree to use the service lawfully and respectfully.</p>
            <ul className="mt-4 space-y-3 text-sm text-ink-900/70">
              <li>• Vendor listings are provided for discovery and contact purposes.</li>
              <li>• Quotes, bookings, and payments are agreed between customer and vendor.</li>
              <li>• The Vendor may moderate, verify, suspend, or remove listings to protect platform quality.</li>
              <li>• Abuse, fraud, spam, or impersonation is not permitted.</li>
            </ul>
          </>
        ) : (
          <>
            <h2 className="t-body font-semibold">Privacy Policy</h2>
            <p className="t-meta mt-3">We only collect the minimum information needed to operate the service: profile information, vendor interactions, and messaging activity.</p>
            <ul className="mt-4 space-y-3 text-sm text-ink-900/70">
              <li>• We store account details, saved vendors, quote requests, and message history.</li>
              <li>• We use interaction data to improve recommendations and vendor discovery.</li>
              <li>• We do not sell personal data.</li>
              <li>• You may request account deletion and data removal through support.</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="flex items-center justify-between mb-6">
      <button onClick={onBack} className="btn-circle" aria-label="Back">
        <ArrowUpRight size={18} className="rotate-180" />
      </button>
      <h1 className="t-h1">{title}</h1>
      <div className="w-11 h-11" />
    </header>
  );
}

function Tab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button className={`flex-1 py-2.5 rounded-full text-xs font-semibold transition ${active ? 'bg-ink-900 text-white' : 'text-ink-900/60'}`} onClick={onClick}>
      {label}
    </button>
  );
}
