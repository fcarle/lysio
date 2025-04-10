'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { CaseStudy, CreateCaseStudyInput, BusinessType, ClientSize, TargetCompanySize } from '@/types/case-study'
import { getCaseStudies, createCaseStudy, updateCaseStudy, deleteCaseStudy } from '@/lib/services/case-study'
import toast from 'react-hot-toast'

export default function ExperiencePage() {
  const [isB2B, setIsB2B] = useState(true)
  const [logo, setLogo] = useState<File | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | null>(null)

  useEffect(() => {
    loadCaseStudies()
  }, [])

  const loadCaseStudies = async () => {
    try {
      const data = await getCaseStudies()
      setCaseStudies(data)
    } catch (error) {
      toast.error('Failed to load case studies')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const input: CreateCaseStudyInput = {
        client_name: formData.get('clientName') as string,
        service: formData.get('service') as string,
        overview: formData.get('overview') as string,
        client_industry: formData.get('industry') as string,
        client_size: formData.get('clientSize') as ClientSize,
        client_description: formData.get('clientDescription') as string,
        results: formData.get('results') as string,
        city: formData.get('city') as string,
        country: formData.get('country') as string,
        business_type: isB2B ? 'b2b' : 'b2c',
        ...(isB2B
          ? {
              target_industry: formData.get('targetIndustry') as string,
              target_company_size: formData.get('targetSize') as TargetCompanySize,
            }
          : {
              target_audience: formData.get('targetAudience') as string,
              target_location: formData.get('targetLocation') as string,
            }),
        ...(logo && { logo }),
      }

      if (editingCaseStudy) {
        await updateCaseStudy(editingCaseStudy.id, input)
        toast.success('Case study updated successfully')
      } else {
        await createCaseStudy(input)
        toast.success('Case study created successfully')
      }
      
      setShowAddForm(false)
      setEditingCaseStudy(null)
      loadCaseStudies()
    } catch (error) {
      toast.error(editingCaseStudy ? 'Failed to update case study' : 'Failed to create case study')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case study?')) return

    try {
      await deleteCaseStudy(id)
      toast.success('Case study deleted successfully')
      loadCaseStudies()
    } catch (error) {
      toast.error('Failed to delete case study')
      console.error(error)
    }
  }

  const handleEdit = (caseStudy: CaseStudy) => {
    setEditingCaseStudy(caseStudy)
    setIsB2B(caseStudy.business_type === 'b2b')
    setShowAddForm(true)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0])
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      {!showAddForm ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Case Studies</h1>
            <Button onClick={() => {
              setEditingCaseStudy(null)
              setShowAddForm(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Case Study
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseStudies.map((study) => (
              <Card key={study.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {study.logo_url ? (
                        <img
                          src={study.logo_url}
                          alt={`${study.client_name} logo`}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 text-lg">
                            {study.client_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{study.client_name}</CardTitle>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(study)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(study.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Service:</span> {study.service}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Industry:</span> {study.client_industry}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Location:</span> {study.city}, {study.country}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{editingCaseStudy ? 'Edit Case Study' : 'Add New Case Study'}</CardTitle>
              <Button variant="outline" onClick={() => {
                setShowAddForm(false)
                setEditingCaseStudy(null)
              }}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input 
                      id="clientName" 
                      name="clientName" 
                      required 
                      defaultValue={editingCaseStudy?.client_name}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service">Service Provided</Label>
                    <Input 
                      id="service" 
                      name="service" 
                      required 
                      defaultValue={editingCaseStudy?.service}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overview">Overview</Label>
                  <Textarea 
                    id="overview" 
                    name="overview" 
                    required 
                    defaultValue={editingCaseStudy?.overview}
                  />
                </div>
              </div>

              {/* Client Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Client Industry</Label>
                    <Input 
                      id="industry" 
                      name="industry" 
                      required 
                      defaultValue={editingCaseStudy?.client_industry}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientSize">Client Size</Label>
                    <Select 
                      name="clientSize" 
                      required 
                      defaultValue={editingCaseStudy?.client_size}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="501-1000">501-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientDescription">Client Description</Label>
                  <Textarea 
                    id="clientDescription" 
                    name="clientDescription" 
                    required 
                    defaultValue={editingCaseStudy?.client_description}
                  />
                </div>
              </div>

              {/* Results */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Results</h3>
                <div className="space-y-2">
                  <Label htmlFor="results">Results Achieved</Label>
                  <Textarea 
                    id="results" 
                    name="results" 
                    required 
                    defaultValue={editingCaseStudy?.results}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      required 
                      defaultValue={editingCaseStudy?.city}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input 
                      id="country" 
                      name="country" 
                      required 
                      defaultValue={editingCaseStudy?.country}
                    />
                  </div>
                </div>
              </div>

              {/* Targeting */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Targeting</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isB2B}
                    onCheckedChange={setIsB2B}
                    id="business-type"
                  />
                  <Label htmlFor="business-type">
                    {isB2B ? 'B2B' : 'B2C/D2C'}
                  </Label>
                </div>
                
                {isB2B ? (
                  <div className="space-y-2">
                    <Label htmlFor="targetIndustry">Target Industry</Label>
                    <Input 
                      id="targetIndustry" 
                      name="targetIndustry" 
                      required 
                      defaultValue={editingCaseStudy?.target_industry}
                    />
                    <Label htmlFor="targetSize">Target Company Size</Label>
                    <Select 
                      name="targetSize" 
                      required 
                      defaultValue={editingCaseStudy?.target_company_size}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input 
                      id="targetAudience" 
                      name="targetAudience" 
                      required 
                      defaultValue={editingCaseStudy?.target_audience}
                    />
                    <Label htmlFor="targetLocation">Target Location</Label>
                    <Input 
                      id="targetLocation" 
                      name="targetLocation" 
                      required 
                      defaultValue={editingCaseStudy?.target_location}
                    />
                  </div>
                )}
              </div>

              {/* Logo Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Client Logo</h3>
                <div className="space-y-2">
                  <Label htmlFor="logo">Upload Logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    required={!editingCaseStudy}
                  />
                  {logo && (
                    <p className="text-sm text-gray-500">
                      Selected file: {logo.name}
                    </p>
                  )}
                  {editingCaseStudy?.logo_url && !logo && (
                    <p className="text-sm text-gray-500">
                      Current logo: {editingCaseStudy.logo_url}
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingCaseStudy ? 'Update Case Study' : 'Save Case Study'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 