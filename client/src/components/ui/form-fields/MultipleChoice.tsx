import React, { useState } from "react";
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

  const handleReorder = (newOrder: string[]) => {
    if (onOptionsChange) {
      onOptionsChange(newOrder);
    }
  };

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
          <Reorder.Group axis="y" values={options} onReorder={handleReorder} className="space-y-2">
            {options.map((option, index) => (
              <OptionItem 
                key={option} 
                option={option} 
                index={index}
                onUpdate={handleUpdateOption}
                onRemove={handleRemoveOption}
              />
            ))}
          </Reorder.Group>
        )}
        
        {/* Add New Option */}
        <div className="flex items-center gap-2 pt-2">
          <Input
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Add new option"
            className="flex-1 border-gray-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newOption) {
                e.preventDefault();
                handleAddOption();
              }
            }}
          />
          <Button 
            onClick={handleAddOption} 
            disabled={!newOption} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusCircle size={18} className="mr-1" />
            Add Option
          </Button>
        </div>
      </div>
      
      {/* Help text */}
      <p className="text-xs text-gray-500 italic">
        Drag to reorder options. Click the + button to add more options.
      </p>
    </div>
  );
}

// Separate component for each option item to enable drag and reorder
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
  const controls = useDragControls();

  return (
    <Reorder.Item 
      value={option} 
      dragControls={controls}
      dragListener={false}
      className="cursor-default"
    >
      <Card className="p-3 flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow">
        <div 
          className="text-gray-400 cursor-move touch-none"
          onPointerDown={(e) => controls.start(e)}
        >
          <GripVertical size={18} />
        </div>
        <RadioGroupItem value={option} id={`option-${index}`} className="text-blue-500" />
        <Input
          value={option}
          onChange={(e) => onUpdate(index, e.target.value)}
          className="flex-1 border-gray-200 focus:border-blue-300 focus:ring-blue-300"
          placeholder="Option text"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50"
          onClick={() => onRemove(index)}
        >
          <X size={18} />
        </Button>
      </Card>
    </Reorder.Item>
  );
}