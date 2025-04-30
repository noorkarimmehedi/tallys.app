import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Phone as PhoneIcon, Search, Globe, ChevronDown } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface PhoneProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  required?: boolean;
  preview?: boolean;
}

export default function Phone({ value, onChange, label, description, required, preview = false }: PhoneProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Use a MutationObserver to detect when dropdown opens/closes
  useEffect(() => {
    const detectDropdown = () => {
      const phoneContainer = document.querySelector('.phone-input-container');
      if (!phoneContainer) return;
      
      // Look for dropdown being added to the DOM
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            // Check if country list is present in the DOM
            const countryList = document.querySelector('.country-list');
            setDropdownOpen(!!countryList);
          }
        }
      });
      
      observer.observe(phoneContainer, { childList: true, subtree: true });
      
      return () => {
        observer.disconnect();
      };
    };
    
    // Run after a small delay to ensure DOM is ready
    const timeout = setTimeout(detectDropdown, 100);
    return () => clearTimeout(timeout);
  }, []);
  
  return (
    <div className="space-y-2">
      <div className="flex flex-col space-y-1.5">
        <Label className="font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className={`phone-input-container ${dropdownOpen ? 'dropdown-open' : ''}`}>
        <PhoneInput
          country={"us"} // Default country
          value={value}
          onChange={(phone) => onChange(phone)}
          disabled={preview}
          countryCodeEditable={false}
          preferredCountries={['us', 'ca', 'gb', 'au', 'in', 'cn', 'jp', 'sg', 'kr', 'ae']} // Add more common countries
          enableSearch={true}
          searchPlaceholder="Type country name..."
          inputClass="rounded-lg phone-input-field"
          buttonClass="rounded-l-lg phone-input-button"
          placeholder="Enter phone number"
          containerClass="phone-input"
          searchClass="modern-search"
          dropdownClass="modern-dropdown"
          specialLabel={""}
          autoFormat={true}
          disableSearchIcon={true}
          disableDropdown={preview}
          enableLongNumbers={true}
          searchNotFound="No countries found"
        />
        
        {/* Custom indicator showing dropdown is available */}
        <div className="phone-dropdown-indicator">
          <Globe size={16} className="globe-icon" />
          <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'open' : ''}`} />
        </div>
        
        {/* Custom search icon for the dropdown */}
        <div className="phone-dropdown-search-icon">
          <Search size={18} />
        </div>
      </div>
    </div>
  );
}