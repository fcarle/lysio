'use client'

import { ArrowRight, Brain, Users, Network, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ImageModal } from '../components/ImageModal'
import { BookDemoDialog } from '../components/BookDemoDialog'

const features = [
  {
    title: "Lysio Intelligence",
    description: "Your AI marketing assistant that understands your needs through natural conversation. Ask questions, get insights, and manage your marketing projects effortlessly.",
    icon: Brain,
    imagePosition: "right",
    imagePlaceholder: "/features/lysio-intelligence.gif"
  },
  {
    title: "Project & Task Management",
    description: "Streamline your marketing projects with intuitive task management. Create, assign, and track tasks with ease while maintaining clear visibility of project progress.",
    icon: Users,
    imagePosition: "left",
    imagePlaceholder: "/features/project-management.gif"
  },
  {
    title: "Team Collaboration",
    description: "Work seamlessly with your team members through real-time updates, shared workspaces, and integrated communication tools. Keep everyone aligned and productive.",
    icon: MessageSquare,
    imagePosition: "right",
    imagePlaceholder: "/features/team-collaboration.gif"
  },
  {
    title: "Lysio Network",
    description: "Access our network of 10,000+ pre-vetted marketing agencies and freelancers. Find the perfect partner for your marketing needs, from strategy to execution.",
    icon: Network,
    imagePosition: "left",
    imagePlaceholder: "/features/lysio-network.gif"
  }
]

export default function FeaturesPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Powerful Features for Modern Marketing Teams
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Discover how Lysio helps marketing teams collaborate, manage projects, and deliver results with AI-powered assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="space-y-48">
          {features.map((feature, index) => (
            <div key={feature.title} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className={index % 2 === 0 ? '' : 'md:order-2'}>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-200"
                     onClick={() => setSelectedImage(feature.imagePlaceholder)}>
                  <Image
                    src={feature.imagePlaceholder}
                    alt={feature.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className={index % 2 === 0 ? 'md:order-2' : ''}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-medium mb-4">{feature.title}</h2>
                <p className="text-xl text-gray-600 mb-6">{feature.description}</p>
                <Link
                  href={feature.title === "Lysio Intelligence" ? "/features/intelligence" : 
                        feature.title === "Lysio Network" ? "/features/network" : "/plans"}
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                >
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-32 sm:mt-40">
          <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transform your marketing workflow?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Join thousands of marketing teams who are already using Lysio to streamline their work and deliver better results.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/plans"
                className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Get started
              </Link>
              <button
                onClick={() => setIsDialogOpen(true)}
                className="text-sm font-semibold leading-6 text-white hover:text-gray-300 transition-colors"
              >
                Contact sales <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        src={selectedImage || ''}
        alt="Feature preview"
      />
      <BookDemoDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </main>
  )
} 