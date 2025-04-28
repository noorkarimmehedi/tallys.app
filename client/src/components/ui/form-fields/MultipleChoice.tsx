import React, { useState, useCallback } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, X, GripVertical, Plus, Circle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        <div className="grid grid-cols-1 gap-2">
          {options.map((option, index) => (
            <div 
              key={index} 
              className={`
                flex items-center gap-2 p-3 rounded-md border transition-all 
                ${value === option 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
                }
                cursor-pointer
              `}
              onClick={() => onChange(option)}
            >
              <div 
                className="h-5 w-5 flex-shrink-0"
              >
                {value === option ? (
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <span className="text-sm font-medium">
                {option}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Editor mode with enhanced UI
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
        
        <AnimatePresence>
          {options.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-4 border border-dashed border-gray-300 rounded-md"
            >
              <p className="text-gray-500 text-sm">No options added yet</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {options.map((option, index) => (
                <motion.div
                  key={getUniqueKey(index)}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <OptionItem 
                    option={option} 
                    index={index}
                    onUpdate={handleUpdateOption}
                    onRemove={handleRemoveOption}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
        
        {/* Add New Option */}
        <div className="pt-2">
          <Button 
            type="button"
            onClick={() => setNewOption("New option")}
            className="w-full flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 border border-dashed border-blue-200 py-2 h-auto"
            variant="ghost"
          >
            <Plus size={16} className="mr-2" />
            Add option
          </Button>
          
          {/* Option input appears when adding a new option */}
          <AnimatePresence>
            {newOption !== "" && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-2"
              >
                <Card className="p-3 flex items-center gap-2 border-blue-200 bg-blue-50">
                  <div className="text-blue-400">
                    <Circle className="h-5 w-5" />
                  </div>
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Option text"
                    className="flex-1 border-blue-200 focus:border-blue-300 focus:ring-blue-300 bg-white"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newOption.trim()) {
                        e.preventDefault();
                        handleAddOption();
                      } else if (e.key === 'Escape') {
                        setNewOption("");
                      }
                    }}
                  />
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-blue-100"
                      onClick={() => setNewOption("")}
                    >
                      <X size={16} />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 px-3 text-white bg-blue-600 hover:bg-blue-700"
                      onClick={handleAddOption}
                      disabled={!newOption.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Help text */}
      <p className="text-xs text-gray-500 italic">
        Click "Add option" to add more choices to your question.
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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(option);
  
  // Memoize this to prevent losing focus on input
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    if (editValue.trim()) {
      onUpdate(index, editValue);
    }
    setIsEditing(false);
  }, [editValue, index, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && editValue.trim()) {
      onUpdate(index, editValue);
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setEditValue(option);
      setIsEditing(false);
    }
  }, [editValue, index, onUpdate, option]);

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  return (
    <Card className="p-3 flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-gray-400">
        <GripVertical size={18} />
      </div>
      
      <div className="h-5 w-5 text-blue-500">
        <Circle className="h-full w-full" />
      </div>
      
      {isEditing ? (
        <Input
          value={editValue}
          onChange={handleChange}
          className="flex-1 border-blue-200 focus:border-blue-300 focus:ring-blue-300"
          placeholder="Option text"
          autoFocus
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div 
          className="flex-1 py-1 px-2 text-sm cursor-text hover:bg-gray-50 rounded"
          onClick={() => {
            setIsEditing(true);
            setEditValue(option);
          }}
        >
          {option}
        </div>
      )}
      
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