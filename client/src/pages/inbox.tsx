import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronRight, Eye, BarChart2, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import MainLayout from "@/components/layouts/MainLayout";
import { createFormUrl } from "@/lib/utils";

export default function Inbox() {
  const { data: forms, isLoading: formsLoading } = useQuery({
    queryKey: ['/api/forms'],
  });
  
  if (formsLoading) {
    return (
      <MainLayout>
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
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
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
                  <FormCard 
                    key={form.id} 
                    formId={form.id} 
                    formTitle={form.title}
                    shortId={form.shortId}
                    views={form.views}
                    published={form.published}
                  />
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
    </MainLayout>
  );
}

interface FormCardProps {
  formId: number;
  formTitle: string;
  shortId: string;
  views?: number;
  published?: boolean;
}

function FormCard({ formId, formTitle, shortId, views = 0, published = false }: FormCardProps) {
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
  
  const responseCount = responses?.length || 0;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-['Alternate_Gothic', 'sans-serif'] tracking-wide flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${published ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {formTitle}
          </CardTitle>
          <Link href={`/form-details/${formId}`}>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-md">
            <div className="text-sm font-semibold text-blue-700">{responseCount}</div>
            <div className="text-xs text-gray-500">Responses</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-md">
            <div className="text-sm font-semibold text-purple-700">{views}</div>
            <div className="text-xs text-gray-500">Views</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-md">
            <div className="text-sm font-semibold text-green-700">
              {views > 0 ? Math.round((responseCount / views) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-500">Completion</div>
          </div>
        </div>
        
        {responseCount > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Recent Responses</h4>
            <div className="space-y-2">
              {responses.slice(0, 2).map((response) => (
                <div key={response.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <span>Response #{response.id}</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(response.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 pb-4 flex justify-between border-t">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => window.open(createFormUrl(shortId), '_blank')}
        >
          <ExternalLink className="h-3.5 w-3.5 mr-1" />
          View Form
        </Button>
        
        <Link href={`/form-details/${formId}`}>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <BarChart2 className="h-3.5 w-3.5 mr-1" />
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
