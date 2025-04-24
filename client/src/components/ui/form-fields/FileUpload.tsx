import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  value: string; 
  onChange: (value: string) => void;
  preview?: boolean;
}

export default function FileUpload({ value, onChange, preview = false }: FileUploadProps) {
  const [fileName, setFileName] = useState("");
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // In a real implementation, you'd upload the file and get back a URL
      onChange(`file://${file.name}`);
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
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {fileName ? (
                <>
                  <i className="ri-file-line text-3xl text-blue-500"></i>
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <p>{fileName}</p>
                    <Button 
                      onClick={() => {
                        setFileName("");
                        onChange("");
                      }}
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 w-6 p-0"
                    >
                      <i className="ri-close-line"></i>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <i className="ri-upload-2-line text-3xl text-gray-400"></i>
                  <div className="text-sm text-gray-600">
                    <Label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
                      <span>Upload a file</span>
                      <Input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </Label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
