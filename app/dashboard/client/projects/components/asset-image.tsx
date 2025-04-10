'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AssetImageProps {
  url: string;
  alt: string;
  projectId: string;
  className?: string;
}

export function AssetImage({ url, alt, projectId, className = '' }: AssetImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryWithNewUrl, setRetryWithNewUrl] = useState(false);
  const supabase = createClientComponentClient();
  const isMounted = useRef(true);

  useEffect(() => {
    // Setup the cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Function to generate a new signed URL
  async function regenerateSignedUrl(path: string) {
    try {
      // Extract path from the URL to create a new signed URL
      const { data, error } = await supabase.storage
        .from('project-assets')
        .createSignedUrl(path, 60 * 60); // 1 hour expiry
      
      if (error) {
        console.error('Error generating signed URL:', error);
        return null;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('Failed to regenerate signed URL:', error);
      return null;
    }
  }

  // Function to extract file path from URL
  function extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      
      // Check if it's an authenticated URL
      if (urlObj.pathname.includes('/object/authenticated/')) {
        const pathMatch = urlObj.pathname.match(/\/object\/authenticated\/([^?]+)/);
        if (pathMatch && pathMatch[1]) {
          return decodeURIComponent(pathMatch[1]);
        }
      }
      
      // Check if it's a public URL
      if (urlObj.pathname.includes('/object/public/')) {
        const pathMatch = urlObj.pathname.match(/\/object\/public\/([^?]+)/);
        if (pathMatch && pathMatch[1]) {
          return decodeURIComponent(pathMatch[1]);
        }
      }
      
      return null;
    } catch (e) {
      console.error('Error extracting path from URL:', e);
      return null;
    }
  }

  useEffect(() => {
    // Process the URL when component mounts or URL changes
    if (!url) {
      setError(true);
      setLoading(false);
      return;
    }

    // Reset states when URL changes
    setLoading(true);
    setError(false);
    setRetryWithNewUrl(false);

    const loadImage = async () => {
      const fixedUrl = getProperImageUrl(url, projectId);
      setImageUrl(fixedUrl);
  
      // Preload the image to check if it works
      const img = new Image();
      
      img.onload = () => {
        if (isMounted.current) {
          setLoading(false);
          setError(false);
        }
      };
      
      img.onerror = async () => {
        // If image failed to load and we haven't tried regenerating the URL yet
        if (isMounted.current && !retryWithNewUrl) {
          console.error('Failed to load image:', fixedUrl);
          
          // Try to extract the path and generate a new signed URL
          const path = extractPathFromUrl(fixedUrl);
          
          if (path) {
            // Try to regenerate a new signed URL
            const newSignedUrl = await regenerateSignedUrl(path);
            
            if (newSignedUrl) {
              console.log('Generated new signed URL for image');
              setImageUrl(newSignedUrl);
              setRetryWithNewUrl(true);
              
              // Try loading with the new URL
              const newImg = new Image();
              newImg.onload = () => {
                if (isMounted.current) {
                  setLoading(false);
                  setError(false);
                }
              };
              
              newImg.onerror = () => {
                if (isMounted.current) {
                  console.error('Failed to load image with new signed URL:', newSignedUrl);
                  setError(true);
                  setLoading(false);
                }
              };
              
              newImg.src = newSignedUrl;
              
              return;
            }
          }
          
          // If we couldn't regenerate a URL, show error
          setError(true);
          setLoading(false);
        } else if (isMounted.current) {
          // We've already tried regenerating the URL, show error
          setError(true);
          setLoading(false);
        }
      };
      
      img.src = fixedUrl;
    };
    
    loadImage();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted.current = false;
    };
  }, [url, projectId, retryWithNewUrl]);

  // Function to correct image URLs
  function getProperImageUrl(url: string, projectId: string): string {
    if (!url) return '';
    
    // Ensure URL has https:// prefix
    let fullUrl = url;
    if (!fullUrl.startsWith('http')) {
      fullUrl = `https://${url}`;
    }
    
    try {
      // Parse the URL to check its structure
      const urlObj = new URL(fullUrl);
      
      // Check if this is a signed URL (will contain /object/authenticated/)
      if (urlObj.pathname.includes('/object/authenticated/')) {
        // This is already a signed URL, use it as is
        return fullUrl;
      }
      
      // Check if it's a public URL (legacy case)
      if (urlObj.pathname.includes('/storage/v1/object/public/')) {
        // If the URL is public, we'll continue using it for now
        return fullUrl;
      }
      
      // If the URL is neither signed nor properly formatted as public,
      // attempt to reconstruct it as a public URL for backward compatibility
      
      // Extract the project-assets part if it exists
      let projectAssetsSection = '';
      if (urlObj.pathname.includes('project-assets')) {
        projectAssetsSection = urlObj.pathname.substring(urlObj.pathname.indexOf('project-assets'));
      } else {
        // Otherwise, assume standard path with projectId/filename
        const filename = url.split('/').pop() || '';
        projectAssetsSection = `project-assets/${projectId}/${filename}`;
      }
      
      // Build the proper Supabase storage URL - try signed URL path format
      fullUrl = `https://${urlObj.hostname}/storage/v1/object/authenticated/${projectAssetsSection}`;
      
      return fullUrl;
    } catch (e) {
      console.error('Error parsing URL:', url, e);
      return fullUrl;
    }
  }

  if (loading) {
    return <Skeleton className={`w-full h-full ${className}`} />;
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 ${className}`}>
        <svg 
          width="32" 
          height="32" 
          xmlns="http://www.w3.org/2000/svg" 
          fillRule="evenodd" 
          clipRule="evenodd"
          className="text-gray-400 mb-2"
        >
          <path d="M24 24h-24v-24h24v24zm-1-23h-22v22h22v-22zm-1 5h-20v13h4v-1h-3v-11h18v11h-3v1h4v-13zm-12 1c1.105 0 2 .895 2 2s-.895 2-2 2-2-.895-2-2 .895-2 2-2zm-1.446 3.207c.331.162.71.293 1.446.293.735 0 1.115-.131 1.447-.293.491-.24.789-.414 1.447-.412.654.001.949.171 1.445.413v6h-10v-6c.497-.242.79-.413 1.447-.413.655-.001 1.054.173 1.446.412z" />
        </svg>
        <p className="text-xs text-gray-500">Image unavailable</p>
        <p className="text-xs text-gray-400 mt-1">Click to try opening directly</p>
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      className={`w-full h-full object-cover ${className}`}
    />
  );
} 