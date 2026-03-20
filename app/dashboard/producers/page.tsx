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
  // Edit modal state
  const [editingProducer, setEditingProducer] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [editSaving, setEditSaving] = useState(false);

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
    if (action === 'deactivate') {
      const reason = window.prompt(locale === 'es' ? 'Motivo de baja (opcional):' : 'Deactivation reason (optional):');
      if (reason === null) return; // cancelled
      setActionLoading(producerId);
      try {
        await api.deactivateProducer(producerId, reason || undefined);
        loadProducers();
      } catch (err) {
        console.error('Failed to deactivate producer:', err);
      } finally {
        setActionLoading(null);
      }
      return;
    }
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

  const openEditModal = (producer: any) => {
    setEditingProducer(producer);
    setEditForm({
      full_name: producer.full_name || '',
      email: producer.email || '',
      phone: producer.phone || '',
      dni: producer.dni || '',
      whatsapp: producer.whatsapp || '',
    });
  };

  const handleEditSave = async () => {
    if (!editingProducer) return;
    setEditSaving(true);
    try {
      await api.updateProducer(editingProducer.id, editForm);
      setEditingProducer(null);
      loadProducers();
    } catch (err) {
      console.error('Failed to update producer:', err);
    } finally {
      setEditSaving(false);
    }
  };

  const statusLabel = (s: string) => {
    const key = s as 'pending' | 'approved' | 'rejected' | 'suspended';
    return t(key);
  };

  const formatDni = (dni: string | null) => {
    if (!dni) return '-';
    return new Intl.NumberFormat('es-AR').format(Number(dni));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('producer_management')}</h1>
          <p className="text-muted-foreground mt-1">
            {locale === 'es' ? 'ABM de promotores — Alta, Baja, Modificación' : 'Promotor management — Create, Deactivate, Modify'}
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{locale === 'es' ? 'Código' : 'Code'}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('name')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">DNI</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('email')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('phone')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('status')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('commission_rate')}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('actions')}</th>
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
              ) : producers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">{t('no_data')}</td>
                </tr>
              ) : producers.map(producer => (
                <tr key={producer.id} className="hover:bg-muted/30 transition-colors animate-fade-in">
                  <td className="px-4 py-4">
                    {(producer as any).promotor_code ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-sm font-bold font-mono">
                        {(producer as any).promotor_code}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                        {producer.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-foreground">{producer.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground font-mono">{formatDni((producer as any).dni)}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{producer.email}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{producer.phone || '-'}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[producer.status]}`}>
                      {statusLabel(producer.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
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
                  <td className="px-4 py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {/* Edit button (always visible) */}
                      <button
                        onClick={() => openEditModal(producer)}
                        className="px-3 py-1 text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                      >
                        {locale === 'es' ? 'Editar' : 'Edit'}
                      </button>
                      {producer.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(producer.id, 'approve')}
                            disabled={actionLoading === producer.id}
                            className="px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors disabled:opacity-50"
                          >
                            {locale === 'es' ? 'Alta' : 'Approve'}
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
                          onClick={() => handleAction(producer.id, 'deactivate')}
                          disabled={actionLoading === producer.id}
                          className="px-3 py-1 text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          {locale === 'es' ? 'Baja' : 'Deactivate'}
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

      {/* Edit Modal */}
      {editingProducer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {locale === 'es' ? 'Editar Promotor' : 'Edit Promotor'}
                {(editingProducer as any).promotor_code && (
                  <span className="ml-2 text-sm font-mono text-primary">#{(editingProducer as any).promotor_code}</span>
                )}
              </h2>
              <button onClick={() => setEditingProducer(null)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'full_name', label: locale === 'es' ? 'Nombre Completo' : 'Full Name' },
                { key: 'dni', label: 'DNI' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: locale === 'es' ? 'Teléfono' : 'Phone' },
                { key: 'whatsapp', label: 'WhatsApp' },
              ].map(({ key, label }) => (
                <div key={key} className={key === 'full_name' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{label}</label>
                  <input
                    type="text"
                    value={editForm[key] || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingProducer(null)}
                className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-secondary transition-colors"
              >
                {locale === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {editSaving
                  ? (locale === 'es' ? 'Guardando...' : 'Saving...')
                  : (locale === 'es' ? 'Guardar Cambios' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
