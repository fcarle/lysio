'use client'

import { FolderKanban, GanttChart, BarChart, Users, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Image from 'next/image'

export default function ProjectManagementPage() {
  return (
    <main className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <FolderKanban className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-medium mb-4">
            Project & Task Management
          </h1>
          <p className="text-xl text-gray-600">
            A comprehensive project management system that helps you organize, track, and complete your marketing projects efficiently.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <GanttChart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Visual Project Timeline</h3>
                <p className="text-gray-600">
                  View your projects and tasks on an interactive Gantt chart. Track deadlines, dependencies, and progress at a glance.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Team Collaboration</h3>
                <p className="text-gray-600">
                  Assign tasks to team members, track their progress, and maintain clear communication within each project.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Smart Task Management</h3>
                <p className="text-gray-600">
                  Create, assign, and track tasks with priorities, deadlines, and status updates. Keep your team focused on what matters most.
                </p>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-lg">
            <Image
              src="/features/project-management.gif"
              alt="Project Management in action"
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
              <h3 className="text-xl font-medium mb-4">Project Overview</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Project status tracking</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Progress monitoring</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Budget tracking</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Team size management</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-medium mb-4">Task Management</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Priority levels</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Due date tracking</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Status updates</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Assignee management</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-medium mb-4">Visualization</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Gantt chart view</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Custom charts</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Progress indicators</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Timeline view</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Project Lifecycle */}
        <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-medium text-center mb-12">Project Lifecycle</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Pending</h3>
              <p className="text-gray-600">New tasks awaiting assignment</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">In Progress</h3>
              <p className="text-gray-600">Active tasks being worked on</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Completed</h3>
              <p className="text-gray-600">Finished tasks and milestones</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BarChart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Analytics</h3>
              <p className="text-gray-600">Track progress and performance</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 