import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, File, Image, FileText, Trash2, Download, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import { AssetImage } from './asset-image';

interface ProjectAsset {
  id: string;
  name: string;
  type: string;
  url: string;
  description?: string;
  created_at: string;
  size: number;
}

interface ProjectAssetsProps {
  projectId: string;
}

export function ProjectAssets({ projectId }: ProjectAssetsProps) {
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAssets();
  }, [projectId]);

  async function fetchAssets() {
    try {
      const { data, error } = await supabase
        .from('project_assets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  }

  async function handleFileUpload() {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${projectId}/${Math.random()}.${fileExt}`;
      
      // Define bucket name as a constant to ensure consistency
      const bucketName = 'project-assets';

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get a signed URL that will work for authenticated users
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry
      
      if (signedError) {
        console.error('Signed URL error:', signedError);
        throw signedError;
      }

      console.log('File uploaded successfully. Signed URL:', signedData.signedUrl);
      
      // Create asset record in database
      const { error: dbError } = await supabase
        .from('project_assets')
        .insert({
          project_id: projectId,
          name: selectedFile.name,
          type: selectedFile.type,
          url: signedData.signedUrl,
          description: fileDescription,
          size: selectedFile.size,
        });

      if (dbError) throw dbError;

      await fetchAssets();
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setFileDescription('');
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteAsset(asset: ProjectAsset) {
    try {
      // Set up a local ID to use for filtering
      const assetId = asset.id;
      
      // Remove from UI immediately to improve perceived performance
      setAssets(prevAssets => prevAssets.filter(a => a.id !== assetId));
      
      // Show toast first
      toast.loading(`Deleting ${asset.name}...`);
      console.log('Deleting asset:', asset);
      
      // Parse the URL to get the storage path
      let storagePath = '';
      try {
        const url = new URL(asset.url);
        const pathParts = url.pathname.split('/');
        
        // Extract storage path from URL
        if (pathParts.includes('project-assets')) {
          const projectAssetsIndex = pathParts.indexOf('project-assets');
          storagePath = pathParts.slice(projectAssetsIndex + 1).join('/');
        } else if (pathParts.length > 0) {
          storagePath = `${projectId}/${pathParts[pathParts.length - 1]}`;
        }
        
        console.log('Attempting to delete from storage, path:', storagePath);
      } catch (urlError) {
        console.error('Error parsing URL:', urlError);
        // If URL parsing fails, try a simple approach
        const fileName = asset.url.split('/').pop();
        if (fileName) {
          storagePath = `${projectId}/${fileName}`;
        }
      }
      
      // Try to delete from storage first with possible paths
      const possiblePaths = [
        storagePath,
        `${projectId}/${asset.name}`,
        asset.url.split('/').pop() || '',
        `${projectId}/${asset.url.split('/').pop() || ''}`,
      ].filter(Boolean); // Remove empty paths
      
      let storageDeleteSuccess = false;
      
      // Try each possible path for deletion
      for (const path of possiblePaths) {
        if (!path) continue;
        
        console.log('Attempting to delete from storage:', path);
        const { error: storageError } = await supabase.storage
          .from('project-assets')
          .remove([path]);
        
        if (!storageError) {
          console.log('Successfully deleted file at path:', path);
          storageDeleteSuccess = true;
          break;
        } else {
          console.log('Failed to delete at path:', path, storageError);
        }
      }
      
      // If storage deletion wasn't successful, try to list files in the bucket
      if (!storageDeleteSuccess) {
        console.log('Trying to find file by listing bucket contents');
        try {
          // List files in the project's folder
          const { data: files, error: listError } = await supabase.storage
            .from('project-assets')
            .list(projectId);
            
          if (listError) {
            console.error('Error listing bucket contents:', listError);
          } else if (files && files.length > 0) {
            console.log('Files in project folder:', files);
            
            // Try to find a matching file by name
            const fileName = asset.name;
            const matchingFile = files.find(f => 
              f.name === fileName || 
              f.name.includes(fileName.split('.')[0]) || 
              asset.url.includes(f.name)
            );
            
            if (matchingFile) {
              console.log('Found matching file:', matchingFile.name);
              const { error: deleteError } = await supabase.storage
                .from('project-assets')
                .remove([`${projectId}/${matchingFile.name}`]);
                
              if (!deleteError) {
                console.log('Successfully deleted matching file');
                storageDeleteSuccess = true;
              } else {
                console.error('Error deleting matching file:', deleteError);
              }
            }
          }
        } catch (listError) {
          console.error('Error in file listing process:', listError);
        }
      }
      
      // Finally, delete from database (ensuring we do this regardless of storage success)
      console.log('Deleting from database, asset ID:', assetId);
      const { error: dbError } = await supabase
        .from('project_assets')
        .delete()
        .eq('id', assetId);
      
      if (dbError) {
        console.error('Database deletion error:', dbError);
        toast.dismiss();
        toast.error(`Error deleting asset in database: ${dbError.message}`);
        
        // Restore the asset in the UI since we couldn't delete it
        await fetchAssets();
        return;
      }
      
      // Show success message
      toast.dismiss();
      toast.success(`Deleted ${asset.name}`);
      
      // Force refresh the assets list to ensure synchronization
      await fetchAssets();
      
    } catch (error) {
      toast.dismiss();
      toast.error(`Error deleting asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Complete error deleting asset:', error);
      
      // Refresh assets to ensure UI is in sync
      await fetchAssets();
    }
  }

  function getFileIcon(type: string) {
    if (type.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (type.includes('pdf')) return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  }

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Function to safely open asset URLs
  async function openAssetUrl(url: string, e: React.MouseEvent) {
    e.preventDefault();
    
    try {
      // For signed URLs, we should check if they're still valid
      // If the URL has expired, we'll need to generate a new one
      
      // Extract the path from the URL
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const pathMatch = urlObj.pathname.match(/\/object\/authenticated\/([^?]+)/);
      
      if (pathMatch && pathMatch[1]) {
        const path = decodeURIComponent(pathMatch[1]);
        console.log('Extracted path from URL:', path);
        
        // Create a new signed URL
        const { data: signedData, error: signedError } = await supabase.storage
          .from('project-assets')
          .createSignedUrl(path, 60 * 60); // 1 hour expiry
        
        if (signedError) {
          console.error('Error creating signed URL:', signedError);
          toast.error('Failed to refresh access to this file');
          return;
        }
        
        // Update the asset in the database with the new URL
        const assetToUpdate = assets.find(a => a.url === url);
        if (assetToUpdate) {
          const { error: updateError } = await supabase
            .from('project_assets')
            .update({ url: signedData.signedUrl })
            .eq('id', assetToUpdate.id);
          
          if (updateError) {
            console.error('Error updating asset URL:', updateError);
          } else {
            // Update the local state
            setAssets(assets.map(a => 
              a.id === assetToUpdate.id ? { ...a, url: signedData.signedUrl } : a
            ));
          }
        }
        
        // Open the new URL
        window.open(signedData.signedUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      
      // If we couldn't extract a path, fall back to the original URL
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening URL:', error);
      toast.error('Failed to open the file');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Project Assets</h3>
        <div className="flex space-x-2">
          <Button size="sm" onClick={() => setIsUploadDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Asset
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Assets</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden cursor-pointer group" onClick={(e) => openAssetUrl(asset.url, e)}>
                {asset.type.startsWith('image/') ? (
                  <div className="aspect-video bg-gray-100 overflow-hidden relative">
                    <AssetImage
                      url={asset.url}
                      alt={asset.name}
                      projectId={projectId}
                      className="transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-md p-1">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAsset(asset);
                        }}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute top-2 right-2 z-10">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAsset(asset);
                        }}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-grow">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getFileIcon(asset.type)}
                      </div>
                      <div>
                        <p className="font-medium truncate max-w-[200px] group-hover:text-blue-600">{asset.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(asset.size)}</p>
                      </div>
                    </div>
                  </div>
                  {asset.description && (
                    <p className="mt-2 text-sm text-gray-600">{asset.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="images" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets
              .filter(asset => asset.type.startsWith('image/'))
              .map((asset) => (
                <Card key={asset.id} className="overflow-hidden cursor-pointer group relative" onClick={(e) => openAssetUrl(asset.url, e)}>
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <AssetImage
                      url={asset.url}
                      alt={asset.name}
                      projectId={projectId}
                      className="transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-md p-1">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAsset(asset);
                        }}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div>
                        <p className="font-medium truncate max-w-[200px] group-hover:text-blue-600">{asset.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(asset.size)}</p>
                      </div>
                    </div>
                    {asset.description && (
                      <p className="mt-2 text-sm text-gray-600">{asset.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets
              .filter(asset => !asset.type.startsWith('image/'))
              .map((asset) => (
                <Card key={asset.id} className="overflow-hidden cursor-pointer group relative" onClick={(e) => openAssetUrl(asset.url, e)}>
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      variant="destructive" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAsset(asset);
                      }}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="flex items-center space-x-3 flex-grow">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getFileIcon(asset.type)}
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-[200px] group-hover:text-blue-600">{asset.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(asset.size)}</p>
                        </div>
                      </div>
                    </div>
                    {asset.description && (
                      <p className="mt-2 text-sm text-gray-600">{asset.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Asset</DialogTitle>
            <DialogDescription>
              Upload a file to share with your team. You can add a description to help others understand the file's purpose.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a description to help others understand this file..."
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFileUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 