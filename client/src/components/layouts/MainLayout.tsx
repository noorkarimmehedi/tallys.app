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
          
          {/* Logo - using your updated SVG for immediate rendering without any loading delay */}
          <div className="flex items-center h-16 px-2 border-b border-gray-200 relative z-10">
            <Link href="/" className="flex items-center -ml-3">
              <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                width="170" height="43" viewBox="0 0 694.000000 178.000000"
                preserveAspectRatio="xMidYMid meet" className="h-9">
                <g transform="translate(0.000000,178.000000) scale(0.100000,-0.100000)"
                fill="#000000" stroke="none">
                  <path d="M1762 1558 c3 -7 23 -14 46 -16 l42 -3 0 -515 0 -514 -40 0 c-29 0
                  -40 -4 -40 -15 0 -13 31 -15 215 -15 184 0 215 2 215 15 0 11 -11 15 -40 15
                  l-40 0 0 530 0 530 -181 0 c-140 0 -180 -3 -177 -12z"/>
                  <path d="M2222 1558 c3 -7 23 -14 46 -16 l42 -3 0 -515 0 -514 -40 0 c-29 0
                  -40 -4 -40 -15 0 -13 31 -15 215 -15 184 0 215 2 215 15 0 11 -11 15 -40 15
                  l-40 0 0 530 0 530 -181 0 c-140 0 -180 -3 -177 -12z"/>
                  <path d="M620 1399 c-41 -11 -92 -24 -112 -30 l-38 -10 0 -94 0 -95 -40 0
                  c-51 0 -53 -18 -2 -22 l37 -3 5 -275 c4 -236 7 -280 22 -307 36 -65 104 -93
                  222 -93 101 0 154 22 190 77 33 52 53 120 38 135 -8 8 -14 -1 -23 -35 -16 -65
                  -66 -120 -108 -120 -65 0 -66 1 -69 328 l-3 295 96 0 c57 0 95 4 95 10 0 6
                  -38 10 -95 10 l-95 0 0 125 c0 145 9 137 -120 104z"/>
                  <path d="M5950 1309 c-79 -16 -171 -68 -235 -134 l-60 -62 -47 47 c-82 81
                  -181 124 -300 129 -130 5 -234 -35 -326 -125 -31 -30 -58 -54 -60 -54 -3 0
                  -31 27 -63 59 -120 122 -264 160 -454 119 -27 -6 -52 -14 -55 -17 -3 -3 -22
                  -15 -43 -26 -95 -49 -188 -173 -216 -289 -55 -224 80 -463 304 -540 56 -18
                  201 -22 255 -5 19 5 42 12 51 14 31 7 131 77 173 122 l43 45 29 -35 c49 -59
                  118 -106 204 -138 47 -18 53 -19 145 -19 133 0 222 38 321 137 l55 56 16 -23
                  c24 -35 96 -100 110 -100 3 0 14 -6 22 -14 34 -30 142 -56 231 -56 139 0 246
                  46 336 143 82 88 109 153 121 282 12 150 -54 299 -181 403 -88 72 -249 107
                  -376 81z"/>
                  <path d="M1216 1179 c-75 -11 -140 -43 -167 -81 -45 -63 -30 -171 27 -197 35
                  -16 100 -14 134 4 40 21 60 53 60 96 0 51 -8 69 -32 69 -16 0 -19 6 -16 37 6
                  71 93 82 119 16 6 -16 14 -90 17 -165 l5 -138 -75 0 c-142 0 -248 -34 -281
                  -90 -50 -84 -21 -195 63 -238 39 -20 57 -23 131 -20 94 3 113 12 150 73 11 17
                  19 23 19 14 0 -23 52 -68 91 -79 18 -6 66 -10 105 -10 57 0 78 4 105 23 41 27
                  66 74 75 145 8 66 -11 71 -21 5 -7 -51 -21 -83 -39 -95 -14 -10 -18 -10 -36 2
                  -12 8 -16 50 -20 237 -5 188 -9 235 -23 268 -26 59 -65 94 -122 110 -67 19
                  -196 26 -269 14z m143 -466 c-1 -102 -15 -160 -45 -180 -19 -12 -24 -12 -38 2
                  -12 13 -16 36 -16 101 0 111 26 163 83 164 15 0 17 -10 16 -87z"/>
                  <path d="M3688 1180 c-121 -21 -191 -109 -191 -240 0 -124 61 -183 240 -235
                  168 -49 200 -76 177 -144 -19 -53 -129 -77 -228 -50 -57 16 -119 79 -152 154
                  -15 35 -32 62 -36 59 -4 -3 -8 -61 -8 -130 0 -104 2 -124 15 -124 8 0 15 4 15
                  10 0 5 11 17 25 26 23 15 28 14 89 -10 51 -20 81 -26 143 -26 177 1 266 84
                  266 245 0 131 -55 190 -223 241 -143 43 -170 55 -187 81 -21 31 -9 68 29 96
                  21 16 43 21 91 21 99 0 171 -52 218 -156 7 -16 16 -28 21 -28 4 0 8 50 8 110
                  0 61 -2 110 -5 110 -3 0 -16 -12 -29 -26 l-22 -27 -60 21 c-75 26 -136 33
                  -196 22z"/>
                  <path d="M2680 1160 c0 -5 12 -10 28 -10 27 0 29 -6 152 -335 l125 -335 63 0
                  c73 0 71 11 20 -122 -54 -142 -128 -220 -192 -204 -43 11 -41 73 2 78 30 3 37
                  22 27 74 -16 87 -171 101 -215 20 -21 -40 -17 -108 8 -143 44 -62 174 -83 258
                  -42 87 42 115 100 294 622 l134 387 38 0 c21 0 38 5 38 10 0 6 -42 10 -105 10
                  -63 0 -105 -4 -105 -10 0 -5 20 -10 45 -10 29 0 45 -4 45 -12 0 -18 -154 -458
                  -160 -458 -3 0 -39 100 -79 223 -41 122 -76 228 -78 235 -4 8 7 12 36 12 23 0
                  41 5 41 10 0 6 -77 10 -210 10 -133 0 -210 -4 -210 -10z"/>
                </g>
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
        {/* Top Navigation Bar - with your updated SVG for instant logo rendering */}
        <div className="flex items-center justify-between h-16 px-2 border-b border-gray-200 bg-white/80 backdrop-blur-sm md:hidden">
          <div className="-ml-3">
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
              width="130" height="33" viewBox="0 0 694.000000 178.000000"
              preserveAspectRatio="xMidYMid meet" className="h-7">
              <g transform="translate(0.000000,178.000000) scale(0.100000,-0.100000)"
              fill="#000000" stroke="none">
                <path d="M1762 1558 c3 -7 23 -14 46 -16 l42 -3 0 -515 0 -514 -40 0 c-29 0
                -40 -4 -40 -15 0 -13 31 -15 215 -15 184 0 215 2 215 15 0 11 -11 15 -40 15
                l-40 0 0 530 0 530 -181 0 c-140 0 -180 -3 -177 -12z"/>
                <path d="M2222 1558 c3 -7 23 -14 46 -16 l42 -3 0 -515 0 -514 -40 0 c-29 0
                -40 -4 -40 -15 0 -13 31 -15 215 -15 184 0 215 2 215 15 0 11 -11 15 -40 15
                l-40 0 0 530 0 530 -181 0 c-140 0 -180 -3 -177 -12z"/>
                <path d="M620 1399 c-41 -11 -92 -24 -112 -30 l-38 -10 0 -94 0 -95 -40 0
                c-51 0 -53 -18 -2 -22 l37 -3 5 -275 c4 -236 7 -280 22 -307 36 -65 104 -93
                222 -93 101 0 154 22 190 77 33 52 53 120 38 135 -8 8 -14 -1 -23 -35 -16 -65
                -66 -120 -108 -120 -65 0 -66 1 -69 328 l-3 295 96 0 c57 0 95 4 95 10 0 6
                -38 10 -95 10 l-95 0 0 125 c0 145 9 137 -120 104z"/>
                <path d="M5950 1309 c-79 -16 -171 -68 -235 -134 l-60 -62 -47 47 c-82 81
                -181 124 -300 129 -130 5 -234 -35 -326 -125 -31 -30 -58 -54 -60 -54 -3 0
                -31 27 -63 59 -120 122 -264 160 -454 119 -27 -6 -52 -14 -55 -17 -3 -3 -22
                -15 -43 -26 -95 -49 -188 -173 -216 -289 -55 -224 80 -463 304 -540 56 -18
                201 -22 255 -5 19 5 42 12 51 14 31 7 131 77 173 122 l43 45 29 -35 c49 -59
                118 -106 204 -138 47 -18 53 -19 145 -19 133 0 222 38 321 137 l55 56 16 -23
                c24 -35 96 -100 110 -100 3 0 14 -6 22 -14 34 -30 142 -56 231 -56 139 0 246
                46 336 143 82 88 109 153 121 282 12 150 -54 299 -181 403 -88 72 -249 107
                -376 81z"/>
                <path d="M1216 1179 c-75 -11 -140 -43 -167 -81 -45 -63 -30 -171 27 -197 35
                -16 100 -14 134 4 40 21 60 53 60 96 0 51 -8 69 -32 69 -16 0 -19 6 -16 37 6
                71 93 82 119 16 6 -16 14 -90 17 -165 l5 -138 -75 0 c-142 0 -248 -34 -281
                -90 -50 -84 -21 -195 63 -238 39 -20 57 -23 131 -20 94 3 113 12 150 73 11 17
                19 23 19 14 0 -23 52 -68 91 -79 18 -6 66 -10 105 -10 57 0 78 4 105 23 41 27
                66 74 75 145 8 66 -11 71 -21 5 -7 -51 -21 -83 -39 -95 -14 -10 -18 -10 -36 2
                -12 8 -16 50 -20 237 -5 188 -9 235 -23 268 -26 59 -65 94 -122 110 -67 19
                -196 26 -269 14z m143 -466 c-1 -102 -15 -160 -45 -180 -19 -12 -24 -12 -38 2
                -12 13 -16 36 -16 101 0 111 26 163 83 164 15 0 17 -10 16 -87z"/>
                <path d="M3688 1180 c-121 -21 -191 -109 -191 -240 0 -124 61 -183 240 -235
                168 -49 200 -76 177 -144 -19 -53 -129 -77 -228 -50 -57 16 -119 79 -152 154
                -15 35 -32 62 -36 59 -4 -3 -8 -61 -8 -130 0 -104 2 -124 15 -124 8 0 15 4 15
                10 0 5 11 17 25 26 23 15 28 14 89 -10 51 -20 81 -26 143 -26 177 1 266 84
                266 245 0 131 -55 190 -223 241 -143 43 -170 55 -187 81 -21 31 -9 68 29 96
                21 16 43 21 91 21 99 0 171 -52 218 -156 7 -16 16 -28 21 -28 4 0 8 50 8 110
                0 61 -2 110 -5 110 -3 0 -16 -12 -29 -26 l-22 -27 -60 21 c-75 26 -136 33
                -196 22z"/>
                <path d="M2680 1160 c0 -5 12 -10 28 -10 27 0 29 -6 152 -335 l125 -335 63 0
                c73 0 71 11 20 -122 -54 -142 -128 -220 -192 -204 -43 11 -41 73 2 78 30 3 37
                22 27 74 -16 87 -171 101 -215 20 -21 -40 -17 -108 8 -143 44 -62 174 -83 258
                -42 87 42 115 100 294 622 l134 387 38 0 c21 0 38 5 38 10 0 6 -42 10 -105 10
                -63 0 -105 -4 -105 -10 0 -5 20 -10 45 -10 29 0 45 -4 45 -12 0 -18 -154 -458
                -160 -458 -3 0 -39 100 -79 223 -41 122 -76 228 -78 235 -4 8 7 12 36 12 23 0
                41 5 41 10 0 6 -77 10 -210 10 -133 0 -210 -4 -210 -10z"/>
              </g>
            </svg>
          </div>
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
