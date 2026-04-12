'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n/provider';

export default function PasswordPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  });

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      change_password: { es: 'Cambiar Contraseña', en: 'Change Password' },
      subtitle: { es: 'Asegura tu cuenta con una contraseña fuerte', en: 'Secure your account with a strong password' },
      current_password: { es: 'Contraseña Actual', en: 'Current Password' },
      new_password: { es: 'Nueva Contraseña', en: 'New Password' },
      confirm_password: { es: 'Confirmar Contraseña', en: 'Confirm Password' },
      update: { es: 'Actualizar Contraseña', en: 'Update Password' },
      updating: { es: 'Actualizando...', en: 'Updating...' },
      back: { es: 'Volver al Perfil', en: 'Back to Profile' },
      mismatch: { es: 'Las contraseñas no coinciden', en: 'Passwords do not match' },
      too_short: { es: 'La contraseña debe tener al menos 6 caracteres', en: 'Password must be at least 6 characters' },
      success_msg: { es: 'Contraseña actualizada correctamente', en: 'Password updated successfully' },
      requirements: { es: 'Requisitos', en: 'Requirements' },
      req_length: { es: 'Mínimo 6 caracteres', en: 'Minimum 6 characters' },
      req_match: { es: 'Las contraseñas deben coincidir', en: 'Passwords must match' },
    };
    return map[key]?.[locale] || key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword.length < 6) { setError(t('too_short')); return; }
    if (form.newPassword !== form.confirm) { setError(t('mismatch')); return; }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password: form.newPassword });
      if (updateError) throw updateError;
      setSuccess(t('success_msg'));
      setForm({ current: '', newPassword: '', confirm: '' });
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const lengthOk = form.newPassword.length >= 6;
  const matchOk = form.newPassword.length > 0 && form.newPassword === form.confirm;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('change_password')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl card-shadow p-6 space-y-5 animate-fade-in">
        {success && (
          <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-xl text-sm font-medium">{success}</div>
        )}
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
        )}

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5" style={{ letterSpacing: '0.05em' }}>{t('current_password')}</label>
          <input type="password" value={form.current} onChange={(e) => setForm(f => ({ ...f, current: e.target.value }))}
            className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="••••••••" />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5" style={{ letterSpacing: '0.05em' }}>{t('new_password')}</label>
          <input type="password" value={form.newPassword} onChange={(e) => setForm(f => ({ ...f, newPassword: e.target.value }))}
            className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="••••••••" />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5" style={{ letterSpacing: '0.05em' }}>{t('confirm_password')}</label>
          <input type="password" value={form.confirm} onChange={(e) => setForm(f => ({ ...f, confirm: e.target.value }))}
            className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="••••••••" />
        </div>

        {/* Requirements */}
        <div className="bg-secondary rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase" style={{ letterSpacing: '0.05em' }}>{t('requirements')}</p>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${lengthOk ? 'bg-success' : 'bg-border'}`}>
              {lengthOk && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className={`text-sm ${lengthOk ? 'text-foreground' : 'text-muted-foreground'}`}>{t('req_length')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${matchOk ? 'bg-success' : 'bg-border'}`}>
              {matchOk && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className={`text-sm ${matchOk ? 'text-foreground' : 'text-muted-foreground'}`}>{t('req_match')}</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving || !lengthOk || !matchOk}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all">
            {saving ? t('updating') : t('update')}
          </button>
        </div>
      </form>
    </div>
  );
}
