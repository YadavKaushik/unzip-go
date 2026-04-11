import { useState, useEffect, createContext, useContext } from 'react';
import { db as supabase } from '@/lib/db';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: any;
  wallet: any;
  signUp: (email: string, password: string, metadata?: { username?: string; phone?: string; referral?: string }) => Promise<{ error: any }>;
  signUpWithPhone: (phone: string, password: string, metadata?: { referral?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithPhone: (phone: string, password: string) => Promise<{ error: any }>;
  signInWithOtp: (phone: string) => Promise<{ error: any }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
    setProfile(data);
  };

  const fetchWallet = async (userId: string) => {
    const { data } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
    setWallet(data);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const refreshWallet = async () => {
    if (user) await fetchWallet(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(async () => {
          await fetchProfile(session.user.id);
          await fetchWallet(session.user.id);
        }, 0);
        // Record login notification on SIGNED_IN event
        if (_event === 'SIGNED_IN') {
          const now = new Date().toLocaleString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' });
          supabase.from('notifications').insert({
            user_id: session.user.id,
            title: 'LOGIN NOTIFICATION',
            message: `Your account is logged in ${now}`,
            type: 'login',
          }).then(() => {});
        }
      } else {
        setProfile(null);
        setWallet(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchWallet(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: { username?: string; phone?: string; referral?: string }) => {
    // Try edge function first (admin.createUser bypasses confirmation)
    try {
      const { data, error } = await supabase.functions.invoke('register-user', {
        body: { email, password },
      });
      if (!error && data && !data.error) {
        // Admin created user, now sign in
        const signInResult = await supabase.auth.signInWithPassword({ email, password });
        if (!signInResult.error) return { error: null };
      }
    } catch (_) { /* edge function not available, fallback */ }

    // Fallback: direct signUp
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (signUpError) return { error: signUpError };

    // Try auto sign-in (works if email confirmation is disabled)
    if (signUpData?.user && !signUpData?.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        // User created but can't sign in — still success, show welcome
        return { error: null };
      }
    }
    return { error: null };
  };

  const signUpWithPhone = async (phone: string, password: string, metadata?: { referral?: string }) => {
    // Try edge function first for real phone auth
    try {
      const { data, error } = await supabase.functions.invoke('register-user', {
        body: { phone, password },
      });
      if (!error && data && !data.error) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ phone, password });
        if (!signInError) return { error: null };
      }
      if (data?.error) return { error: { message: data.error } };
    } catch (_) { /* edge function not available, fallback to fake email */ }

    // Fallback: use fake email approach
    const fakeEmail = `phone${phone.replace(/\D/g, '')}@techie404.app`;
    return signUp(fakeEmail, password, { phone, referral: metadata?.referral });
  };

  const signInWithPhone = async (phone: string, password: string) => {
    // Try real phone sign-in first
    const { error: phoneError } = await supabase.auth.signInWithPassword({ phone, password });
    if (!phoneError) return { error: null };

    // Fallback: try fake email sign-in
    const fakeEmail = `phone${phone.replace(/\D/g, '')}@techie404.app`;
    const { error } = await supabase.auth.signInWithPassword({ email: fakeEmail, password });
    return { error };
  };


  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signInWithOtp = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    return { error };
  };

  const verifyOtp = async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setWallet(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, wallet, signUp, signUpWithPhone, signIn, signInWithPhone, signInWithOtp, verifyOtp, signOut, refreshProfile, refreshWallet }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
