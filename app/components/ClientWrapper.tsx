'use client';

import { Suspense } from 'react';

// This component is a simple wrapper that adds Suspense boundaries
// for client components that use hooks like useSearchParams
export default function ClientWrapper({ 
  children,
  fallback = <div>Loading...</div>
}: { 
  children: React.ReactNode,
  fallback?: React.ReactNode 
}) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
} 