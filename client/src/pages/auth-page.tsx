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
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
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
          {/* App Logo with Vertical Cut Reveal Animation */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="mb-4 flex items-center justify-center">
              <img src={logoImage} alt="Logo" className="h-16 w-auto" />
            </div>
            
            <div className="w-full text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl flex flex-col items-center justify-center font-medium p-4 tracking-wide text-primary">
              <VerticalCutReveal
                splitBy="characters"
                staggerDuration={0.025}
                staggerFrom="first"
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 21,
                }}
                containerClassName="text-center mb-2"
              >
                {`Welcome to tallys!`}
              </VerticalCutReveal>
              
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.1}
                staggerFrom="center"
                reverse={true}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 21,
                  delay: 0.7,
                }}
                containerClassName="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 mt-2 mb-6 text-center"
              >
                {`The smart way to create forms and schedule events`}
              </VerticalCutReveal>
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


        </div>
      </div>
    </div>
  );
}