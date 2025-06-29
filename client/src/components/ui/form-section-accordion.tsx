import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Mail, MapPin, User, FileText, Star, Calendar, Phone as PhoneIcon } from "lucide-react"
import { FormQuestion, FormSection as FormSectionType, FieldType } from "@shared/schema"
import ShortText from "@/components/ui/form-fields/ShortText";
import Paragraph from "@/components/ui/form-fields/Paragraph";
import Email from "@/components/ui/form-fields/Email";
import MultipleChoice from "@/components/ui/form-fields/MultipleChoice";
import Rating from "@/components/ui/form-fields/Rating";
import FileUpload from "@/components/ui/form-fields/FileUpload";
import DateField from "@/components/ui/form-fields/DateField";
import Phone from "@/components/ui/form-fields/Phone";
import { getQuestionsGroupedBySections } from "@/lib/utils";

interface FormSection {
  id: string
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  isComplete?: boolean
}

interface FormSectionAccordionProps {
  questions: FormQuestion[];
  sections?: FormSectionType[];
  onAnswerChange?: (questionId: string, answer: any) => void;
  formResponses?: Record<string, any>;
  preview?: boolean;
  infoDescription?: string;
}

const sections: FormSection[] = [
  {
    id: "1",
    icon: <User className="size-4 stroke-2 text-blue-500" />,
    title: "Personal Information",
    children: (
      <div className="flex flex-col gap-2">
        <Input type="text" placeholder="First Name" />
        <Input type="text" placeholder="Last Name" />
      </div>
    ),
  },
  {
    id: "2",
    icon: <Mail className="size-4 stroke-2 text-blue-500" />,
    title: "Contact Information",
    children: (
      <div className="flex flex-col gap-2">
        <Input type="email" placeholder="Email" />
        <Input type="tel" placeholder="Phone" />
      </div>
    ),
  },
  {
    id: "3",
    icon: <MapPin className="size-4 stroke-2 text-blue-500" />,
    title: "Address Information",
    children: (
      <div className="flex flex-col gap-2">
        <Input type="text" placeholder="Street" />
        <Input type="text" placeholder="City" />
        <Input type="text" placeholder="State" />
        <Input type="text" placeholder="Zip" />
      </div>
    ),
  },
]

// Default example component
function DefaultFormSectionAccordion() {
  return (
    <Accordion 
      type="single" 
      collapsible 
      defaultValue={undefined}
      className="w-full max-w-full"
    >
      {sections.map((section) => (
        <AccordionItem 
          key={section.id} 
          value={section.id}
          className="mb-2 rounded-md border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all will-change-transform transform-gpu"
        >
          <AccordionTrigger className="group px-3 sm:px-4 py-3 hover:no-underline hover:bg-muted/20">
            <div className="flex items-center gap-2">
              {section.icon}
              <span className="font-medium">{section.title}</span>
              {section.isComplete && (
                <span className="ml-2 text-sm text-green-500">✓</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 sm:px-4 transition-all transform-gpu">
            <div className="py-2">{section.children}</div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

// Component for actual form questions grouped by sections
function FormSectionAccordion({ 
  questions, 
  sections = [], 
  onAnswerChange = () => {}, 
  formResponses = {},
  preview = false,
  infoDescription
}: FormSectionAccordionProps) {
  // Add mobile detection
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    // Set initial value on mount
    setIsMobile(window.innerWidth < 768);
    
    // Use a debounced resize handler for better performance
    let resizeTimer: number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 100);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);
  
  const groupedQuestions = getQuestionsGroupedBySections({ 
    questions, 
    sections,
    infoDescription 
  });

  // Helper to determine if a field has been completed
  const isFieldComplete = (questionId: string) => {
    return formResponses && formResponses[questionId] !== undefined && formResponses[questionId] !== "";
  };

  // Helper to render the appropriate field component based on type
  const renderField = (question: FormQuestion) => {
    const fieldProps = {
      value: formResponses[question.id] || "",
      onChange: (value: any) => onAnswerChange(question.id, value),
      required: question.required,
      id: question.id,
      placeholder: "",
      label: question.title,
      description: question.description || "",
      question,
      preview
    };

    switch (question.type) {
      case "shortText":
        return <ShortText {...fieldProps} />;
      case "paragraph":
        return <Paragraph {...fieldProps} />;
      case "email":
        return <Email {...fieldProps} />;
      case "phone":
        return <Phone {...fieldProps} />;
      case "multipleChoice":
        return <MultipleChoice {...fieldProps} options={question.options || []} />;
      case "rating":
        return <Rating {...fieldProps} maxRating={question.maxRating || 5} />;
      case "fileUpload":
        return <FileUpload {...fieldProps} />;
      case "date":
        return <DateField {...fieldProps} />;
      default:
        return <ShortText {...fieldProps} />;
    }
  };

  // Get appropriate icon based on section or first question type
  const getSectionIcon = (sectionGroup: { sectionId?: string; sectionTitle: string; questions: FormQuestion[] }) => {
    const firstQuestionType = sectionGroup.questions[0]?.type;
    
    if (sectionGroup.sectionId === 'information') {
      return <FileText className="size-4 stroke-2 text-blue-500" />;
    } else if (sectionGroup.sectionTitle.toLowerCase().includes('personal')) {
      return <User className="size-4 stroke-2 text-blue-500" />;
    } else if (sectionGroup.sectionTitle.toLowerCase().includes('contact')) {
      return <Mail className="size-4 stroke-2 text-blue-500" />;
    } else if (sectionGroup.sectionTitle.toLowerCase().includes('address')) {
      return <MapPin className="size-4 stroke-2 text-blue-500" />;
    } else if (firstQuestionType === 'paragraph') {
      return <FileText className="size-4 stroke-2 text-blue-500" />;
    } else if (firstQuestionType === 'rating') {
      return <Star className="size-4 stroke-2 text-blue-500" />;
    } else if (firstQuestionType === 'fileUpload') {
      return <FileText className="size-4 stroke-2 text-blue-500" />;
    } else if (firstQuestionType === 'date') {
      return <Calendar className="size-4 stroke-2 text-blue-500" />;
    } else if (firstQuestionType === 'phone') {
      return <PhoneIcon className="size-4 stroke-2 text-blue-500" />;
    } else {
      return <FileText className="size-4 stroke-2 text-blue-500" />;
    }
  };

  // Check if all questions in a section are complete
  const isSectionComplete = (questions: FormQuestion[]) => {
    return questions.every(q => !q.required || isFieldComplete(q.id));
  };

  return (
    <Accordion 
      type="single" 
      collapsible
      defaultValue={undefined} // No section is opened by default
      className="w-full max-w-full overflow-hidden"
      style={{ maxWidth: '100%', overflowX: 'hidden' }}
    >
      {groupedQuestions.map((section, index) => (
        <AccordionItem 
          key={section.sectionId || `section-${index}`} 
          value={section.sectionId || `section-${index}`}
          className={`mb-2 rounded-md border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all will-change-transform transform-gpu ${isMobile ? 'accordion-item' : ''} max-w-full`}
          style={{ 
            WebkitTransformStyle: 'preserve-3d',
            WebkitBackfaceVisibility: 'hidden',
            maxWidth: '100%',
            width: '100%',
            ...(isMobile && {
              WebkitTransform: 'translate3d(0,0,0)',
              WebkitTransition: 'transform 0.1ms',
              transformTranslate: '0.1ms',
              WebkitTapHighlightColor: 'transparent',
              overflowX: 'hidden'
            })
          }}
        >
          <AccordionTrigger 
            className="group px-2 sm:px-4 py-3 hover:no-underline hover:bg-muted/20 w-full"
            style={isMobile ? { 
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              WebkitUserSelect: 'none',
              transition: 'none',
              maxWidth: '100%'
            } : { touchAction: 'manipulation' }}
          >
            <div className="flex items-center gap-2 w-full overflow-hidden">
              {getSectionIcon(section)}
              <span className="font-medium truncate">{section.sectionTitle}</span>
              {isSectionComplete(section.questions) && (
                <span className="ml-2 text-sm text-green-500 flex-shrink-0">✓</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent 
            className={`px-2 sm:px-4 ${!isMobile ? 'transition-all transform-gpu' : 'accordion-content-mobile'}`}
            style={isMobile ? { 
              WebkitTransformStyle: 'preserve-3d',
              WebkitBackfaceVisibility: 'hidden',
              WebkitTransform: 'translate3d(0,0,0)',
              WebkitPerspective: '1000',
              transitionProperty: 'none',
              pointerEvents: 'auto',
              overflowX: 'hidden',
              overflowY: 'hidden',
              willChange: 'height',
              userSelect: 'none',
              touchAction: 'manipulation',
              maxWidth: '100%'
            } : undefined}
          >
            <div className="py-2 space-y-4 max-w-full overflow-hidden">
              {section.sectionDescription && (
                <p className="text-sm text-muted-foreground mb-4">{section.sectionDescription}</p>
              )}
              
              {section.questions.map(question => (
                <div 
                  key={question.id} 
                  className="mb-4 max-w-full"
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    WebkitUserSelect: 'none',
                    overflowX: 'hidden',
                    wordBreak: 'break-word'
                  }}
                >
                  {renderField(question)}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { FormSectionAccordion }