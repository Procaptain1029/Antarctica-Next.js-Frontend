'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(t('login_error'));
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', data.user.id)
        .single();

      if (!profile || !['admin', 'supervisor', 'finance'].includes(profile.role)) {
        setError(locale === 'es' ? 'Solo administradores pueden acceder' : 'Admin access only');
        await supabase.auth.signOut();
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError(t('login_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Top controls */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <button
          onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
          className="px-4 py-2 text-sm font-medium rounded-full border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
        >
          {locale === 'es' ? 'EN' : 'ES'}
        </button>
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
        >
          {resolvedTheme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left branding */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">Antártida</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12">Seguros Automotores</p>
            
            <div className="space-y-6">
              {[
                { icon: 'M5 13l4 4L19 7', text: locale === 'es' ? 'Gestión centralizada de cotizaciones' : 'Centralized quote management' },
                { icon: 'M9 12l2 2 4-4', text: locale === 'es' ? 'Validación antifraude con IA' : 'AI-powered anti-fraud validation' },
                { icon: 'M5 13l4 4L19 7', text: locale === 'es' ? 'Control de productores y comisiones' : 'Producer & commission control' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Antártida</h1>
          </div>

          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/20 p-8 border border-slate-200/50 dark:border-slate-700/50">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('login_title')}</h2>
              <p className="text-slate-500 dark:text-slate-400">{t('login_subtitle')}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm animate-fade-in">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="admin@antartida.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-blue-500 focus:ring-blue-500" />
                  {locale === 'es' ? 'Recordarme' : 'Remember me'}
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  {t('forgot_password')}
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('loading')}
                  </span>
                ) : (
                  t('login')
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} Antártida Seguros. {locale === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
