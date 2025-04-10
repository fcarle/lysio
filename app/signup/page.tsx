import SignUpForm from '@/components/auth/SignUpForm'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Join Lysio
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Connect with the best marketing providers or showcase your services
            </p>
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:text-primary/90">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
          <SignUpForm />
        </div>
      </div>
    </main>
  )
} 