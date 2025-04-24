import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormQuestion, FormResponse, FormSection } from "@shared/schema";
import ShortText from "@/components/ui/form-fields/ShortText";
import Paragraph from "@/components/ui/form-fields/Paragraph";
import MultipleChoice from "@/components/ui/form-fields/MultipleChoice";
import Email from "@/components/ui/form-fields/Email";
import FileUpload from "@/components/ui/form-fields/FileUpload";
import Rating from "@/components/ui/form-fields/Rating";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Mail, MapPin, User, FileText, Star, CheckCircle } from "lucide-react";
import { getQuestionsGroupedBySections } from "@/lib/utils";

interface FormPreviewProps {
  form: Form;
  preview?: boolean;
}

export function FormPreview({ form, preview = false }: FormPreviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<FormResponse>({});
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();
  
  const submitResponseMutation = useMutation({
    mutationFn: async (responseData: { answers: FormResponse }) => {
      const response = await apiRequest('POST', `/api/forms/${form.id}/responses`, responseData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Response submitted",
        description: "Thank you for your submission!",
      });
      setCompleted(true);
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to submit your response",
        variant: "destructive",
      });
    }
  });
  
  const questions = form.questions;
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };
  
  const canProceed = () => {
    if (!currentQuestion) return true;
    if (!currentQuestion.required) return true;
    return answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== "";
  };
  
  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      if (!preview) {
        submitResponseMutation.mutate({ answers });
      } else {
        setCompleted(true);
      }
    }
  };
  
  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const renderField = (question: FormQuestion) => {
    const value = answers[question.id] || "";
    
    switch (question.type) {
      case "shortText":
        return (
          <ShortText
            value={value as string}
            onChange={(value) => handleAnswer(question.id, value)}
          />
        );
      case "paragraph":
        return (
          <Paragraph
            value={value as string}
            onChange={(value) => handleAnswer(question.id, value)}
          />
        );
      case "email":
        return (
          <Email
            value={value as string}
            onChange={(value) => handleAnswer(question.id, value)}
          />
        );
      case "multipleChoice":
        return (
          <MultipleChoice
            value={value as string}
            onChange={(value) => handleAnswer(question.id, value)}
            options={question.options || []}
          />
        );
      case "fileUpload":
        return (
          <FileUpload
            value={value as string}
            onChange={(value) => handleAnswer(question.id, value)}
          />
        );
      case "rating":
        return (
          <Rating
            value={Number(value) || 0}
            onChange={(value) => handleAnswer(question.id, value)}
            maxRating={question.maxRating || 5}
          />
        );
      default:
        return <div>Unsupported question type</div>;
    }
  };
  
  if (completed) {
    return (
      <div className="flex items-center justify-center min-h-full p-6">
        <Card className="max-w-xl w-full">
          <CardContent className="p-6 text-center">
            <div className="text-5xl text-green-500 mb-4">
              <i className="ri-check-line"></i>
            </div>
            <h3 className="text-2xl font-bold mb-2 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">Thank You!</h3>
            <p className="text-gray-600 mb-6">Your response has been recorded.</p>
            {preview && (
              <Button 
                className="bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
                onClick={() => {
                  setAnswers({});
                  setCurrentQuestionIndex(0);
                  setCompleted(false);
                }}
              >
                Start Over
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Helper function to get icon based on question type
  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'shortText':
        return <User className="size-4 stroke-2 text-muted-foreground" />;
      case 'email':
        return <Mail className="size-4 stroke-2 text-muted-foreground" />;
      case 'paragraph':
        return <FileText className="size-4 stroke-2 text-muted-foreground" />;
      case 'multipleChoice':
        return <CheckCircle className="size-4 stroke-2 text-muted-foreground" />;
      case 'rating':
        return <Star className="size-4 stroke-2 text-muted-foreground" />;
      default:
        return <User className="size-4 stroke-2 text-muted-foreground" />;
    }
  };

  // Helper function to get section icon
  const getSectionIcon = (icon?: string) => {
    if (!icon) return <User className="size-4 stroke-2 text-muted-foreground" />;
    
    switch (icon) {
      case 'user':
        return <User className="size-4 stroke-2 text-muted-foreground" />;
      case 'mail':
        return <Mail className="size-4 stroke-2 text-muted-foreground" />;
      case 'map':
        return <MapPin className="size-4 stroke-2 text-muted-foreground" />;
      default:
        return <User className="size-4 stroke-2 text-muted-foreground" />;
    }
  };

  const isQuestionComplete = (questionId: string) => {
    return answers[questionId] !== undefined && answers[questionId] !== "";
  };
  
  // Check if section is complete (all required questions answered)
  const isSectionComplete = (sectionQuestions: FormQuestion[]) => {
    return sectionQuestions.every(q => 
      !q.required || isQuestionComplete(q.id)
    );
  };
  
  const handleSubmit = () => {
    // Check if all required questions are answered
    const allRequiredAnswered = questions.every(question => 
      !question.required || isQuestionComplete(question.id)
    );
    
    if (allRequiredAnswered) {
      if (!preview) {
        submitResponseMutation.mutate({ answers });
      } else {
        setCompleted(true);
      }
    } else {
      toast({
        title: "Missing required fields",
        description: "Please answer all required questions",
        variant: "destructive",
      });
    }
  };

  // Group questions by section
  const sections = form.sections || [];
  const questionsBySection = getQuestionsGroupedBySections({ 
    questions: form.questions, 
    sections 
  }) as {
    sectionId: string | undefined;
    sectionTitle: string;
    sectionDescription?: string;
    sectionIcon?: string;
    questions: FormQuestion[];
  }[];

  // Map our form data to the structure expected by FormSectionAccordion
  const formSections = questionsBySection.map(section => ({
    id: section.sectionId || 'default',
    title: section.sectionTitle,
    icon: getSectionIcon(section.sectionIcon),
    isComplete: isSectionComplete(section.questions),
    children: (
      <div className="flex flex-col gap-4">
        {section.sectionDescription && (
          <p className="text-gray-600">{section.sectionDescription}</p>
        )}
        {section.questions.map((question) => (
          <div key={question.id} className="flex flex-col gap-2">
            <div className="flex flex-col">
              <h4 className="text-md font-medium flex items-center gap-2">
                {getQuestionIcon(question.type)}
                {question.title}
                {question.required && <span className="text-red-500">*</span>}
              </h4>
              {question.description && (
                <p className="text-sm text-gray-500">{question.description}</p>
              )}
            </div>
            {renderField(question)}
          </div>
        ))}
      </div>
    ),
  }));

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-[400px] w-full">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">{form.title}</h3>
          <p className="text-gray-600 mb-6">Please complete all the sections below</p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {formSections.map((section) => (
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
              <AccordionContent>
                {section.children}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleSubmit}
            disabled={submitResponseMutation.isPending}
            className="bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
          >
            {submitResponseMutation.isPending ? (
              <span className="animate-spin mr-2">●</span>
            ) : (
              "Submit Form"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
