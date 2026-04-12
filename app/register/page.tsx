'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n/provider';
import { useTheme } from '@/lib/theme-provider';

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { locale, setLocale } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      create_account: { es: 'Crear Cuenta', en: 'Create Account' },
      subtitle: { es: 'Regístrate para acceder al panel', en: 'Sign up to access the dashboard' },
      full_name: { es: 'Nombre Completo', en: 'Full Name' },
      email: { es: 'Correo Electrónico', en: 'Email' },
      password: { es: 'Contraseña', en: 'Password' },
      confirm_password: { es: 'Confirmar Contraseña', en: 'Confirm Password' },
      register: { es: 'Registrarse', en: 'Sign Up' },
      registering: { es: 'Registrando...', en: 'Signing up...' },
      have_account: { es: '¿Ya tienes cuenta?', en: 'Already have an account?' },
      login: { es: 'Iniciar Sesión', en: 'Sign In' },
      mismatch: { es: 'Las contraseñas no coinciden', en: 'Passwords do not match' },
      too_short: { es: 'La contraseña debe tener al menos 6 caracteres', en: 'Password must be at least 6 characters' },
      error: { es: 'Error al registrarse', en: 'Registration failed' },
      success: { es: 'Cuenta creada. Verifica tu email.', en: 'Account created. Check your email.' },
      agree: { es: 'Acepto los', en: 'I agree to the' },
      terms: { es: 'Términos y Condiciones', en: 'Terms & Conditions' },
    };
    return map[key]?.[locale] || key;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) { setError(t('too_short')); return; }
    if (form.password !== form.confirm) { setError(t('mismatch')); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.full_name } },
      });

      if (authError) { setError(authError.message); return; }

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: form.full_name,
          email: form.email,
          role: 'producer',
          status: 'pending',
          commission_rate: 0.10,
        });
      }

      router.push('/login');
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-lg font-extrabold text-white" style={{ letterSpacing: '-0.04em' }}>A</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground" style={{ letterSpacing: '-0.04em' }}>Antártida</h1>
          <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase" style={{ letterSpacing: '0.15em' }}>Seguros Automotores</p>
        </div>

        <div className="bg-card rounded-2xl p-8 card-shadow">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">{t('create_account')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm animate-fade-in">{error}</div>
            )}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">{t('full_name')}</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} required
                className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder={locale === 'es' ? 'Juan Pérez' : 'John Doe'} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">{t('email')}</label>
              <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required
                className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="user@antartida.com" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">{t('password')}</label>
              <input type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} required
                className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="••••••••" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">{t('confirm_password')}</label>
              <input type="password" value={form.confirm} onChange={(e) => setForm(f => ({ ...f, confirm: e.target.value }))} required
                className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="••••••••" />
            </div>

            <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer pt-1">
              <input type="checkbox" required className="rounded border-input accent-primary mt-0.5" />
              <span>{t('agree')} <a href="#" className="font-semibold text-primary hover:underline">{t('terms')}</a></span>
            </label>

            <button type="submit" disabled={loading}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {loading ? t('registering') : t('register')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('have_account')}{' '}
            <Link href="/login" className="font-bold text-primary hover:underline">{t('login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
