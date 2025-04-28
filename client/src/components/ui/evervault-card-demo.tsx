import React from "react";
import { EvervaultCard, Icon } from "@/components/ui/evervault-card";

export function EvervaultCardDemo() {
  return (
    <div className="border border-black/[0.2] dark:border-white/[0.2] flex flex-col items-start max-w-lg mx-auto p-4 relative md:h-[30rem] h-auto mb-8">
      <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

      <div className="w-full md:min-h-[16rem] min-h-[140px] flex items-center justify-center">
        <EvervaultCard text="tallys" className="md:h-60 h-32" />
      </div>

      <div className="mt-4 md:mt-6 dark:text-white text-black w-full">
        <h2 className="text-lg md:text-xl font-medium mb-2">What is tallys?</h2>
        <p className="text-xs md:text-sm font-light mb-2">
          tallys is an all-in-one platform designed to simplify form creation and event scheduling.
        </p>
        <p className="text-xs md:text-sm font-light mb-2">
          It lets you build beautiful interactive forms, organize questions into customizable sections, and easily schedule appointments with clients.
        </p>
        <p className="text-xs md:text-sm font-light">
          With tallys, you can brand your forms with your company logo, share them via simple links, and manage responses all in one place.
        </p>
      </div>
    </div>
  );
}