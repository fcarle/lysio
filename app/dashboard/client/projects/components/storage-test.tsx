'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

export function StorageBucketTest() {
  const [result, setResult] = useState<string>('');
  const [bucketName, setBucketName] = useState<string>('project-assets');
  const [loading, setLoading] = useState<boolean>(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<string>('');
  
  const supabase = createClientComponentClient();
  
  async function testListBuckets() {
    setLoading(true);
    setResult('');
    try {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        setResult(`Error: ${error.message}`);
        return;
      }
      
      setResult(JSON.stringify(data, null, 2));
      toast.success('Successfully listed buckets');
    } catch (error) {
      setResult(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
      toast.error('Error testing buckets');
    } finally {
      setLoading(false);
    }
  }
  
  async function testListFiles() {
    setLoading(true);
    setResult('');
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list();
      
      if (error) {
        setResult(`Error: ${error.message}`);
        return;
      }
      
      setResult(JSON.stringify(data, null, 2));
      toast.success(`Successfully listed files in ${bucketName}`);
    } catch (error) {
      setResult(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
      toast.error('Error listing files');
    } finally {
      setLoading(false);
    }
  }
  
  async function testUploadFile() {
    if (!fileToUpload) {
      toast.error('Please select a file first');
      return;
    }
    
    setLoading(true);
    setUploadResult('');
    try {
      const fileName = `test-${Date.now()}.${fileToUpload.name.split('.').pop()}`;
      
      // Test upload
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        setUploadResult(`Upload error: ${uploadError.message}`);
        return;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      setUploadResult(`File uploaded successfully! 
      
Path: ${fileName}
Public URL: ${publicUrl}

Testing URL access now...`);
      
      // Test if we can access the URL
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        setUploadResult(prev => `${prev}
        
URL status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          toast.success('File uploaded and URL is accessible!');
        } else {
          toast.error(`URL returned status ${response.status}`);
        }
      } catch (fetchError) {
        setUploadResult(prev => `${prev}
        
URL test error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
        toast.error('Error testing URL accessibility');
      }

      // Now test with signed URL
      try {
        const { data: signedData, error: signedError } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(fileName, 60 * 60); // 1 hour expiry
        
        if (signedError) {
          setUploadResult(prev => `${prev}
          
Signed URL error: ${signedError.message}`);
          return;
        }
        
        setUploadResult(prev => `${prev}
        
Signed URL: ${signedData.signedUrl}

Testing signed URL access now...`);
        
        // Test if we can access the signed URL
        const signedResponse = await fetch(signedData.signedUrl, { method: 'HEAD' });
        setUploadResult(prev => `${prev}
        
Signed URL status: ${signedResponse.status} ${signedResponse.statusText}`);
        
        if (signedResponse.ok) {
          toast.success('File uploaded and signed URL is accessible!');
        } else {
          toast.error(`Signed URL returned status ${signedResponse.status}`);
        }
      } catch (signedFetchError) {
        setUploadResult(prev => `${prev}
        
Signed URL test error: ${signedFetchError instanceof Error ? signedFetchError.message : String(signedFetchError)}`);
        toast.error('Error testing signed URL accessibility');
      }
    } catch (error) {
      setUploadResult(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
      toast.error('Error uploading file');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Storage Bucket Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input 
            placeholder="Bucket name" 
            value={bucketName} 
            onChange={(e) => setBucketName(e.target.value)} 
          />
          <Button 
            onClick={testListBuckets} 
            disabled={loading}
            variant="outline"
          >
            List Buckets
          </Button>
          <Button 
            onClick={testListFiles} 
            disabled={loading}
          >
            List Files
          </Button>
        </div>
        
        {result && (
          <Textarea 
            value={result} 
            readOnly 
            className="h-40 font-mono text-sm" 
          />
        )}
        
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Test File Upload</p>
          <div className="flex items-center space-x-2">
            <Input 
              type="file" 
              onChange={(e) => setFileToUpload(e.target.files?.[0] || null)} 
            />
            <Button 
              onClick={testUploadFile} 
              disabled={loading || !fileToUpload}
            >
              Upload Test File
            </Button>
          </div>
        </div>
        
        {uploadResult && (
          <Textarea 
            value={uploadResult} 
            readOnly 
            className="h-40 font-mono text-sm" 
          />
        )}
      </CardContent>
    </Card>
  );
} 