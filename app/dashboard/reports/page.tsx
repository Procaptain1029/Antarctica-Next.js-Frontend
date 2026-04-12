'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/provider';
import { api } from '@/lib/api';

type ReportType = 'quotes' | 'commissions' | 'producers';

export default function ReportsPage() {
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportType, setReportType] = useState<ReportType>('quotes');

  const downloadReport = async (format: 'excel' | 'pdf') => {
    setLoading(true);
    try {
      const params: Record<string, string> = { type: reportType, format };
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const blob = await api.downloadReport(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const reports = [
    { key: 'quotes' as const, icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    ), color: 'bg-primary/10 text-primary', label: locale === 'es' ? 'Cotizaciones' : 'Quotes', desc: locale === 'es' ? 'Reporte detallado de cotizaciones' : 'Detailed quotation report' },
    { key: 'commissions' as const, icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ), color: 'bg-warning/10 text-warning', label: locale === 'es' ? 'Comisiones' : 'Commissions', desc: locale === 'es' ? 'Liquidaciones y pagos' : 'Settlements and payments' },
    { key: 'producers' as const, icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ), color: 'bg-info/10 text-info', label: locale === 'es' ? 'Promotores' : 'Producers', desc: locale === 'es' ? 'Estado de la red comercial' : 'Sales network status' },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">{t('report_management')}</h1>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map(r => (
          <button key={r.key} onClick={() => setReportType(r.key)}
            className={`bg-card rounded-2xl p-5 card-shadow text-left transition-all ${reportType === r.key ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-border'}`}>
            <div className={`w-12 h-12 rounded-xl ${r.color} flex items-center justify-center mb-4`}>{r.icon}</div>
            <p className="text-sm font-bold text-foreground">{r.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
          </button>
        ))}
      </div>

      {/* Date Filters */}
      <div className="bg-card rounded-2xl card-shadow p-6">
        <h3 className="text-base font-bold text-foreground mb-4">{locale === 'es' ? 'Filtros y Descarga' : 'Filters & Download'}</h3>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{locale === 'es' ? 'Desde' : 'From'}</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{locale === 'es' ? 'Hasta' : 'To'}</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => downloadReport('excel')} disabled={loading}
              className="px-5 py-2.5 text-sm rounded-xl bg-success text-white font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Excel
            </button>
            <button onClick={() => downloadReport('pdf')} disabled={loading}
              className="px-5 py-2.5 text-sm rounded-xl bg-error text-white font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              PDF
            </button>
          </div>
        </div>
        {loading && (
          <div className="flex items-center gap-2 mt-4">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">{locale === 'es' ? 'Generando reporte...' : 'Generating report...'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
