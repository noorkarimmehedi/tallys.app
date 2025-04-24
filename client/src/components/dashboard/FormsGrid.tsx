import React from "react";
import { Link } from "wouter";
import { Form } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { ShineBorder } from "@/components/ui/shine-border";

export default function FormsGrid() {
  const { data: forms = [], isLoading } = useQuery<Form[]>({
    queryKey: ['/api/forms'],
  });

  const deleteFormMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/forms/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="block">
            <Card className="relative h-full bg-white shadow-md">
              <CardContent className="p-5">
                {/* Simple loading bar at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-300" />
                
                {/* Status badge skeleton */}
                <div className="absolute top-3 right-3">
                  <Skeleton className="h-3 w-3 rounded-full" />
                </div>
                
                {/* Content skeletons */}
                <Skeleton className="h-5 w-6 mb-3" />
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-24 mb-6" />
                
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-8 w-16 rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (!forms || forms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-6">
          <i className="ri-file-list-3-line text-2xl text-black/70"></i>
        </div>
        <h3 className="text-xl font-medium text-gray-800 mb-2 font-['Alternate_Gothic', 'sans-serif']">No forms yet</h3>
        <p className="text-gray-500 mb-8 text-sm max-w-md text-center">Create your first form and start collecting responses</p>
        <Link href="/form-builder">
          <Button className="bg-black hover:bg-gray-800 px-6 py-2 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
            <i className="ri-add-line mr-2"></i>
            Create Form
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {/* Forms */}
      {forms.map((form: Form) => (
        <Link href={`/form-builder/${form.id}`} key={form.id} className="block">
          <Card className="relative h-full group bg-white shadow-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-5">
              {/* Status badge */}
              <div className="absolute top-3 right-3">
                <div 
                  className={`rounded-full h-3 w-3 ${
                    form.published 
                      ? "bg-green-500" 
                      : "bg-gray-400"
                  }`}
                />
              </div>
              
              {/* Border overlay - simple colored top bar instead of full border */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: form.published ? 'linear-gradient(to right, #A07CFE, #FE8FB5, #FFBE7B)' : '#888',
                }}
              />
              
              {/* Form icon */}
              <div className="mb-3 text-black font-medium">
                <i className="ri-file-list-3-line text-lg"></i>
              </div>
              
              {/* Form title */}
              <h3 className="text-lg font-bold mb-3 text-gray-900 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
                {form.title}
              </h3>
              
              {/* Stats */}
              <div className="flex items-center text-xs text-gray-700 mb-6">
                <i className="ri-eye-line mr-1"></i>
                <span className="font-medium">{form.views} views</span>
                {form.published && (
                  <>
                    <span className="mx-2">•</span>
                    <i className="ri-message-3-line mr-1"></i>
                    <span className="font-medium">0 responses</span>
                  </>
                )}
              </div>
              
              {/* Bottom section with status and actions */}
              <div className="flex justify-between items-center">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  form.published 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-200 text-gray-700"
                }`}>
                  {form.published ? "Published" : "Draft"}
                </span>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-2 border-red-200 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteFormMutation.mutate(form.id);
                    }}
                  >
                    <i className="ri-delete-bin-line mr-1"></i>
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
