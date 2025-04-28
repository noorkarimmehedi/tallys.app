import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarDays, FileText } from "lucide-react";
import FormsGrid from "@/components/dashboard/FormsGrid";
import EventsGrid from "@/components/dashboard/EventsGrid";

export default function Dashboard() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("forms");
  
  // Get tab from URL query parameter or sessionStorage
  useEffect(() => {
    // First check URL params
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    
    if (tabParam === "events" || tabParam === "forms") {
      setActiveTab(tabParam);
      return;
    }
    
    // Then check sessionStorage (for redirects from empty states)
    const storedTab = sessionStorage.getItem('dashboard_active_tab');
    if (storedTab === "events" || storedTab === "forms") {
      setActiveTab(storedTab);
      // Clear the storage to avoid persisting across page refreshes
      sessionStorage.removeItem('dashboard_active_tab');
    }
  }, [location]);
  
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your forms and events
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/form-builder/new">
            <Button className="bg-black hover:bg-gray-800">
              <FileText className="h-4 w-4 mr-2 text-white" />
              Create Form
            </Button>
          </Link>
          <Link href="/event-builder-weekly/new">
            <Button className="bg-black hover:bg-gray-800">
              <CalendarDays className="h-4 w-4 mr-2 text-white" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="forms" className="flex items-center gap-1">
            <FileText className="h-4 w-4 text-blue-500" />
            Forms
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4 text-blue-500" />
            Events
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="forms" className="focus:outline-none">
          <FormsGrid />
        </TabsContent>
        
        <TabsContent value="events" className="focus:outline-none" id="events-section">
          <EventsGrid />
        </TabsContent>
      </Tabs>
    </div>
  );
}
