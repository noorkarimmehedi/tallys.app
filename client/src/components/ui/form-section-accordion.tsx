import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FormQuestion, FormSection as FormSectionType } from "@shared/schema"
import { SectionGroup, getQuestionsGroupedBySections } from "@/lib/utils"
import { Clipboard, Mail, MapPin, User, FileText, Star, Phone, Calendar, Hash } from "lucide-react"
import React from "react"

// Component to render specific field types
const FieldRenderer = React.lazy(() => import("@/components/form-preview/FieldRenderer"));

interface FormSectionAccordionProps {
  questions: FormQuestion[];
  sections?: FormSectionType[];
  onAnswerChange?: (questionId: string, value: any) => void;
  formResponses?: Record<string, any>;
  preview?: boolean;
}

// Get icon based on section or first question type
function getSectionIcon(section: SectionGroup): React.ReactNode {
  const firstQuestionType = section.questions[0]?.type;
  
  switch (firstQuestionType) {
    case "shortText":
    case "name":
      return <User className="size-4 stroke-2 text-muted-foreground" />;
    case "email":
      return <Mail className="size-4 stroke-2 text-muted-foreground" />;
    case "address":
      return <MapPin className="size-4 stroke-2 text-muted-foreground" />;
    case "phone":
      return <Phone className="size-4 stroke-2 text-muted-foreground" />;
    case "paragraph":
      return <FileText className="size-4 stroke-2 text-muted-foreground" />;
    case "rating":
      return <Star className="size-4 stroke-2 text-muted-foreground" />;
    case "date":
      return <Calendar className="size-4 stroke-2 text-muted-foreground" />;
    case "number":
      return <Hash className="size-4 stroke-2 text-muted-foreground" />;
    default:
      return <Clipboard className="size-4 stroke-2 text-muted-foreground" />;
  }
}

function FormSectionAccordion({ 
  questions, 
  sections = [], 
  onAnswerChange, 
  formResponses = {}, 
  preview = false 
}: FormSectionAccordionProps) {
  // Group questions by sections
  const sectionGroups = getQuestionsGroupedBySections({ questions, sections });
  
  // Check if a section is complete
  const isSectionComplete = (group: SectionGroup) => {
    if (!formResponses || Object.keys(formResponses).length === 0) return false;
    
    return group.questions.every(question => {
      return !question.required || !!formResponses[question.id];
    });
  };
  
  return (
    <Accordion 
      type="single" 
      collapsible 
      className="w-full max-w-[650px] mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6"
    >
      {sectionGroups.map((group) => (
        <AccordionItem key={group.sectionId || 'default'} value={group.sectionId || 'default'}>
          <AccordionTrigger className="group">
            <div className="flex items-center gap-2">
              {getSectionIcon(group)}
              <span className="font-medium">{group.sectionTitle}</span>
              {isSectionComplete(group) && (
                <span className="ml-2 text-sm text-green-500">✓</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-6 py-4">
              {group.questions.map((question) => (
                <div key={question.id} className="flex flex-col gap-2">
                  <h3 className="text-base font-medium">{question.title}</h3>
                  {question.description && (
                    <p className="text-sm text-gray-500 mb-2">{question.description}</p>
                  )}
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <FieldRenderer
                      question={question}
                      value={formResponses[question.id] || ""}
                      onChange={(value) => onAnswerChange?.(question.id, value)}
                      preview={preview}
                    />
                  </React.Suspense>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export { FormSectionAccordion }