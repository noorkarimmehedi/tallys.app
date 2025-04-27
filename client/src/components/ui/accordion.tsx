"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // Check if we're on a mobile device (client-side only)
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    // Set initial value
    setIsMobile(window.innerWidth < 768);
    
    // Add resize listener to update when window size changes
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Mobile-optimized inline styles
  const mobileStyles = {
    WebkitOverflowScrolling: 'touch',
    backfaceVisibility: 'hidden' as 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    WebkitTransform: 'translate3d(0,0,0)',
    transform: 'translate3d(0,0,0)',
    WebkitPerspective: '1000',
    WebkitFontSmoothing: 'antialiased',
    WebkitTapHighlightColor: 'transparent',
    WebkitUserSelect: 'none' as 'none',
    transform3D: 'preserve-3d',
    willChange: 'height, opacity',
    transitionProperty: 'height, opacity',
    transitionTimingFunction: 'ease-out',
    transitionDuration: '200ms',
    overflowX: 'hidden' as 'hidden',
    overflowY: 'hidden' as 'hidden'
  };
  
  // Desktop styles
  const desktopStyles = {
    WebkitOverflowScrolling: 'touch',
    backfaceVisibility: 'hidden' as 'hidden',
    WebkitTransform: 'translateZ(0)',
    WebkitBackfaceVisibility: 'hidden' as 'hidden',
    willChange: 'transform, opacity, height',
    transitionProperty: 'transform, opacity, height',
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDuration: '300ms'
  };
  
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all",
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        isMobile && "accordion-item"
      )}
      style={isMobile ? mobileStyles : desktopStyles}
      {...props}
    >
      <div 
        className={cn("pb-4 pt-0", className)}
        style={isMobile ? { 
          transform: 'translate3d(0,0,0)',
          WebkitTransform: 'translate3d(0,0,0)'
        } : undefined}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
})

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }