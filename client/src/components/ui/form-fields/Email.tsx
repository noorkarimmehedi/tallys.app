import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailProps {
  value: string;
  onChange: (value: string) => void;
  preview?: boolean;
}

export default function Email({ value, onChange, preview = false }: EmailProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">Email</Label>
        <Input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="example@example.com"
          className="form-input block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm transition-all"
          readOnly={preview}
        />
      </div>
    </div>
  );
}
