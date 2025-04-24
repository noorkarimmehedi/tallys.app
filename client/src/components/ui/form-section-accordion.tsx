import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Mail, MapPin, User } from "lucide-react"

interface FormSection {
  id: string
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  isComplete?: boolean
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

function FormSectionAccordion() {
  return (
    <Accordion 
      type="single" 
      collapsible 
      className="w-full max-w-full sm:max-w-[400px]"
    >
      {sections.map((section) => (
        <AccordionItem 
          key={section.id} 
          value={section.id}
          className="mb-3 border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20"
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
          <AccordionContent className="px-4">
            <div className="py-2">{section.children}</div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { FormSectionAccordion }