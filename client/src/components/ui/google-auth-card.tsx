"use client";

import React, { useRef } from "react";
import { useAnimate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HighlighterItem, HighlightGroup, Particles } from "@/components/ui/highlighter";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";

interface GoogleAuthCardProps {
  onGoogleSignIn: () => Promise<void>;
  isLoading: boolean;
}

export function GoogleAuthCard({ onGoogleSignIn, isLoading }: GoogleAuthCardProps) {
  const [scope, animate] = useAnimate();

  return (
    <section className="relative mx-auto my-4 max-w-md w-full">
      <HighlightGroup className="group h-full">
        <div
          className="group/item h-full"
          data-aos="fade-down"
        >
          <HighlighterItem className="rounded-3xl p-4">
            <div className="relative z-20 overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-black md:h-[240px] h-auto">
              <Particles
                className="absolute inset-0 -z-10 opacity-10 transition-opacity duration-1000 ease-in-out group-hover/item:opacity-100"
                quantity={200}
                color={"#3b82f6"} // Using primary blue color
                vy={-0.2}
              />
              <div className="flex h-full justify-center">
                <div className="flex h-full flex-col justify-center gap-4 p-6 md:py-8">
                  <div className="flex flex-col items-center">
                    <h3 className="pb-1 font-bold">
                      <span className="text-2xl md:text-3xl">
                        Sign in with Google
                      </span>
                    </h3>
                    <p className="mb-3 text-sm text-slate-500 text-center">
                      Create and manage your forms and events
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
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
                  </div>
                  
                  <p className="text-xs text-slate-500 text-center pb-2">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </HighlighterItem>
        </div>
      </HighlightGroup>
    </section>
  );
}