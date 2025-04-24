import React, { useState } from "react";
import { Link, useLocation } from "wouter";

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
    <div 
      className="flex h-screen overflow-hidden" 
      style={{
        backgroundImage: `url("/attached_assets/Image 4-24-25 at 7.53 PM.jpeg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Sidebar */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:flex md:flex-shrink-0 fixed inset-0 z-50 md:relative md:z-auto`}>
        <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <Link href="/">
              <a className="text-2xl font-medium font-['Alternate_Gothic', 'sans-serif']">tallys</a>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 pt-4 pb-4 overflow-y-auto">
            <div className="px-4 space-y-1">
              {/* Home Navigation Item */}
              <Link href="/">
                <a className={`flex items-center px-4 py-3 text-sm font-medium rounded-md group
                  ${location === "/" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-100"}`}>
                  <i className={`ri-home-line mr-3 text-lg ${location === "/" ? "text-gray-800" : "text-gray-600"}`}></i>
                  <span className="font-['Alternate_Gothic', 'sans-serif'] tracking-wide text-base">Home</span>
                </a>
              </Link>
              
              {/* Inbox Navigation Item */}
              <Link href="/inbox">
                <a className={`flex items-center px-4 py-3 text-sm font-medium rounded-md group
                  ${location === "/inbox" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-100"}`}>
                  <i className={`ri-inbox-line mr-3 text-lg ${location === "/inbox" ? "text-gray-800" : "text-gray-600"}`}></i>
                  <span className="font-['Alternate_Gothic', 'sans-serif'] tracking-wide text-base">Inbox</span>
                </a>
              </Link>
              
              {/* Calendar Navigation Item */}
              <Link href="/calendar">
                <a className={`flex items-center px-4 py-3 text-sm font-medium rounded-md group
                  ${location === "/calendar" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-100"}`}>
                  <i className={`ri-calendar-line mr-3 text-lg ${location === "/calendar" ? "text-gray-800" : "text-gray-600"}`}></i>
                  <span className="font-['Alternate_Gothic', 'sans-serif'] tracking-wide text-base">Calendar</span>
                </a>
              </Link>
              
              {/* Settings Navigation Item */}
              <Link href="/settings">
                <a className={`flex items-center px-4 py-3 text-sm font-medium rounded-md group
                  ${location === "/settings" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-100"}`}>
                  <i className={`ri-settings-3-line mr-3 text-lg ${location === "/settings" ? "text-gray-800" : "text-gray-600"}`}></i>
                  <span className="font-['Alternate_Gothic', 'sans-serif'] tracking-wide text-base">Settings</span>
                </a>
              </Link>
            </div>
            
            {/* Workspace Section */}
            <div className="mt-8">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Workspaces</h3>
              <div className="mt-2 px-4 space-y-1">
                <a href="#personal" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 group">
                  <span className="w-2 h-2 mr-3 bg-blue-500 rounded-full"></span>
                  <span>Personal</span>
                </a>
                <a href="#work" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 group">
                  <span className="w-2 h-2 mr-3 bg-green-500 rounded-full"></span>
                  <span>Work</span>
                </a>
              </div>
            </div>
          </nav>
          
          {/* User Profile */}
          <div className="flex items-center px-6 py-3 border-t border-gray-200">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <i className="ri-user-line text-gray-600"></i>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">Demo User</p>
              <p className="text-xs text-gray-500">Pro Plan</p>
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
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white md:hidden">
          <h1 className="text-xl font-medium font-['Alternate_Gothic', 'sans-serif']">tallys</h1>
          <button 
            type="button" 
            className="text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className="ri-menu-line text-2xl"></i>
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
