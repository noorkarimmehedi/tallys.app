import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone as PhoneIcon } from "lucide-react";

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
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <PhoneIcon className="h-4 w-4 text-gray-500" />
        </div>
        <Input
          type="tel"
          placeholder="(123) 456-7890"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
          disabled={preview}
        />
      </div>
    </div>
  );
}