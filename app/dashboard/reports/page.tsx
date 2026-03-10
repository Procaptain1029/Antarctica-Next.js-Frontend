'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n/provider';
import { api } from '@/lib/api';
import { DashboardData } from '@/types/database';

export default function ReportsPage() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await api.getDashboardData();
        setData(result);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const fmtMoney = (n: number) => `$${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n)}`;

  const handleExport = async (type: string) => {
    try {
      await api.exportReport(type);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const conversionRate = data?.quotes.total
    ? ((data.quotes.approved / data.quotes.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('reports_analytics')}</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('quotes')}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-border transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            {locale === 'es' ? 'Exportar Cotizaciones' : 'Export Quotes'}
          </button>
          <button
            onClick={() => handleExport('commissions')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            {locale === 'es' ? 'Exportar Comisiones' : 'Export Commissions'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="text-sm text-muted-foreground">{t('conversion_rate')}</p>
          <p className="text-3xl font-bold text-primary mt-2">{conversionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{data?.quotes.approved}/{data?.quotes.total} {locale === 'es' ? 'cotizaciones' : 'quotes'}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="text-sm text-muted-foreground">{t('total_premium')}</p>
          <p className="text-3xl font-bold text-success mt-2">{fmtMoney(data?.quotes.total_premium || 0)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="text-sm text-muted-foreground">{t('active_producers')}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{data?.producers.approved || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">{data?.producers.total} total</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="text-sm text-muted-foreground">{locale === 'es' ? 'Comisiones Totales' : 'Total Commissions'}</p>
          <p className="text-3xl font-bold text-purple-500 mt-2">{fmtMoney((data?.commissions.totalDue || 0) + (data?.commissions.totalPaid || 0))}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('monthly_overview')}</h3>
          <div className="space-y-4">
            {data?.monthly?.slice(0, 6).map((month) => {
              const date = new Date(month.month);
              const label = date.toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', { month: 'short', year: 'numeric' });
              const maxQuotes = Math.max(...(data.monthly?.map(m => m.total_quotes) || [1]));
              const pct = maxQuotes > 0 ? (month.total_quotes / maxQuotes * 100) : 0;

              return (
                <div key={month.month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{label}</span>
                    <span className="text-muted-foreground">{month.total_quotes} {locale === 'es' ? 'cotizaciones' : 'quotes'}</span>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden flex">
                    <div className="h-full bg-success rounded-full" style={{ width: `${month.approved / Math.max(month.total_quotes, 1) * pct}%` }} />
                    <div className="h-full bg-error rounded-full" style={{ width: `${month.rejected / Math.max(month.total_quotes, 1) * pct}%` }} />
                    <div className="h-full bg-warning rounded-full" style={{ width: `${month.pending / Math.max(month.total_quotes, 1) * pct}%` }} />
                  </div>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs text-success">✓ {month.approved}</span>
                    <span className="text-xs text-error">✕ {month.rejected}</span>
                    <span className="text-xs text-warning">⏳ {month.pending}</span>
                    {month.total_premium > 0 && <span className="text-xs text-muted-foreground ml-auto">{fmtMoney(month.total_premium)}</span>}
                  </div>
                </div>
              );
            })}
            {(!data?.monthly || data.monthly.length === 0) && (
              <p className="text-muted-foreground text-sm text-center py-8">{t('no_data')}</p>
            )}
          </div>
        </div>

        {/* Producer Ranking */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('producer_ranking')}</h3>
          <div className="space-y-3">
            {data?.topProducers?.slice(0, 8).map((producer, i) => (
              <div key={producer.producer_id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                  i === 1 ? 'bg-gray-300/20 text-gray-500' :
                  i === 2 ? 'bg-amber-700/20 text-amber-700' :
                  'bg-muted text-muted-foreground'
                }`}>
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{producer.full_name}</p>
                  <p className="text-xs text-muted-foreground">{producer.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{fmtMoney(producer.total_premium)}</p>
                  <p className="text-xs text-muted-foreground">{producer.approved_quotes} {locale === 'es' ? 'aprobadas' : 'approved'}</p>
                </div>
              </div>
            ))}
            {(!data?.topProducers || data.topProducers.length === 0) && (
              <p className="text-muted-foreground text-sm text-center py-8">{t('no_data')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('most_sold_plans')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.planDistribution?.map((plan) => {
            const total = data.planDistribution.reduce((s, p) => s + p.count, 0);
            const pct = total > 0 ? (plan.count / total * 100) : 0;
            return (
              <div key={plan.name} className="bg-muted rounded-xl p-4 text-center">
                <p className="text-sm font-medium text-foreground">{plan.name}</p>
                <p className="text-2xl font-bold text-primary mt-2">{plan.count}</p>
                <p className="text-xs text-muted-foreground">{pct.toFixed(1)}% {locale === 'es' ? 'del total' : 'of total'}</p>
              </div>
            );
          })}
          {(!data?.planDistribution || data.planDistribution.length === 0) && (
            <p className="col-span-4 text-muted-foreground text-sm text-center py-8">{t('no_data')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
