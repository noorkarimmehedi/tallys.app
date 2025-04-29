import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useToast } from "@/hooks/use-toast";
import { Tiles } from "@/components/ui/tiles";
import { GoogleAuthCard } from "@/components/ui/google-auth-card";
import { EvervaultCardDemo } from "@/components/ui/evervault-card-demo";
import { AnimatePresence, motion } from "framer-motion";

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { currentUser, loading, signInWithGoogle } = useFirebaseAuth();
  const { toast } = useToast();
  // Use state to manage UI components visibility with smooth transitions
  const [showTallyCard, setShowTallyCard] = useState(true);

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

      <div className="w-full max-w-6xl mx-auto px-4 pt-2 sm:pt-16 pb-8 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center justify-center">
          {/* App Logo & Title with Animation */}
          <div className="flex flex-col items-center mb-4 text-center">
            <AnimatePresence>
              {showTallyCard && (
                <motion.div 
                  className="flex flex-col items-center justify-center mb-1 md:mb-3 w-full max-w-lg"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <EvervaultCardDemo />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Modern Auth Card with Particles */}
          <div className="w-full max-w-lg mx-auto">
            <GoogleAuthCard
              onGoogleSignIn={handleGoogleSignIn}
              isLoading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}