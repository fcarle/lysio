'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { Building2, Briefcase, Clock } from 'lucide-react'

interface ClientRelationship {
  company_id: string;
  company_name: string;
  role: string;
  status: 'pending' | 'active' | 'inactive';
  permissions: string[];
  responsibilities: string[];
  last_active: string;
}

export default function WorkPage() {
  const [clientRelationships, setClientRelationships] = useState<ClientRelationship[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchClientRelationships()
  }, [supabase])

  const fetchClientRelationships = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // Fetch all companies where this provider is a team member
      const { data: relationships, error } = await supabase
        .from('team_members')
        .select(`
          company_id,
          role,
          status,
          updated_at,
          companies (
            name
          ),
          team_member_permissions (
            permission
          ),
          team_member_responsibilities (
            responsibility
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error

      // Transform the data into our ClientRelationship format
      const formattedRelationships = relationships.map(rel => {
        // Use type assertion to safely access company name
        let companyName = 'Unknown Company';
        
        try {
          if (Array.isArray(rel.companies)) {
            companyName = rel.companies[0]?.name || 'Unknown Company';
          } else if (rel.companies && typeof rel.companies === 'object') {
            companyName = (rel.companies as any).name || 'Unknown Company';
          }
        } catch (e) {
          console.error('Error parsing company name:', e);
        }
          
        return {
          company_id: rel.company_id,
          company_name: companyName,
          role: rel.role,
          status: rel.status,
          permissions: rel.team_member_permissions.map(p => p.permission),
          responsibilities: rel.team_member_responsibilities.map(r => r.responsibility),
          last_active: rel.updated_at
        };
      });

      setClientRelationships(formattedRelationships)
    } catch (error) {
      console.error('Error fetching client relationships:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClientClick = (companyId: string) => {
    router.push(`/dashboard/client?company=${companyId}`)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Clients</h1>
        <Badge variant="outline">
          {clientRelationships.length} Clients
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientRelationships.map((client) => (
          <Card 
            key={client.company_id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleClientClick(client.company_id)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {client.company_name}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Role: {client.role}
                  </p>
                </div>
                <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                  {client.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Permissions Summary */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Permissions</h4>
                  <div className="flex flex-wrap gap-1">
                    {client.permissions.slice(0, 3).map(permission => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                    {client.permissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{client.permissions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Responsibilities Summary */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Responsibilities</h4>
                  <div className="flex flex-wrap gap-1">
                    {client.responsibilities.slice(0, 3).map(responsibility => (
                      <Badge key={responsibility} variant="outline" className="text-xs">
                        {responsibility}
                      </Badge>
                    ))}
                    {client.responsibilities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{client.responsibilities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Last Active */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Last active: {new Date(client.last_active).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 