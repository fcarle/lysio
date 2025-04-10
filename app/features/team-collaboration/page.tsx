'use client'

import { Users, Network, UserPlus, Target, Building2, MapPin, Sparkles, CheckCircle } from 'lucide-react'
import Image from 'next/image'

export default function TeamCollaborationPage() {
  return (
    <main className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-medium mb-4">
            Team Collaboration
          </h1>
          <p className="text-xl text-gray-600">
            Foster seamless communication and collaboration within your team with real-time updates and shared workspaces.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Network className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Team Network Visualization</h3>
                <p className="text-gray-600">
                  View your team's structure, responsibilities, and workload distribution in an interactive network diagram.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Easy Team Management</h3>
                <p className="text-gray-600">
                  Invite team members, assign roles, and manage permissions with a simple interface.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Responsibility Assignment</h3>
                <p className="text-gray-600">
                  Assign and track team member responsibilities and service areas for better resource allocation.
                </p>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-lg">
            <Image
              src="/features/team-collaboration.gif"
              alt="Team Collaboration in action"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-24">
          <h2 className="text-3xl font-medium text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-medium mb-4">Team Management</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Role-based access control</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Team member invitations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Status tracking</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Permission management</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-medium mb-4">Workload Management</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Workload visualization</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Task distribution</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Project assignments</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Capacity planning</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-medium mb-4">Network Integration</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>External talent access</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Service matching</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Expertise tracking</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Resource allocation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Network Integration */}
        <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-medium text-center mb-12">Network Integration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Industry Experience</h3>
              <p className="text-gray-600">Match with professionals based on sector expertise</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Location Matching</h3>
              <p className="text-gray-600">Find team members in compatible time zones</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Expert Matching</h3>
              <p className="text-gray-600">Connect with specialized professionals</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 