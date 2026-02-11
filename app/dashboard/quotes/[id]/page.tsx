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
  const [reason, setReason] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await api.getQuoteDetail(id as string);
        setQuote(result.quote);
      } catch (err) {
        console.error('Failed to load quote:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const fmtMoney = (n: number) => new Intl.NumberFormat(locale === 'es' ? 'es-AR' : 'en-US', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.approveQuote(id as string);
      const result = await api.getQuoteDetail(id as string);
      setQuote(result.quote);
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await api.rejectQuote(id as string, reason);
      setShowRejectModal(false);
      const result = await api.getQuoteDetail(id as string);
      setQuote(result.quote);
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestFix = async () => {
    setActionLoading(true);
    try {
      await api.requestQuoteFix(id as string, instructions);
      setShowFixModal(false);
      const result = await api.getQuoteDetail(id as string);
      setQuote(result.quote);
    } catch (err) {
      console.error('Failed to request fix:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const photoTypeLabel: Record<string, string> = {
    plate: locale === 'es' ? 'Patente' : 'Plate',
    front: locale === 'es' ? 'Frente' : 'Front',
    rear: locale === 'es' ? 'Trasero' : 'Rear',
    left: locale === 'es' ? 'Izquierdo' : 'Left',
    right: locale === 'es' ? 'Derecho' : 'Right',
    license_front: locale === 'es' ? 'Licencia Frente' : 'License Front',
    license_back: locale === 'es' ? 'Licencia Dorso' : 'License Back',
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

  if (!quote) {
    return <p className="text-center text-muted-foreground py-12">{t('no_data')}</p>;
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    pending_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    needs_fix: 'bg-orange-100 text-orange-700',
    processing_ai: 'bg-purple-100 text-purple-700',
    pending_uploads: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
            <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{quote.quote_number}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[quote.status] || ''}`}>
                {t(`status_${quote.status}` as any)}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">{fmtDate(quote.created_at)}</p>
          </div>
        </div>

        {/* Actions */}
        {quote.status === 'pending_review' && (
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-success text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {t('approve_quote')}
            </button>
            <button
              onClick={() => setShowFixModal(true)}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-warning text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {t('request_fix')}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-error text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {t('reject_quote')}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle & Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">{t('vehicle_info')}</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">{t('vehicle_plate')}</dt>
                  <dd className="text-sm font-mono font-bold text-foreground">{quote.vehicle_plate}</dd>
                </div>
                {quote.vehicle && (
                  <>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">{locale === 'es' ? 'Marca/Modelo' : 'Make/Model'}</dt>
                      <dd className="text-sm text-foreground">{quote.vehicle.make} {quote.vehicle.model}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">{locale === 'es' ? 'Año' : 'Year'}</dt>
                      <dd className="text-sm text-foreground">{quote.vehicle.year}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">{locale === 'es' ? 'Color' : 'Color'}</dt>
                      <dd className="text-sm text-foreground">{quote.vehicle.color}</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">{t('customer_info')}</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">DNI</dt>
                  <dd className="text-sm font-mono text-foreground">{quote.customer_dni}</dd>
                </div>
                {quote.customer && (
                  <>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">{t('name')}</dt>
                      <dd className="text-sm text-foreground">{quote.customer.full_name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">{t('email')}</dt>
                      <dd className="text-sm text-foreground">{quote.customer.email || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">{t('phone')}</dt>
                      <dd className="text-sm text-foreground">{quote.customer.phone || '-'}</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">{t('photos')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quote.photos?.map(photo => (
                <div
                  key={photo.id}
                  className="cursor-pointer group relative"
                  onClick={() => setSelectedPhoto(photo.storage_url || null)}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-muted border border-border">
                    {photo.storage_url ? (
                      <img
                        src={photo.storage_url}
                        alt={photo.photo_type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground">{photoTypeLabel[photo.photo_type] || photo.photo_type}</p>
                    {photo.quality_score != null && (
                      <span className={`text-xs font-bold ${
                        photo.quality_score >= 80 ? 'text-success' :
                        photo.quality_score >= 50 ? 'text-warning' : 'text-error'
                      }`}>
                        {photo.quality_score.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {(!quote.photos || quote.photos.length === 0) && (
                <p className="col-span-4 text-center text-muted-foreground py-8">{t('no_data')}</p>
              )}
            </div>
          </div>

          {/* Location */}
          {quote.gps_lat && quote.gps_lng && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">{t('location')}</h3>
              <div className="aspect-video rounded-xl overflow-hidden bg-muted border border-border">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${quote.gps_lng - 0.01},${quote.gps_lat - 0.01},${quote.gps_lng + 0.01},${quote.gps_lat + 0.01}&layer=mapnik&marker=${quote.gps_lat},${quote.gps_lng}`}
                  className="w-full h-full"
                  style={{ border: 0 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Lat: {quote.gps_lat?.toFixed(6)}, Lng: {quote.gps_lng?.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Plan & Premium */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">{t('plan')}</h3>
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-primary">{quote.premium ? fmtMoney(quote.premium) : '-'}</p>
              <p className="text-sm text-muted-foreground mt-1">{(quote.plan as any)?.name || '-'}</p>
            </div>
            <dl className="space-y-2 mt-4 border-t border-border pt-4">
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">{locale === 'es' ? 'Productor' : 'Producer'}</dt>
                <dd className="text-sm text-foreground">{(quote.producer as any)?.full_name}</dd>
              </div>
              {quote.submitted_at && (
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">{t('submitted_at')}</dt>
                  <dd className="text-sm text-foreground">{fmtDate(quote.submitted_at)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* AI Validation */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">{t('ai_validation')}</h3>
            {quote.ai_score != null ? (
              <>
                <div className="text-center py-3">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 ${
                    quote.ai_score >= 80 ? 'border-success text-success' :
                    quote.ai_score >= 50 ? 'border-warning text-warning' : 'border-error text-error'
                  }`}>
                    <span className="text-2xl font-bold">{quote.ai_score.toFixed(0)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{quote.ai_summary}</p>
                </div>
                {quote.ai_flags && quote.ai_flags.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {quote.ai_flags.map((flag, i) => (
                      <div
                        key={i}
                        className={`px-3 py-2 rounded-lg text-xs ${
                          flag.severity === 'critical' ? 'bg-error/10 text-error' :
                          flag.severity === 'warning' ? 'bg-warning/10 text-warning' :
                          'bg-blue-500/10 text-blue-500'
                        }`}
                      >
                        <span className="font-semibold uppercase">{flag.severity}:</span> {flag.message}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                {quote.ai_status === 'processing' ? (locale === 'es' ? 'Procesando...' : 'Processing...') : t('no_data')}
              </p>
            )}
          </div>

          {/* Rejection / Fix info */}
          {quote.rejection_reason && (
            <div className="bg-error/5 rounded-2xl border border-error/20 p-6">
              <h3 className="text-base font-semibold text-error mb-2">{t('rejection_reason')}</h3>
              <p className="text-sm text-foreground">{quote.rejection_reason}</p>
            </div>
          )}
          {quote.fix_instructions && (
            <div className="bg-warning/5 rounded-2xl border border-warning/20 p-6">
              <h3 className="text-base font-semibold text-warning mb-2">{t('fix_instructions')}</h3>
              <p className="text-sm text-foreground">{quote.fix_instructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={() => setSelectedPhoto(null)}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img src={selectedPhoto} alt="Photo" className="max-w-full max-h-[85vh] rounded-xl object-contain" />
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('reject_quote')}</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('rejection_reason')}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-secondary transition-colors">{t('cancel')}</button>
              <button onClick={handleReject} disabled={!reason || actionLoading} className="px-4 py-2 text-sm rounded-xl bg-error text-white hover:opacity-90 disabled:opacity-50 transition-all">{t('confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Fix Modal */}
      {showFixModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('request_fix')}</h3>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={t('fix_instructions')}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button onClick={() => setShowFixModal(false)} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-secondary transition-colors">{t('cancel')}</button>
              <button onClick={handleRequestFix} disabled={!instructions || actionLoading} className="px-4 py-2 text-sm rounded-xl bg-warning text-white hover:opacity-90 disabled:opacity-50 transition-all">{t('confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
