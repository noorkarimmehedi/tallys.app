import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Tiles } from "@/components/ui/tiles";
import { Home, Inbox, CalendarDays, Settings, User, Menu, LayoutGrid, BarChart } from "lucide-react";
import { MagnetizeNavItem } from "@/components/ui/magnetize-nav-item";
import logoImage from "@/assets/logo.png";

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
            <Link href="/" className="flex items-center">
              <img src={logoImage} alt="Logo" className="h-8" />
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 pt-2 pb-2 overflow-y-auto relative z-10">
            <div className="px-3 space-y-0.5">
              {/* Home Navigation Item */}
              <MagnetizeNavItem
                href="/"
                icon={<Home />}
                label="Home"
                isActive={location === "/"}
                particleCount={12}
                attractRadius={40}
              />
              
              {/* Inbox Navigation Item */}
              <MagnetizeNavItem
                href="/inbox"
                icon={<Inbox />}
                label="Inbox"
                isActive={location === "/inbox"}
                particleCount={12}
                attractRadius={40}
              />
              
              {/* Calendar Navigation Item */}
              <MagnetizeNavItem
                href="/calendar"
                icon={<CalendarDays />}
                label="Calendar"
                isActive={location === "/calendar"}
                particleCount={12}
                attractRadius={40}
              />
              
              {/* Settings Navigation Item */}
              <MagnetizeNavItem
                href="/settings"
                icon={<Settings />}
                label="Settings"
                isActive={location === "/settings"}
                particleCount={12}
                attractRadius={40}
              />
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
          <img src={logoImage} alt="Logo" className="h-6" />
          <button 
            type="button" 
            className="text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
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
