import Link from 'next/link'
import { 
  ArrowRight, Users, Calendar, Shield, Sparkles, CheckCircle, Clock, 
  BarChart, MessageSquare, Settings, Target, Layers, PenTool, 
  LineChart, UserPlus, Briefcase, Plus, Minus
} from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-light mb-8">
              <Sparkles className="w-5 h-5 text-primary mr-2" />
              <span className="text-primary font-medium">Marketing Project Management</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-medium mb-6 leading-tight">
              Manage Your Marketing <span className="text-primary">Projects</span> with Ease
            </h1>
            <p className="text-xl text-gray-600 mb-10 font-serif max-w-2xl mx-auto">
              The all-in-one platform for marketing teams to organize projects, collaborate effectively, and deliver results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl text-white bg-primary hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-medium mb-4">Project Management</h3>
              <p className="text-gray-600 font-serif">Create and track marketing projects with ease. Keep everything organized and on schedule.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-medium mb-4">Team Collaboration</h3>
              <p className="text-gray-600 font-serif">Work together seamlessly. Assign tasks, share updates, and stay aligned with your team.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-6">
                <BarChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-medium mb-4">Performance Tracking</h3>
              <p className="text-gray-600 font-serif">Monitor progress and measure success with real-time analytics and insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-medium mb-4">Trusted by Marketing Teams</h2>
            <p className="text-xl text-gray-600 font-serif">Join thousands of marketing professionals who trust Lysio</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-medium text-primary mb-2">100+</div>
              <p className="text-gray-600 font-serif">Marketing Services</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-medium text-primary mb-2">50k+</div>
              <p className="text-gray-600 font-serif">Projects Managed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-medium text-primary mb-2">98%</div>
              <p className="text-gray-600 font-serif">Team Efficiency</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-medium text-primary mb-2">30%</div>
              <p className="text-gray-600 font-serif">Time Saved</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-medium mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 font-serif">Common questions from marketing leaders</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-200">
              <h3 className="text-xl font-medium mb-3 flex items-start">
                <span className="text-primary mr-3">Q:</span>
                Why should we use Lysio when our marketing manager already handles project management?
              </h3>
              <p className="text-gray-600 font-serif pl-8">
                Lysio doesn't replace your marketing manager—it empowers them. Our platform automates routine tasks, provides clear visibility into project status, and helps managers focus on strategy rather than administrative work. Marketing managers using Lysio report spending 30% less time on coordination and 40% more time on strategic initiatives.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-200">
              <h3 className="text-xl font-medium mb-3 flex items-start">
                <span className="text-primary mr-3">Q:</span>
                How is this different from other project management tools we've tried?
              </h3>
              <p className="text-gray-600 font-serif pl-8">
                Unlike generic project management tools, Lysio is built specifically for marketing teams. We understand marketing workflows, terminology, and KPIs. Our platform includes marketing-specific templates, automated task generation based on campaign types, and integrations with marketing tools you already use. This specialized approach means faster adoption and better results for marketing teams.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-200">
              <h3 className="text-xl font-medium mb-3 flex items-start">
                <span className="text-primary mr-3">Q:</span>
                What about the learning curve for our team?
              </h3>
              <p className="text-gray-600 font-serif pl-8">
                Lysio is designed with simplicity in mind. Most teams are fully operational within a week. We provide onboarding support, video tutorials, and a knowledge base. Plus, our intuitive interface means minimal training is required. Many of our clients report that their teams were comfortable using the platform within just a few days.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-200">
              <h3 className="text-xl font-medium mb-3 flex items-start">
                <span className="text-primary mr-3">Q:</span>
                Can we integrate Lysio with our existing marketing tools?
              </h3>
              <p className="text-gray-600 font-serif pl-8">
                Lysio is designed to work alongside your existing marketing tools. While we don't currently offer direct integrations with third-party platforms, our flexible project management approach allows you to reference and track work from other tools within Lysio. We're continuously developing our platform and plan to add more integration capabilities in future updates.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-200">
              <h3 className="text-xl font-medium mb-3 flex items-start">
                <span className="text-primary mr-3">Q:</span>
                How does Lysio help with resource allocation and budgeting?
              </h3>
              <p className="text-gray-600 font-serif pl-8">
                Lysio provides comprehensive resource management features. You can allocate team members based on skills and availability, track time spent on projects, and monitor budget utilization in real-time. Our forecasting tools help you anticipate resource needs and avoid bottlenecks. Many of our clients have reduced project overruns by 25% using these features.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-200">
              <h3 className="text-xl font-medium mb-3 flex items-start">
                <span className="text-primary mr-3">Q:</span>
                What kind of ROI can we expect from implementing Lysio?
              </h3>
              <p className="text-gray-600 font-serif pl-8">
                Lysio helps marketing teams work more efficiently by reducing time spent on coordination and administrative tasks. The exact ROI depends on your team size, current processes, and how you use the platform. We focus on delivering value through improved project visibility, better team alignment, and streamlined workflows. Many of our clients report significant time savings and improved project completion rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-medium mb-6 text-white">Ready to Transform Your Marketing Workflow?</h2>
          <p className="text-xl mb-8 font-serif text-white">Join thousands of marketing teams who trust Lysio to manage their projects.</p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl text-primary bg-white hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  )
} 