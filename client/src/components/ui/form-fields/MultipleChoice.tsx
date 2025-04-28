import React, { useState, useCallback } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, X, GripVertical } from "lucide-react";
import { motion, Reorder, useDragControls } from "framer-motion";

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
  options = [], 
  onOptionsChange,
  preview = false,
  label = "Choose an option", 
  description = "",
  required = false
}: MultipleChoiceProps) {
  const [newOption, setNewOption] = useState("");
  const [nextId, setNextId] = useState(1);
  
  // Generate unique key for options to avoid reorder issues
  const getUniqueKey = useCallback((index: number) => {
    return `option-${index}-${nextId}`;
  }, [nextId]);
  
  const handleAddOption = useCallback(() => {
    if (newOption.trim() && onOptionsChange) {
      const newOptions = [...options, newOption.trim()];
      onOptionsChange(newOptions);
      setNewOption("");
      setNextId(prev => prev + 1);
    }
  }, [newOption, options, onOptionsChange]);
  
  const handleUpdateOption = useCallback((index: number, text: string) => {
    if (onOptionsChange) {
      const newOptions = [...options];
      newOptions[index] = text;
      onOptionsChange(newOptions);
    }
  }, [options, onOptionsChange]);
  
  const handleRemoveOption = useCallback((index: number) => {
    if (onOptionsChange) {
      const newOptions = options.filter((_, i) => i !== index);
      onOptionsChange(newOptions);
      setNextId(prev => prev + 1); // Update to force re-render
    }
  }, [options, onOptionsChange]);

  const handleReorder = useCallback((newOrder: string[]) => {
    if (onOptionsChange) {
      onOptionsChange(newOrder);
      setNextId(prev => prev + 1); // Update to force re-render
    }
  }, [onOptionsChange]);

  // If in preview mode or no options management capability, use the simple view
  if (preview || !onOptionsChange) {
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
            <div key={index} className="flex items-center gap-2 py-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="text-sm">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  }
  
  // Editor mode with enhanced UI and reordering capability
  return (
    <div className="space-y-6">
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {description && (
          <p className="text-sm text-gray-500 mb-2">{description}</p>
        )}
      </div>
      
      {/* Options Editor */}
      <div className="space-y-3">
        <Label className="block text-sm font-medium text-blue-600">
          Options
        </Label>
        
        {options.length === 0 ? (
          <div className="text-center p-4 border border-dashed border-gray-300 rounded-md">
            <p className="text-gray-500 text-sm">No options added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {options.map((option, index) => (
              <OptionItem 
                key={getUniqueKey(index)}
                option={option} 
                index={index}
                onUpdate={handleUpdateOption}
                onRemove={handleRemoveOption}
              />
            ))}
          </div>
        )}
        
        {/* Add New Option */}
        <div className="flex items-center gap-2 pt-2">
          <Input
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Add new option"
            className="flex-1 border-gray-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newOption.trim()) {
                e.preventDefault();
                handleAddOption();
              }
            }}
          />
          <Button 
            type="button"
            onClick={handleAddOption} 
            disabled={!newOption.trim()} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusCircle size={18} className="mr-1" />
            Add
          </Button>
        </div>
      </div>
      
      {/* Help text */}
      <p className="text-xs text-gray-500 italic">
        Enter option text and click Add to add more options.
      </p>
    </div>
  );
}

// Separate component for each option item 
function OptionItem({
  option, 
  index, 
  onUpdate, 
  onRemove
}: {
  option: string;
  index: number;
  onUpdate: (index: number, text: string) => void;
  onRemove: (index: number) => void;
}) {
  // Memoize this to prevent losing focus on input
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, e.target.value);
  }, [index, onUpdate]);

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  return (
    <Card className="p-3 flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-gray-400">
        <GripVertical size={18} />
      </div>
      {/* Custom radio button styled element */}
      <div className="h-4 w-4 rounded-full border border-blue-500 flex items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
      </div>
      <Input
        value={option}
        onChange={handleChange}
        className="flex-1 border-gray-200 focus:border-blue-300 focus:ring-blue-300"
        placeholder="Option text"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50"
        onClick={handleRemove}
      >
        <X size={18} />
      </Button>
    </Card>
  );
}