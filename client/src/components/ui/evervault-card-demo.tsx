import React from "react";
import { EvervaultCard, Icon } from "@/components/ui/evervault-card";

export function EvervaultCardDemo() {
  const description = `tallys is an all-in-one platform designed to simplify form creation and event scheduling.

Build forms, schedule events, brand with your logo, and manage responses all in one place.`;

  return (
    <div className="border border-black/[0.2] dark:border-white/[0.2] flex flex-col items-start max-w-lg mx-auto p-4 relative md:h-[28rem] h-auto mb-2">
      <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

      <div className="w-full md:min-h-[16rem] min-h-[120px] flex items-center justify-center">
        <EvervaultCard 
          text="tallys" 
          description={description}
          className="md:h-[340px] h-28" 
        />
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