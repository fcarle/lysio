'use client'

import { CheckCircle, Users } from 'lucide-react'
import { useState } from 'react'
import { BookDemoDialog } from '../components/BookDemoDialog'

const sharedFeatures = [
  'Lysio Intelligence - AI-powered insights',
  'Project & task management',
  'Team collaboration tools',
  'Client management',
  'Resource planning',
  'Time tracking',
  'Project templates',
  'Real-time analytics & reporting',
  'Customizable workflows',
  'Unlimited projects'
]

const plans = [
  {
    name: 'Small Team',
    subtitle: 'Up to 5 users',
    description: 'Perfect for small marketing teams and agencies',
    teamSize: '1-5 team members',
    cta: 'Book a Demo',
    highlighted: false
  },
  {
    name: 'Growing Team',
    subtitle: 'Up to 15 users',
    description: 'Ideal for mid-sized marketing teams',
    teamSize: '5-15 team members',
    cta: 'Book a Demo',
    highlighted: true
  },
  {
    name: 'Enterprise',
    subtitle: 'Unlimited users',
    description: 'For large organizations and agencies',
    teamSize: 'Unlimited team members',
    cta: 'Book a Demo',
    highlighted: false
  }
]

export default function PlansPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-medium mb-4">
            Simple Team-Based Plans
          </h1>
          <p className="text-xl text-gray-600">
            All features included. Just choose the size that fits your team.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl ${
                plan.highlighted
                  ? 'shadow-xl ring-4 ring-primary/20'
                  : 'shadow-lg'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-5 inset-x-0 flex justify-center">
                  <span className="bg-primary text-white px-6 py-2 rounded-full text-sm font-medium shadow-md">
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`h-full p-8 rounded-2xl ${
                plan.highlighted
                  ? 'bg-white'
                  : 'bg-white'
              }`}>
                <div className="text-center">
                  <h3 className="text-2xl font-medium mb-2">{plan.name}</h3>
                  <p className="text-lg text-primary font-medium mb-2">{plan.subtitle}</p>
                  <p className="text-gray-600 mb-8">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">{plan.teamSize}</p>
                </div>

                <div className="mb-8">
                  <p className="text-sm font-medium text-gray-900 mb-4">All Features Included:</p>
                  <ul className="space-y-4">
                    {sharedFeatures.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-center mt-auto">
                  <button
                    onClick={() => setIsDialogOpen(true)}
                    className={`inline-flex justify-center w-full px-6 py-3 text-lg font-medium rounded-xl transition-all duration-200 ${
                      plan.highlighted
                        ? 'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg'
                        : 'bg-white text-primary border-2 border-primary hover:bg-primary/5'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-medium text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-medium mb-2">What's included in every plan?</h3>
              <p className="text-gray-600">
                All plans include full access to every feature. The only difference is the number of team members you can add to your account.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">
                Yes, you can easily upgrade or downgrade your plan as your team grows or changes. Your features will remain the same.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">How do I get started?</h3>
              <p className="text-gray-600">
                Book a demo with our team and we'll help you set up your account with the right team size. We'll also give you a full platform tour.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BookDemoDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </main>
  )
} 