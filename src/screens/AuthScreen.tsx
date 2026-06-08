import { useState } from 'react';
import { ArrowUpRight, Phone, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

type AuthView = 'method' | 'phone' | 'otp';

export default function AuthScreen() {
  const [view, setView] = useState<AuthView>('method');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useApp();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    // Format phone number to ensure it has country code
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setView('otp');
      setLoading(false);
      showToast('Code sent!', 'success');
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: code,
      type: 'sms',
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      showToast('Welcome!', 'success');
      // Auth state change in App.tsx will handle navigation
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto flex flex-col items-center bg-cream-50">
      <div className="relative w-full max-w-[420px] min-h-full flex flex-col px-6 pt-10 pb-8 z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-ink-900 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <path d="M24 4L8 14V34L24 44L40 34V14L24 4Z" fill="white" />
              <path d="M24 14L16 19V29L24 34L32 29V19L24 14Z" fill="#0B0B12" />
              <path d="M24 20L20 22.5V27.5L24 30L28 27.5V22.5L24 20Z" fill="white" />
            </svg>
          </div>
          <h1 className="t-display text-3xl">
            {view === 'method' && 'Welcome'}
            {view === 'phone' && 'Enter Phone'}
            {view === 'otp' && 'Verify Code'}
          </h1>
          <p className="t-meta mt-2">
            {view === 'method' && 'Sign in to The Vendor'}
            {view === 'phone' && 'We will send you a code'}
            {view === 'otp' && 'Check your messages'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Method Selection */}
        {view === 'method' && (
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 rounded-full bg-white border border-cream-200 text-ink-900 text-sm font-semibold flex items-center justify-center gap-3 shadow-sm hover:bg-cream-50 transition disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-cream-200" />
              <span className="text-[10px] text-ink-900/40 font-semibold uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-cream-200" />
            </div>

            <button
              onClick={() => setView('phone')}
              className="w-full py-4 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              <Phone size={16} />
              Continue with Phone
              <ArrowUpRight size={16} />
            </button>
          </div>
        )}

        {/* Phone Input */}
        {view === 'phone' && (
          <div className="space-y-4">
            <button
              onClick={() => setView('method')}
              className="flex items-center gap-1 text-sm text-ink-900/60 mb-2"
            >
              <ChevronLeft size={14} /> Back
            </button>
            <div className="card">
              <label className="t-label mb-1.5 block">Phone Number</label>
              <div className="flex items-center gap-2.5 bg-cream-100 rounded-xl px-3.5 py-3 focus-within:bg-cream-200 transition">
                <Phone size={15} className="text-ink-900/40 flex-shrink-0" />
                <input
                  type="tel"
                  placeholder="+264 81 234 5678"
                  className="flex-1 bg-transparent outline-none text-sm font-medium min-w-0"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-4 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Code'}
              <ArrowUpRight size={16} />
            </button>
          </div>
        )}

        {/* OTP Input */}
        {view === 'otp' && (
          <div className="space-y-4">
            <button
              onClick={() => setView('phone')}
              className="flex items-center gap-1 text-sm text-ink-900/60 mb-2"
            >
              <ChevronLeft size={14} /> Change number
            </button>
            <div className="flex gap-2 justify-center mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-12 h-14 text-center text-xl font-bold bg-cream-100 rounded-xl outline-none focus:bg-cream-200 transition"
                />
              ))}
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-4 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
              <ArrowUpRight size={16} />
            </button>
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full text-center text-sm text-ink-900/60"
            >
              Resend Code
            </button>
          </div>
        )}

        {/* Skip for now */}
        <button
          type="button"
          className="t-label mt-8 mx-auto block"
          onClick={() => {
            // For demo purposes, allow skipping auth
            localStorage.setItem('tv_authed', 'true');
            window.location.reload();
          }}
        >
          Skip for now →
        </button>
      </div>
    </div>
  );
}
