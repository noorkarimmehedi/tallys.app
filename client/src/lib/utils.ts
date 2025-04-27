import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { nanoid } from "nanoid";
import { FormQuestion, FieldType, FormSection } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createQuestion(type: FieldType, title: string = '', sectionId?: string): FormQuestion {
  return {
    id: nanoid(),
    type,
    title: title,
    required: false,
    options: type === 'multipleChoice' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
    maxRating: type === 'rating' ? 5 : undefined,
    sectionId
  }
}

export function createSection(title: string = '', description: string = ''): FormSection {
  return {
    id: nanoid(),
    title: title || 'New Section',
    description,
    icon: 'user'
  }
}

export function getDefaultFormTheme(logoUrl?: string) {
  return {
    backgroundColor: "#ffffff",
    textColor: "#000000",
    primaryColor: "#000000",
    fontFamily: "Alternate Gothic",
    logoUrl: logoUrl || ""
  }
}

export function createFormUrl(shortId: string): string {
  return `${window.location.origin}/f/${shortId}`;
}

export function getFieldIcon(type: FieldType): string {
  const icons: Record<FieldType, string> = {
    shortText: "ri-text-line",
    paragraph: "ri-text-paragraph-line",
    email: "ri-mail-line",
    multipleChoice: "ri-checkbox-multiple-line",
    fileUpload: "ri-upload-line",
    rating: "ri-star-line",
    name: "ri-user-line",
    address: "ri-map-pin-line",
    phone: "ri-phone-line",
    date: "ri-calendar-line",
    number: "ri-calculator-line"
  };
  
  return icons[type] || "ri-file-line";
}

export function getFieldLabel(type: FieldType): string {
  const labels: Record<FieldType, string> = {
    shortText: "Short Text",
    paragraph: "Paragraph",
    email: "Email",
    multipleChoice: "Multiple Choice",
    fileUpload: "File Upload",
    rating: "Rating",
    name: "Name",
    address: "Address",
    phone: "Phone",
    date: "Date & Time",
    number: "Number"
  };
  
  return labels[type] || "Unknown Field";
}

// Group questions by sections
export interface SectionGroup {
  sectionId?: string;
  sectionTitle: string;
  sectionDescription?: string;
  sectionIcon?: string;
  questions: FormQuestion[];
}

export function getQuestionsGroupedBySections(form: { questions: FormQuestion[], sections?: FormSection[], infoDescription?: string }): SectionGroup[] {
  // Ensure questions and sections are arrays
  const questions = Array.isArray(form?.questions) ? form.questions : [];
  const sections = Array.isArray(form?.sections) ? form.sections : [];
  
  // Add debug logging
  console.log("getQuestionsGroupedBySections input:", {
    questionCount: questions.length,
    sectionCount: sections.length,
    questionsValid: Array.isArray(form?.questions),
    sectionsValid: Array.isArray(form?.sections),
    questionsData: questions,
    sectionsData: sections,
    infoDescription: form?.infoDescription
  });
  
  // Create default group for questions without a section
  const result: SectionGroup[] = [];

  // Always add the Information section at the top
  result.push({
    sectionId: 'information',
    sectionTitle: "Information",
    sectionDescription: form?.infoDescription || "This form collects the necessary information we need.",
    sectionIcon: 'info-circle',
    questions: [] as FormQuestion[]
  });
  
  // If we have no sections defined but have questions, create a default section
  if (sections.length === 0 && questions.length > 0) {
    result.push({
      sectionId: 'default',
      sectionTitle: "Form Questions", 
      questions: [...questions] // Clone the questions array
    });
    
    // Return the result with the Information section at top
    return result;
  }
  
  // Add a default group for unsectioned questions
  result.push({
    sectionId: 'unsectioned',
    sectionTitle: "General Questions",
    questions: [] as FormQuestion[]
  });
  
  // Add groups for each section
  sections.forEach(section => {
    result.push({
      sectionId: section.id,
      sectionTitle: section.title,
      sectionDescription: section.description,
      sectionIcon: section.icon,
      questions: [] as FormQuestion[]
    });
  });
  
  // Place questions in their respective groups
  questions.forEach(question => {
    const sectionId = question.sectionId;
    if (sectionId) {
      const section = result.find(s => s.sectionId === sectionId);
      if (section) {
        section.questions.push({...question}); // Clone the question
      } else {
        // If section doesn't exist, add to unsectioned group
        result[1].questions.push({...question}); // Now position 1 since Information is at 0
      }
    } else {
      // If no sectionId, add to unsectioned group
      result[1].questions.push({...question}); // Now position 1 since Information is at 0
    }
  });
  
  // Remove empty sections except the Information section
  const filteredResult = result.filter((section, index) => 
    index === 0 || section.questions.length > 0
  );
  
  console.log("getQuestionsGroupedBySections result:", filteredResult);
  
  return filteredResult;
}
