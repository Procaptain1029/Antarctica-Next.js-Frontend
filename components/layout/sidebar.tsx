'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/provider';

const overviewItems = [
  { key: 'dashboard' as const, href: '/dashboard', icon: 'grid' },
  { key: 'quotes' as const, href: '/dashboard/quotes', icon: 'file-text' },
  { key: 'reports' as const, href: '/dashboard/reports', icon: 'chart' },
];

const managementItems = [
  { key: 'producers' as const, href: '/dashboard/producers', icon: 'users' },
  { key: 'commissions' as const, href: '/dashboard/commissions', icon: 'dollar' },
];

const accountItems = [
  { key: 'profile' as const, href: '/dashboard/profile', icon: 'user' },
];

function NavIcon({ name, active }: { name: string; active?: boolean }) {
  const color = active ? 'text-sidebar-active' : 'text-sidebar-text';
  const cls = `w-5 h-5 ${color}`;
  switch (name) {
    case 'grid':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
    case 'users':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    case 'file-text':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    case 'dollar':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'chart':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
    case 'user':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    default:
      return null;
  }
}

function NavItem({ item, pathname, t }: { item: { key: any; href: string; icon: string }; pathname: string; t: any }) {
  const isActive = item.href === '/dashboard'
    ? pathname === '/dashboard'
    : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-200 ${
        isActive
          ? 'bg-sidebar-active-bg text-sidebar-active font-semibold'
          : 'text-sidebar-text font-medium hover:bg-sidebar-hover'
      }`}
    >
      <NavIcon name={item.icon} active={isActive} />
      {t(item.key)}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { t, locale } = useI18n();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-sidebar-bg border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 h-16 flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-sm">
            <span className="text-[15px] font-extrabold text-white" style={{ letterSpacing: '-0.04em' }}>A</span>
          </div>
          <div className="leading-none">
            <span className="text-[15px] font-extrabold text-foreground block" style={{ letterSpacing: '-0.04em' }}>Antártida</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase block mt-0.5" style={{ letterSpacing: '0.12em' }}>Seguros</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        {/* Overview section */}
        <p className="px-3 mb-2 text-[11px] font-bold text-sidebar-heading uppercase" style={{ letterSpacing: '0.08em' }}>
          {locale === 'es' ? 'General' : 'Overview'}
        </p>
        <div className="space-y-0.5 mb-6">
          {overviewItems.map(item => (
            <NavItem key={item.key} item={item} pathname={pathname} t={t} />
          ))}
        </div>

        {/* Management section */}
        <p className="px-3 mb-2 text-[11px] font-bold text-sidebar-heading uppercase" style={{ letterSpacing: '0.08em' }}>
          {locale === 'es' ? 'Gestión' : 'Management'}
        </p>
        <div className="space-y-0.5 mb-6">
          {managementItems.map(item => (
            <NavItem key={item.key} item={item} pathname={pathname} t={t} />
          ))}
        </div>

        {/* Account section */}
        <p className="px-3 mb-2 text-[11px] font-bold text-sidebar-heading uppercase" style={{ letterSpacing: '0.08em' }}>
          {locale === 'es' ? 'Cuenta' : 'Account'}
        </p>
        <div className="space-y-0.5">
          {accountItems.map(item => (
            <NavItem key={item.key} item={item} pathname={pathname} t={t} />
          ))}
        </div>
      </nav>
    </aside>
  );
}
