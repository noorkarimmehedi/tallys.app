import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  value: string; 
  onChange: (value: string) => void;
  preview?: boolean;
}

export default function FileUpload({ value, onChange, preview = false }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  // Extract filename from value
  // The value can be a full URL to the uploaded file or a temporary "file://filename.ext" format
  const isRemoteFile = value && !value.startsWith('file://');
  const fileName = value ? (isRemoteFile ? value.split('/').pop() : value.replace('file://', '')) : '';
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Update UI immediately with a temporary value
    onChange(`file://${file.name}`);
    
    if (preview) return; // Don't actually upload in preview mode
    
    try {
      setIsUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload file to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json' 
        }
      });
      
      if (!response.ok) {
        throw new Error('File upload failed');
      }
      
      const result = await response.json();
      
      // Update with the real URL from the server
      onChange(result.url);
      
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully",
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">Upload File</Label>
        
        {preview ? (
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <i className="ri-upload-2-line text-3xl text-gray-400"></i>
              <div className="text-sm text-gray-600">
                <Label htmlFor="file-upload" className="relative cursor-not-allowed rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
                  Upload a file
                </Label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, PDF, DOC, DOCX, XLS, XLSX, TXT, CSV (Max 2MB)</p>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                  <div className="text-sm text-gray-600 mt-2">
                    <p>Uploading file...</p>
                  </div>
                </>
              ) : fileName ? (
                <>
                  <i className="ri-file-line text-3xl text-blue-500"></i>
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <p>{fileName}</p>
                    <Button 
                      onClick={() => {
                        onChange("");
                      }}
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 w-6 p-0"
                      disabled={isUploading}
                    >
                      <i className="ri-close-line"></i>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <i className="ri-upload-2-line text-3xl text-gray-400"></i>
                  <div className="text-sm text-gray-600">
                    <Label htmlFor="file-upload" className={`relative ${isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500`}>
                      <span>Upload a file</span>
                      <Input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                    </Label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF, DOC, DOCX, XLS, XLSX, TXT, CSV (Max 2MB)</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
