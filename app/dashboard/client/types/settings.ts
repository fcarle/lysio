export interface CompanySettings {
  id?: string;
  user_id?: string;
  name: string;
  email?: string;
  industry?: string | null;
  about?: string | null;
  location?: string | null;
  targeting?: string | null;
  budget?: number | null;
  currency?: string;
  budget_frequency?: 'monthly' | 'quarterly' | 'yearly';
  logo?: File;
  logo_url?: string | null;
  marketing_goal?: string | null;
  created_at?: string;
  updated_at?: string;
  budget_items?: Array<{id: string, service: string, amount: number | ''}>;
}

export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Entertainment',
  'Real Estate',
  'Travel',
  'Food & Beverage',
  'Other'
];

export const MARKETING_GOALS = [
  'Increase Brand Awareness',
  'Generate Leads',
  'Drive Sales',
  'Improve Customer Retention',
  'Enter New Markets',
  'Launch New Product',
  'Other'
]; 