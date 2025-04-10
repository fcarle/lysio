'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'react-hot-toast'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Lysio',
    allowNewRegistrations: true,
    requireEmailVerification: true,
    maxCaseStudiesPerProvider: 5,
    maxClientsPerProvider: 10,
    maintenanceMode: false
  })

  const handleSave = async () => {
    try {
      // Here you would typically save these settings to your database
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow New Registrations</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable new user registrations
                </p>
              </div>
              <Switch
                checked={settings.allowNewRegistrations}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, allowNewRegistrations: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Require users to verify their email address
                </p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, requireEmailVerification: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Limits and Restrictions */}
        <Card>
          <CardHeader>
            <CardTitle>Limits and Restrictions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxCaseStudies">Maximum Case Studies per Provider</Label>
              <Input
                id="maxCaseStudies"
                type="number"
                value={settings.maxCaseStudiesPerProvider}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxCaseStudiesPerProvider: parseInt(e.target.value)
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxClients">Maximum Clients per Provider</Label>
              <Input
                id="maxClients"
                type="number"
                value={settings.maxClientsPerProvider}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxClientsPerProvider: parseInt(e.target.value)
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Put the site in maintenance mode (only admins can access)
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, maintenanceMode: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  )
} 