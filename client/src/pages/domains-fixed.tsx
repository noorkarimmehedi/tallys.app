import React, { useState } from "react";
import { 
  Globe, CheckCircle, AlertCircle, PlusCircle, Trash2, ArrowRight, Copy, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type DomainType = "forms" | "events";
type DomainStatus = "verified" | "pending" | "failed";

interface DomainInterface {
  id: number;
  domain: string;
  status: DomainStatus;
  type: DomainType;
  createdAt: string;
}

// Mock domains data
const initialDomains: DomainInterface[] = [
  {
    id: 1,
    domain: "forms.yourdomain.com",
    status: "verified",
    type: "forms",
    createdAt: "2 months ago",
  },
  {
    id: 2,
    domain: "events.yourdomain.com",
    status: "pending",
    type: "events",
    createdAt: "2 days ago",
  },
];

const DomainVerificationSteps = () => (
  <div className="space-y-4 mt-4">
    <div className="bg-muted p-4 rounded-md">
      <h3 className="font-medium text-sm">Step 1: Add DNS Record</h3>
      <p className="text-xs text-muted-foreground mb-2">Add the following TXT record to your domain DNS settings:</p>
      <div className="flex items-center justify-between bg-background p-2 rounded border text-xs">
        <code className="font-mono">_formbuilder-verify.yourdomain.com</code>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-6 px-2">
            <Copy className="h-3 w-3 mr-1" />
            <span>Copy</span>
          </Button>
        </div>
      </div>
    </div>
    
    <div className="bg-muted p-4 rounded-md">
      <h3 className="font-medium text-sm">Step 2: Update CNAME Record</h3>
      <p className="text-xs text-muted-foreground mb-2">Add a CNAME record pointing to our servers:</p>
      <div className="flex items-center justify-between bg-background p-2 rounded border text-xs">
        <code className="font-mono">forms.yourdomain.com → forms-proxy.ourservice.com</code>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-6 px-2">
            <Copy className="h-3 w-3 mr-1" />
            <span>Copy</span>
          </Button>
        </div>
      </div>
    </div>
    
    <div className="bg-muted p-4 rounded-md">
      <h3 className="font-medium text-sm">Step 3: Verify Domain</h3>
      <p className="text-xs text-muted-foreground mb-2">
        After adding the DNS records, click the "Verify Domain" button. DNS changes may take up to 24-48 hours to propagate.
      </p>
      <Button variant="default" size="sm" className="mt-2">
        Verify Domain
      </Button>
    </div>
  </div>
);

const Domains = () => {
  const [domains, setDomains] = useState<DomainInterface[]>(initialDomains);
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [domainType, setDomainType] = useState<DomainType>("forms");
  const [domainError, setDomainError] = useState("");

  // Handle adding a new domain
  const handleAddDomain = () => {
    // Basic domain validation
    if (!newDomain) {
      setDomainError("Domain cannot be empty");
      return;
    }

    const domainRegex = /^(?!-)(?:[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(newDomain)) {
      setDomainError("Please enter a valid domain name");
      return;
    }

    // Check if domain already exists
    if (domains.some(d => d.domain.toLowerCase() === newDomain.toLowerCase())) {
      setDomainError("This domain is already added");
      return;
    }

    // Add new domain
    const newDomainObj: DomainInterface = {
      id: domains.length + 1,
      domain: newDomain,
      status: "pending",
      type: domainType,
      createdAt: "Just now",
    };

    setDomains([...domains, newDomainObj]);
    setNewDomain("");
    setDomainType("forms");
    setDomainError("");
    setIsAddDomainOpen(false);
  };

  // Handle removing a domain
  const handleRemoveDomain = (domainId: number) => {
    if (window.confirm("Are you sure you want to remove this domain?")) {
      setDomains(domains.filter(domain => domain.id !== domainId));
    }
  };

  // Handle verifying a domain
  const handleVerifyDomain = (domainId: number) => {
    // In a real app, this would send a verification request to the server
    // Here we'll just update the status for demo purposes
    setDomains(
      domains.map(domain =>
        domain.id === domainId ? { ...domain, status: "verified" as DomainStatus } : domain
      )
    );
  };

  // Reset error when input changes
  const handleDomainInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDomain(e.target.value);
    if (domainError) setDomainError("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custom Domains</h1>
          <p className="text-muted-foreground mt-1">
            Configure custom domains for your forms and events.
          </p>
        </div>
        
        <Dialog open={isAddDomainOpen} onOpenChange={setIsAddDomainOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Add Domain</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Custom Domain</DialogTitle>
              <DialogDescription>
                Enter your domain to customize the URL for your forms or events.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  placeholder="forms.yourdomain.com"
                  value={newDomain}
                  onChange={handleDomainInputChange}
                  className={domainError ? "border-red-500" : ""}
                />
                {domainError && (
                  <p className="text-red-500 text-xs">{domainError}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Domain Type</Label>
                <Tabs defaultValue="forms" className="w-full" onValueChange={(v) => setDomainType(v as DomainType)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="forms">Forms</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                  </TabsList>
                  <TabsContent value="forms">
                    <div className="p-3 text-xs text-muted-foreground border rounded-md mt-2">
                      Your form links will be <code className="text-primary">formname.{newDomain || "yourdomain.com"}</code>
                    </div>
                  </TabsContent>
                  <TabsContent value="events">
                    <div className="p-3 text-xs text-muted-foreground border rounded-md mt-2">
                      Your event links will be <code className="text-primary">eventname.{newDomain || "yourdomain.com"}</code>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDomainOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDomain}>Add Domain</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader className="px-6 border-b">
          <CardTitle>Your Custom Domains</CardTitle>
          <CardDescription>
            Custom domains let you brand your forms and events with your own domain name.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {domains.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-1">No domains added yet</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                Add your first custom domain to brand your forms and events with your own domain name.
              </p>
              <Button onClick={() => setIsAddDomainOpen(true)}>
                Add Your First Domain
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {domains.map(domain => (
                <div 
                  key={domain.id} 
                  className="flex items-center justify-between p-4 sm:px-6"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${domain.status === "verified" ? "text-green-500" : domain.status === "pending" ? "text-amber-500" : "text-red-500"}`}>
                      {domain.status === "verified" ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : domain.status === "pending" ? (
                        <AlertCircle className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium">{domain.domain}</span>
                        <Badge 
                          variant="outline" 
                          className="ml-2 uppercase text-xs"
                        >
                          {domain.type}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={`ml-2 capitalize text-xs ${
                            domain.status === "verified" 
                              ? "bg-green-50 text-green-600 border-green-200" 
                              : domain.status === "pending" 
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : "bg-red-50 text-red-600 border-red-200"
                          }`}
                        >
                          {domain.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Added {domain.createdAt}
                      </div>
                      {domain.status === "verified" && (
                        <div className="mt-2 flex items-center text-xs text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Domain verified and active
                        </div>
                      )}
                      {domain.status === "pending" && (
                        <div className="mt-2 flex items-center text-xs text-amber-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          DNS verification pending
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {domain.status === "verified" ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => window.open(`https://${domain.domain}`, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>Visit</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Visit your domain</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleVerifyDomain(domain.id)}
                      >
                        <ArrowRight className="h-3 w-3" />
                        <span>Verify</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveDomain(domain.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Remove</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Domain Verification</CardTitle>
            <CardDescription>
              Follow these steps to verify ownership of your domain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DomainVerificationSteps />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>About Custom Domains</CardTitle>
            <CardDescription>
              Benefits of using custom domains for your forms and events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Enhanced Branding</h3>
                  <p className="text-xs text-muted-foreground">
                    Maintain consistent branding by using your own domain name instead of our default domain.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Improved Trust</h3>
                  <p className="text-xs text-muted-foreground">
                    Users are more likely to trust and complete forms that are hosted on your own domain.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">SEO Benefits</h3>
                  <p className="text-xs text-muted-foreground">
                    Forms on your own domain can contribute to your site's SEO and help drive more traffic.
                  </p>
                </div>
              </div>
              
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Need help?</AlertTitle>
                <AlertDescription>
                  If you're having trouble with domain verification, contact our support team for assistance.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Domains;