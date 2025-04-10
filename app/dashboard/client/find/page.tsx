'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Shield, Clock, Target, Building2, Globe, DollarSign, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { getCompanySettings } from '@/lib/supabase/client'

const INDUSTRIES = [
  'E-commerce',
  'SaaS',
  'Healthcare',
  'Education',
  'Finance',
  'Real Estate',
  'Travel',
  'Food & Beverage',
  'Fashion',
  'Technology',
  'Other'
] as const

const BUDGET_RANGES = [
  '1,000 - 5,000',
  '5,000 - 10,000',
  '10,000 - 25,000',
  '25,000 - 50,000',
  '50,000+'
] as const

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }
] as const

export default function FindPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [services, setServices] = useState('')
  const [budget, setBudget] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [companyData, setCompanyData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCompanySettings = async () => {
      try {
        const settings = await getCompanySettings()
        setCompanyData(settings)
      } catch (error) {
        console.error('Error loading company settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCompanySettings()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted')
    setIsDialogOpen(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Find Your Perfect Match
        </h1>
        <p className="text-base text-gray-600">
          Let Lysio find the right agency or freelancer for your needs. We analyze your requirements and match you with pre-vetted professionals.
        </p>
      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-4 text-center">
          <Clock className="w-6 h-6 text-lysio-blue mx-auto mb-2" />
          <h3 className="text-sm font-medium mb-1">48-Hour Guarantee</h3>
          <p className="text-xs text-gray-600">Average response time: 6 hours</p>
        </Card>
        <Card className="p-4 text-center">
          <Shield className="w-6 h-6 text-lysio-blue mx-auto mb-2" />
          <h3 className="text-sm font-medium mb-1">Privacy Protected</h3>
          <p className="text-xs text-gray-600">Your information stays private</p>
        </Card>
        <Card className="p-4 text-center">
          <Target className="w-6 h-6 text-lysio-blue mx-auto mb-2" />
          <h3 className="text-sm font-medium mb-1">Pre-Vetted Partners</h3>
          <p className="text-xs text-gray-600">Quality guaranteed matches</p>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-6">How It Works</h2>
        <div className="grid grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 rounded-lg bg-blue-50 mb-4">
              <Building2 className="w-6 h-6 text-lysio-blue" />
            </div>
            <h3 className="text-sm font-medium mb-2">Company Analysis</h3>
            <p className="text-sm text-gray-600">We analyze your company profile and goals.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="p-3 rounded-lg bg-blue-50 mb-4">
              <Users className="w-6 h-6 text-lysio-blue" />
            </div>
            <h3 className="text-sm font-medium mb-2">Team Assessment</h3>
            <p className="text-sm text-gray-600">Understanding your team structure.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="p-3 rounded-lg bg-blue-50 mb-4">
              <Globe className="w-6 h-6 text-lysio-blue" />
            </div>
            <h3 className="text-sm font-medium mb-2">Smart Matching</h3>
            <p className="text-sm text-gray-600">Finding partners with experience.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="p-3 rounded-lg bg-blue-50 mb-4">
              <DollarSign className="w-6 h-6 text-lysio-blue" />
            </div>
            <h3 className="text-sm font-medium mb-2">Budget Alignment</h3>
            <p className="text-sm text-gray-600">Ensuring matches fit your budget.</p>
          </div>
        </div>
      </Card>

      {/* CTA Section */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Sparkles className="w-10 h-10 text-lysio-blue" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Ready to Find Your Match?</h2>
              <p className="text-base text-gray-600">
                We'll analyze your needs and find the perfect partner.
              </p>
            </div>
          </div>
          <Button 
            size="lg" 
            className="bg-lysio-blue hover:bg-blue-600 text-white px-8"
            onClick={() => setIsDialogOpen(true)}
          >
            Start Matching Process
          </Button>
        </div>
      </Card>

      {/* Matching Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[1000px] flex gap-0">
          {/* Form Section */}
          <div className="flex-1 p-4">
            <DialogHeader className="mb-4">
              <DialogTitle>Tell us about your needs</DialogTitle>
              <DialogDescription>
                Share your requirements to help us find the perfect match for you.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company" className="text-sm font-medium">Company Name</Label>
                  <Input 
                    id="company" 
                    value={companyData?.name || ''} 
                    disabled 
                    className="bg-gray-50 mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">This is your registered company name</p>
                </div>
                
                <div>
                  <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                  <Input 
                    id="industry" 
                    value={companyData?.industry || ''} 
                    disabled 
                    className="bg-gray-50 mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Based on your company profile</p>
                </div>

                <div>
                  <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                  <Input 
                    id="location" 
                    value={companyData?.location || ''} 
                    disabled 
                    className="bg-gray-50 mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Based on your company profile</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Services Needed</Label>
                  <Textarea 
                    value={services}
                    onChange={(e) => setServices(e.target.value)}
                    placeholder="Describe the services you need (e.g., Google Ads management, content creation, social media management)"
                    className="h-16 mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Be as specific as possible about your requirements</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Budget</Label>
                  <div className="grid grid-cols-12 gap-2 mt-1">
                    <div className="col-span-3">
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map(curr => (
                            <SelectItem key={curr.code} value={curr.code}>
                              {curr.symbol} {curr.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-9">
                      <Input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="Enter your budget amount"
                        min="0"
                        step="100"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Shield className="w-3.5 h-3.5 text-lysio-blue flex-shrink-0" />
                    <p className="text-xs text-gray-600">This will only be used for matching and won't be shared with agencies or freelancers</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {companyData?.budget ? `Your current budget is ${CURRENCIES.find(c => c.code === companyData.currency)?.symbol}${companyData.budget} ${companyData.budget_frequency}` : 'Enter your budget amount'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">Additional Details</Label>
                  <Textarea 
                    id="description" 
                    value={companyData?.about || ''} 
                    disabled 
                    className="h-16 bg-gray-50 mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Using your company profile description</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" className="bg-lysio-blue hover:bg-blue-600 text-white px-8">
                  Submit Request
                </Button>
              </div>
            </form>
          </div>

          {/* AI Preview Section */}
          <div className="w-[280px] bg-gray-50 p-4 border-l">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-lysio-blue" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Secure Matching Process</h3>
              <p className="text-[11px] leading-relaxed text-gray-600">
                We'll notify verified agencies and freelancers who have relevant experience in your industry. This ensures controlled communication and prevents multiple unsolicited contacts.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs font-medium">Preview of Outreach</h3>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              <div className="bg-white rounded-lg p-3 text-xs text-gray-600">
                <div className="space-y-3">
                  <div className="pb-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900">Hi there,</p>
                  </div>
                  
                  <div>
                    <p>We have an exciting opportunity from a <span className="text-gray-900">{companyData?.industry?.toLowerCase()}</span> company based in <span className="text-gray-900">{companyData?.location}</span>.</p>
                    <p className="mt-1">They are looking for expertise in <span className="text-gray-900">{services || '[awaiting service details]'}</span>.</p>
                  </div>

                  <div className="bg-gray-50 rounded p-2 space-y-1.5">
                    <p className="font-medium text-gray-900 text-[11px] uppercase tracking-wide">Key requirements</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <p className="text-gray-500">Industry</p>
                        <p className="text-gray-900">{companyData?.industry?.toLowerCase() || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Location</p>
                        <p className="text-gray-900">{companyData?.location || '—'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500">Services</p>
                        <p className="text-gray-900">{services || '—'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <p>Would you be interested in learning more?</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-[10px] text-gray-600 text-center">
                  You'll be notified when we find a match within your budget and experience requirements.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 