'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/provider';
import { api } from '@/lib/api';
import { Quote } from '@/types/database';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  pending_uploads: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  processing_ai: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  pending_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  needs_fix: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

export default function QuotesPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '15' };
      if (filter) params.status = filter;
      if (search) params.search = search;
      const result = await api.getQuotes(params);
      setQuotes(result.quotes);
      setTotalPages(result.pagination.pages);
      setTotal(result.pagination.total);
    } catch (err) {
      console.error('Failed to load quotes:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  const statusKey = (s: string) => `status_${s}` as any;
  const fmtMoney = (n: number) => `$${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n)}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const aiScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('quote_management')}</h1>
          <p className="text-muted-foreground mt-1">
            {total} {t('results').toLowerCase()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={`${t('search')} (${t('vehicle_plate')}, ${t('customer_dni')}, ${t('quote_number')})...`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'pending_review', 'approved', 'rejected', 'processing_ai', 'needs_fix'].map(status => (
            <button
              key={status}
              onClick={() => { setFilter(status); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-border'
              }`}
            >
              {status === '' ? (locale === 'es' ? 'Todas' : 'All') : t(statusKey(status))}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('quote_number')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'es' ? 'Productor' : 'Producer'}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('vehicle_plate')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('plan')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('premium')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('ai_score')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('status')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('created_at')}</th>
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
                    {t('loading')}
                  </td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">{t('no_data')}</td>
                </tr>
              ) : quotes.map(quote => (
                <tr
                  key={quote.id}
                  onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer animate-fade-in"
                >
                  <td className="px-6 py-4 text-sm font-mono font-medium text-primary-light">{quote.quote_number}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{(quote.producer as any)?.full_name || '-'}</td>
                  <td className="px-6 py-4 text-sm font-mono text-foreground">{quote.vehicle_plate || '-'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{(quote.plan as any)?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{quote.premium ? fmtMoney(quote.premium) : '-'}</td>
                  <td className="px-6 py-4">
                    {quote.ai_score != null ? (
                      <span className={`text-sm font-bold ${aiScoreColor(quote.ai_score)}`}>
                        {quote.ai_score.toFixed(0)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[quote.status] || ''}`}>
                      {t(statusKey(quote.status))}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{fmtDate(quote.created_at)}</td>
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
