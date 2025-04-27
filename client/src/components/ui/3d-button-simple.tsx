"use client" 

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button as OldButton } from './button';

export function Button({ 
  children, 
  variant = 'default', 
  className, 
  ...props 
}: React.ComponentProps<typeof OldButton>) {
  return (
    <OldButton
      variant={variant === 'default' ? 'default' : 'outline'}
      className={cn(
        "relative border border-blue-700 border-b-4 hover:border-b hover:translate-y-[3px] transition-all duration-150",
        variant === 'default' 
          ? "bg-blue-500 text-white hover:bg-blue-600 border-b-blue-600 shadow-md" 
          : "bg-white hover:bg-neutral-100 border-neutral-300 border-b-neutral-200",
        className
      )}
      {...props}
    >
      {children}
    </OldButton>
  );
}