const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_URL}/api`;
  }

  private async getToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    const { createClient } = await import('./supabase/client');
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken();

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    // Check if response is file download
    const contentType = res.headers.get('content-type');
    if (contentType?.includes('spreadsheet') || contentType?.includes('octet-stream')) {
      return res.blob() as unknown as T;
    }

    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Admin - Producers
  async getProducers(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/producers?${query}`);
  }

  async approveProducer(id: string) {
    return this.request<any>(`/admin/producers/${id}/approve`, { method: 'POST' });
  }

  async rejectProducer(id: string, reason?: string) {
    return this.request<any>(`/admin/producers/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async suspendProducer(id: string) {
    return this.request<any>(`/admin/producers/${id}/suspend`, { method: 'POST' });
  }

  async reactivateProducer(id: string) {
    return this.request<any>(`/admin/producers/${id}/reactivate`, { method: 'POST' });
  }

  async updateCommissionRate(id: string, commission_rate: number) {
    return this.request<any>(`/admin/producers/${id}/commission-rate`, {
      method: 'PATCH',
      body: JSON.stringify({ commission_rate }),
    });
  }

  async updateProducer(id: string, data: Record<string, any>) {
    return this.request<any>(`/admin/producers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deactivateProducer(id: string, reason?: string) {
    return this.request<any>(`/admin/producers/${id}/deactivate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Admin - Quotes
  async getQuotes(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/quotes?${query}`);
  }

  async getQuoteDetail(id: string) {
    return this.request<any>(`/quotes/${id}`);
  }

  async getQuoteAIResults(id: string) {
    return this.request<any>(`/quotes/${id}/ai-results`);
  }

  async approveQuote(id: string, notes?: string) {
    return this.request<any>(`/admin/quotes/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async rejectQuote(id: string, reason: string) {
    return this.request<any>(`/admin/quotes/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async requestQuoteFix(id: string, instructions: string) {
    return this.request<any>(`/admin/quotes/${id}/request-fix`, {
      method: 'POST',
      body: JSON.stringify({ instructions }),
    });
  }

  async updateQuoteStatus(id: string, status: string, notes?: string) {
    return this.request<any>(`/admin/quotes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Admin - Commissions
  async getCommissions(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/admin/commissions?${query}`);
  }

  async markCommissionPaid(id: string) {
    return this.request<any>(`/admin/commissions/${id}/mark-paid`, { method: 'POST' });
  }

  // Admin - Reports
  async getDashboardData() {
    return this.request<any>('/admin/reports/dashboard');
  }

  async exportReport(type: string, params: Record<string, string> = {}) {
    const query = new URLSearchParams({ type, ...params }).toString();
    const token = await this.getToken();

    const res = await fetch(`${this.baseUrl}/admin/reports/export?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Export failed');

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const api = new ApiClient();
