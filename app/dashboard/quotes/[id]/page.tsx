'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/provider';
import { api } from '@/lib/api';
import { Quote } from '@/types/database';

export default function QuoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, locale } = useI18n();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFixModal, setShowFixModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [reason, setReason] = useState('');
  const [instructions, setInstructions] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try { setQuote((await api.getQuoteDetail(id as string)).quote); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  const fmtMoney = (n: number) => `$${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n)}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const reload = async () => { setQuote((await api.getQuoteDetail(id as string)).quote); };
  const handleApprove = async () => { setActionLoading(true); try { await api.approveQuote(id as string); await reload(); } catch (err) { console.error(err); } finally { setActionLoading(false); } };
  const handleReject = async () => { setActionLoading(true); try { await api.rejectQuote(id as string, reason); setShowRejectModal(false); await reload(); } catch (err) { console.error(err); } finally { setActionLoading(false); } };
  const handleRequestFix = async () => { setActionLoading(true); try { await api.requestQuoteFix(id as string, instructions); setShowFixModal(false); await reload(); } catch (err) { console.error(err); } finally { setActionLoading(false); } };
  const handleUpdateStatus = async () => { if (!newStatus) return; setActionLoading(true); try { await api.updateQuoteStatus(id as string, newStatus, statusNotes || undefined); setShowStatusModal(false); setNewStatus(''); setStatusNotes(''); await reload(); } catch (err) { console.error(err); } finally { setActionLoading(false); } };

  const allStatuses = [
    { value: 'draft', label: t('status_draft' as any) },
    { value: 'pending_uploads', label: t('status_pending_uploads' as any) },
    { value: 'processing_ai', label: t('status_processing_ai' as any) },
    { value: 'pending_review', label: t('status_pending_review' as any) },
    { value: 'approved', label: t('status_approved' as any) },
    { value: 'rejected', label: t('status_rejected' as any) },
    { value: 'needs_fix', label: t('status_needs_fix' as any) },
  ];

  const photoTypeLabel: Record<string, string> = {
    plate: locale === 'es' ? 'Patente' : 'Plate',
    front: locale === 'es' ? 'Frente' : 'Front',
    rear: locale === 'es' ? 'Trasero' : 'Rear',
    left: locale === 'es' ? 'Izquierdo' : 'Left',
    right: locale === 'es' ? 'Derecho' : 'Right',
    license_front: locale === 'es' ? 'Licencia Frente' : 'License Front',
    license_back: locale === 'es' ? 'Licencia Dorso' : 'License Back',
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  if (!quote) return <p className="text-center text-muted-foreground py-12">{t('no_data')}</p>;

  const statusStyles: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    pending_review: 'bg-warning/10 text-warning',
    approved: 'bg-success/10 text-success',
    rejected: 'bg-error/10 text-error',
    needs_fix: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    processing_ai: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    pending_uploads: 'bg-info/10 text-info',
  };

  const aiScoreColor = (s: number) => s >= 80 ? 'text-success' : s >= 50 ? 'text-warning' : 'text-error';
  const aiScoreBorder = (s: number) => s >= 80 ? 'border-success' : s >= 50 ? 'border-warning' : 'border-error';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-foreground">{quote.quote_number}</h1>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${statusStyles[quote.status] || ''}`}>{t(`status_${quote.status}` as any)}</span>
            </div>
            <p className="text-sm text-muted-foreground">{fmtDate(quote.created_at)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => { setNewStatus(quote.status); setShowStatusModal(true); }} disabled={actionLoading}
            className="px-4 py-2.5 border border-border text-sm rounded-xl font-semibold text-foreground hover:bg-secondary disabled:opacity-50 transition-colors">
            {t('change_status' as any)}
          </button>
          {quote.status === 'pending_review' && (
            <>
              <button onClick={handleApprove} disabled={actionLoading}
                className="px-4 py-2.5 bg-success text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">{t('approve_quote')}</button>
              <button onClick={() => setShowFixModal(true)} disabled={actionLoading}
                className="px-4 py-2.5 bg-warning text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">{t('request_fix')}</button>
              <button onClick={() => setShowRejectModal(true)} disabled={actionLoading}
                className="px-4 py-2.5 bg-error text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">{t('reject_quote')}</button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Vehicle & Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-card rounded-2xl card-shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                </div>
                <h3 className="text-sm font-bold text-foreground">{t('vehicle_info')}</h3>
              </div>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">{t('vehicle_plate')}</dt><dd className="font-mono font-bold text-primary">{quote.vehicle_plate}</dd></div>
                {quote.vehicle && (
                  <>
                    <div className="flex justify-between"><dt className="text-muted-foreground">{t('vehicle_make' as any)}</dt><dd className="font-medium">{quote.vehicle.make || '-'}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">{t('vehicle_model' as any)}</dt><dd className="font-medium">{quote.vehicle.model || '-'}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">{t('vehicle_year' as any)}</dt><dd className="font-medium">{quote.vehicle.year || '-'}</dd></div>
                    {quote.vehicle.color && <div className="flex justify-between"><dt className="text-muted-foreground">{t('vehicle_color' as any)}</dt><dd className="font-medium">{quote.vehicle.color}</dd></div>}
                    {quote.vehicle.fuel_type && <div className="flex justify-between"><dt className="text-muted-foreground">{t('vehicle_fuel' as any)}</dt><dd className="font-medium">{quote.vehicle.fuel_type}</dd></div>}
                  </>
                )}
              </dl>
            </div>

            <div className="bg-card rounded-2xl card-shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <h3 className="text-sm font-bold text-foreground">{t('customer_info')}</h3>
              </div>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">DNI</dt><dd className="font-mono font-medium">{quote.customer_dni ? new Intl.NumberFormat('es-AR').format(Number(quote.customer_dni)) : '-'}</dd></div>
                {(quote.customer_data as any)?.cuit && <div className="flex justify-between"><dt className="text-muted-foreground">CUIT</dt><dd className="font-mono font-medium">{(quote.customer_data as any).cuit}</dd></div>}
                {quote.customer && (
                  <>
                    <div className="flex justify-between"><dt className="text-muted-foreground">{t('name')}</dt><dd className="font-medium">{quote.customer.full_name || '-'}</dd></div>
                    {quote.customer.date_of_birth && <div className="flex justify-between"><dt className="text-muted-foreground">{t('date_of_birth' as any)}</dt><dd>{quote.customer.date_of_birth}</dd></div>}
                    {quote.customer.sex && <div className="flex justify-between"><dt className="text-muted-foreground">{t('sex' as any)}</dt><dd>{quote.customer.sex === 'M' ? t('male' as any) : t('female' as any)}</dd></div>}
                    <div className="flex justify-between"><dt className="text-muted-foreground">{t('email')}</dt><dd>{quote.customer.email || '-'}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">{t('phone')}</dt><dd>{quote.customer.phone || '-'}</dd></div>
                    {quote.customer.street_name && <div className="flex justify-between"><dt className="text-muted-foreground">{t('street_name' as any)}</dt><dd>{quote.customer.street_name}</dd></div>}
                    {quote.customer.street_number && <div className="flex justify-between"><dt className="text-muted-foreground">{t('street_number' as any)}</dt><dd>{quote.customer.street_number}</dd></div>}
                    {quote.customer.floor && <div className="flex justify-between"><dt className="text-muted-foreground">{t('floor_label' as any)}</dt><dd>{quote.customer.floor}</dd></div>}
                    {quote.customer.apartment && <div className="flex justify-between"><dt className="text-muted-foreground">{t('apartment' as any)}</dt><dd>{quote.customer.apartment}</dd></div>}
                    {!quote.customer.street_name && quote.customer.address && <div className="flex justify-between"><dt className="text-muted-foreground">{t('address' as any)}</dt><dd className="text-right max-w-[60%]">{quote.customer.address}</dd></div>}
                    {quote.customer.city && <div className="flex justify-between"><dt className="text-muted-foreground">{t('city')}</dt><dd>{quote.customer.city}</dd></div>}
                    {quote.customer.province && <div className="flex justify-between"><dt className="text-muted-foreground">{t('province' as any)}</dt><dd>{quote.customer.province}</dd></div>}
                    {quote.customer.postal_code && <div className="flex justify-between"><dt className="text-muted-foreground">{t('postal_code' as any)}</dt><dd>{quote.customer.postal_code}</dd></div>}
                  </>
                )}
              </dl>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-card rounded-2xl card-shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-sm font-bold text-foreground">{t('photos')}</h3>
              {quote.photos && <span className="text-xs text-muted-foreground">({quote.photos.length})</span>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quote.photos?.map(photo => (
                <div key={photo.id} className="cursor-pointer group" onClick={() => setSelectedPhoto(photo.storage_url || null)}>
                  <div className="aspect-square rounded-xl overflow-hidden bg-secondary border border-border">
                    {photo.storage_url ? (
                      <img src={photo.storage_url} alt={photo.photo_type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground">{photoTypeLabel[photo.photo_type] || photo.photo_type}</p>
                    {photo.quality_score != null && (
                      <span className={`text-xs font-bold ${photo.quality_score >= 80 ? 'text-success' : photo.quality_score >= 50 ? 'text-warning' : 'text-error'}`}>
                        {photo.quality_score.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {(!quote.photos || quote.photos.length === 0) && <p className="col-span-4 text-center text-sm text-muted-foreground py-8">{t('no_data')}</p>}
            </div>
          </div>

          {/* Location */}
          {quote.gps_lat && quote.gps_lng && (
            <div className="bg-card rounded-2xl card-shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h3 className="text-sm font-bold text-foreground">{t('location')}</h3>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden bg-secondary border border-border">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${quote.gps_lng - 0.01},${quote.gps_lat - 0.01},${quote.gps_lng + 0.01},${quote.gps_lat + 0.01}&layer=mapnik&marker=${quote.gps_lat},${quote.gps_lng}`}
                  className="w-full h-full" style={{ border: 0 }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-mono">Lat: {quote.gps_lat?.toFixed(6)}, Lng: {quote.gps_lng?.toFixed(6)}</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          <div className="bg-card rounded-2xl card-shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-sm font-bold text-foreground">{t('plan')}</h3>
            </div>
            <div className="text-center py-3 border-b border-border mb-4">
              <p className="text-3xl font-bold text-foreground">{quote.premium ? fmtMoney(quote.premium) : '-'}</p>
              <p className="text-sm text-muted-foreground mt-1">{(quote.plan as any)?.name || '-'}</p>
            </div>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">{locale === 'es' ? 'Promotor' : 'Producer'}</dt><dd className="font-medium">{(quote.producer as any)?.full_name}</dd></div>
              {(quote.vehicle_data as any)?.api_meta?.solicitud && (
                <div className="flex justify-between"><dt className="text-muted-foreground">{t('solicitud_number')}</dt><dd className="font-mono font-bold text-primary">{(quote.vehicle_data as any).api_meta.solicitud}</dd></div>
              )}
              {quote.submitted_at && <div className="flex justify-between"><dt className="text-muted-foreground">{t('submitted_at')}</dt><dd className="text-xs">{fmtDate(quote.submitted_at)}</dd></div>}
            </dl>
          </div>

          {/* AI Validation */}
          <div className="bg-card rounded-2xl card-shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-sm font-bold text-foreground">{t('ai_validation')}</h3>
            </div>
            {quote.ai_score != null ? (
              <div>
                <div className="text-center py-2">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-[3px] ${aiScoreBorder(quote.ai_score)} ${aiScoreColor(quote.ai_score)}`}>
                    <span className="text-xl font-bold">{quote.ai_score.toFixed(0)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 max-w-[200px] mx-auto">{quote.ai_summary}</p>
                </div>
                {quote.ai_flags && quote.ai_flags.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {quote.ai_flags.map((flag, i) => (
                      <div key={i} className={`px-3 py-2 rounded-lg text-xs ${
                        flag.severity === 'critical' ? 'bg-error/10 text-error' :
                        flag.severity === 'warning' ? 'bg-warning/10 text-warning' :
                        'bg-info/10 text-info'
                      }`}>
                        <span className="font-bold uppercase">{flag.severity}:</span> {flag.message}
                      </div>
                    ))}
                  </div>
                )}
                {(quote.vehicle_data as any)?.ai_checkpoints != null && (
                  <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">{locale === 'es' ? 'Checkpoints' : 'Checkpoints'}</span><span className="font-bold">{(quote.vehicle_data as any).ai_checkpoints}</span></div>
                    {(quote.vehicle_data as any)?.ai_token_usage != null && (
                      <div className="flex justify-between"><span className="text-muted-foreground">{locale === 'es' ? 'Tokens IA' : 'AI tokens'}</span><span className="font-medium">{(quote.vehicle_data as any).ai_token_usage.toLocaleString()}</span></div>
                    )}
                    {(quote.vehicle_data as any)?.ai_token_details && (
                      <div className="flex justify-between"><span className="text-muted-foreground">{locale === 'es' ? 'Llamadas' : 'Calls'}</span><span className="font-medium">{(quote.vehicle_data as any).ai_token_details.calls}</span></div>
                    )}
                    {(quote.vehicle_data as any)?.ai_checkpoint_names && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground font-medium">{locale === 'es' ? 'Ver detalle' : 'View details'}</summary>
                        <ol className="mt-2 space-y-1 text-xs text-muted-foreground list-decimal list-inside">
                          {(quote.vehicle_data as any).ai_checkpoint_names.map((cp: string, i: number) => <li key={i}>{cp}</li>)}
                        </ol>
                      </details>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-6">
                {quote.ai_status === 'processing' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    {locale === 'es' ? 'Procesando...' : 'Processing...'}
                  </span>
                ) : t('no_data')}
              </p>
            )}
          </div>

          {quote.rejection_reason && (
            <div className="bg-error/5 border border-error/20 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-error mb-1">{t('rejection_reason')}</h3>
              <p className="text-sm text-foreground">{quote.rejection_reason}</p>
            </div>
          )}
          {quote.fix_instructions && (
            <div className="bg-warning/5 border border-warning/20 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-warning mb-1">{t('fix_instructions')}</h3>
              <p className="text-sm text-foreground">{quote.fix_instructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl max-h-[90vh]">
            <button className="absolute -top-10 right-0 text-white/70 hover:text-white" onClick={() => setSelectedPhoto(null)}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <img src={selectedPhoto} alt="Photo" className="max-w-full max-h-[85vh] rounded-2xl object-contain" />
          </div>
        </div>
      )}

      {/* Modals */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl card-shadow p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-bold text-foreground mb-4">{t('reject_quote')}</h3>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('rejection_reason')}
              className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[120px]" />
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2.5 text-sm rounded-xl border border-border font-semibold hover:bg-secondary transition-colors">{t('cancel')}</button>
              <button onClick={handleReject} disabled={!reason || actionLoading} className="px-4 py-2.5 text-sm rounded-xl bg-error text-white font-bold hover:opacity-90 disabled:opacity-50 transition-all">{t('confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {showFixModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl card-shadow p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-bold text-foreground mb-4">{t('request_fix')}</h3>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder={t('fix_instructions')}
              className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[120px]" />
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setShowFixModal(false)} className="px-4 py-2.5 text-sm rounded-xl border border-border font-semibold hover:bg-secondary transition-colors">{t('cancel')}</button>
              <button onClick={handleRequestFix} disabled={!instructions || actionLoading} className="px-4 py-2.5 text-sm rounded-xl bg-warning text-white font-bold hover:opacity-90 disabled:opacity-50 transition-all">{t('confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl card-shadow p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-bold text-foreground mb-4">{t('change_status' as any)}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{t('new_status' as any)}</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                  {allStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{locale === 'es' ? 'Notas (opcional)' : 'Notes (optional)'}</label>
                <textarea value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)} placeholder={locale === 'es' ? 'Notas...' : 'Notes...'}
                  className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[100px]" />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setShowStatusModal(false)} className="px-4 py-2.5 text-sm rounded-xl border border-border font-semibold hover:bg-secondary transition-colors">{t('cancel')}</button>
              <button onClick={handleUpdateStatus} disabled={!newStatus || newStatus === quote.status || actionLoading}
                className="px-4 py-2.5 text-sm rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 disabled:opacity-50 transition-all">{t('update_status' as any)}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
