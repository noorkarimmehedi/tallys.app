import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Mail, MapPin, User, FileText, Star, Calendar } from "lucide-react"
import { FormQuestion, FormSection as FormSectionType, FieldType } from "@shared/schema"
import ShortText from "@/components/ui/form-fields/ShortText";
import Paragraph from "@/components/ui/form-fields/Paragraph";
import Email from "@/components/ui/form-fields/Email";
import MultipleChoice from "@/components/ui/form-fields/MultipleChoice";
import Rating from "@/components/ui/form-fields/Rating";
import FileUpload from "@/components/ui/form-fields/FileUpload";
import DateField from "@/components/ui/form-fields/DateField";
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
}

const sections: FormSection[] = [
  {
    id: "1",
    icon: <User className="size-4 stroke-2 text-muted-foreground" />,
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
    icon: <Mail className="size-4 stroke-2 text-muted-foreground" />,
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
    icon: <MapPin className="size-4 stroke-2 text-muted-foreground" />,
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
      defaultValue="1"
      className="w-full max-w-full"
    >
      {sections.map((section) => (
        <AccordionItem 
          key={section.id} 
          value={section.id}
          className="mb-3 border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all will-change-transform transform-gpu"
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
  preview = false
}: FormSectionAccordionProps) {
  const groupedQuestions = getQuestionsGroupedBySections({ questions, sections });

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
    
    if (sectionGroup.sectionTitle.toLowerCase().includes('personal')) {
      return <User className="size-4 stroke-2 text-muted-foreground" />;
    } else if (sectionGroup.sectionTitle.toLowerCase().includes('contact')) {
      return <Mail className="size-4 stroke-2 text-muted-foreground" />;
    } else if (sectionGroup.sectionTitle.toLowerCase().includes('address')) {
      return <MapPin className="size-4 stroke-2 text-muted-foreground" />;
    } else if (firstQuestionType === 'paragraph') {
      return <FileText className="size-4 stroke-2 text-muted-foreground" />;
    } else if (firstQuestionType === 'rating') {
      return <Star className="size-4 stroke-2 text-muted-foreground" />;
    } else if (firstQuestionType === 'fileUpload') {
      return <FileText className="size-4 stroke-2 text-muted-foreground" />;
    } else if (firstQuestionType === 'date') {
      return <Calendar className="size-4 stroke-2 text-muted-foreground" />;
    } else {
      return <FileText className="size-4 stroke-2 text-muted-foreground" />;
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
      defaultValue={groupedQuestions.length > 0 ? groupedQuestions[0].sectionId || "section-0" : undefined}
      className="w-full max-w-full"
    >
      {groupedQuestions.map((section, index) => (
        <AccordionItem 
          key={section.sectionId || `section-${index}`} 
          value={section.sectionId || `section-${index}`}
          className="mb-3 border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all will-change-transform transform-gpu"
        >
          <AccordionTrigger className="group px-3 sm:px-4 py-3 hover:no-underline hover:bg-muted/20">
            <div className="flex items-center gap-2">
              {getSectionIcon(section)}
              <span className="font-medium">{section.sectionTitle}</span>
              {isSectionComplete(section.questions) && (
                <span className="ml-2 text-sm text-green-500">✓</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 sm:px-4 transition-all transform-gpu">
            <div className="py-2 space-y-4">
              {section.sectionDescription && (
                <p className="text-sm text-muted-foreground mb-4">{section.sectionDescription}</p>
              )}
              
              {section.questions.map(question => (
                <div key={question.id} className="mb-4">
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