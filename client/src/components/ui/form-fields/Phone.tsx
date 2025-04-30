import React from "react";
import { Label } from "@/components/ui/label";
import { Phone as PhoneIcon } from "lucide-react";
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
          inputStyle={{
            width: "100%",
            height: "40px",
            fontSize: "14px",
            borderRadius: "0.375rem",
            borderColor: "hsl(var(--border))",
            backgroundColor: preview ? "hsl(var(--muted))" : "transparent"
          }}
          buttonStyle={{
            borderColor: "hsl(var(--border))",
            borderRadius: "0.375rem 0 0 0.375rem",
            backgroundColor: preview ? "hsl(var(--muted))" : "transparent"
          }}
          dropdownStyle={{
            fontFamily: "Familjen Grotesk, ui-sans-serif, system-ui",
            fontSize: "14px"
          }}
          placeholder="Enter phone number"
          containerClass="phone-input"
          searchPlaceholder="Search countries"
          enableSearch={true}
        />
      </div>
    </div>
  );
}