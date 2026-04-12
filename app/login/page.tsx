'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n/provider';
import { useTheme } from '@/lib/theme-provider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(t('login_error')); return; }
      const { data: profile } = await supabase.from('profiles').select('role, status').eq('id', data.user.id).single();
      if (!profile || !['admin', 'supervisor', 'finance'].includes(profile.role)) {
        setError(locale === 'es' ? 'Solo administradores pueden acceder' : 'Admin access only');
        await supabase.auth.signOut();
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch { setError(t('login_error')); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <button onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-muted-foreground hover:bg-secondary transition-colors">
          {locale === 'es' ? 'EN' : 'ES'}
        </button>
        <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
          {resolvedTheme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
      </div>

      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground" style={{ letterSpacing: '-0.04em' }}>Antártida</h1>
          <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase" style={{ letterSpacing: '0.15em' }}>Seguros Automotores</p>
        </div>

        <div className="bg-card rounded-2xl p-8 card-shadow">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">{t('login_title')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('login_subtitle')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm animate-fade-in">{error}</div>
            )}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">{t('email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="admin@antartida.com" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">{t('password')}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="••••••••" />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-input accent-primary" />
                {locale === 'es' ? 'Recordarme' : 'Remember me'}
              </label>
              <a href="#" className="text-sm font-semibold text-primary hover:underline">{t('forgot_password')}</a>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {loading ? t('loading') : t('login')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {locale === 'es' ? '¿No tienes cuenta?' : "Don't have an account?"}{' '}
            <Link href="/register" className="font-bold text-primary hover:underline">
              {locale === 'es' ? 'Registrarse' : 'Sign Up'}
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Antártida Seguros
          </p>
        </div>
      </div>
    </div>
  );
}
