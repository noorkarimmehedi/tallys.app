import React from "react";
import { FormSectionAccordionDemo } from "@/components/ui/form-section-accordion-demo";
import { Tiles } from "@/components/ui/tiles";

export default function DemoAccordion() {
  return (
    <div className="flex items-center justify-center min-h-screen relative">
      {/* Tiles Background */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <Tiles 
          rows={50} 
          cols={8}
          tileSize="md"
          tileClassName="border-gray-200"
        />
      </div>
      
      <div className="max-w-[600px] w-full p-6">
        <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">Accordion Demo Form</h3>
            <p className="text-gray-600 mb-6">Please complete all the sections below</p>
          </div>
          
          <FormSectionAccordionDemo />
          
          <div className="flex justify-end mt-6">
            <button 
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
            >
              Submit Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}