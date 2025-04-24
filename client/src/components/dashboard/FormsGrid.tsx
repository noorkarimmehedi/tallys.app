import React from "react";
import { Link } from "wouter";
import { Form } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function FormsGrid() {
  const { data: forms, isLoading } = useQuery({
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
          <Card key={i} className="relative group overflow-hidden border border-gray-200">
            <div className="h-32 bg-gray-100 p-4 flex items-center justify-center border-b border-gray-200">
              <Skeleton className="h-16 w-16 rounded-lg" />
            </div>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-20" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!forms || forms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4 text-gray-300">
          <i className="ri-file-list-3-line"></i>
        </div>
        <h3 className="text-xl font-medium text-gray-800 mb-2 font-['Alternate_Gothic', 'sans-serif']">No forms yet</h3>
        <p className="text-gray-600 mb-6">Create your first form to get started</p>
        <Link href="/form-builder">
          <Button className="bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
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
        <Card key={form.id} className="relative group bg-white overflow-hidden border border-gray-200 hover:shadow-md transition-all">
          <div className="h-32 bg-gray-100 p-4 flex items-center justify-center border-b border-gray-200">
            <i className="ri-file-list-3-line text-5xl text-gray-400"></i>
          </div>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium text-gray-900 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
              {form.title}
            </h3>
            <div className="mt-2 flex items-center text-sm text-gray-500">
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
            <div className="mt-4 flex justify-between">
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                form.published 
                  ? "bg-green-100 text-green-800" 
                  : "bg-gray-200 text-gray-700"
              }`}>
                {form.published ? "Published" : "Draft"}
              </span>
              <div className="flex space-x-2">
                <Link href={`/form-builder/${form.id}`}>
                  <Button variant="ghost" size="icon" className="p-1 text-gray-500 hover:text-gray-900">
                    <i className="ri-edit-line"></i>
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="p-1 text-gray-500 hover:text-gray-900"
                  onClick={() => deleteFormMutation.mutate(form.id)}
                >
                  <i className="ri-delete-bin-line"></i>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
