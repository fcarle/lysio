'use client';

import { StorageBucketTest } from '../client/projects/components/storage-test';

export default function StorageTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Supabase Storage Test</h1>
      <p className="mb-6 text-gray-600">
        Use this page to test your Supabase storage configuration. This will help diagnose issues with
        bucket access, permissions, and file uploads.
      </p>
      
      <StorageBucketTest />
    </div>
  );
} 