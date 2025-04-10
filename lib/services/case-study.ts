import { createClient } from '@/lib/supabase/client'
import { CaseStudy, CreateCaseStudyInput } from '@/types/case-study'

const supabase = createClient()

export async function getCaseStudies(): Promise<CaseStudy[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('provider_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createCaseStudy(input: CreateCaseStudyInput): Promise<CaseStudy> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let logoUrl: string | undefined

  // Upload logo if provided
  if (input.logo) {
    const fileExt = input.logo.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('case_study_logos')
      .upload(filePath, input.logo)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('case_study_logos')
      .getPublicUrl(filePath)

    logoUrl = publicUrl
  }

  // Create case study
  const { data, error } = await supabase
    .from('case_studies')
    .insert({
      provider_id: user.id,
      client_name: input.client_name,
      service: input.service,
      overview: input.overview,
      client_industry: input.client_industry,
      client_size: input.client_size,
      client_description: input.client_description,
      results: input.results,
      city: input.city,
      country: input.country,
      business_type: input.business_type,
      target_industry: input.target_industry,
      target_company_size: input.target_company_size,
      target_audience: input.target_audience,
      target_location: input.target_location,
      logo_url: logoUrl,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCaseStudy(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('case_studies')
    .delete()
    .eq('id', id)
    .eq('provider_id', user.id)

  if (error) throw error
}

export async function updateCaseStudy(id: string, input: Partial<CreateCaseStudyInput>): Promise<CaseStudy> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let logoUrl: string | undefined

  // Upload new logo if provided
  if (input.logo) {
    const fileExt = input.logo.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('case_study_logos')
      .upload(filePath, input.logo)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('case_study_logos')
      .getPublicUrl(filePath)

    logoUrl = publicUrl
  }

  // Update case study
  const { data, error } = await supabase
    .from('case_studies')
    .update({
      ...input,
      ...(logoUrl && { logo_url: logoUrl }),
    })
    .eq('id', id)
    .eq('provider_id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
} 