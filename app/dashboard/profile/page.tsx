'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n/provider';

export default function ProfilePage() {
  const { locale } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
  });
  const [role, setRole] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, phone, role, created_at')
          .eq('id', user.id)
          .single();
        if (profile) {
          setForm({ full_name: profile.full_name || '', email: profile.email || '', phone: profile.phone || '' });
          setRole(profile.role || '');
          setCreatedAt(profile.created_at || '');
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: form.full_name, phone: form.phone })
        .eq('id', user.id);

      if (updateError) throw updateError;
      setSuccess(locale === 'es' ? 'Perfil actualizado correctamente' : 'Profile updated successfully');
    } catch (err: any) {
      setError(err.message || (locale === 'es' ? 'Error al actualizar' : 'Failed to update'));
    } finally {
      setSaving(false);
    }
  };

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      profile: { es: 'Perfil', en: 'Profile' },
      profile_subtitle: { es: 'Gestiona tu información personal', en: 'Manage your personal information' },
      full_name: { es: 'Nombre Completo', en: 'Full Name' },
      email_address: { es: 'Correo Electrónico', en: 'Email Address' },
      email_hint: { es: 'El email no se puede cambiar desde aquí', en: 'Email cannot be changed here' },
      phone: { es: 'Teléfono', en: 'Phone' },
      role: { es: 'Rol', en: 'Role' },
      member_since: { es: 'Miembro desde', en: 'Member since' },
      save: { es: 'Guardar Cambios', en: 'Save Changes' },
      saving: { es: 'Guardando...', en: 'Saving...' },
      password_security: { es: 'Contraseña y Seguridad', en: 'Password & Security' },
      password_desc: { es: 'Cambia tu contraseña para mantener tu cuenta segura', en: 'Change your password to keep your account secure' },
      manage_password: { es: 'Gestionar Contraseña', en: 'Manage Password' },
    };
    return map[key]?.[locale] || key;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('profile')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('profile_subtitle')}</p>
      </div>

      {/* Avatar + Role */}
      <div className="bg-card rounded-2xl card-shadow p-6 animate-fade-in">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-2xl font-extrabold text-white shadow-lg">
            {form.full_name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{form.full_name || '—'}</h2>
            <p className="text-sm text-muted-foreground capitalize">{role}</p>
            {createdAt && <p className="text-xs text-muted-foreground mt-0.5">{t('member_since')} {fmtDate(createdAt)}</p>}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-card rounded-2xl card-shadow p-6 space-y-5 animate-fade-in">
        {success && (
          <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-xl text-sm font-medium">{success}</div>
        )}
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
        )}

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5" style={{ letterSpacing: '0.05em' }}>{t('full_name')}</label>
          <input type="text" value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
            className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5" style={{ letterSpacing: '0.05em' }}>{t('email_address')}</label>
          <input type="email" value={form.email} disabled
            className="w-full px-3.5 py-3 rounded-xl border border-input bg-secondary text-muted-foreground text-sm cursor-not-allowed" />
          <p className="text-xs text-muted-foreground mt-1">{t('email_hint')}</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5" style={{ letterSpacing: '0.05em' }}>{t('phone')}</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
            className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="+54 11 1234-5678" />
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all">
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </form>

      {/* Password Card */}
      <div className="bg-card rounded-2xl card-shadow p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">{t('password_security')}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('password_desc')}</p>
          </div>
          <Link href="/dashboard/profile/password"
            className="px-5 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
            {t('manage_password')}
          </Link>
        </div>
      </div>
    </div>
  );
}
