'use client';

import { useEffect, useState, useCallback } from 'react';
import { useI18n } from '@/lib/i18n/provider';
import { api } from '@/lib/api';
import { Profile } from '@/types/database';

const statusStyles: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-error/10 text-error',
  suspended: 'bg-muted text-muted-foreground',
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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, filter, search]);

  useEffect(() => { loadProducers(); }, [loadProducers]);

  const handleAction = async (producerId: string, action: string) => {
    if (action === 'deactivate') {
      const reason = window.prompt(locale === 'es' ? 'Motivo de baja (opcional):' : 'Deactivation reason (optional):');
      if (reason === null) return;
      setActionLoading(producerId);
      try { await api.deactivateProducer(producerId, reason || undefined); loadProducers(); } catch (err) { console.error(err); } finally { setActionLoading(null); }
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
    } catch (err) { console.error(err); } finally { setActionLoading(null); }
  };

  const handleRateUpdate = async (producerId: string) => {
    try {
      const rate = parseFloat(newRate) / 100;
      if (isNaN(rate) || rate < 0 || rate > 1) return;
      await api.updateCommissionRate(producerId, rate);
      setEditingRate(null); setNewRate(''); loadProducers();
    } catch (err) { console.error(err); }
  };

  const openEditModal = (producer: any) => {
    setEditingProducer(producer);
    setEditForm({ full_name: producer.full_name || '', email: producer.email || '', phone: producer.phone || '', dni: producer.dni || '', whatsapp: producer.whatsapp || '' });
  };

  const handleEditSave = async () => {
    if (!editingProducer) return;
    setEditSaving(true);
    try { await api.updateProducer(editingProducer.id, editForm); setEditingProducer(null); loadProducers(); } catch (err) { console.error(err); } finally { setEditSaving(false); }
  };

  const statusLabel = (s: string) => t(s as 'pending' | 'approved' | 'rejected' | 'suspended');
  const formatDni = (dni: string | null) => !dni ? '-' : new Intl.NumberFormat('es-AR').format(Number(dni));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">{t('producer_management')}</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder={t('search') + '...'} value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground" />
        </div>
        <div className="flex gap-1.5">
          {['', 'pending', 'approved', 'suspended', 'rejected'].map(status => (
            <button key={status} onClick={() => { setFilter(status); setPage(1); }}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${filter === status ? 'bg-foreground text-card' : 'text-muted-foreground hover:bg-secondary'}`}>
              {status === '' ? t('all_producers') : statusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{locale === 'es' ? 'Código' : 'Code'}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{t('name')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">DNI</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{t('email')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{t('status')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{t('commission_rate')}</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-muted-foreground uppercase">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center"><div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" /></td></tr>
              ) : producers.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-sm text-muted-foreground">{t('no_data')}</td></tr>
              ) : producers.map(producer => (
                <tr key={producer.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-4 font-mono text-sm font-semibold text-foreground">{(producer as any).promotor_code || '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{producer.full_name.charAt(0).toUpperCase()}</div>
                      <span className="text-sm font-semibold text-foreground">{producer.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-secondary-foreground font-mono">{formatDni((producer as any).dni)}</td>
                  <td className="px-5 py-4 text-sm text-secondary-foreground">{producer.email}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${statusStyles[producer.status]}`}>{statusLabel(producer.status)}</span>
                  </td>
                  <td className="px-5 py-4">
                    {editingRate === producer.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" value={newRate} onChange={(e) => setNewRate(e.target.value)}
                          className="w-16 px-2 py-1 text-sm border border-input rounded-lg bg-background text-foreground" placeholder="%" min="0" max="100" step="0.1" />
                        <button onClick={() => handleRateUpdate(producer.id)} className="text-success text-sm px-1">✓</button>
                        <button onClick={() => setEditingRate(null)} className="text-error text-sm px-1">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingRate(producer.id); setNewRate(String((producer.commission_rate * 100).toFixed(1))); }}
                        className="text-sm font-semibold text-primary hover:underline">{(producer.commission_rate * 100).toFixed(1)}%</button>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => openEditModal(producer)} className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">{locale === 'es' ? 'Editar' : 'Edit'}</button>
                      {producer.status === 'pending' && (
                        <>
                          <button onClick={() => handleAction(producer.id, 'approve')} disabled={actionLoading === producer.id} className="px-3 py-1.5 text-xs font-bold text-success bg-success/10 rounded-lg hover:bg-success/20 disabled:opacity-50">{locale === 'es' ? 'Alta' : 'Approve'}</button>
                          <button onClick={() => handleAction(producer.id, 'reject')} disabled={actionLoading === producer.id} className="px-3 py-1.5 text-xs font-bold text-error bg-error/10 rounded-lg hover:bg-error/20 disabled:opacity-50">{t('reject')}</button>
                        </>
                      )}
                      {producer.status === 'approved' && <button onClick={() => handleAction(producer.id, 'deactivate')} disabled={actionLoading === producer.id} className="px-3 py-1.5 text-xs font-bold text-error bg-error/10 rounded-lg hover:bg-error/20 disabled:opacity-50">{locale === 'es' ? 'Baja' : 'Deactivate'}</button>}
                      {producer.status === 'suspended' && <button onClick={() => handleAction(producer.id, 'reactivate')} disabled={actionLoading === producer.id} className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 disabled:opacity-50">{t('reactivate')}</button>}
                    </div>
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

      {/* Edit Modal */}
      {editingProducer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="bg-card rounded-2xl card-shadow w-full max-w-lg mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{locale === 'es' ? 'Editar Promotor' : 'Edit Promotor'}{(editingProducer as any).promotor_code && <span className="ml-2 text-sm text-muted-foreground">#{(editingProducer as any).promotor_code}</span>}</h2>
              <button onClick={() => setEditingProducer(null)} className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{ key: 'full_name', label: locale === 'es' ? 'Nombre Completo' : 'Full Name' }, { key: 'dni', label: 'DNI' }, { key: 'email', label: 'Email' }, { key: 'phone', label: locale === 'es' ? 'Teléfono' : 'Phone' }, { key: 'whatsapp', label: 'WhatsApp' }].map(({ key, label }) => (
                <div key={key} className={key === 'full_name' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase">{label}</label>
                  <input type="text" value={editForm[key] || ''} onChange={(e) => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingProducer(null)} className="px-4 py-2.5 text-sm rounded-xl border border-border text-secondary-foreground hover:bg-secondary transition-colors font-semibold">{locale === 'es' ? 'Cancelar' : 'Cancel'}</button>
              <button onClick={handleEditSave} disabled={editSaving} className="px-5 py-2.5 text-sm rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 font-bold">{editSaving ? '...' : (locale === 'es' ? 'Guardar' : 'Save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
