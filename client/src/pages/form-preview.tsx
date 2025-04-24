import React from "react";
import { useParams, useLocation } from "wouter";
import { FormPreview as FormPreviewComponent } from "@/components/form-preview/FormPreview";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

export default function FormPreview() {
  const params = useParams();
  const [, navigate] = useLocation();
  const id = params.id;
  const shortId = params.shortId;
  
  // Set up the right query key depending on whether we're
  // accessing via /preview/:id or via /f/:shortId
  const queryKey = shortId 
    ? [`/api/f/${shortId}`]
    : [`/api/forms/${id}`];
  
  const { data: form, isLoading } = useQuery({
    queryKey,
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-xl w-full">
          <Skeleton className="h-10 w-3/4 mx-auto mb-6" />
          <Skeleton className="h-8 w-1/2 mx-auto mb-8" />
          
          <div className="rounded-lg overflow-hidden">
            <Skeleton className="h-64 w-full mb-4" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-xl w-full text-center">
          <div className="text-5xl mb-4 text-gray-300">
            <i className="ri-error-warning-line"></i>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2 font-['Alternate_Gothic', 'sans-serif']">
            Form not found
          </h3>
          <p className="text-gray-600 mb-6">
            This form either doesn't exist or hasn't been published yet.
          </p>
          <Button 
            className="bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
            onClick={() => navigate("/")}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  // Header for preview mode
  if (!shortId) {
    return (
      <>
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/form-builder/${id}`)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </Button>
            <div className="ml-4">
              <h3 className="text-lg font-medium font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
                {form.title} (Preview)
              </h3>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              className="bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
              onClick={() => navigate(`/form-builder/${id}`)}
            >
              Edit Form
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-white">
          <FormPreviewComponent form={form} preview={true} />
        </div>
      </>
    );
  }
  
  // Public form view (no header)
  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: "radial-gradient(#F8F8F8 1px, transparent 0)",
        backgroundSize: "20px 20px"
      }}
    >
      <FormPreviewComponent form={form} />
    </div>
  );
}
