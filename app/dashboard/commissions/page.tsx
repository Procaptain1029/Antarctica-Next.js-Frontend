'use client';

import { useEffect, useState, useCallback } from 'react';
import { useI18n } from '@/lib/i18n/provider';
import { api } from '@/lib/api';
import { Commission } from '@/types/database';

const statusStyles: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  paid: 'bg-success/10 text-success',
  cancelled: 'bg-error/10 text-error',
};

export default function CommissionsPage() {
  const { t, locale } = useI18n();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.getCommissions({ page: String(page), limit: '15', ...(filter && { status: filter }) }); setCommissions(r.commissions); setTotalPages(r.pagination.pages); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const handlePay = async (id: string) => { setActionLoading(id); try { await api.markCommissionPaid(id); load(); } catch (err) { console.error(err); } finally { setActionLoading(null); } };
  const handleCancel = async (id: string) => { setActionLoading(id); try { await api.cancelCommission(id); load(); } catch (err) { console.error(err); } finally { setActionLoading(null); } };
  const fmtMoney = (n: number) => `$${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n)}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const statusLabel = (s: string) => t(s as 'pending' | 'paid' | 'cancelled');

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">{t('commission_management')}</h1>

      <div className="flex gap-1.5">
        {['', 'pending', 'paid', 'cancelled'].map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${filter === s ? 'bg-foreground text-card' : 'text-muted-foreground hover:bg-secondary'}`}>
            {s === '' ? (locale === 'es' ? 'Todas' : 'All') : statusLabel(s)}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-2xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{locale === 'es' ? 'Productor' : 'Producer'}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{locale === 'es' ? 'Cotización' : 'Quote'}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{locale === 'es' ? 'Monto' : 'Amount'}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{locale === 'es' ? 'Tasa' : 'Rate'}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{t('status')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{t('created_at')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center"><div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" /></td></tr>
              ) : commissions.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-sm text-muted-foreground">{t('no_data')}</td></tr>
              ) : commissions.map(c => (
                <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                        {(c as any).producer?.full_name?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{(c as any).producer?.full_name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-primary font-bold">{(c as any).quote?.quote_number || '-'}</td>
                  <td className="px-5 py-4 text-sm font-bold text-foreground">{fmtMoney(c.amount)}</td>
                  <td className="px-5 py-4 text-sm text-secondary-foreground">{(c.rate * 100).toFixed(1)}%</td>
                  <td className="px-5 py-4"><span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${statusStyles[c.status] || ''}`}>{statusLabel(c.status)}</span></td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{fmtDate(c.created_at)}</td>
                  <td className="px-5 py-4">
                    {c.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button onClick={() => handlePay(c.id)} disabled={actionLoading === c.id} className="px-3 py-1.5 text-xs font-bold text-success bg-success/10 rounded-lg hover:bg-success/20 disabled:opacity-50">{locale === 'es' ? 'Pagar' : 'Pay'}</button>
                        <button onClick={() => handleCancel(c.id)} disabled={actionLoading === c.id} className="px-3 py-1.5 text-xs font-bold text-error bg-error/10 rounded-lg hover:bg-error/20 disabled:opacity-50">{locale === 'es' ? 'Cancelar' : 'Cancel'}</button>
                      </div>
                    )}
                  </td>
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
