import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import SubscriptionStatus from "@/components/subscription/SubscriptionStatus";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Password update form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // User profile update state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Set initial values from user data
  React.useEffect(() => {
    if (user) {
      setName(user.displayName || user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);
  
  // Password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("PUT", "/api/user/password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const res = await apiRequest("PUT", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });
  
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive",
      });
      return;
    }
    
    updatePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };
  
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      name,
      email,
    });
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">Manage your account and preferences</p>
      </div>
      
      <Tabs defaultValue="account">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-['Alternate_Gothic', 'sans-serif'] tracking-wide">Account Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="grid gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Button 
                      type="submit"
                      className="mt-4 bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-['Alternate_Gothic', 'sans-serif'] tracking-wide">Password</CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="grid gap-4">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input 
                        id="new-password" 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Button 
                      type="submit"
                      className="mt-4 bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
                      disabled={updatePasswordMutation.isPending}
                    >
                      {updatePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-['Alternate_Gothic', 'sans-serif'] tracking-wide">Notification Preferences</CardTitle>
              <CardDescription>Control when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive email when someone completes your form</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Form Summary</p>
                    <p className="text-sm text-gray-500">Receive weekly summaries of form activity</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing</p>
                    <p className="text-sm text-gray-500">Receive updates about new features and promotions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Button className="mt-4 bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-['Alternate_Gothic', 'sans-serif'] tracking-wide">Appearance</CardTitle>
              <CardDescription>Customize how Tallys looks for you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div>
                  <Label className="mb-2 block">Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-md p-4 text-center hover:border-blue-500 cursor-pointer">
                      <div className="h-12 bg-white border border-gray-200 rounded mb-2"></div>
                      <span className="text-sm">Light</span>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4 text-center hover:border-blue-500 cursor-pointer">
                      <div className="h-12 bg-gray-900 border border-gray-200 rounded mb-2"></div>
                      <span className="text-sm">Dark</span>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4 text-center hover:border-blue-500 cursor-pointer bg-blue-50">
                      <div className="h-12 bg-gradient-to-r from-white to-gray-900 border border-gray-200 rounded mb-2"></div>
                      <span className="text-sm">System</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Default Form Background</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-md p-4 text-center hover:border-blue-500 cursor-pointer">
                      <div className="h-12 bg-white border border-gray-200 rounded mb-2"></div>
                      <span className="text-sm">White</span>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4 text-center hover:border-blue-500 cursor-pointer bg-blue-50">
                      <div className="h-12 bg-white bg-opacity-90 rounded mb-2" style={{
                        backgroundImage: "radial-gradient(#F8F8F8 1px, transparent 0)",
                        backgroundSize: "10px 10px"
                      }}></div>
                      <span className="text-sm">Dotted</span>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4 text-center hover:border-blue-500 cursor-pointer">
                      <div className="h-12 bg-gray-100 border border-gray-200 rounded mb-2"></div>
                      <span className="text-sm">Light Gray</span>
                    </div>
                  </div>
                </div>
                
                <Button className="mt-4 bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-['Alternate_Gothic', 'sans-serif'] tracking-wide">Billing Information</CardTitle>
              <CardDescription>Manage your subscription and billing details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {/* Replace static billing information with the dynamic SubscriptionStatus component */}
                <div className="mb-4">
                  {/* Import this component at the top of the file */}
                  <SubscriptionStatus />
                </div>
                
                {/* Only show this section when user has an active subscription */}
                {/* 
                <div>
                  <h3 className="font-medium mb-4">Payment Method</h3>
                  <div className="flex items-center p-4 border border-gray-200 rounded-md mb-4">
                    <div className="mr-4 text-xl">
                      <i className="ri-visa-line"></i>
                    </div>
                    <div>
                      <p>Visa ending in 4242</p>
                      <p className="text-sm text-gray-500">Expires 12/2025</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      <i className="ri-pencil-line"></i>
                    </Button>
                  </div>
                  <Button variant="outline">
                    <i className="ri-add-line mr-2"></i>
                    Add Payment Method
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Billing History</h3>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="text-center p-4 text-gray-500">
                      No billing history available
                    </div>
                  </div>
                </div>
                */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
