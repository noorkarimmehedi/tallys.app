"use client";

import React, { useRef, useState, useEffect } from "react";
import { useAnimate, motion, AnimatePresence } from "framer-motion";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Button } from "@/components/ui/button";
import { HighlighterItem, HighlightGroup, Particles } from "@/components/ui/highlighter";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface GoogleAuthCardProps {
  onGoogleSignIn: () => Promise<void>;
  isLoading: boolean;
}

export function GoogleAuthCard({ onGoogleSignIn, isLoading }: GoogleAuthCardProps) {
  const [scope, animate] = useAnimate();
  const { currentUser, loading: authLoading } = useFirebaseAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const isMobile = useIsMobile();

  // Sequence the animations for a smoother experience
  useEffect(() => {
    // Card container appears first
    const cardTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100); 
    
    // Then the content fades in for a nice "reveal" effect
    const contentTimer = setTimeout(() => {
      setContentVisible(true);
    }, 350);
    
    return () => {
      clearTimeout(cardTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  // Don't show anything while Firebase auth is initializing
  if (authLoading) {
    return null;
  }

  // If user is already authenticated, don't show the card
  if (currentUser) {
    return null;
  }

  // Define animation properties based on device
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: isMobile ? 10 : 20,
      scale: isMobile ? 0.98 : 1
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: isMobile ? 0.5 : 0.6,
        ease: "easeOut",
        when: "beforeChildren"
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.4,
        ease: "easeInOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.section 
      className="relative mx-auto my-4 w-full"
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      layout
    >
      <HighlightGroup className="group h-full">
        <div className="group/item h-full">
          <HighlighterItem className="rounded-3xl p-4">
            <div className="relative z-20 overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-black md:h-[240px] h-auto md:w-full">
              <Particles
                className="absolute inset-0 -z-10 opacity-10 transition-opacity duration-1000 ease-in-out group-hover/item:opacity-100"
                quantity={isMobile ? 120 : 200}
                color={"#3b82f6"} // Using primary blue color
                vy={-0.2}
              />
              
              <motion.div 
                className="flex h-full justify-center w-full"
                variants={contentVariants}
                initial="hidden"
                animate={contentVisible ? "visible" : "hidden"}
              >
                <div className="flex h-full w-full flex-col justify-center gap-4 p-6 md:py-8">
                  <motion.div className="flex flex-col items-center" variants={itemVariants}>
                    <h3 className="pb-1 font-bold">
                      <span className="text-2xl md:text-3xl">
                        Sign in with Google
                      </span>
                    </h3>
                    <p className="mb-3 text-sm text-slate-500 text-center">
                      Create and manage your forms and events
                    </p>
                  </motion.div>
                  
                  <motion.div className="flex justify-center" variants={itemVariants}>
                    <Button 
                      onClick={onGoogleSignIn} 
                      disabled={isLoading} 
                      className="w-full flex items-center justify-center gap-2 py-4 bg-black hover:bg-gray-800"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FcGoogle className="h-5 w-5" />
                      )}
                      <span>{isLoading ? "Signing in..." : "Sign in with Google"}</span>
                    </Button>
                  </motion.div>
                  
                  <motion.p 
                    className="text-xs text-slate-500 text-center pb-2"
                    variants={itemVariants}
                  >
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </HighlighterItem>
        </div>
      </HighlightGroup>
    </motion.section>
  );
}