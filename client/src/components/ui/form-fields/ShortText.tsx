import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShortTextProps {
  value: string;
  onChange: (value: string) => void;
  preview?: boolean;
  label?: string;
  description?: string;
  required?: boolean;
}

export default function ShortText({ 
  value, 
  onChange, 
  preview = false, 
  label = "Answer",
  description = "",
  required = false 
}: ShortTextProps) {
  return (
    <div className="space-y-2">
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {description && (
          <p className="text-sm text-gray-500 mb-2">{description}</p>
        )}
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your answer"
          className="form-input block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm transition-all"
          readOnly={preview}
          required={required}
        />
      </div>
    </div>
  );
}
