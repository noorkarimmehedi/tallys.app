import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Tiles } from "@/components/ui/tiles";
import { 
  Home, Inbox, CalendarDays, Settings, User, Menu, LayoutGrid, 
  LogOut, Globe, Crown, Users, Briefcase, FileText, 
  Star, MessageSquare, Trash2, HelpCircle
} from "lucide-react";
import { MagnetizeNavItem } from "@/components/ui/magnetize-nav-item";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useAuth } from "@/hooks/use-auth";
import logoImage from "@/assets/logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MainLayoutProps {
  children: React.ReactNode;
}

// User Profile Section component
function UserProfileSection() {
  const { currentUser, signOut } = useFirebaseAuth();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const displayName = currentUser?.displayName || user?.username || "User";
  const email = currentUser?.email || user?.email || "";
  const photoURL = currentUser?.photoURL;
  
  // Get initials from display name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 relative z-10 bg-blue-50/40">
      <div className="flex items-center">
        <Avatar className="h-8 w-8 rounded-full border-2 border-blue-100">
          {photoURL ? (
            <AvatarImage src={photoURL} alt={displayName} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="ml-2 overflow-hidden">
          <p className="text-xs font-medium text-gray-800 truncate">{displayName}</p>
          <p className="text-[10px] text-gray-500 truncate">{email}</p>
        </div>
      </div>
      
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleSignOut}
              className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 text-gray-600" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Sign out</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
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
        <div className="flex flex-col w-52 bg-white/80 backdrop-blur-sm border-r border-gray-200 h-full relative overflow-hidden" style={{ fontFamily: 'Alternate Gothic No2 BT, sans-serif', fontSize: '13px', letterSpacing: '0.02em' }}>
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
            {/* Original Navigation Items */}
            <div className="px-3 space-y-0.5 font-medium mb-3">
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
            
            {/* Account Management Section */}
            <div className="px-3 mb-3">
              <h3 className="text-xs uppercase text-gray-500 mb-1 px-2" style={{ fontFamily: 'Chivo, sans-serif', fontWeight: 500 }}>Account</h3>
              <div className="space-y-0.5 font-medium">
                <MagnetizeNavItem
                  href="/members"
                  icon={<Users />}
                  label="Members"
                  isActive={location === "/members"}
                  particleCount={12}
                  attractRadius={40}
                />
                
                <MagnetizeNavItem
                  href="/domains"
                  icon={<Globe />}
                  label="Domains"
                  isActive={location === "/domains"}
                  particleCount={12}
                  attractRadius={40}
                />
                
                <MagnetizeNavItem
                  href="/upgrade"
                  icon={<Crown />}
                  label="Upgrade plan"
                  isActive={location === "/upgrade"}
                  particleCount={12}
                  attractRadius={40}
                />
              </div>
            </div>
            
            {/* Workspaces Section */}
            <div className="px-3 mb-3">
              <h3 className="text-xs uppercase text-gray-500 mb-1 px-2" style={{ fontFamily: 'Chivo, sans-serif', fontWeight: 500 }}>Workspaces</h3>
              <div className="space-y-0.5 font-medium">
                <MagnetizeNavItem
                  href="/workspace"
                  icon={<Briefcase className="text-blue-500" />}
                  label={<span className="flex items-center"><span className="text-blue-500 mr-1">›</span> My workspace</span>}
                  isActive={location === "/workspace"}
                  particleCount={12}
                  attractRadius={40}
                />
              </div>
            </div>
            
            {/* Product Section */}
            <div className="px-3 mb-3">
              <h3 className="text-xs uppercase text-gray-500 mb-1 px-2" style={{ fontFamily: 'Chivo, sans-serif', fontWeight: 500 }}>Product</h3>
              <div className="space-y-0.5 font-medium">
                <MagnetizeNavItem
                  href="/templates"
                  icon={<FileText />}
                  label="Templates"
                  isActive={location === "/templates"}
                  particleCount={12}
                  attractRadius={40}
                />
                
                <MagnetizeNavItem
                  href="/whats-new"
                  icon={<Star />}
                  label="What's new"
                  isActive={location === "/whats-new"}
                  particleCount={12}
                  attractRadius={40}
                />
                
                <MagnetizeNavItem
                  href="/feature-requests"
                  icon={<MessageSquare />}
                  label="Feature requests"
                  isActive={location === "/feature-requests"}
                  particleCount={12}
                  attractRadius={40}
                />
                
                <MagnetizeNavItem
                  href="/trash"
                  icon={<Trash2 />}
                  label="Trash"
                  isActive={location === "/trash"}
                  particleCount={12}
                  attractRadius={40}
                />
              </div>
            </div>
            
            {/* Help Section */}
            <div className="px-3 mb-2">
              <h3 className="text-xs uppercase text-gray-500 mb-1 px-2" style={{ fontFamily: 'Chivo, sans-serif', fontWeight: 500 }}>Help</h3>
              <div className="space-y-0.5 font-medium">
                <MagnetizeNavItem
                  href="/support"
                  icon={<HelpCircle />}
                  label="Contact support"
                  isActive={location === "/support"}
                  particleCount={12}
                  attractRadius={40}
                />
              </div>
            </div>
          </nav>
          
          {/* User Profile */}
          <UserProfileSection />
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
