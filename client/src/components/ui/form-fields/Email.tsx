import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

interface EmailProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  preview?: boolean;
  id?: string;
  question?: any;
}

export default function Email({ 
  value, 
  onChange, 
  label = "Email",
  description = "",
  required = false,
  placeholder = "example@example.com",
  preview = false,
  id
}: EmailProps) {
  return (
    <div className="space-y-2">
      <div>
        <Label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-800 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground mb-2">{description}</p>
        )}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id={id}
            type="email"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="form-input block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary/40 focus:border-primary transition-all"
            readOnly={preview}
            required={required}
          />
        </div>
      </div>
    </div>
  );
}
