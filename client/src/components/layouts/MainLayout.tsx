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
          
          {/* Logo - using inline SVG for immediate rendering without any loading delay */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200 relative z-10">
            <Link href="/" className="flex items-center">
              <svg
                width="160"
                height="40"
                viewBox="0 0 640 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-8"
              >
                <path
                  d="M140 20H40C28.9543 20 20 28.9543 20 40V120C20 131.046 28.9543 140 40 140H140C151.046 140 160 131.046 160 120V40C160 28.9543 151.046 20 140 20Z"
                  fill="black"
                />
                <path d="M100 60H80V100H100V60Z" fill="white" />
                <path d="M60 60H40V80H60V60Z" fill="white" />
                <path d="M140 60H120V80H140V60Z" fill="white" />
                <path d="M120 100H100V120H120V100Z" fill="white" />
                <path d="M60 100H40V120H60V100Z" fill="white" />
                <path d="M220 50H200V110H220V50Z" fill="black" />
                <path d="M280 50H240V70H280V50Z" fill="black" />
                <path d="M280 70H260V110H280V70Z" fill="black" />
                <path d="M340 50H300V70H340V50Z" fill="black" />
                <path d="M340 90H300V110H340V90Z" fill="black" />
                <path d="M320 70H300V90H320V70Z" fill="black" />
                <path d="M400 50H360V110H400V50Z" fill="black" />
                <path d="M380 50H360V110H380V50Z" fill="black" />
                <path d="M440 50H420V110H440V50Z" fill="black" />
                <path d="M500 50H460V70H500V50Z" fill="black" />
                <path d="M480 70H460V110H480V70Z" fill="black" />
                <path d="M560 50H520V110H560V50Z" fill="black" />
                <path d="M540 50H520V110H540V50Z" fill="black" />
                <path d="M620 50H580V110H620V50Z" fill="black" />
                <path d="M620 50H580V70H620V50Z" fill="black" />
                <path d="M620 90H580V110H620V90Z" fill="black" />
              </svg>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 pt-2 pb-2 overflow-y-auto relative z-10">
            {/* Original Navigation Items */}
            <div className="px-3 space-y-0.5 font-medium mb-3">
              {/* Home Navigation Item with Grid 2x2 Icon */}
              <MagnetizeNavItem
                href="/"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-grid-2x2">
                    <path d="M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                label="Home"
                isActive={location === "/"}
                particleCount={12}
                attractRadius={40}
              />
              
              {/* Inbox Navigation Item with Lucide Icon */}
              <MagnetizeNavItem
                href="/inbox"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-inbox">
                    <rect width="18" height="14" x="3" y="5" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                label="Inbox"
                isActive={location === "/inbox"}
                particleCount={12}
                attractRadius={40}
              />
              
              {/* Calendar Navigation Item with Lucide Icon */}
              <MagnetizeNavItem
                href="/calendar"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-calendar">
                    <rect width="18" height="16" x="3" y="4" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                label="Calendar"
                isActive={location === "/calendar"}
                particleCount={12}
                attractRadius={40}
              />
              
              {/* Settings Navigation Item with Cog Icon */}
              <MagnetizeNavItem
                href="/settings"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-cog">
                    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 22v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="m17 20.66-1-1.73" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11 10.27 7 3.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="m20.66 17-1.73-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="m3.34 7 1.73 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="m20.66 7-1.73 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="m3.34 17 1.73-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="m17 3.34-1 1.73" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="m11 13.73-4 6.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                label="Settings"
                isActive={location === "/settings"}
                particleCount={12}
                attractRadius={40}
              />
            </div>
            
            {/* Account Management Section */}
            <div className="px-3 mb-3">
              <h3 className="text-xs uppercase text-gray-700 mb-1 px-2" style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 800 }}>Account</h3>
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
              <h3 className="text-xs uppercase text-gray-700 mb-1 px-2" style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 800 }}>Workspaces</h3>
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
              <h3 className="text-xs uppercase text-gray-700 mb-1 px-2" style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 800 }}>Product</h3>
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
              <h3 className="text-xs uppercase text-gray-700 mb-1 px-2" style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 800 }}>Help</h3>
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
        {/* Top Navigation Bar - with inline SVG for instant logo rendering */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm md:hidden">
          <svg
            width="120"
            height="30"
            viewBox="0 0 640 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6"
          >
            <path
              d="M140 20H40C28.9543 20 20 28.9543 20 40V120C20 131.046 28.9543 140 40 140H140C151.046 140 160 131.046 160 120V40C160 28.9543 151.046 20 140 20Z"
              fill="black"
            />
            <path d="M100 60H80V100H100V60Z" fill="white" />
            <path d="M60 60H40V80H60V60Z" fill="white" />
            <path d="M140 60H120V80H140V60Z" fill="white" />
            <path d="M120 100H100V120H120V100Z" fill="white" />
            <path d="M60 100H40V120H60V100Z" fill="white" />
            <path d="M220 50H200V110H220V50Z" fill="black" />
            <path d="M280 50H240V70H280V50Z" fill="black" />
            <path d="M280 70H260V110H280V70Z" fill="black" />
            <path d="M340 50H300V70H340V50Z" fill="black" />
            <path d="M340 90H300V110H340V90Z" fill="black" />
            <path d="M320 70H300V90H320V70Z" fill="black" />
            <path d="M400 50H360V110H400V50Z" fill="black" />
            <path d="M380 50H360V110H380V50Z" fill="black" />
            <path d="M440 50H420V110H440V50Z" fill="black" />
            <path d="M500 50H460V70H500V50Z" fill="black" />
            <path d="M480 70H460V110H480V70Z" fill="black" />
            <path d="M560 50H520V110H560V50Z" fill="black" />
            <path d="M540 50H520V110H540V50Z" fill="black" />
            <path d="M620 50H580V110H620V50Z" fill="black" />
            <path d="M620 50H580V70H620V50Z" fill="black" />
            <path d="M620 90H580V110H620V90Z" fill="black" />
          </svg>
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
