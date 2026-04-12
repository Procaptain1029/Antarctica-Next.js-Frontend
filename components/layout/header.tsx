'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n/provider';
import { useTheme } from '@/lib/theme-provider';

export function Header() {
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();
  const [user, setUser] = useState<{ full_name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, role')
          .eq('id', authUser.id)
          .single();
        if (profile) setUser(profile);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div />

      <div className="flex items-center gap-1.5">
        {/* Language */}
        <button
          onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-secondary-foreground hover:bg-secondary transition-colors"
        >
          {locale === 'es' ? 'EN' : 'ES'}
        </button>

        {/* Theme */}
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
        >
          {resolvedTheme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-2" />

        {/* User */}
        {user && (
          <Link href="/dashboard/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-foreground leading-tight">{user.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
              {user.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </Link>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-2" />

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-error hover:bg-error/5 transition-colors"
          title={t('logout')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden lg:inline">{t('logout')}</span>
        </button>
      </div>
    </header>
  );
}
