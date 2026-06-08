import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Automatically create a vendor profile if signup succeeded
      if (authData.session) {
        // First ensure a profile exists
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            id: authData.user.id,
            email: email,
            full_name: businessName,
            role: 'vendor'
          }, { onConflict: 'id' });
          
        if (profileError) console.error("Profile creation error:", profileError);

        // Then create the vendor entry
        const { error: vendorError } = await supabase
          .from('vendors')
          .insert({
            user_id: authData.user.id,
            business_name: businessName,
            status: 'pending'
          });

        if (vendorError) throw vendorError;

        // Redirect to dashboard
        navigate('/');
      } else if (authData.user) {
        // Signup succeeded but no session (email confirmation required or user exists)
        setError('Please check your email to confirm your account, or sign in if you already have an account.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface text-foreground">
      <div className="w-full max-w-sm space-y-8 bg-card p-8 rounded-2xl shadow-xl border border-border">
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Create Vendor Account</h1>
          <p className="text-sm text-muted-foreground mt-2">Start growing your business today</p>
        </div>
        
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Business Name</label>
            <input 
              type="text" 
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full p-3 bg-muted/30 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" 
              placeholder="Your Business Ltd." 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Email address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-muted/30 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" 
              placeholder="name@business.com" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Password</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-muted/30 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" 
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold shadow-sm shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center mt-6 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
