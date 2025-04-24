import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ParagraphProps {
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

export default function Paragraph({ 
  value, 
  onChange, 
  label = "Answer",
  description = "",
  required = false,
  placeholder = "Enter your answer",
  preview = false,
  id
}: ParagraphProps) {
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
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="form-input block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary/40 focus:border-primary transition-all min-h-20 sm:min-h-24 resize-none"
          readOnly={preview}
          required={required}
        />
      </div>
    </div>
  );
}
