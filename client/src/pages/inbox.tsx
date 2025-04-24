import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function Inbox() {
  const { data: forms, isLoading: formsLoading } = useQuery({
    queryKey: ['/api/forms'],
  });
  
  if (formsLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <div className="mb-4">
          <Skeleton className="h-10 w-96" />
        </div>
        
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">Inbox</h2>
        <p className="mt-1 text-sm text-gray-500">View and manage form responses</p>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Forms</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {!forms || forms.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4 text-gray-300">
                <i className="ri-inbox-line"></i>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2 font-['Alternate_Gothic', 'sans-serif']">
                No responses yet
              </h3>
              <p className="text-gray-600">Responses will appear here once people fill out your forms</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {forms.map((form) => (
                <ResponseList key={form.id} formId={form.id} formTitle={form.title} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="unread">
          <div className="text-center py-12">
            <div className="text-5xl mb-4 text-gray-300">
              <i className="ri-mail-open-line"></i>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2 font-['Alternate_Gothic', 'sans-serif']">
              No unread responses
            </h3>
            <p className="text-gray-600">You've read all responses</p>
          </div>
        </TabsContent>
        
        <TabsContent value="flagged">
          <div className="text-center py-12">
            <div className="text-5xl mb-4 text-gray-300">
              <i className="ri-flag-line"></i>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2 font-['Alternate_Gothic', 'sans-serif']">
              No flagged responses
            </h3>
            <p className="text-gray-600">Flag important responses to find them here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ResponseListProps {
  formId: number;
  formTitle: string;
}

function ResponseList({ formId, formTitle }: ResponseListProps) {
  const { data: responses, isLoading } = useQuery({
    queryKey: [`/api/forms/${formId}/responses`],
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!responses || responses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
            {formTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No responses yet</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
            {formTitle}
          </span>
          <span className="text-sm text-gray-500 font-normal">
            {responses.length} responses
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {responses.map((response) => (
            <div key={response.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-500">
                  Response #{response.id}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(response.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="ml-4">
                {Object.entries(response.answers).map(([questionId, answer]) => (
                  <div key={questionId} className="mb-2">
                    <div className="text-sm text-gray-600">
                      {answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
