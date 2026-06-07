import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronRight, Shield, Smartphone, Mail, Phone, Lock, History, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';

const STORAGE_KEY = 'tv_privacy_security_v1';

interface SecurityPrefs {
  phoneVerified: boolean;
  emailVerified: boolean;
  twoFactor: boolean;
  profileVisible: boolean;
  showOnlineStatus: boolean;
  allowMarketing: boolean;
}

export default function PrivacySecurityScreen() {
  const { setCurrentScreen, showToast } = useApp();
  const [prefs, setPrefs] = useState<SecurityPrefs>({
    phoneVerified: true,
    emailVerified: true,
    twoFactor: false,
    profileVisible: true,
    showOnlineStatus: true,
    allowMarketing: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs(prev => ({ ...prev, ...JSON.parse(raw) }));
    } catch { /* ignore */ }
  }, []);

  const update = (patch: Partial<SecurityPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <div className="px-5 pt-6 pb-10">
      <TopBar title="Privacy & Security" onBack={() => setCurrentScreen('profile')} />

      <Section title="Verification">
        <InfoRow icon={<Phone size={16} />} title="Phone Verification" subtitle={prefs.phoneVerified ? 'Verified' : 'Not verified'} status={prefs.phoneVerified ? 'Verified' : 'Verify'} />
        <InfoRow icon={<Mail size={16} />} title="Email Verification" subtitle={prefs.emailVerified ? 'Verified' : 'Not verified'} status={prefs.emailVerified ? 'Verified' : 'Verify'} />
      </Section>

      <Section title="Login Security">
        <ToggleRow
          icon={<KeyRound size={16} />}
          title="Two-Factor Authentication"
          subtitle="Require a secondary verification code on sign in"
          value={prefs.twoFactor}
          onChange={(value) => {
            update({ twoFactor: value });
            showToast(value ? 'Two-factor enabled' : 'Two-factor disabled', value ? 'success' : '');
          }}
        />
        <ActionRow icon={<Lock size={16} />} title="Change Password" subtitle="Update your current password" onClick={() => showToast('Password reset flow coming soon')} />
        <ActionRow icon={<History size={16} />} title="Login History" subtitle="See recent sign-ins and active sessions" onClick={() => showToast('Showing recent sessions')} />
      </Section>

      <Section title="Privacy Controls">
        <ToggleRow
          icon={<Shield size={16} />}
          title="Public Profile Visibility"
          subtitle="Allow vendors and support to see your basic profile"
          value={prefs.profileVisible}
          onChange={(value) => update({ profileVisible: value })}
        />
        <ToggleRow
          icon={<Smartphone size={16} />}
          title="Show Online Status"
          subtitle="Display your online status in conversations"
          value={prefs.showOnlineStatus}
          onChange={(value) => update({ showOnlineStatus: value })}
        />
        <ToggleRow
          icon={<Mail size={16} />}
          title="Marketing Consent"
          subtitle="Receive platform tips, promotions and business updates"
          value={prefs.allowMarketing}
          onChange={(value) => update({ allowMarketing: value })}
        />
      </Section>

      <div className="card-soft mt-6">
        <p className="t-body font-semibold">Need help securing your account?</p>
        <p className="t-meta mt-1">Our support team can help you review activity, reset access, and secure your profile.</p>
        <button
          className="mt-4 px-5 py-3 rounded-full bg-ink-900 text-white text-sm font-semibold"
          onClick={() => setCurrentScreen('contact-support')}
        >
          Contact support
        </button>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <p className="t-label mb-2 px-1">{title}</p>
      <div className="card divide-y divide-cream-200" style={{ padding: '4px 0' }}>{children}</div>
    </section>
  );
}

function InfoRow({ icon, title, subtitle, status }: { icon: React.ReactNode; title: string; subtitle: string; status: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center text-ink-900 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="t-body font-semibold truncate">{title}</p>
        <p className="t-meta truncate">{subtitle}</p>
      </div>
      <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-cream-100 text-ink-900">{status}</span>
    </div>
  );
}

function ActionRow({ icon, title, subtitle, onClick }: { icon: React.ReactNode; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-cream-100 transition">
      <div className="w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center text-ink-900 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="t-body font-semibold truncate">{title}</p>
        <p className="t-meta truncate">{subtitle}</p>
      </div>
      <ChevronRight size={14} className="text-ink-900/30" />
    </button>
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
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full transition relative ${value ? 'bg-ink-900' : 'bg-cream-200'}`}
        aria-label={title}
      >
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}
