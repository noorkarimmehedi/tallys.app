import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Link, Mail, Check, Share2, Twitter, Facebook, Linkedin } from "lucide-react";
import { Form } from "@shared/schema";
import { createFormUrl } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface FormShareProps {
  form: Form;
}

export default function FormShare({ form }: FormShareProps) {
  const [copied, setCopied] = useState(false);
  const formUrl = createFormUrl(form.shortId);
  
  // Function to copy form link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "Form link copied to clipboard",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  // Generate email share link
  const getEmailLink = () => {
    const subject = encodeURIComponent(`Please fill out my form: ${form.title}`);
    const body = encodeURIComponent(`I've created a form and would appreciate if you could fill it out: ${formUrl}`);
    return `mailto:?subject=${subject}&body=${body}`;
  };

  // Generate Twitter share link
  const getTwitterLink = () => {
    const text = encodeURIComponent(`Check out my form: ${form.title} ${formUrl}`);
    return `https://twitter.com/intent/tweet?text=${text}`;
  };

  // Generate Facebook share link
  const getFacebookLink = () => {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(formUrl)}`;
  };

  // Generate LinkedIn share link
  const getLinkedInLink = () => {
    const title = encodeURIComponent(form.title);
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(formUrl)}&title=${title}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Share your form</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="link">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link">
            <div className="space-y-4">
              <div>
                <Label htmlFor="form-link">Form Link</Label>
                <div className="flex mt-1.5">
                  <Input 
                    id="form-link"
                    value={formUrl} 
                    readOnly 
                    className="flex-1 bg-gray-50"
                  />
                  <Button 
                    variant="outline" 
                    className="ml-2 min-w-[100px]"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="pt-4">
                <Label className="mb-2 block">Share via</Label>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open(getEmailLink(), '_blank')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open(formUrl, '_blank')}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="embed">
            <div className="space-y-4">
              <div>
                <Label htmlFor="embed-code">Embed Code</Label>
                <div className="flex mt-1.5">
                  <Input 
                    id="embed-code"
                    value={`<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`} 
                    readOnly 
                    className="flex-1 bg-gray-50"
                  />
                  <Button 
                    variant="outline" 
                    className="ml-2 min-w-[100px]"
                    onClick={() => {
                      navigator.clipboard.writeText(`<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`);
                      toast({
                        title: "Embed code copied",
                        description: "Embed code copied to clipboard",
                      });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="pt-4">
                <Label className="mb-2 block">Preview</Label>
                <div className="border rounded-md p-4 bg-gray-50 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="text-gray-400 mb-2">
                      <Share2 className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-600">Embed preview not available</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="social">
            <div className="space-y-4">
              <Label className="mb-2 block">Share on social media</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => window.open(getTwitterLink(), '_blank')}
                >
                  <Twitter className="h-4 w-4 mr-2 text-[#1DA1F2]" />
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => window.open(getFacebookLink(), '_blank')}
                >
                  <Facebook className="h-4 w-4 mr-2 text-[#1877F2]" />
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => window.open(getLinkedInLink(), '_blank')}
                >
                  <Linkedin className="h-4 w-4 mr-2 text-[#0077B5]" />
                  LinkedIn
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => window.open(getEmailLink(), '_blank')}
                >
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  Email
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}