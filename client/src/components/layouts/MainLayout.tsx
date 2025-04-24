import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Tiles } from "@/components/ui/tiles";
import { Home, Inbox, CalendarDays, Settings, User, Menu, LayoutGrid, BarChart } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Determine if we're on a form page (no navbar/sidebar needed)
  const isFormPage = location.startsWith("/f/");
  
  if (isFormPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Grid Tiles Background for main content */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <Tiles 
          rows={50} 
          cols={15}
          tileSize="md"
          tileClassName="opacity-50 dark:opacity-30"
        />
      </div>
    
      {/* Sidebar */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:flex md:flex-shrink-0 fixed inset-0 z-50 md:relative md:z-auto`}>
        <div className="flex flex-col w-52 bg-white/80 backdrop-blur-sm border-r border-gray-200 h-full relative overflow-hidden">
          {/* Grid Tiles Background for sidebar */}
          <div className="absolute inset-0 overflow-hidden z-0">
            <Tiles 
              rows={30} 
              cols={8}
              tileSize="sm"
              tileClassName="opacity-30 dark:opacity-20"
            />
          </div>
          
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200 relative z-10">
            <Link href="/">
              <a className="text-2xl font-medium font-['Alternate_Gothic', 'sans-serif']">tallys</a>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 pt-2 pb-2 overflow-y-auto relative z-10">
            <div className="px-3 space-y-0.5">
              {/* Home Navigation Item */}
              <Link href="/">
                <a className={`flex items-center px-3 py-2 text-xs font-medium rounded-md group
                  ${location === "/" ? "bg-gray-100/80 text-gray-900" : "text-gray-600 hover:bg-gray-100/50"}`}>
                  <Home className={`mr-2 h-4 w-4 ${location === "/" ? "text-gray-800" : "text-gray-600"}`} />
                  <span className="font-['Alternate_Gothic', 'sans-serif'] tracking-wide text-sm">Home</span>
                </a>
              </Link>
              
              {/* Inbox Navigation Item */}
              <Link href="/inbox">
                <a className={`flex items-center px-3 py-2 text-xs font-medium rounded-md group
                  ${location === "/inbox" ? "bg-gray-100/80 text-gray-900" : "text-gray-600 hover:bg-gray-100/50"}`}>
                  <Inbox className={`mr-2 h-4 w-4 ${location === "/inbox" ? "text-gray-800" : "text-gray-600"}`} />
                  <span className="font-['Alternate_Gothic', 'sans-serif'] tracking-wide text-sm">Inbox</span>
                </a>
              </Link>
              
              {/* Calendar Navigation Item */}
              <Link href="/calendar">
                <a className={`flex items-center px-3 py-2 text-xs font-medium rounded-md group
                  ${location === "/calendar" ? "bg-gray-100/80 text-gray-900" : "text-gray-600 hover:bg-gray-100/50"}`}>
                  <CalendarDays className={`mr-2 h-4 w-4 ${location === "/calendar" ? "text-gray-800" : "text-gray-600"}`} />
                  <span className="font-['Alternate_Gothic', 'sans-serif'] tracking-wide text-sm">Calendar</span>
                </a>
              </Link>
              
              {/* Form Demo Navigation Item */}
              <Link href="/form-demo">
                <a className={`flex items-center px-3 py-2 text-xs font-medium rounded-md group
                  ${location === "/form-demo" ? "bg-gray-100/80 text-gray-900" : "text-gray-600 hover:bg-gray-100/50"}`}>
                  <LayoutGrid className={`mr-2 h-4 w-4 ${location === "/form-demo" ? "text-gray-800" : "text-gray-600"}`} />
                  <span className="font-['Alternate_Gothic', 'sans-serif'] tracking-wide text-sm">Form Demo</span>
                </a>
              </Link>

              {/* Settings Navigation Item */}
              <Link href="/settings">
                <a className={`flex items-center px-3 py-2 text-xs font-medium rounded-md group
                  ${location === "/settings" ? "bg-gray-100/80 text-gray-900" : "text-gray-600 hover:bg-gray-100/50"}`}>
                  <Settings className={`mr-2 h-4 w-4 ${location === "/settings" ? "text-gray-800" : "text-gray-600"}`} />
                  <span className="font-['Alternate_Gothic', 'sans-serif'] tracking-wide text-sm">Settings</span>
                </a>
              </Link>
            </div>
            
            {/* Workspace Section */}
            <div className="mt-5 relative z-10">
              <h3 className="px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Workspaces</h3>
              <div className="mt-1 px-3 space-y-0.5">
                <a href="#personal" className="flex items-center px-3 py-2 text-xs font-medium text-gray-600 rounded-md hover:bg-gray-100/50 group">
                  <span className="w-2 h-2 mr-2 bg-blue-500 rounded-full"></span>
                  <span>Personal</span>
                </a>
                <a href="#work" className="flex items-center px-3 py-2 text-xs font-medium text-gray-600 rounded-md hover:bg-gray-100/50 group">
                  <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
                  <span>Work</span>
                </a>
              </div>
            </div>
          </nav>
          
          {/* User Profile */}
          <div className="flex items-center px-4 py-2 border-t border-gray-200 relative z-10">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="h-3 w-3 text-gray-600" />
              </div>
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-800">Demo User</p>
              <p className="text-[10px] text-gray-500">Pro Plan</p>
            </div>
          </div>
        </div>
        
        {/* Mobile overlay */}
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm md:hidden">
          <h1 className="text-xl font-medium font-['Alternate_Gothic', 'sans-serif']">tallys</h1>
          <button 
            type="button" 
            className="text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
