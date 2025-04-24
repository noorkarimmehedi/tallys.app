import React from "react";
import { useParams } from "wouter";
import { FormBuilder as FormBuilderComponent } from "@/components/form-builder/FormBuilder";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function FormBuilder() {
  const params = useParams();
  const id = params.id;
  
  const { data: form, isLoading } = useQuery({
    queryKey: [`/api/forms/${id}`],
    enabled: !!id && id !== 'new',
  });
  
  if (id && id !== 'new' && isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-64 w-full mb-4" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }
  
  return <FormBuilderComponent id={id !== 'new' ? id : undefined} />;
}
