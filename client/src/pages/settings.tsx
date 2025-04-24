import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
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
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" defaultValue="Demo User" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="demo@example.com" />
                    </div>
                  </div>
                  <div>
                    <Button className="mt-4 bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-['Alternate_Gothic', 'sans-serif'] tracking-wide">Password</CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  <div>
                    <Button className="mt-4 bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
                      Update Password
                    </Button>
                  </div>
                </div>
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
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Current Plan</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold">Pro Plan</p>
                      <p className="text-sm text-gray-500">$15/month, billed monthly</p>
                    </div>
                    <Button variant="outline">
                      Change Plan
                    </Button>
                  </div>
                </div>
                
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
                    <div className="p-4 border-b border-gray-200 flex justify-between">
                      <div>
                        <p>April 1, 2023</p>
                        <p className="text-sm text-gray-500">Pro Plan - Monthly</p>
                      </div>
                      <div className="text-right">
                        <p>$15.00</p>
                        <p className="text-xs text-green-600">Paid</p>
                      </div>
                    </div>
                    <div className="p-4 border-b border-gray-200 flex justify-between">
                      <div>
                        <p>March 1, 2023</p>
                        <p className="text-sm text-gray-500">Pro Plan - Monthly</p>
                      </div>
                      <div className="text-right">
                        <p>$15.00</p>
                        <p className="text-xs text-green-600">Paid</p>
                      </div>
                    </div>
                    <div className="p-4 flex justify-between">
                      <div>
                        <p>February 1, 2023</p>
                        <p className="text-sm text-gray-500">Pro Plan - Monthly</p>
                      </div>
                      <div className="text-right">
                        <p>$15.00</p>
                        <p className="text-xs text-green-600">Paid</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
