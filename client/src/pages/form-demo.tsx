import React, { useState } from 'react';
import { FormSectionAccordion } from '@/components/ui/form-section-accordion';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { FormQuestion, FormSection, FieldType } from '@shared/schema';

// Define button component
function NavButton({ 
  onClick, 
  children,
  icon: Icon,
  direction = 'right'
}: { 
  onClick: () => void; 
  children: React.ReactNode;
  icon: any;
  direction?: 'left' | 'right';
}) {
  return (
    <Button
      onClick={onClick}
      className="flex items-center justify-center gap-2"
      variant="default"
    >
      {direction === 'left' && <Icon className="h-4 w-4" />}
      {children}
      {direction === 'right' && <Icon className="h-4 w-4" />}
    </Button>
  );
}

// Define form data outside component to avoid recreation
const formQuestions: FormQuestion[] = [
  {
    id: "q1",
    type: "shortText" as FieldType,
    title: "What's your name?",
    required: true,
    sectionId: "section1"
  },
  {
    id: "q2",
    type: "email" as FieldType,
    title: "What's your email?",
    required: true,
    sectionId: "section1"
  },
  {
    id: "q3",
    type: "paragraph" as FieldType,
    title: "Tell us about yourself",
    required: false,
    sectionId: "section2"
  },
  {
    id: "q4",
    type: "multipleChoice" as FieldType,
    title: "How did you hear about us?",
    required: true,
    sectionId: "section2",
    options: ["Social Media", "Friend", "Advertisement", "Other"]
  },
  {
    id: "q5",
    type: "rating" as FieldType,
    title: "Rate your experience",
    required: true,
    sectionId: "section2",
    maxRating: 5
  }
];

const formSections: FormSection[] = [
  {
    id: "section1",
    title: "Contact Information",
    description: "Please provide your contact details",
    icon: "user"
  },
  {
    id: "section2",
    title: "Additional Information",
    description: "Tell us more about yourself",
    icon: "file"
  }
];

// Form steps
const getSteps = (onAnswerChange: (id: string, value: any) => void, responses: Record<string, any>) => [
  {
    title: "Personal Information",
    description: "Tell us about yourself",
    component: <FormSectionAccordion 
      questions={formQuestions}
      sections={formSections}
      onAnswerChange={onAnswerChange}
      formResponses={responses}
    />
  },
  {
    title: "Form Settings",
    description: "Customize your form",
    component: <div className="h-64 flex items-center justify-center text-gray-500">Form settings placeholder</div>
  },
  {
    title: "Confirmation",
    description: "Review and submit",
    component: <div className="h-64 flex items-center justify-center text-gray-500">Confirmation placeholder</div>
  }
];

export default function FormDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  
  const handleAnswerChange = (questionId: string, value: any) => {
    setFormResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    console.log("Updated responses:", { ...formResponses, [questionId]: value });
  };
  
  // Generate steps with the current responses and handler
  const steps = getSteps(handleAnswerChange, formResponses);
  
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection("forward");
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setDirection("backward");
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const variants = {
    enter: (direction: "forward" | "backward") => ({
      x: direction === "forward" ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: "forward" | "backward") => ({
      x: direction === "forward" ? -100 : 100,
      opacity: 0
    })
  };

  return (
    <div className="container py-10 mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 font-['Alternate_Gothic', 'sans-serif']">Form Demo</h1>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 
                  ${index <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                {index + 1}
              </div>
              <div className="text-xs text-center">
                <p className="font-medium">{step.title}</p>
                <p className="text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 h-1 bg-gray-200 rounded">
          <div 
            className="h-full bg-primary rounded transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Form content with animations */}
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-sm mb-6 overflow-hidden">
        <motion.div
          key={currentStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.3 }}
          className="min-h-[400px]"
        >
          {steps[currentStep].component}
        </motion.div>
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        <NavButton 
          onClick={goToPreviousStep} 
          icon={ArrowLeft}
          direction="left"
        >
          Previous
        </NavButton>
        
        <NavButton 
          onClick={goToNextStep}
          icon={ArrowRight} 
        >
          {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
        </NavButton>
      </div>
    </div>
  );
}