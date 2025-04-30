import React from "react";
import { Label } from "@/components/ui/label";
import { Phone as PhoneIcon, Search } from "lucide-react";
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
  return (
    <div className="space-y-2">
      <div className="flex flex-col space-y-1.5">
        <Label className="font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="phone-input-container">
        <PhoneInput
          country={"us"} // Default country
          value={value}
          onChange={(phone) => onChange(phone)}
          disabled={preview}
          countryCodeEditable={false}
          preferredCountries={['us', 'ca', 'gb', 'au']}
          enableSearch={true}
          searchPlaceholder="Search countries..."
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
        
        {/* Custom search icon for the dropdown */}
        <div className="phone-dropdown-search-icon">
          <Search size={16} />
        </div>
      </div>
    </div>
  );
}