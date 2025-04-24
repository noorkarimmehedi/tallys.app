import React from "react";
import { FieldType } from "@shared/schema";
import { getFieldIcon, getFieldLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ElementsSidebarProps {
  onAddElement: (type: FieldType) => void;
}

export function ElementsSidebar({ onAddElement }: ElementsSidebarProps) {
  const basicElements: FieldType[] = [
    'shortText',
    'paragraph',
    'multipleChoice',
    'email'
  ];
  
  const advancedElements: FieldType[] = [
    'fileUpload',
    'rating',
    'name',
    'address',
    'phone',
    'date',
    'number'
  ];
  
  const renderElement = (type: FieldType) => (
    <Button
      key={type}
      variant="outline"
      className="bg-white border border-gray-200 rounded-md p-3 flex items-center hover:bg-gray-50 cursor-pointer w-full justify-start font-normal"
      onClick={() => onAddElement(type)}
    >
      <i className={`${getFieldIcon(type)} text-gray-600 text-lg`}></i>
      <span className="ml-3 text-sm">{getFieldLabel(type)}</span>
    </Button>
  );
  
  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      <div className="h-16 border-b border-gray-200 flex items-center px-4">
        <h3 className="text-lg font-medium font-['Alternate_Gothic', 'sans-serif'] tracking-wide">Form Elements</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic</h4>
          
          <div className="space-y-2">
            {basicElements.map(renderElement)}
          </div>
          
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6">Advanced</h4>
          
          <div className="space-y-2">
            {advancedElements.map(renderElement)}
          </div>
        </div>
      </div>
    </div>
  );
}
