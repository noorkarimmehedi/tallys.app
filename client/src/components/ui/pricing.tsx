"use client";

import { cn } from "@/lib/utils";
import { Check, Star } from "lucide-react";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { ButtonPrototype } from "@/components/ui/button-prototype";
import { PricingSwitch } from "@/components/ui/pricing-switch";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you. All plans include access to our platform, lead generation tools, and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: {
            x: x / window.innerWidth,
            y: y / window.innerHeight,
          },
          colors: ["#000", "#333", "#666"],
          ticks: 200,
          gravity: 1.2,
          decay: 0.94,
          startVelocity: 30,
          shapes: ["circle"],
        });
      } catch (e) {
        console.log("Confetti animation not available");
      }
    }
  };

  return (
    <div className="container py-20">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h2>
        <p className="text-muted-foreground text-lg whitespace-pre-line">
          {description}
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <div className="bg-gray-100 p-6 px-8 rounded-xl border border-gray-200 shadow-md flex items-center gap-4">
          <span className={`font-semibold text-lg ${isMonthly ? 'text-black font-bold' : 'text-gray-400'}`}>Monthly</span>
          <div className="relative inline-flex items-center cursor-pointer bg-black p-2 rounded-xl border border-gray-300">
            <PricingSwitch
              ref={switchRef as any}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
            />
          </div>
          <div className="flex flex-col items-start">
            <span className={`font-semibold text-lg ${!isMonthly ? 'text-black font-bold' : 'text-gray-400'}`}>
              Annual billing
            </span>
            <span className="text-sm text-green-600 font-bold">Save 20%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 sm:2 gap-4">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 1 }}
            whileInView={{
              y: plan.isPopular ? -20 : 0,
              opacity: 1,
              x: index === 2 ? -30 : index === 0 ? 30 : 0,
              scale: index === 0 || index === 2 ? 0.94 : 1.0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.4,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              `rounded-2xl border-[1px] p-6 text-center lg:flex lg:flex-col lg:justify-center relative`,
              plan.isPopular ? "border-black border-2 bg-black text-white" : "border-border bg-background",
              "flex flex-col",
              !plan.isPopular && "mt-5",
              index === 0 || index === 2
                ? "z-0 transform translate-x-0 translate-y-0 -translate-z-[50px] rotate-y-[10deg]"
                : "z-10",
              index === 0 && "origin-right",
              index === 2 && "origin-left"
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-black py-0.5 px-2 rounded-bl-xl rounded-tr-xl flex items-center">
                <Star className="text-white h-4 w-4 fill-current" />
                <span className="text-white ml-1 font-sans font-semibold">
                  Popular
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <p className={cn("text-base font-semibold", plan.isPopular ? "text-white" : "text-muted-foreground")}>
                {plan.name}
              </p>
              <div className="mt-6 flex items-center justify-center gap-x-2">
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={isMonthly ? plan.price : plan.yearlyPrice}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={cn("text-5xl font-bold tracking-tight flex items-center", plan.isPopular ? "text-white" : "text-foreground")}
                  >
                    ${isMonthly ? plan.price : plan.yearlyPrice}
                  </motion.span>
                </AnimatePresence>
                {plan.period !== "Next 3 months" && (
                  <span className={cn("text-sm font-semibold leading-6 tracking-wide", plan.isPopular ? "text-gray-300" : "text-muted-foreground")}>
                    / {plan.period}
                  </span>
                )}
              </div>

              <p className={cn("text-xs leading-5", plan.isPopular ? "text-gray-300" : "text-muted-foreground")}>
                {isMonthly ? "billed monthly" : "billed annually"}
              </p>

              <ul className="mt-5 gap-2 flex flex-col">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className={cn("h-4 w-4 mt-1 flex-shrink-0", plan.isPopular ? "text-white" : "text-primary")} />
                    <span className={cn("text-left", plan.isPopular ? "text-gray-300" : "")}>{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className={cn("w-full my-4", plan.isPopular ? "border-gray-700" : "")} />

              <ButtonPrototype
                variant={plan.isPopular ? "default" : "noShadow"}
                className={cn(
                  "w-full text-lg font-semibold tracking-tighter",
                  plan.isPopular ? "btn-prototype" : "border border-gray-200"
                )}
                onClick={() => window.location.href = plan.href}
              >
                {plan.buttonText}
              </ButtonPrototype>
              <p className={cn("mt-6 text-xs leading-5", plan.isPopular ? "text-gray-300" : "text-muted-foreground")}>
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}