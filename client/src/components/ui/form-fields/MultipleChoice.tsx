import React, { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MultipleChoiceProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  onOptionsChange?: (options: string[]) => void;
  preview?: boolean;
  label?: string;
  description?: string;
  required?: boolean;
}

export default function MultipleChoice({ 
  value, 
  onChange, 
  options, 
  onOptionsChange,
  preview = false,
  label = "Choose an option", 
  description = "",
  required = false
}: MultipleChoiceProps) {
  const [newOption, setNewOption] = useState("");
  
  const handleAddOption = () => {
    if (newOption && onOptionsChange) {
      onOptionsChange([...options, newOption]);
      setNewOption("");
    }
  };
  
  const handleUpdateOption = (index: number, text: string) => {
    if (onOptionsChange) {
      const newOptions = [...options];
      newOptions[index] = text;
      onOptionsChange(newOptions);
    }
  };
  
  const handleRemoveOption = (index: number) => {
    if (onOptionsChange) {
      const newOptions = options.filter((_, i) => i !== index);
      onOptionsChange(newOptions);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {description && (
          <p className="text-sm text-gray-500 mb-2">{description}</p>
        )}
      </div>
      <RadioGroup value={value} onValueChange={onChange}>
        {options.map((option, index) => (
          <div key={index} className="flex items-center justify-between gap-2 py-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              {preview ? (
                <Label htmlFor={`option-${index}`} className="text-sm">
                  {option}
                </Label>
              ) : (
                <Input
                  value={option}
                  onChange={(e) => handleUpdateOption(index, e.target.value)}
                  className="border-none focus:ring-0 p-1"
                  placeholder="Option text"
                />
              )}
            </div>
            {!preview && onOptionsChange && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={() => handleRemoveOption(index)}
              >
                <i className="ri-close-line"></i>
              </Button>
            )}
          </div>
        ))}
      </RadioGroup>
      
      {!preview && onOptionsChange && (
        <div className="pt-2 border-t border-gray-200 mt-4">
          <div className="flex gap-2">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Add new option"
              className="flex-1"
            />
            <Button onClick={handleAddOption} disabled={!newOption} variant="outline">
              <i className="ri-add-line mr-1"></i>
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}