import React from "react";
import { EvervaultCard, Icon } from "@/components/ui/evervault-card";

export function EvervaultCardDemo() {
  return (
    <div className="border border-black/[0.2] dark:border-white/[0.2] flex flex-col items-start max-w-lg mx-auto p-4 relative md:h-[28rem] h-auto mb-2">
      <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

      <div className="w-full md:min-h-[240px] min-h-[120px] flex items-center justify-center">
        <EvervaultCard 
          text="tallys" 
          className="md:h-[240px] h-28" 
        />
      </div>
      
      {/* Description visible on desktop */}
      <div className="mt-4 hidden md:block dark:text-white text-black w-full">
        <h2 className="text-lg md:text-xl font-medium mb-2">What is tallys?</h2>
        <p className="text-sm font-light mb-3">
          tallys is an all-in-one platform designed to simplify form creation and event scheduling.
        </p>
        <p className="text-sm font-light">
          Build forms, schedule events, brand with your logo, and manage responses all in one place.
        </p>
      </div>
      
      {/* Only show this on mobile */}
      <div className="mt-2 md:hidden dark:text-white text-black w-full">
        <h2 className="text-lg font-medium mb-1">What is tallys?</h2>
        <p className="text-xs font-light mb-1">
          tallys is an all-in-one platform designed to simplify form creation and event scheduling.
        </p>
        <p className="text-xs font-light">
          Build forms, schedule events, brand with your logo, and manage responses all in one place.
        </p>
      </div>
    </div>
  );
}