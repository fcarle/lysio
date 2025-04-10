'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image'

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!user?.user_metadata?.role) return '/dashboard';
    return `/${user.user_metadata.role.toLowerCase()}`;
  };

  const headerContent = (
    <div className="flex justify-between h-16 items-center">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Lysio Logo"
            width={240}
            height={80}
            className="h-12 w-auto"
          />
        </Link>
      </div>
      <nav className="hidden md:flex items-center space-x-8">
        {!user ? (
          <>
            <Link 
              href="/features" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Features
            </Link>
            <Link 
              href="/plans" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Plans
            </Link>
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary/90 transition-all duration-200"
            >
              Get Started
            </Link>
          </>
        ) : (
          <>
            <Link 
              href={getDashboardLink()} 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Sign Out
            </button>
          </>
        )}
      </nav>
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary">
                Lysio
              </Link>
            </div>
          </div>
        ) : (
          headerContent
        )}
      </div>
    </header>
  );
} 