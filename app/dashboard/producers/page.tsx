'use client';

import { useEffect, useState, useCallback } from 'react';
import { useI18n } from '@/lib/i18n/provider';
import { api } from '@/lib/api';
import { Profile } from '@/types/database';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  suspended: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

export default function ProducersPage() {
  const { t, locale } = useI18n();
  const [producers, setProducers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [newRate, setNewRate] = useState('');

  const loadProducers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '15' };
      if (filter) params.status = filter;
      if (search) params.search = search;
      const result = await api.getProducers(params);
      setProducers(result.producers);
      setTotalPages(result.pagination.pages);
    } catch (err) {
      console.error('Failed to load producers:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => { loadProducers(); }, [loadProducers]);

  const handleAction = async (producerId: string, action: string) => {
    setActionLoading(producerId);
    try {
      switch (action) {
        case 'approve': await api.approveProducer(producerId); break;
        case 'reject': await api.rejectProducer(producerId); break;
        case 'suspend': await api.suspendProducer(producerId); break;
        case 'reactivate': await api.reactivateProducer(producerId); break;
      }
      loadProducers();
    } catch (err) {
      console.error(`Failed to ${action} producer:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRateUpdate = async (producerId: string) => {
    try {
      const rate = parseFloat(newRate) / 100;
      if (isNaN(rate) || rate < 0 || rate > 1) return;
      await api.updateCommissionRate(producerId, rate);
      setEditingRate(null);
      setNewRate('');
      loadProducers();
    } catch (err) {
      console.error('Failed to update rate:', err);
    }
  };

  const statusLabel = (s: string) => {
    const key = s as 'pending' | 'approved' | 'rejected' | 'suspended';
    return t(key);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('producer_management')}</h1>
          <p className="text-muted-foreground mt-1">
            {locale === 'es' ? 'Gestiona las cuentas de micro-productores' : 'Manage micro-producer accounts'}
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
            placeholder={t('search') + '...'}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {['', 'pending', 'approved', 'suspended', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => { setFilter(status); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-border'
              }`}
            >
              {status === '' ? t('all_producers') : statusLabel(status)}
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
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('name')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('email')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('phone')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('city')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('status')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('commission_rate')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <svg className="animate-spin w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('loading')}
                  </td>
                </tr>
              ) : producers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">{t('no_data')}</td>
                </tr>
              ) : producers.map(producer => (
                <tr key={producer.id} className="hover:bg-muted/30 transition-colors animate-fade-in">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                        {producer.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-foreground">{producer.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{producer.email}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{producer.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{producer.city || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[producer.status]}`}>
                      {statusLabel(producer.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {editingRate === producer.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={newRate}
                          onChange={(e) => setNewRate(e.target.value)}
                          className="w-20 px-2 py-1 text-sm border border-input rounded-lg bg-background text-foreground"
                          placeholder="%"
                          min="0" max="100" step="0.1"
                        />
                        <button onClick={() => handleRateUpdate(producer.id)} className="text-success text-sm">✓</button>
                        <button onClick={() => setEditingRate(null)} className="text-error text-sm">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingRate(producer.id); setNewRate(String((producer.commission_rate * 100).toFixed(1))); }}
                        className="text-sm text-primary-light hover:underline"
                      >
                        {(producer.commission_rate * 100).toFixed(1)}%
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {producer.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(producer.id, 'approve')}
                            disabled={actionLoading === producer.id}
                            className="px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors disabled:opacity-50"
                          >
                            {t('approve')}
                          </button>
                          <button
                            onClick={() => handleAction(producer.id, 'reject')}
                            disabled={actionLoading === producer.id}
                            className="px-3 py-1 text-xs font-medium bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors disabled:opacity-50"
                          >
                            {t('reject')}
                          </button>
                        </>
                      )}
                      {producer.status === 'approved' && (
                        <button
                          onClick={() => handleAction(producer.id, 'suspend')}
                          disabled={actionLoading === producer.id}
                          className="px-3 py-1 text-xs font-medium bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-colors disabled:opacity-50"
                        >
                          {t('suspend')}
                        </button>
                      )}
                      {producer.status === 'suspended' && (
                        <button
                          onClick={() => handleAction(producer.id, 'reactivate')}
                          disabled={actionLoading === producer.id}
                          className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                        >
                          {t('reactivate')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {t('showing')} {page} {t('of')} {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-border text-muted-foreground hover:bg-secondary disabled:opacity-50 transition-colors"
              >
                {t('previous')}
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-border text-muted-foreground hover:bg-secondary disabled:opacity-50 transition-colors"
              >
                {t('next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
