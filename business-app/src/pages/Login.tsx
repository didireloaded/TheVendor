import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Successfully logged in
      if (data.session) {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
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
          <h1 className="text-2xl font-bold">The Vendor Business</h1>
          <p className="text-sm text-muted-foreground mt-2">Manage your presence and grow your business</p>
        </div>
        
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
            <label className="text-sm font-semibold flex justify-between">
              Password
              <a href="#" className="text-primary font-medium hover:underline">Forgot?</a>
            </label>
            <input 
              type="password" 
              required
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
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Don't have a vendor account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
