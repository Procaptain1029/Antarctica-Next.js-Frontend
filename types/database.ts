// ============================================================
// Antártida Frontend - Database Type Definitions
// ============================================================

export type UserRole = 'producer' | 'admin' | 'supervisor' | 'finance';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type QuoteStatus = 'draft' | 'pending_uploads' | 'processing_ai' | 'pending_review' | 'approved' | 'rejected' | 'needs_fix';
export type AIStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PhotoType = 'plate' | 'front' | 'rear' | 'left' | 'right' | 'license_front' | 'license_back';
export type CommissionStatus = 'due' | 'paid';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  commission_rate: number;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  locale: 'es' | 'en';
  theme: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
  approved_at?: string;
}

export interface Quote {
  id: string;
  quote_number: string;
  producer_id: string;
  status: QuoteStatus;
  premium?: number;
  customer_dni?: string;
  vehicle_plate?: string;
  customer_data: Record<string, unknown>;
  vehicle_data: Record<string, unknown>;
  plan_data: Record<string, unknown>;
  gps_lat?: number;
  gps_lng?: number;
  ai_status: AIStatus;
  ai_score?: number;
  ai_flags: Array<{
    type: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
  }>;
  ai_summary?: string;
  admin_notes?: string;
  rejection_reason?: string;
  fix_instructions?: string;
  submitted_at?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  // Relations
  producer?: Profile;
  plan?: InsurancePlan;
  photos?: QuotePhoto[];
  customer?: Customer;
  vehicle?: Vehicle;
}

export interface QuotePhoto {
  id: string;
  quote_id: string;
  photo_type: PhotoType;
  storage_path: string;
  storage_url?: string;
  quality_score?: number;
  ocr_text?: string;
  validation_flags: string[];
  ai_analysis: Record<string, unknown>;
  created_at: string;
}

export interface Customer {
  id: string;
  dni: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  vehicle_type?: string;
}

export interface InsurancePlan {
  id: string;
  name: string;
  name_en?: string;
  code: string;
  description?: string;
  description_en?: string;
  base_premium: number;
  coverage_type: string;
  coverage_details: Record<string, boolean | number>;
  is_active: boolean;
}

export interface CommissionEntry {
  id: string;
  producer_id: string;
  policy_id: string;
  quote_id: string;
  amount: number;
  rate: number;
  premium: number;
  status: CommissionStatus;
  period_month?: number;
  period_year?: number;
  paid_at?: string;
  created_at: string;
  producer?: Profile;
  policy?: { policy_number: string };
  quote?: { quote_number: string; vehicle_plate: string };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  title_en?: string;
  body: string;
  body_en?: string;
  type: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface DashboardData {
  monthly: Array<{
    month: string;
    total_quotes: number;
    approved: number;
    rejected: number;
    pending: number;
    total_premium: number;
    active_producers: number;
  }>;
  producers: {
    total: number;
    pending: number;
    approved: number;
    suspended: number;
  };
  quotes: {
    total: number;
    pending_review: number;
    approved: number;
    rejected: number;
    total_premium: number;
  };
  commissions: {
    totalDue: number;
    totalPaid: number;
  };
  topProducers: Array<{
    producer_id: string;
    full_name: string;
    email: string;
    total_quotes: number;
    approved_quotes: number;
    total_premium: number;
    total_commissions: number;
  }>;
  planDistribution: Array<{ name: string; count: number }>;
}
