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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <ShineBorder 
            key={i}
            borderRadius={12}
            borderWidth={1}
            duration={10}
            color="#444444"
            className="relative w-full min-w-0 min-h-0 p-0 bg-transparent"
          >
            <Card className="relative overflow-hidden border-none shadow-sm h-full bg-white/50 backdrop-blur-sm">
              <CardContent className="p-5">
                <Skeleton className="h-4 w-6 mb-5" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-3 w-24 mb-6" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </CardContent>
            </Card>
          </ShineBorder>
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {forms.map((form: Form) => (
        <Link href={`/form-builder/${form.id}`} key={form.id}>
          <ShineBorder 
            borderRadius={12}
            borderWidth={1}
            duration={10}
            color={form.published ? ["#A07CFE", "#FE8FB5", "#FFBE7B"] : "#444444"}
            className="relative w-full min-w-0 min-h-0 p-0 bg-transparent"
          >
            <Card className="relative group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 h-full bg-white/50 backdrop-blur-sm">
              <CardContent className="p-5">
                {/* Status indicator */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex h-2 w-2 rounded-full ${
                    form.published 
                      ? "bg-green-500" 
                      : "bg-gray-300"
                  }`}></span>
                </div>
                
                {/* Form icon */}
                <div className="mb-4 text-black">
                  <i className="ri-file-list-3-line text-lg"></i>
                </div>
                
                {/* Form title */}
                <h3 className="text-lg font-medium mb-2 text-gray-900 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
                  {form.title}
                </h3>
                
                {/* Stats */}
                <div className="flex items-center text-xs text-gray-500 mb-6">
                  <i className="ri-eye-line mr-1"></i>
                  <span>{form.views} views</span>
                  {form.published && (
                    <>
                      <span className="mx-2">•</span>
                      <i className="ri-message-3-line mr-1"></i>
                      <span>0 responses</span>
                    </>
                  )}
                </div>
                
                {/* Bottom section with status and actions */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {form.published ? "Published" : "Draft"}
                  </span>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-gray-500 hover:text-gray-900"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteFormMutation.mutate(form.id);
                      }}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ShineBorder>
        </Link>
      ))}
    </div>
  );
}
