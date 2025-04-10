'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface ProviderProfile {
  role: string
  provider_type: 'agency' | 'freelancer' | null
  website_url: string
  company_size: 'Solo' | '2-5' | '6-10' | '11-20' | '21-50' | '51-100' | '101-250' | '251-500' | '501-1000' | '1000+' | null
  years_of_experience: number | null
  logo_url: string
  profile_photo_url: string
  services: Array<{
    name: string
    description: string
    minimum_budget: number
  }> | null
  pricing_models: string[] | null
  typical_clients: string[] | null
  specialized_industries: string[] | null
  avoided_industries: string[] | null
  based_country: string
  based_city: string
  working_countries: string[] | null
  avoided_countries: string[] | null
  spoken_languages: string[] | null
  required_client_language: string
  show_logo: boolean
  allow_promotion: boolean
  interested_in_paid_promotion: boolean
  payment_terms: string
  accept_success_fee: boolean
  preferred_currency: string
}

const defaultProfile: ProviderProfile = {
  role: 'provider',
  provider_type: null,
  website_url: '',
  company_size: null,
  years_of_experience: null,
  logo_url: '',
  profile_photo_url: '',
  services: [],
  pricing_models: [],
  typical_clients: [],
  specialized_industries: [],
  avoided_industries: [],
  based_country: '',
  based_city: '',
  working_countries: [],
  avoided_countries: [],
  spoken_languages: [],
  required_client_language: '',
  show_logo: false,
  allow_promotion: false,
  interested_in_paid_promotion: false,
  payment_terms: '',
  accept_success_fee: true,
  preferred_currency: 'USD'
}

const marketingServices = {
  'Search Engine Marketing': [
    'SEO (Search Engine Optimization)',
    'Local SEO',
    'Technical SEO',
    'Content SEO',
    'Link Building',
    'Keyword Research',
    'PPC (Pay-Per-Click)',
    'Google Ads Management',
    'Bing Ads Management',
    'Display Advertising',
    'Remarketing',
    'Shopping Ads'
  ],
  'Social Media Marketing': [
    'Social Media Management',
    'Facebook Ads',
    'Instagram Ads',
    'LinkedIn Ads',
    'Twitter Ads',
    'Social Media Content Creation',
    'Social Media Strategy',
    'Community Management',
    'Influencer Marketing',
    'Social Media Analytics'
  ],
  'E-commerce Marketing': [
    'Amazon PPC',
    'Amazon SEO',
    'Amazon Store Optimization',
    'E-commerce Marketing Strategy',
    'Product Listing Optimization',
    'Marketplace Management',
    'E-commerce Analytics'
  ],
  'Lead Generation': [
    'Lead Generation Strategy',
    'Lead Nurturing',
    'Email Marketing',
    'Marketing Automation',
    'CRM Integration',
    'Lead Scoring',
    'Lead Tracking',
    'Lead Qualification'
  ],
  'Content Marketing': [
    'Content Strategy',
    'Blog Writing',
    'Copywriting',
    'Video Marketing',
    'Infographic Design',
    'Content Calendar Management',
    'Content Distribution',
    'Content Analytics'
  ],
  'Analytics & Reporting': [
    'Marketing Analytics',
    'Conversion Tracking',
    'ROI Analysis',
    'Performance Reporting',
    'Data Visualization',
    'Marketing Dashboard Creation'
  ],
  'Other Services': [
    'Marketing Strategy',
    'Brand Strategy',
    'Market Research',
    'Competitor Analysis',
    'Marketing Consulting',
    'Marketing Training',
    'Marketing Automation Setup',
    'Marketing Technology Integration'
  ]
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProviderProfile>(defaultProfile)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error) throw error

      if (data) {
        // Ensure all array fields are initialized even if null in database
        const sanitizedData = {
          ...data,
          services: data.services || [],
          pricing_models: data.pricing_models || [],
          typical_clients: data.typical_clients || [],
          specialized_industries: data.specialized_industries || [],
          avoided_industries: data.avoided_industries || [],
          working_countries: data.working_countries || [],
          avoided_countries: data.avoided_countries || [],
          spoken_languages: data.spoken_languages || []
        }
        setProfile(prev => ({
          ...prev,
          ...sanitizedData
        }))
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      // First check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      // Prepare the data for update
      const updateData = {
        user_id: user.id,
        role: 'provider',
        provider_type: profile.provider_type,
        website_url: profile.website_url,
        company_size: profile.company_size,
        years_of_experience: profile.years_of_experience,
        logo_url: profile.logo_url,
        profile_photo_url: profile.profile_photo_url,
        services: profile.services || [],
        pricing_models: profile.pricing_models || [],
        typical_clients: profile.typical_clients || [],
        specialized_industries: profile.specialized_industries || [],
        avoided_industries: profile.avoided_industries || [],
        based_country: profile.based_country,
        based_city: profile.based_city,
        working_countries: profile.working_countries || [],
        avoided_countries: profile.avoided_countries || [],
        spoken_languages: profile.spoken_languages || [],
        required_client_language: profile.required_client_language,
        show_logo: profile.show_logo,
        allow_promotion: profile.allow_promotion,
        interested_in_paid_promotion: profile.interested_in_paid_promotion,
        payment_terms: profile.payment_terms,
        accept_success_fee: profile.accept_success_fee,
        preferred_currency: profile.preferred_currency,
        updated_at: new Date().toISOString()
      }

      let error;

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', user.id)
        error = updateError
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([updateData])
        error = insertError
      }

      if (error) {
        console.error('Error updating profile:', error)
        throw new Error(error.message)
      }

      toast.success('Profile updated successfully')
      
      // Reload the profile to ensure we have the latest data
      await loadProfile()
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast.error(error.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleServiceChange = (index: number, field: string, value: string | number) => {
    const newServices = [...profile.services]
    newServices[index] = { ...newServices[index], [field]: value }
    setProfile(prev => ({ ...prev, services: newServices }))
  }

  const addService = () => {
    setProfile(prev => ({
      ...prev,
      services: [...prev.services, { name: '', description: '', minimum_budget: 0 }]
    }))
  }

  const removeService = (index: number) => {
    setProfile(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Provider Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your profile and preferences</p>
        </div>
        
        <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
          {/* Basic Info Section */}
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
              <p className="mt-1 text-sm text-gray-500">Tell us about your business or services</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Provider Type</label>
                <select
                  value={profile.provider_type || ''}
                  onChange={e => setProfile(prev => ({ ...prev, provider_type: e.target.value as 'agency' | 'freelancer' }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="">Select type</option>
                  <option value="agency">Agency</option>
                  <option value="freelancer">Freelancer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Company Size</label>
                <select
                  value={profile.company_size || ''}
                  onChange={e => setProfile(prev => ({ ...prev, company_size: e.target.value as ProviderProfile['company_size'] }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="">Select size</option>
                  <option value="Solo">Solo</option>
                  <option value="2-5">2-5 employees</option>
                  <option value="6-10">6-10 employees</option>
                  <option value="11-20">11-20 employees</option>
                  <option value="21-50">21-50 employees</option>
                  <option value="51-100">51-100 employees</option>
                  <option value="101-250">101-250 employees</option>
                  <option value="251-500">251-500 employees</option>
                  <option value="501-1000">501-1,000 employees</option>
                  <option value="1000+">1,000+ employees</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                <input
                  type="number"
                  value={profile.years_of_experience || ''}
                  onChange={e => setProfile(prev => ({ ...prev, years_of_experience: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  min="0"
                  placeholder="Enter years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Website/Portfolio URL</label>
                <input
                  type="url"
                  value={profile.website_url}
                  onChange={e => setProfile(prev => ({ ...prev, website_url: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Services</h2>
                <p className="mt-1 text-sm text-gray-500">List the services you offer</p>
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="currency" className="text-sm font-medium text-gray-700">Currency:</label>
                <select
                  id="currency"
                  value={profile.preferred_currency}
                  onChange={e => setProfile(prev => ({ ...prev, preferred_currency: e.target.value }))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {(profile.services || []).map((service, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900">Service {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Service Name</label>
                      <select
                        value={service.name}
                        onChange={e => handleServiceChange(index, 'name', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      >
                        <option value="">Select a service</option>
                        {Object.entries(marketingServices).map(([category, services]) => (
                          <optgroup key={category} label={category}>
                            {services.map(serviceName => (
                              <option key={serviceName} value={serviceName}>
                                {serviceName}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Minimum Budget</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">
                            {profile.preferred_currency === 'USD' && '$'}
                            {profile.preferred_currency === 'EUR' && '€'}
                            {profile.preferred_currency === 'GBP' && '£'}
                            {profile.preferred_currency === 'JPY' && '¥'}
                            {profile.preferred_currency === 'CAD' && 'C$'}
                            {profile.preferred_currency === 'AUD' && 'A$'}
                          </span>
                        </div>
                        <input
                          type="number"
                          value={service.minimum_budget}
                          onChange={e => handleServiceChange(index, 'minimum_budget', parseInt(e.target.value))}
                          className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                          min="0"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={service.description}
                      onChange={e => handleServiceChange(index, 'description', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      rows={3}
                      placeholder="Describe your service..."
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addService}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Service
              </button>
            </div>
          </div>

          {/* Location Section */}
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Location</h2>
              <p className="mt-1 text-sm text-gray-500">Where are you based?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Based Country</label>
                <input
                  type="text"
                  value={profile.based_country}
                  onChange={e => setProfile(prev => ({ ...prev, based_country: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  placeholder="Enter country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Based City</label>
                <input
                  type="text"
                  value={profile.based_city}
                  onChange={e => setProfile(prev => ({ ...prev, based_city: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  placeholder="Enter city"
                />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Preferences & Terms</h2>
              <p className="mt-1 text-sm text-gray-500">Set your preferences and payment terms</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
                <input
                  type="text"
                  value={profile.payment_terms}
                  onChange={e => setProfile(prev => ({ ...prev, payment_terms: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  placeholder="e.g., 50% upfront, 50% upon completion"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="showLogo"
                      checked={profile.show_logo}
                      onChange={e => setProfile(prev => ({ ...prev, show_logo: e.target.checked }))}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="showLogo" className="text-sm font-medium text-gray-700">
                      Allow logo to be shown on website
                    </label>
                    <p className="text-sm text-gray-500">Your logo will be displayed on your profile page</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="allowPromotion"
                      checked={profile.allow_promotion}
                      onChange={e => setProfile(prev => ({ ...prev, allow_promotion: e.target.checked }))}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="allowPromotion" className="text-sm font-medium text-gray-700">
                      Allow work promotion on website
                    </label>
                    <p className="text-sm text-gray-500">Your work may be featured in our marketing materials</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="acceptSuccessFee"
                      checked={profile.accept_success_fee}
                      onChange={e => setProfile(prev => ({ ...prev, accept_success_fee: e.target.checked }))}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="acceptSuccessFee" className="text-sm font-medium text-gray-700">
                      Accept success-based fee for matched clients
                    </label>
                    <p className="text-sm text-gray-500">You'll be charged a small fee for successful client matches</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-6 py-4 bg-gray-50 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 