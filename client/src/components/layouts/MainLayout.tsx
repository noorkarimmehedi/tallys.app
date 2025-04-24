import React from "react";
import { Link, useLocation } from "wouter";
import { Tiles } from "@/components/ui/tiles";
import { Home, Inbox, CalendarDays, Settings } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  
  // Determine if we're on a form page (no navbar/sidebar needed)
  const isFormPage = location.startsWith("/f/");
  
  if (isFormPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      {/* Grid Tiles Background for main content */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <Tiles 
          rows={50} 
          cols={15}
          tileSize="md"
          tileClassName="opacity-50 dark:opacity-30"
        />
      </div>
    
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <Link href="/" className="text-2xl font-medium font-['Alternate_Gothic', 'sans-serif']">
            tallys
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className={`flex items-center px-3 py-2 text-xs font-medium rounded-md
                ${location === "/" ? "bg-gray-100/80 text-gray-900" : "text-gray-600 hover:bg-gray-100/50"}`}
            >
              <Home className={`mr-2 h-4 w-4 ${location === "/" ? "text-gray-800" : "text-gray-600"}`} />
              <span>Home</span>
            </Link>
            
            <Link 
              href="/inbox" 
              className={`flex items-center px-3 py-2 text-xs font-medium rounded-md
                ${location === "/inbox" ? "bg-gray-100/80 text-gray-900" : "text-gray-600 hover:bg-gray-100/50"}`}
            >
              <Inbox className={`mr-2 h-4 w-4 ${location === "/inbox" ? "text-gray-800" : "text-gray-600"}`} />
              <span>Inbox</span>
            </Link>
            
            <Link 
              href="/calendar" 
              className={`flex items-center px-3 py-2 text-xs font-medium rounded-md
                ${location === "/calendar" ? "bg-gray-100/80 text-gray-900" : "text-gray-600 hover:bg-gray-100/50"}`}
            >
              <CalendarDays className={`mr-2 h-4 w-4 ${location === "/calendar" ? "text-gray-800" : "text-gray-600"}`} />
              <span>Calendar</span>
            </Link>
            
            <Link 
              href="/settings" 
              className={`flex items-center px-3 py-2 text-xs font-medium rounded-md
                ${location === "/settings" ? "bg-gray-100/80 text-gray-900" : "text-gray-600 hover:bg-gray-100/50"}`}
            >
              <Settings className={`mr-2 h-4 w-4 ${location === "/settings" ? "text-gray-800" : "text-gray-600"}`} />
              <span>Settings</span>
            </Link>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-sm p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
