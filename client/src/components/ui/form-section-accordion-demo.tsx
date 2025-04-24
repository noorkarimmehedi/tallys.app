import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/form-accordion"
import { Input } from "@/components/ui/input"
import { Mail, MapPin, User } from "lucide-react"

interface Question {
  id: string
  title: string
  required?: boolean
  description?: string
}

interface FormSection {
  id: string
  title: string
  icon: React.ReactNode
  questions: Question[]
  isComplete?: boolean
}

const sections: FormSection[] = [
  {
    id: "1",
    icon: <User className="size-4 stroke-2 text-muted-foreground" />,
    title: "Personal Information",
    questions: [
      {
        id: "q1",
        title: "What's your first name?",
        required: true
      },
      {
        id: "q2",
        title: "What's your last name?",
        required: true
      }
    ]
  },
  {
    id: "2",
    icon: <Mail className="size-4 stroke-2 text-muted-foreground" />,
    title: "Contact Information",
    questions: [
      {
        id: "q3",
        title: "What's your email address?",
        required: true,
        description: "We'll use this to send your confirmation"
      },
      {
        id: "q4",
        title: "What's your phone number?",
        description: "Optional contact number"
      }
    ]
  },
  {
    id: "3",
    icon: <MapPin className="size-4 stroke-2 text-muted-foreground" />,
    title: "Address Information",
    questions: [
      {
        id: "q5",
        title: "What's your street address?",
        required: true
      },
      {
        id: "q6",
        title: "City"
      },
      {
        id: "q7",
        title: "State/Province"
      },
      {
        id: "q8",
        title: "ZIP/Postal Code"
      }
    ]
  },
]

function FormSectionAccordionDemo() {
  return (
    <Accordion 
      type="single" 
      collapsible 
      className="w-full max-w-full sm:max-w-[500px]"
    >
      {sections.map((section) => (
        <AccordionItem 
          key={section.id} 
          value={section.id} 
          className="mb-4 border rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20"
        >
          <AccordionTrigger className="group px-4 py-3 hover:no-underline hover:bg-muted/20">
            <div className="flex items-center gap-2">
              {section.icon}
              <span className="font-medium">{section.title}</span>
              {section.isComplete && (
                <span className="ml-2 text-sm text-green-500">✓</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 p-4 bg-white">
              {section.questions.map((question) => (
                <div 
                  key={question.id} 
                  className="animate-fadeIn border-b pb-4 last:border-b-0 last:pb-0 transition-opacity duration-300"
                >
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
                    <Input 
                      type={question.id === "q3" ? "email" : "text"} 
                      placeholder="Enter your answer here" 
                      className="w-full focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { FormSectionAccordionDemo }