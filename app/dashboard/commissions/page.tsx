'use client';

import { useEffect, useState, useCallback } from 'react';
import { useI18n } from '@/lib/i18n/provider';
import { api } from '@/lib/api';
import { CommissionEntry } from '@/types/database';

export default function CommissionsPage() {
  const { t, locale } = useI18n();
  const [commissions, setCommissions] = useState<CommissionEntry[]>([]);
  const [totals, setTotals] = useState({ due: 0, paid: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fmtMoney = (n: number) => new Intl.NumberFormat(locale === 'es' ? 'es-AR' : 'en-US', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const loadCommissions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (filter) params.status = filter;
      const result = await api.getCommissions(params);
      setCommissions(result.commissions);
      setTotals(result.totals);
      setTotalPages(result.pagination.pages);
    } catch (err) {
      console.error('Failed to load commissions:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { loadCommissions(); }, [loadCommissions]);

  const handleMarkPaid = async (id: string) => {
    setActionLoading(id);
    try {
      await api.markCommissionPaid(id);
      loadCommissions();
    } catch (err) {
      console.error('Failed to mark paid:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async () => {
    try {
      await api.exportReport('commissions');
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('commission_management')}</h1>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('export_excel')}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="text-sm text-muted-foreground">{t('total_due')}</p>
          <p className="text-2xl font-bold text-warning mt-1">{fmtMoney(totals.due)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="text-sm text-muted-foreground">{t('total_paid_amount')}</p>
          <p className="text-2xl font-bold text-success mt-1">{fmtMoney(totals.paid)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground mt-1">{fmtMoney(totals.total)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'due', 'paid'].map(status => (
          <button
            key={status}
            onClick={() => { setFilter(status); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-border'
            }`}
          >
            {status === '' ? (locale === 'es' ? 'Todas' : 'All') : t(status as 'due' | 'paid')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'es' ? 'Productor' : 'Producer'}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('policy_number')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('quote_number')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('premium')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('rate')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('amount')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('status')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    <svg className="animate-spin w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </td>
                </tr>
              ) : commissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">{t('no_data')}</td>
                </tr>
              ) : commissions.map(c => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors animate-fade-in">
                  <td className="px-6 py-4 text-sm text-foreground">{(c.producer as any)?.full_name || '-'}</td>
                  <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{(c.policy as any)?.policy_number || '-'}</td>
                  <td className="px-6 py-4 text-sm font-mono text-primary-light">{(c.quote as any)?.quote_number || '-'}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{fmtMoney(c.premium)}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{(c.rate * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">{fmtMoney(c.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      c.status === 'paid'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {t(c.status as 'due' | 'paid')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.status === 'due' && (
                      <button
                        onClick={() => handleMarkPaid(c.id)}
                        disabled={actionLoading === c.id}
                        className="px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors disabled:opacity-50"
                      >
                        {t('mark_paid')}
                      </button>
                    )}
                    {c.status === 'paid' && c.paid_at && (
                      <span className="text-xs text-muted-foreground">{fmtDate(c.paid_at)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">{t('showing')} {page} {t('of')} {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm rounded-lg border border-border text-muted-foreground hover:bg-secondary disabled:opacity-50">{t('previous')}</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm rounded-lg border border-border text-muted-foreground hover:bg-secondary disabled:opacity-50">{t('next')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
