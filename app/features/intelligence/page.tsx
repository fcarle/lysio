'use client'

import { Brain, MessageSquare, Sparkles, Zap, Bot } from 'lucide-react'
import Image from 'next/image'

export default function LysioIntelligencePage() {
  return (
    <main className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Brain className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-medium mb-4">
            Meet Your AI Marketing Assistant
          </h1>
          <p className="text-xl text-gray-600">
            Lysio Intelligence is your intelligent assistant that helps manage and optimize your marketing projects through natural conversation.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Natural Conversation</h3>
                <p className="text-gray-600">
                  Chat naturally with Lysio Intelligence about your projects, tasks, and team management needs. No complex commands or syntax required.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Smart Project Creation</h3>
                <p className="text-gray-600">
                  Automatically generate well-structured projects with tasks, deadlines, and priorities based on your requirements and industry best practices.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Contextual Awareness</h3>
                <p className="text-gray-600">
                  Understands your team structure, ongoing projects, and company settings to provide personalized recommendations and insights.
                </p>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-lg">
            <Image
              src="/features/lysio-intelligence.gif"
              alt="Lysio Intelligence in action"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-24">
          <h2 className="text-3xl font-medium text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-medium text-primary">1</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Describe Your Needs</h3>
              <p className="text-gray-600">
                Simply tell Lysio Intelligence what you want to achieve with your marketing project.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-medium text-primary">2</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Review Suggestions</h3>
              <p className="text-gray-600">
                Get AI-generated project structures with tasks, timelines, and resource recommendations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-medium text-primary">3</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Implement & Optimize</h3>
              <p className="text-gray-600">
                Review, customize, and implement the suggestions with one click.
              </p>
            </div>
          </div>
        </div>

        {/* Key Capabilities */}
        <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-medium text-center mb-12">Key Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-medium mb-4">Project Planning</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Bot className="w-5 h-5 text-primary" />
                  <span>Creates detailed project structures</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Bot className="w-5 h-5 text-primary" />
                  <span>Suggests realistic timelines and deadlines</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Bot className="w-5 h-5 text-primary" />
                  <span>Prioritizes tasks based on project goals</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-medium mb-4">Team Assistance</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Bot className="w-5 h-5 text-primary" />
                  <span>Recommends task assignments</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Bot className="w-5 h-5 text-primary" />
                  <span>Helps find qualified professionals in the Lysio Network</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Bot className="w-5 h-5 text-primary" />
                  <span>Provides project-specific insights</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 