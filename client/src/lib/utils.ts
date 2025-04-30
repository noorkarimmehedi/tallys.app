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
  sections,
  infoDescription 
}: { 
  questions: FormQuestion[]; 
  sections: FormSection[];
  infoDescription?: string;
}): Array<{
  sectionId: string;
  sectionTitle: string;
  sectionDescription?: string;
  questions: FormQuestion[];
}> {
  const tempResult: Record<string, FormQuestion[]> = {};
  const sectionsMap: Record<string, { title: string; description?: string }> = {};
  
  // Initialize with empty arrays for each section and build sections map
  sections.forEach(section => {
    tempResult[section.id] = [];
    sectionsMap[section.id] = { 
      title: section.title,
      description: section.description
    };
  });
  
  // Add a group for questions without section
  tempResult['unsectioned'] = [];
  
  // Group questions by section
  questions.forEach(question => {
    if (question.sectionId && tempResult[question.sectionId]) {
      tempResult[question.sectionId].push(question);
    } else {
      tempResult['unsectioned'].push(question);
    }
  });
  
  // Convert to array format
  const result = Object.entries(tempResult)
    .filter(([_, questionList]) => questionList.length > 0) // Only include sections with questions
    .map(([sectionId, questions]) => {
      if (sectionId === 'unsectioned') {
        return {
          sectionId: 'unsectioned',
          sectionTitle: 'Questions',
          questions
        };
      } else {
        return {
          sectionId,
          sectionTitle: sectionsMap[sectionId]?.title || 'Section',
          sectionDescription: sectionsMap[sectionId]?.description,
          questions
        };
      }
    });
    
  // Add information section if description is provided
  if (infoDescription) {
    result.unshift({
      sectionId: 'information',
      sectionTitle: 'Information',
      sectionDescription: infoDescription,
      questions: []
    });
  }
  
  return result;
}