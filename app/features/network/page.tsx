'use client'

import { Users, Network, Building2, MapPin, DollarSign, Shield, Target, Globe, Sparkles } from 'lucide-react'
import Image from 'next/image'

export default function LysioNetworkPage() {
  return (
    <main className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Network className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-medium mb-4">
            Lysio Network
          </h1>
          <p className="text-xl text-gray-600">
            Access a network of 10,000+ pre-vetted agencies and freelancers. Find the perfect match for your projects based on industry experience, location, and budget compatibility.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Industry Experience</h3>
                <p className="text-gray-600">
                  Match with professionals who have proven experience in your specific industry and sector.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Location Matching</h3>
                <p className="text-gray-600">
                  Find team members in compatible time zones and regions for seamless collaboration.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Budget Compatibility</h3>
                <p className="text-gray-600">
                  Connect with professionals whose pricing aligns with your project budget and requirements.
                </p>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-lg">
            <Image
              src="/features/lysio-network.gif"
              alt="Lysio Network in action"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Pre-Vetted Partners</h3>
            <p className="text-gray-600">
              All professionals in our network undergo a thorough verification process.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Quality Guaranteed</h3>
            <p className="text-gray-600">
              We ensure all matches meet our high standards for expertise and reliability.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Global Network</h3>
            <p className="text-gray-600">
              Access talent from around the world with diverse expertise and perspectives.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-24">
          <h2 className="text-3xl font-medium text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-medium text-primary">1</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Define Your Needs</h3>
              <p className="text-gray-600">
                Specify your project requirements, budget, and timeline.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-medium text-primary">2</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                Our system finds the best matches based on your criteria.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-medium text-primary">3</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Review Profiles</h3>
              <p className="text-gray-600">
                Browse detailed profiles of matched professionals.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-medium text-primary">4</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Connect & Collaborate</h3>
              <p className="text-gray-600">
                Start working with your chosen professionals.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 md:p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-medium mb-4">Ready to Find Your Perfect Match?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join our network and connect with top professionals for your next project.
            </p>
            <a
              href="/plans"
              className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </main>
  )
} 