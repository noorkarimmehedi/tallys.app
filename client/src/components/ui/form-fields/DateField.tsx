import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  required?: boolean;
  preview?: boolean;
}

export default function DateField({ value, onChange, label, description, required, preview = false }: DateFieldProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Detect mobile screens and iOS
  useEffect(() => {
    const checkPlatform = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Check if device is iOS
      const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsIOS(isAppleDevice);
    };
    
    // Check on initial load
    checkPlatform();
    
    // Add listener for resize events
    window.addEventListener('resize', checkPlatform);
    
    // Cleanup listener
    return () => window.removeEventListener('resize', checkPlatform);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex flex-col space-y-1.5">
        <Label className={`font-medium ${isMobile ? 'text-base' : ''}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-xs'}`}>{description}</p>}
      </div>
      
      {/* Date input field with mobile optimizations */}
      <div className={`relative ${isMobile ? 'mb-4' : ''}`}>
        {/* Calendar icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Calendar className={`text-gray-500 ${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
        </div>
        
        <style jsx global>{`
          /* iOS-specific date input styling */
          @supports (-webkit-touch-callout: none) {
            input[type="date"]::-webkit-date-and-time-value {
              text-align: left;
              min-height: 1.5em;
              padding-top: 0.15em;
            }
            
            input[type="date"]::-webkit-calendar-picker-indicator {
              background-position: right;
              background-size: 20px 20px;
              padding-right: 10px;
              height: 100%;
              position: absolute;
              right: 0;
              top: 0;
              width: 40px;
            }
          }
        `}</style>
        
        <Input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            pl-10 
            ${isMobile ? 'text-base py-3 px-4 rounded-lg shadow-sm' : ''}
            focus:border-primary focus:ring-1 focus:ring-primary
            ${isIOS ? 'pr-12' : ''}
          `}
          disabled={preview}
          style={{
            // Mobile optimization
            ...(isMobile && {
              fontSize: '16px', // Prevents iOS zoom on focus
              minHeight: '48px', // Larger touch target
              appearance: 'none', // Remove browser styling
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              border: '1px solid #d1d5db',
            })
          }}
        />
      </div>
      
      {/* Helper text for mobile */}
      {isMobile && (
        <div className="flex items-center text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded-lg border border-gray-100">
          <Calendar className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
          <p>{isIOS ? 'Tap to use the iOS date picker' : 'Tap to open your device\'s date picker'}</p>
        </div>
      )}
    </div>
  );
}