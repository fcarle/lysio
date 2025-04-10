'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useClientContext } from '@/hooks/useClientContext'
import Sidebar from './components/Sidebar';

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams()
  const { setCurrentCompanyId } = useClientContext()
  
  useEffect(() => {
    const companyId = searchParams.get('company')
    if (companyId) {
      setCurrentCompanyId(companyId)
    }
  }, [searchParams, setCurrentCompanyId])

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full">
      <div className="fixed top-16 bottom-0 left-0">
        <Sidebar />
      </div>
      <main className="flex-1 ml-64 w-[calc(100%-16rem)] overflow-y-auto bg-gray-50 p-8">
        {children}
      </main>
    </div>
  );
} 