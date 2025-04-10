export type BusinessType = 'b2b' | 'b2c' | 'd2c'

export type ClientSize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+'

export type TargetCompanySize = 'small' | 'medium' | 'large'

export interface CaseStudy {
  id: string
  provider_id: string
  client_name: string
  service: string
  overview: string
  client_industry: string
  client_size: ClientSize
  client_description: string
  results: string
  city: string
  country: string
  business_type: BusinessType
  // B2B specific fields
  target_industry?: string
  target_company_size?: TargetCompanySize
  // B2C/D2C specific fields
  target_audience?: string
  target_location?: string
  // Logo
  logo_url?: string
  // Metadata
  created_at: string
  updated_at: string
}

export interface CreateCaseStudyInput {
  client_name: string
  service: string
  overview: string
  client_industry: string
  client_size: ClientSize
  client_description: string
  results: string
  city: string
  country: string
  business_type: BusinessType
  // B2B specific fields
  target_industry?: string
  target_company_size?: TargetCompanySize
  // B2C/D2C specific fields
  target_audience?: string
  target_location?: string
  // Logo file
  logo?: File
} 