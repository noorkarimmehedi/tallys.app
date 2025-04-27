import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { AnimatedGridBackground } from "@/components/ui/animated-grid-background";
import { GoogleButton } from "@/components/ui/google-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tiles } from "@/components/ui/tiles";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import logoImage from "../assets/lgoooo.png";

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { currentUser, loading, signInWithGoogle } = useFirebaseAuth();
  const { toast } = useToast();

  // If already logged in, redirect to home
  useEffect(() => {
    if (currentUser) {
      toast({
        title: "Welcome back!",
        description: "You are now signed in.",
      });
      navigate("/");
    }
  }, [currentUser, navigate, toast]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Failed to sign in with Google", error);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Beautiful Animated Grid Background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute inset-0">
          <Tiles 
            rows={50} 
            cols={50} 
            tileSize="sm" 
            className="opacity-20"
          />
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 pt-16 pb-8 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center justify-center">
          {/* App Logo & Title with Typewriter Effect */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <img src={logoImage} alt="Logo" className="h-10" />
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <TypewriterEffectSmooth
                words={[
                  { text: "Welcome" },
                  { text: "to" },
                  { text: "Tallys", className: "text-blue-500 dark:text-blue-500" },
                ]}
                className="mb-2"
              />
              <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base mt-1 mb-6">
                The smart way to create forms and schedule events
              </p>
            </div>
          </div>

          {/* Auth Card */}
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/70">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
                <CardDescription>
                  Sign in to access your forms and events
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4 pt-4">
                <GoogleButton 
                  onClick={handleGoogleSignIn} 
                  isLoading={loading}
                  className="w-full"
                />
              </CardContent>
              <CardFooter className="flex flex-col text-center text-sm text-muted-foreground">
                <p>
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </CardFooter>
            </Card>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-xl bg-white/40 backdrop-blur-sm flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Build Forms</h3>
              <p className="mt-2 text-sm text-muted-foreground">Create beautiful, responsive forms with a simple drag-and-drop interface.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/40 backdrop-blur-sm flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Schedule Events</h3>
              <p className="mt-2 text-sm text-muted-foreground">Let clients book appointments without the back-and-forth emails.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/40 backdrop-blur-sm flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Analyze Results</h3>
              <p className="mt-2 text-sm text-muted-foreground">Get insights from your form responses and manage bookings in one place.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}