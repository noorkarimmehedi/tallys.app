import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useToast } from "@/hooks/use-toast";
import { Tiles } from "@/components/ui/tiles";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { GoogleAuthCard } from "@/components/ui/google-auth-card";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat-bubble";

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
            
            <div className="flex flex-col items-center justify-center mb-6 w-full max-w-lg">
              <div className="w-full max-w-md mx-auto">
                <ChatBubble variant="received">
                  <ChatBubbleAvatar fallback="U" />
                  <ChatBubbleMessage>
                    <p className="text-sm sm:text-base font-medium">What is tallys?</p>
                  </ChatBubbleMessage>
                </ChatBubble>
                
                <div className="flex flex-row-reverse items-start gap-2 mb-4">
                  <div className="flex flex-col items-end">
                    <ChatBubbleMessage variant="sent" className="text-sm sm:text-base leading-relaxed mb-2">
                      <div className="text-left">
                        <p>
                          tallys is an all-in-one platform designed to simplify form creation and event scheduling.
                        </p>
                        <p className="mt-2">
                          It lets you build beautiful interactive forms, organize questions into customizable sections, and easily schedule appointments with clients.
                        </p>
                        <p className="mt-2">
                          With tallys, you can brand your forms with your company logo, share them via simple links, and manage responses all in one place.
                        </p>
                      </div>
                    </ChatBubbleMessage>
                    <ChatBubbleAvatar fallback="T" />
                  </div>
                </div>
              </div>
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