'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n/provider';
import { api } from '@/lib/api';
import { DashboardData } from '@/types/database';

function StatsCard({ title, value, subtitle, icon, color }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await api.getDashboardData();
        setData(result);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  const fmt = (n: number) => new Intl.NumberFormat(locale === 'es' ? 'es-AR' : 'en-US').format(n);
  const fmtMoney = (n: number) => new Intl.NumberFormat(locale === 'es' ? 'es-AR' : 'en-US', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('dashboard')}</h1>
        <p className="text-muted-foreground mt-1">
          {locale === 'es' ? 'Resumen general de la plataforma' : 'Platform overview'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title={t('total_quotes')}
          value={fmt(data?.quotes.total || 0)}
          subtitle={`${data?.quotes.pending_review || 0} ${t('pending_review').toLowerCase()}`}
          color="bg-blue-500/10 text-blue-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatsCard
          title={t('approved_quotes')}
          value={fmt(data?.quotes.approved || 0)}
          subtitle={`${((data?.quotes.approved || 0) / Math.max(data?.quotes.total || 1, 1) * 100).toFixed(1)}% ${locale === 'es' ? 'aprobación' : 'approval'}`}
          color="bg-success/10 text-success"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title={t('total_premium')}
          value={fmtMoney(data?.quotes.total_premium || 0)}
          subtitle={locale === 'es' ? 'en pólizas aprobadas' : 'in approved policies'}
          color="bg-purple-500/10 text-purple-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title={t('active_producers')}
          value={fmt(data?.producers.approved || 0)}
          subtitle={`${data?.producers.pending || 0} ${t('pending').toLowerCase()}`}
          color="bg-warning/10 text-warning"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
      </div>

      {/* Commission Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatsCard
          title={t('commissions_due')}
          value={fmtMoney(data?.commissions.totalDue || 0)}
          subtitle={locale === 'es' ? 'pendientes de pago' : 'pending payment'}
          color="bg-orange-500/10 text-orange-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title={t('commissions_paid')}
          value={fmtMoney(data?.commissions.totalPaid || 0)}
          subtitle={locale === 'es' ? 'total pagado' : 'total paid'}
          color="bg-emerald-500/10 text-emerald-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Producers */}
        <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('top_producers')}</h3>
          <div className="space-y-3">
            {data?.topProducers?.slice(0, 5).map((producer, i) => (
              <div key={producer.producer_id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                    i === 1 ? 'bg-gray-300/20 text-gray-500' :
                    i === 2 ? 'bg-amber-700/20 text-amber-700' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{producer.full_name}</p>
                    <p className="text-xs text-muted-foreground">{producer.approved_quotes} {locale === 'es' ? 'aprobadas' : 'approved'}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">{fmtMoney(producer.total_premium)}</span>
              </div>
            ))}
            {(!data?.topProducers || data.topProducers.length === 0) && (
              <p className="text-muted-foreground text-sm py-4 text-center">{t('no_data')}</p>
            )}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('plan_distribution')}</h3>
          <div className="space-y-4">
            {data?.planDistribution?.map((plan) => {
              const total = data.planDistribution.reduce((s, p) => s + p.count, 0);
              const pct = total > 0 ? (plan.count / total * 100) : 0;
              return (
                <div key={plan.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{plan.name}</span>
                    <span className="text-muted-foreground">{plan.count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {(!data?.planDistribution || data.planDistribution.length === 0) && (
              <p className="text-muted-foreground text-sm py-4 text-center">{t('no_data')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
