import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { createFormUrl } from "@/lib/utils";
import { Form } from "@shared/schema";
import {
  Copy,
  Facebook,
  Link as LinkIcon,
  Mail,
  Share2,
  Twitter,
  Globe,
  Code,
} from "lucide-react";

interface FormShareProps {
  form: Form;
}

export default function FormShare({ form }: FormShareProps) {
  const [activeTab, setActiveTab] = useState("link");
  const { toast } = useToast();
  
  const formUrl = createFormUrl(form.shortId);
  
  const copyToClipboard = (text: string, message: string = "Copied to clipboard") => {
    navigator.clipboard.writeText(text);
    toast({
      title: message,
      duration: 2000,
    });
  };
  
  const embedCode = `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`;
  
  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };
  
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
                <Code className="h-4 w-4 mr-2" />
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
                  <Globe className="h-4 w-4 mr-2" />
                  Open Form
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="social" className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Share your form directly on social media platforms.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(formUrl)}`)}
                >
                  <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                  Facebook
                </Button>
                
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => openShareWindow(`https://twitter.com/intent/tweet?url=${encodeURIComponent(formUrl)}&text=Check out this form: ${encodeURIComponent(form.title)}`)}
                >
                  <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                  Twitter
                </Button>
                
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => openShareWindow(`mailto:?subject=${encodeURIComponent(`Form: ${form.title}`)}&body=${encodeURIComponent(`Check out this form: ${formUrl}`)}`)}
                >
                  <Mail className="h-4 w-4 mr-2 text-gray-600" />
                  Email
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
                onClick={() => copyToClipboard(embedCode, "Embed code copied")}
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
      
      {form.published && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">QR Code</CardTitle>
            <CardDescription>
              Generate a QR code for your form to share offline.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-md border">
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(formUrl)}`} 
                  alt="QR Code"
                  className="w-full h-full"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(formUrl)}`;
                  window.open(qrUrl, '_blank');
                }}
              >
                Preview
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(formUrl)}`;
                  const link = document.createElement('a');
                  link.href = qrUrl;
                  link.download = `form-qr-${form.shortId}.png`;
                  link.click();
                }}
              >
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}