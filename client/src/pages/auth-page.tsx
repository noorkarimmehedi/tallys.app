import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useToast } from "@/hooks/use-toast";
import { Tiles } from "@/components/ui/tiles";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { GoogleAuthCard } from "@/components/ui/google-auth-card";
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
          <div className="flex flex-col items-center mb-4 text-center">
            <div className="mb-4 flex items-center justify-center">
              <img src={logoImage} alt="Logo" className="h-16 w-auto" />
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <TypewriterEffectSmooth
                words={[
                  { text: "Welcome to tallys", className: "text-blue-500 dark:text-blue-500" },
                ]}
                className="mb-2"
              />
              <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-lg mt-3 mb-4">
                The smart way to create forms and schedule events
              </p>
            </div>
          </div>

          {/* Modern Auth Card with Particles */}
          <GoogleAuthCard
            onGoogleSignIn={handleGoogleSignIn}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
}