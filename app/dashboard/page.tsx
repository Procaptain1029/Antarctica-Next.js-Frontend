'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n/provider';
import { api } from '@/lib/api';
import { DashboardData } from '@/types/database';

function CircularProgress({ percent, size = 56, stroke = 4, color }: { percent: number; size?: number; stroke?: number; color: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-700 ease-out" />
    </svg>
  );
}

const cardThemes = [
  { bg: 'from-[#063BA7] to-[#0550C8]', ring: '#60a5fa', accent: 'rgba(96,165,250,0.18)' },
  { bg: 'from-[#006C9C] to-[#0081B8]', ring: '#67e8f9', accent: 'rgba(103,232,249,0.18)' },
  { bg: 'from-[#0E4F8B] to-[#1264AD]', ring: '#93c5fd', accent: 'rgba(147,197,253,0.18)' },
  { bg: 'from-[#0D5E7E] to-[#0F7499]', ring: '#5eead4', accent: 'rgba(94,234,212,0.18)' },
];

function StatCard({ title, value, subtitle, percent, icon, themeIndex }: {
  title: string;
  value: string | number;
  subtitle?: string;
  percent: number;
  icon: React.ReactNode;
  themeIndex: number;
}) {
  const theme = cardThemes[themeIndex % cardThemes.length];
  return (
    <div className={`bg-gradient-to-br ${theme.bg} rounded-2xl p-5 text-white relative overflow-hidden animate-fade-in`}>
      <div className="absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center opacity-30" style={{ background: theme.accent }}>
        {icon}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <CircularProgress percent={Math.min(percent, 100)} color={theme.ring} />
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white/90">{Math.round(percent)}%</span>
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-extrabold leading-none" style={{ letterSpacing: '-0.03em' }}>{value}</p>
          <p className="text-[13px] font-medium text-white/60 mt-1">{title}</p>
        </div>
      </div>
      {subtitle && <p className="text-[11px] text-white/40 mt-3 font-medium">{subtitle}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try { setData(await api.getDashboardData()); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-56 bg-secondary rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`bg-gradient-to-br ${cardThemes[i].bg} rounded-2xl p-5 h-[120px]`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/10" />
                <div className="space-y-2 flex-1">
                  <div className="h-7 w-20 bg-white/10 rounded" />
                  <div className="h-4 w-28 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-card rounded-2xl p-6 card-shadow h-24" />
          <div className="bg-card rounded-2xl p-6 card-shadow h-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-card rounded-2xl p-6 card-shadow h-64" />
          <div className="bg-card rounded-2xl p-6 card-shadow h-64" />
        </div>
      </div>
    );
  }

  const fmt = (n: number) => new Intl.NumberFormat(locale === 'es' ? 'es-AR' : 'en-US').format(n);
  const fmtMoney = (n: number) => `$${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n)}`;

  const totalQ = data?.quotes.total || 0;
  const approvedQ = data?.quotes.approved || 0;
  const pendingPct = totalQ > 0 ? ((data?.quotes.pending_review || 0) / totalQ * 100) : 0;
  const approvalPct = totalQ > 0 ? (approvedQ / totalQ * 100) : 0;
  const premiumTarget = 10000000;
  const premiumPct = Math.min(((data?.quotes.total_premium || 0) / premiumTarget) * 100, 100);
  const totalProducers = (data?.producers.approved || 0) + (data?.producers.pending || 0);
  const producerPct = totalProducers > 0 ? ((data?.producers.approved || 0) / totalProducers * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {locale === 'es' ? 'Hola, Bienvenido' : 'Hi, Welcome back'}
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t('total_quotes')}
          value={fmt(totalQ)}
          subtitle={`${data?.quotes.pending_review || 0} ${t('pending_review').toLowerCase()}`}
          percent={pendingPct}
          themeIndex={0}
          icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard
          title={t('approved_quotes')}
          value={fmt(approvedQ)}
          subtitle={`${approvalPct.toFixed(1)}% ${locale === 'es' ? 'aprobación' : 'approval rate'}`}
          percent={approvalPct}
          themeIndex={1}
          icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title={t('total_premium')}
          value={fmtMoney(data?.quotes.total_premium || 0)}
          subtitle={locale === 'es' ? 'en pólizas aprobadas' : 'in approved policies'}
          percent={premiumPct}
          themeIndex={2}
          icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title={t('active_producers')}
          value={fmt(data?.producers.approved || 0)}
          subtitle={`${data?.producers.pending || 0} ${t('pending').toLowerCase()}`}
          percent={producerPct}
          themeIndex={3}
          icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
      </div>

      {/* Commission Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-card rounded-2xl p-6 card-shadow animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('commissions_due')}</p>
              <p className="text-2xl font-bold text-warning mt-1">{fmtMoney(data?.commissions.totalDue || 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">{locale === 'es' ? 'pendientes de pago' : 'pending payment'}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 card-shadow animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('commissions_paid')}</p>
              <p className="text-2xl font-bold text-success mt-1">{fmtMoney(data?.commissions.totalPaid || 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">{locale === 'es' ? 'total pagado' : 'total paid'}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card rounded-2xl p-6 card-shadow animate-fade-in">
          <h3 className="text-lg font-bold text-foreground mb-4">{t('top_producers')}</h3>
          <div className="space-y-0">
            {data?.topProducers?.slice(0, 5).map((producer, i) => (
              <div key={producer.producer_id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-gray-300 text-gray-600'
                  }`}>{i + 1}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{producer.full_name}</p>
                    <p className="text-xs text-muted-foreground">{producer.approved_quotes} {locale === 'es' ? 'aprobadas' : 'approved'}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-foreground">{fmtMoney(producer.total_premium)}</span>
              </div>
            ))}
            {(!data?.topProducers || data.topProducers.length === 0) && (
              <p className="text-sm text-muted-foreground py-8 text-center">{t('no_data')}</p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 card-shadow animate-fade-in">
          <h3 className="text-lg font-bold text-foreground mb-4">{t('plan_distribution')}</h3>
          <div className="space-y-5">
            {data?.planDistribution?.map((plan, i) => {
              const total = data.planDistribution.reduce((s, p) => s + p.count, 0);
              const pct = total > 0 ? (plan.count / total * 100) : 0;
              const barColors = ['bg-primary', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
              return (
                <div key={plan.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-foreground">{plan.name}</span>
                    <span className="text-muted-foreground">{plan.count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${barColors[i % barColors.length]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {(!data?.planDistribution || data.planDistribution.length === 0) && (
              <p className="text-sm text-muted-foreground py-8 text-center">{t('no_data')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
