import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/form-accordion"
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

function FormSectionAccordionDemo() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-[400px]">
      {sections.map((section) => (
        <AccordionItem key={section.id} value={section.id}>
          <AccordionTrigger className="group">
            <div className="flex items-center gap-2">
              {section.icon}
              <span>{section.title}</span>
              {section.isComplete && (
                <span className="ml-2 text-sm text-green-500">✓</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>{section.children}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { FormSectionAccordionDemo }