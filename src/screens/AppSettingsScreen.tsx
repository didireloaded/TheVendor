import { useEffect, useState } from 'react';
import { ArrowUpRight, Bell, MoonStar, MapPin, Globe2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const STORAGE_KEY = 'tv_app_settings_v1';

interface AppSettings {
  darkMode: boolean;
  compactLayout: boolean;
  locationPriority: boolean;
  notifications: boolean;
  language: 'English' | 'Afrikaans';
}

export default function AppSettingsScreen() {
  const { setCurrentScreen, showToast } = useApp();
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    compactLayout: false,
    locationPriority: true,
    notifications: true,
    language: 'English',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings(prev => ({ ...prev, ...JSON.parse(raw) }));
    } catch { /* ignore */ }
  }, []);

  const update = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <div className="px-5 pt-6 pb-10">
      <TopBar title="App Settings" onBack={() => setCurrentScreen('profile')} />

      <Section title="Preferences">
        <ToggleRow icon={<MoonStar size={16} />} title="Dark Mode" subtitle="Switch to a darker visual theme" value={settings.darkMode} onChange={(v) => { update({ darkMode: v }); showToast('Theme preference saved'); }} />
        <ToggleRow icon={<MapPin size={16} />} title="Location Priority" subtitle="Prefer nearby vendors in discovery" value={settings.locationPriority} onChange={(v) => update({ locationPriority: v })} />
        <ToggleRow icon={<Bell size={16} />} title="Push Notifications" subtitle="Receive message, quote, and update alerts" value={settings.notifications} onChange={(v) => update({ notifications: v })} />
      </Section>

      <Section title="Language">
        <SelectRow icon={<Globe2 size={16} />} title="Language" subtitle="Choose your interface language" value={settings.language} onChange={(value) => { update({ language: value as AppSettings['language'] }); showToast('Language saved'); }} options={['English', 'Afrikaans']} />
      </Section>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <p className="t-label mb-2 px-1">{title}</p>
      <div className="card divide-y divide-cream-200" style={{ padding: '4px 0' }}>{children}</div>
    </section>
  );
}

function ToggleRow({ icon, title, subtitle, value, onChange }: { icon: React.ReactNode; title: string; subtitle: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center text-ink-900 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="t-body font-semibold truncate">{title}</p>
        <p className="t-meta">{subtitle}</p>
      </div>
      <button onClick={() => onChange(!value)} className={`w-12 h-7 rounded-full transition relative ${value ? 'bg-ink-900' : 'bg-cream-200'}`}>
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}

function SelectRow({ icon, title, subtitle, value, onChange, options }: { icon: React.ReactNode; title: string; subtitle: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center text-ink-900 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="t-body font-semibold truncate">{title}</p>
        <p className="t-meta">{subtitle}</p>
      </div>
      <select value={value} onChange={e => onChange(e.target.value)} className="bg-cream-100 rounded-xl px-3 py-2 text-sm outline-none">
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
