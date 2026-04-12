'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/provider';
import { api } from '@/lib/api';
import { Quote } from '@/types/database';

const statusStyles: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending_uploads: 'bg-info/10 text-info',
  processing_ai: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  pending_review: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-error/10 text-error',
  needs_fix: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
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
    try { const r = await api.getQuotes({ page: String(page), limit: '15', ...(filter && { status: filter }), ...(search && { search }) }); setQuotes(r.quotes); setTotalPages(r.pagination.pages); setTotal(r.pagination.total); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page, filter, search]);

  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  const statusKey = (s: string) => `status_${s}` as any;
  const fmtMoney = (n: number) => `$${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n)}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const aiColor = (s: number) => s >= 80 ? 'text-success' : s >= 50 ? 'text-warning' : 'text-error';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('quote_management')}</h1>
        <p className="text-sm text-muted-foreground">{total} {t('results').toLowerCase()}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder={`${t('search')}...`} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['', 'pending_review', 'approved', 'rejected', 'processing_ai', 'needs_fix'].map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${filter === s ? 'bg-foreground text-card' : 'text-muted-foreground hover:bg-secondary'}`}>
              {s === '' ? (locale === 'es' ? 'Todas' : 'All') : t(statusKey(s))}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{t('quote_number')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{locale === 'es' ? 'Productor' : 'Producer'}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{t('vehicle_plate')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{t('plan')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{t('premium')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{t('ai_score')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{t('status')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{t('created_at')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center"><div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" /></td></tr>
              ) : quotes.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-sm text-muted-foreground">{t('no_data')}</td></tr>
              ) : quotes.map(q => (
                <tr key={q.id} onClick={() => router.push(`/dashboard/quotes/${q.id}`)} className="hover:bg-secondary/30 cursor-pointer transition-colors">
                  <td className="px-5 py-4 font-mono text-sm font-bold text-primary">{q.quote_number}</td>
                  <td className="px-5 py-4 text-sm text-foreground">{(q.producer as any)?.full_name || '-'}</td>
                  <td className="px-5 py-4 font-mono text-sm text-foreground">{q.vehicle_plate || '-'}</td>
                  <td className="px-5 py-4 text-sm text-secondary-foreground">{(q.plan as any)?.name || '-'}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-foreground">{q.premium ? fmtMoney(q.premium) : '-'}</td>
                  <td className="px-5 py-4">{q.ai_score != null ? <span className={`text-sm font-bold ${aiColor(q.ai_score)}`}>{q.ai_score.toFixed(0)}</span> : <span className="text-muted-foreground">-</span>}</td>
                  <td className="px-5 py-4"><span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${statusStyles[q.status] || ''}`}>{t(statusKey(q.status))}</span></td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{fmtDate(q.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
            <p className="text-sm text-muted-foreground">{t('showing')} {page} {t('of')} {totalPages}</p>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm rounded-lg border border-border text-secondary-foreground hover:bg-secondary disabled:opacity-40">{t('previous')}</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm rounded-lg border border-border text-secondary-foreground hover:bg-secondary disabled:opacity-40">{t('next')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
