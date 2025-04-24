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
import { CheckCircle, User, Mail, FileText, Star, MapPin } from "lucide-react";
import { getQuestionsGroupedBySections } from "@/lib/utils";
import { Tiles } from "@/components/ui/tiles";
import { FormSectionAccordion } from "@/components/ui/form-section-accordion";

interface FormPreviewProps {
  form: Form;
  preview?: boolean;
}

export function FormPreview({ form, preview = false }: FormPreviewProps) {
  const [answers, setAnswers] = useState<FormResponse>({});
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();
  
  console.log("FormPreview rendering with form:", {
    id: form.id,
    title: form.title,
    questionCount: form.questions?.length || 0,
    sectionCount: form.sections?.length || 0
  });
  
  // Ensure form has questions and sections arrays
  const questions = form.questions || [];
  const sections = form.sections || [];
  
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
  
  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    console.log("Updated answers:", { ...answers, [questionId]: answer });
  };
  
  const isQuestionComplete = (questionId: string) => {
    return answers[questionId] !== undefined && answers[questionId] !== "";
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
  
  if (completed) {
    return (
      <div className="flex items-center justify-center min-h-screen relative">
        {/* Tiles Background */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <Tiles 
            rows={50} 
            cols={8}
            tileSize="md"
            tileClassName="border-gray-200"
          />
        </div>
        
        <div className="max-w-xl w-full p-6">
          <Card className="bg-white/90 backdrop-blur-md shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="text-5xl text-green-500 mb-4">
                <CheckCircle className="w-16 h-16 mx-auto stroke-1" />
              </div>
              <h3 className="text-2xl font-bold mb-2 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">Thank You!</h3>
              <p className="text-gray-600 mb-6">Your response has been recorded.</p>
              {preview && (
                <Button 
                  className="bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
                  onClick={() => {
                    setAnswers({});
                    setCompleted(false);
                  }}
                >
                  Start Over
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen relative">
      {/* Tiles Background */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <Tiles 
          rows={50} 
          cols={8}
          tileSize="md"
          tileClassName="border-gray-200"
        />
      </div>
      
      <div className="w-full max-w-[600px] px-3 sm:px-6 py-4 sm:py-6">
        <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-2 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">{form.title}</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Please complete all the sections below</p>
          </div>
          
          {questions.length === 0 ? (
            <div className="text-center p-6 border border-dashed border-gray-300 rounded-md">
              <p className="text-gray-500">This form has no questions yet.</p>
            </div>
          ) : (
            <FormSectionAccordion 
              questions={questions}
              sections={sections}
              onAnswerChange={handleAnswer}
              formResponses={answers}
              preview={preview}
            />
          )}
          
          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleSubmit}
              disabled={submitResponseMutation.isPending || questions.length === 0}
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
    </div>
  );
}
