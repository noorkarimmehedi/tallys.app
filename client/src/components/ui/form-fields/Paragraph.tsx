import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ParagraphProps {
  value: string;
  onChange: (value: string) => void;
  preview?: boolean;
}

export default function Paragraph({ value, onChange, preview = false }: ParagraphProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">Answer</Label>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your answer"
          className="form-input block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm transition-all min-h-24 resize-none"
          readOnly={preview}
        />
      </div>
    </div>
  );
}
