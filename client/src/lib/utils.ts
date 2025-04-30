import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FieldType, FormQuestion, FormSection, FormTheme } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

// Function to merge Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to get icon for a field type
export function getFieldIcon(type: FieldType): string {
  const iconMap: Record<FieldType, string> = {
    shortText: 'fas fa-font',
    paragraph: 'fas fa-align-left',
    email: 'fas fa-envelope',
    multipleChoice: 'fas fa-check-circle',
    fileUpload: 'fas fa-file-upload',
    rating: 'fas fa-star',
    name: 'fas fa-user',
    address: 'fas fa-map-marker-alt',
    phone: 'fas fa-phone',
    date: 'fas fa-calendar-alt',
    number: 'fas fa-hashtag'
  };
  
  return iconMap[type] || 'fas fa-question-circle';
}

// Function to get label for a field type
export function getFieldLabel(type: FieldType): string {
  const labelMap: Record<FieldType, string> = {
    shortText: 'Short Text',
    paragraph: 'Paragraph',
    email: 'Email',
    multipleChoice: 'Multiple Choice',
    fileUpload: 'File Upload',
    rating: 'Rating',
    name: 'Name',
    address: 'Address',
    phone: 'Phone Number',
    date: 'Date',
    number: 'Number'
  };
  
  return labelMap[type] || 'Unknown Field';
}

// Function to create a form URL
export function createFormUrl(shortId: string): string {
  return `${window.location.origin}/f/form-${shortId}`;
}

// Function to create a section
export function createSection(title: string = 'New Section', description: string = ''): FormSection {
  return {
    id: uuidv4(),
    title,
    description
  };
}

// Function to create a question
export function createQuestion(type: FieldType = 'shortText', title: string = 'New Question', sectionId?: string): FormQuestion {
  return {
    id: uuidv4(),
    type,
    title,
    required: false,
    sectionId,
    options: type === 'multipleChoice' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
    maxRating: type === 'rating' ? 5 : undefined
  };
}

// Function to get default form theme
export function getDefaultFormTheme(logoUrl?: string): FormTheme {
  return {
    backgroundColor: '#ffffff',
    textColor: '#333333',
    primaryColor: '#3b82f6',
    fontFamily: 'Inter, sans-serif',
    logoUrl
  };
}

// Function to group questions by sections
export function getQuestionsGroupedBySections({ 
  questions, 
  sections 
}: { 
  questions: FormQuestion[]; 
  sections: FormSection[] 
}): Record<string, FormQuestion[]> {
  const result: Record<string, FormQuestion[]> = {};
  
  // Initialize with empty arrays for each section
  sections.forEach(section => {
    result[section.id] = [];
  });
  
  // Add a group for questions without section
  result['unsectioned'] = [];
  
  // Group questions by section
  questions.forEach(question => {
    if (question.sectionId && result[question.sectionId]) {
      result[question.sectionId].push(question);
    } else {
      result['unsectioned'].push(question);
    }
  });
  
  return result;
}