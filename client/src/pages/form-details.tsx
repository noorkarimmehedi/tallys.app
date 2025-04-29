import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { PieChart, Copy, Link as LinkIcon, Settings, Download, BarChart2, FileText, Share2 } from "lucide-react";
import { Form, Response } from "@shared/schema";
import { createFormUrl } from "@/lib/utils";
import FormSubmissionsTable from "@/components/form-details/FormSubmissionsTable";

const FormShare = ({ form }: { form: Form }) => {
  const [activeTab, setActiveTab] = useState("link");
  const formUrl = createFormUrl(form.shortId);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  const embedCode = `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`;
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Share Form</CardTitle>
          <CardDescription>
            Share your form with others via link, email, or social media.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="link">
                <LinkIcon className="h-4 w-4 mr-2" />
                Link
              </TabsTrigger>
              <TabsTrigger value="social">
                <Share2 className="h-4 w-4 mr-2" />
                Social
              </TabsTrigger>
              <TabsTrigger value="embed">
                <LinkIcon className="h-4 w-4 mr-2" />
                Embed
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="link" className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <p className="text-sm font-medium">Form Link</p>
                  {!form.published && (
                    <div className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                      Draft
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <Input
                    value={formUrl}
                    readOnly
                    className="text-sm flex-1 bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => copyToClipboard(formUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {form.published
                    ? "This form is published and accessible to anyone with the link."
                    : "This form is currently in draft mode. Enable publishing in Settings to make it accessible."}
                </p>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={() => window.open(formUrl, '_blank')}
                  className="w-full sm:w-auto"
                >
                  Open Form
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="social" className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Share your form directly on social media platforms.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(formUrl)}`, '_blank')}
                >
                  Facebook
                </Button>
                
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(formUrl)}&text=${encodeURIComponent(form.title)}`, '_blank')}
                >
                  Twitter
                </Button>
              </div>
              
              {!form.published && (
                <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md">
                  <p>Remember: Your form is in draft mode. Publish it first to share with others.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="embed" className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Embed this form directly on your website using the code below.
              </p>
              
              <div className="bg-gray-100 p-3 rounded-md">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all">
                  {embedCode}
                </pre>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(embedCode)}
                className="mt-2"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              
              {!form.published && (
                <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md">
                  <p>Your form is in draft mode. It must be published for the embed to work properly.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const FormSettings = ({ form }: { form: Form }) => {
  const [location, setLocation] = useLocation();
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">General Settings</CardTitle>
          <CardDescription>
            Manage your form's title, status, and submission behavior.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="title">Form Title</label>
              <Input
                id="title"
                defaultValue={form.title}
                placeholder="Enter form title"
              />
              <p className="text-xs text-gray-500">This is the title displayed at the top of your form.</p>
            </div>
            
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <label className="text-base" htmlFor="published">Publish Form</label>
                <p className="text-sm text-gray-500">
                  When enabled, your form will be accessible to anyone with the link.
                </p>
              </div>
              <div className="h-6 w-12 bg-gray-200 rounded-full relative">
                <div className={`h-5 w-5 rounded-full absolute top-0.5 transition-all ${form.published ? 'bg-blue-600 right-0.5' : 'bg-gray-400 left-0.5'}`}></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="submitButtonText">Submit Button Text</label>
              <Input
                id="submitButtonText"
                defaultValue={form.metadata?.submitButtonText || "Submit"}
                placeholder="Submit"
              />
              <p className="text-xs text-gray-500">Customize the text on the form's submit button.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="redirectUrl">Redirect URL (Optional)</label>
              <Input
                id="redirectUrl"
                defaultValue={form.metadata?.redirectUrl || ""}
                placeholder="https://example.com/thank-you"
              />
              <p className="text-xs text-gray-500">
                Redirect users to this URL after form submission. Leave blank to show the default thank you page.
              </p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            type="submit"
            className="ml-auto"
          >
            Save Changes
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg text-red-600 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete this form and all of its data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Once you delete a form, there is no going back. This action permanently removes the form, all of its questions, and all of its responses.
          </p>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button variant="destructive">Delete Form</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default function FormDetails() {
  const params = useParams();
  const formId = params?.id;
  const [location, setLocation] = useLocation();
  const [currentTab, setCurrentTab] = useState("summary");

  const { data: form, isLoading: formLoading } = useQuery<Form>({
    queryKey: [`/api/forms/${formId}`],
  });

  const { data: responses, isLoading: responsesLoading } = useQuery<Response[]>({
    queryKey: [`/api/forms/${formId}/responses`],
  });

  // Format date for display
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  // Count responses
  const responseCount = responses?.length || 0;
  
  // Calculate completion rate (just a placeholder based on views)
  const completionRate = form?.views ? Math.round((responseCount / form.views) * 100) : 0;

  // Determine average completion time (placeholder)
  const avgCompletionTime = "2m 45s";

  // Calculate statistics
  const stats = useMemo(() => {
    if (!form || !responses) return [];
    
    return [
      { 
        label: "Responses", 
        value: responseCount.toString(),
        icon: <FileText className="h-5 w-5 text-blue-500" />,
        color: "bg-blue-50"
      },
      { 
        label: "Completion Rate", 
        value: `${completionRate}%`,
        icon: <PieChart className="h-5 w-5 text-green-500" />,
        color: "bg-green-50"
      },
      { 
        label: "Views", 
        value: form.views?.toString() || "0",
        icon: <BarChart2 className="h-5 w-5 text-purple-500" />,
        color: "bg-purple-50"
      },
      { 
        label: "Avg. Time", 
        value: avgCompletionTime,
        icon: <BarChart2 className="h-5 w-5 text-orange-500" />,
        color: "bg-orange-50"
      }
    ];
  }, [form, responses, responseCount, completionRate]);

  if (formLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/inbox")}
            className="text-sm"
          >
            ← Back
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="mb-6">
          <Skeleton className="h-12 w-full mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/inbox")}
            className="text-sm"
          >
            ← Back
          </Button>
        </div>
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-800 mb-2">Form not found</h3>
          <p className="text-gray-600">The form you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with back button and title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/inbox")}
            className="text-sm"
          >
            ← Back
          </Button>
          <h1 className="text-2xl font-bold font-['Alternate_Gothic', 'sans-serif'] tracking-wide truncate">
            {form.title}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => window.open(createFormUrl(form.shortId), '_blank')}
          >
            <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
            View Form
          </Button>
          <Button 
            size="sm" 
            className="text-xs bg-black hover:bg-gray-800"
            onClick={() => setLocation(`/form-builder/${form.id}`)}
          >
            Edit Form
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="mb-6 text-sm text-gray-500">
        <p>Created {formatDate(form.createdAt || '')}</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary" value={currentTab} onValueChange={setCurrentTab} className="mt-6">
        <TabsList className="grid grid-cols-4 md:w-auto md:inline-grid">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className={`p-6 ${stat.color}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                      <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                    </div>
                    <div className="p-2 rounded-full bg-white/90">
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Responses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Responses</CardTitle>
              </CardHeader>
              <CardContent>
                {responsesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : responses && responses.length > 0 ? (
                  <div className="space-y-3">
                    {responses.slice(0, 5).map((response, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="text-sm font-medium">Response #{response.id}</p>
                          <p className="text-xs text-gray-500">{formatDate(response.createdAt || '')}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setCurrentTab("submissions")}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No responses yet</p>
                  </div>
                )}
              </CardContent>
              {responses && responses.length > 5 && (
                <CardFooter className="flex justify-center border-t pt-4">
                  <Button 
                    variant="link" 
                    onClick={() => setCurrentTab("submissions")}
                  >
                    View all {responses.length} responses
                  </Button>
                </CardFooter>
              )}
            </Card>

            {/* Form Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Form Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Form Link</p>
                    <div className="flex items-center mt-1">
                      <Input 
                        value={createFormUrl(form.shortId)} 
                        readOnly 
                        className="text-sm flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-2"
                        onClick={() => {
                          navigator.clipboard.writeText(createFormUrl(form.shortId));
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div className="flex items-center mt-1">
                      <div className={`h-2.5 w-2.5 rounded-full ${form.published ? "bg-green-500" : "bg-gray-400"} mr-2`}></div>
                      <p className="text-sm">{form.published ? "Published" : "Draft"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Questions</p>
                    <p className="text-sm mt-1">{form.questions.length} questions</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-sm mt-1">{formatDate(form.updatedAt || '')}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentTab("share")}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentTab("settings")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Submissions Tab */}
        <TabsContent value="submissions" className="pt-6">
          <FormSubmissionsTable form={form} responses={responses || []} isLoading={responsesLoading} />
        </TabsContent>
        
        {/* Share Tab */}
        <TabsContent value="share" className="pt-6">
          <FormShare form={form} />
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="pt-6">
          <FormSettings form={form} />
        </TabsContent>
      </Tabs>
    </div>
  );
}