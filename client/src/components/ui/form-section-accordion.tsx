import React from 'react';
import { FormQuestion, FormSection } from '@shared/schema';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  CheckCircle,
  User,
  Mail,
  FileText,
  Star,
  MapPin
} from 'lucide-react';
// We'll temporarily create a local version of the FieldRenderer
// since the import is failing
import ShortText from '@/components/ui/form-fields/ShortText';
import Paragraph from '@/components/ui/form-fields/Paragraph';
import Email from '@/components/ui/form-fields/Email';
import MultipleChoice from '@/components/ui/form-fields/MultipleChoice';
import FileUpload from '@/components/ui/form-fields/FileUpload';
import Rating from '@/components/ui/form-fields/Rating';

// Simplified inline FieldRenderer component
function FieldRenderer({ 
  question, 
  value, 
  onChange, 
  preview = false 
}: {
  question: FormQuestion;
  value: any;
  onChange: (value: any) => void;
  preview?: boolean;
}) {
  switch (question.type) {
    case "shortText":
    case "name":  // Handle "name" type using the same ShortText component
      return (
        <ShortText
          value={value as string}
          onChange={onChange}
        />
      );
    case "paragraph":
      return (
        <Paragraph
          value={value as string}
          onChange={onChange}
        />
      );
    case "email":
      return (
        <Email
          value={value as string}
          onChange={onChange}
        />
      );
    case "multipleChoice":
      return (
        <MultipleChoice
          value={value as string}
          onChange={onChange}
          options={question.options || []}
        />
      );
    case "fileUpload":
      return (
        <FileUpload
          value={value as string}
          onChange={onChange}
        />
      );
    case "rating":
      return (
        <Rating
          value={Number(value) || 0}
          onChange={onChange}
          maxRating={question.maxRating || 5}
        />
      );
    case "number":
      return (
        <ShortText
          value={value as string}
          onChange={onChange}
        />
      );
    case "phone":
      return (
        <ShortText
          value={value as string}
          onChange={onChange}
        />
      );
    case "address":
      return (
        <Paragraph
          value={value as string}
          onChange={onChange}
        />
      );
    case "date":
      return (
        <ShortText
          value={value as string}
          onChange={onChange}
        />
      );
    default:
      return <div className="p-2 border border-red-300 rounded bg-red-50 text-red-600">Unsupported question type: {question.type}</div>;
  }
}
import { SectionGroup, getQuestionsGroupedBySections } from '@/lib/utils';

interface FormSectionAccordionProps {
  questions: FormQuestion[];
  sections?: FormSection[];
  onAnswerChange?: (questionId: string, value: any) => void;
  formResponses?: Record<string, any>;
  preview?: boolean;
}

// Helper function to get section icon
function getSectionIcon(section: SectionGroup): React.ReactNode {
  if (!section.sectionIcon) {
    return <User className="size-4 stroke-2 text-muted-foreground" />;
  }
  
  switch (section.sectionIcon) {
    case 'user':
      return <User className="size-4 stroke-2 text-muted-foreground" />;
    case 'mail':
      return <Mail className="size-4 stroke-2 text-muted-foreground" />;
    case 'file':
      return <FileText className="size-4 stroke-2 text-muted-foreground" />;
    case 'star':
      return <Star className="size-4 stroke-2 text-muted-foreground" />;
    case 'map':
      return <MapPin className="size-4 stroke-2 text-muted-foreground" />;
    default:
      return <User className="size-4 stroke-2 text-muted-foreground" />;
  }
}

export function FormSectionAccordion({ 
  questions, 
  sections = [],
  onAnswerChange,
  formResponses = {},
  preview = false
}: FormSectionAccordionProps) {
  // Group questions by sections
  const sectionsGroups = getQuestionsGroupedBySections({ questions, sections });
  
  // Add debug logging
  console.log("FormSectionAccordion rendering with:", { 
    questions: questions.length, 
    sections: sections.length,
    sectionsGroups: sectionsGroups.length
  });
  
  if (sectionsGroups.length === 0) {
    console.log("Warning: No section groups generated");
  } else {
    console.log("Section groups:", sectionsGroups.map(g => ({
      id: g.sectionId,
      title: g.sectionTitle,
      questionCount: g.questions.length
    })));
  }
  
  // Helper function to check if question is complete
  const isQuestionComplete = (questionId: string) => {
    return formResponses[questionId] !== undefined && formResponses[questionId] !== "";
  };
  
  // Check if section is complete (all required questions answered)
  const isSectionComplete = (group: SectionGroup) => {
    return group.questions.every(q => 
      !q.required || isQuestionComplete(q.id)
    );
  };

  // If no sections/questions, show a placeholder
  if (sectionsGroups.length === 0) {
    return (
      <div className="text-center p-6 border border-dashed border-gray-300 rounded-md">
        <p className="text-gray-500">No form content available. Add questions and sections to see them here.</p>
      </div>
    );
  }

  return (
    <Accordion 
      type="multiple" 
      defaultValue={sectionsGroups.map(g => g.sectionId || 'unsectioned')} 
      className="w-full"
    >
      {sectionsGroups.map((group) => (
        <AccordionItem 
          key={group.sectionId || 'unsectioned'} 
          value={group.sectionId || 'unsectioned'}
          className="mb-4 border rounded-md overflow-hidden"
        >
          <AccordionTrigger className="group px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-2">
              {getSectionIcon(group)}
              <span className="font-medium">{group.sectionTitle}</span>
              {isSectionComplete(group) && (
                <span className="ml-2 text-sm text-green-500">✓</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 p-4 bg-white">
              {group.questions.map((question) => (
                <div key={question.id} className="animate-fadeIn border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="mb-2">
                    <h4 className="text-base font-medium mb-1">
                      {question.title}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                    {question.description && (
                      <p className="text-sm text-gray-500">{question.description}</p>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    {onAnswerChange && (
                      <FieldRenderer
                        question={question}
                        value={formResponses[question.id] || ""}
                        onChange={(value: any) => onAnswerChange(question.id, value)}
                        preview={preview}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}