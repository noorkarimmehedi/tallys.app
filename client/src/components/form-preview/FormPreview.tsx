import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormQuestion, FormResponse } from "@shared/schema";
import ShortText from "@/components/ui/form-fields/ShortText";
import Paragraph from "@/components/ui/form-fields/Paragraph";
import MultipleChoice from "@/components/ui/form-fields/MultipleChoice";
import Email from "@/components/ui/form-fields/Email";
import FileUpload from "@/components/ui/form-fields/FileUpload";
import Rating from "@/components/ui/form-fields/Rating";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  
  return (
    <div className="flex items-center justify-center min-h-full p-6">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">{form.title}</h3>
          {currentQuestionIndex === 0 && (
            <p className="text-gray-600">Help us by filling out this form</p>
          )}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold mb-2 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
                {currentQuestion.title}
              </h3>
              {currentQuestion.description && (
                <p className="text-gray-600">{currentQuestion.description}</p>
              )}
            </div>
            
            <Card className="bg-white rounded-lg shadow-md">
              <CardContent className="p-6">
                {renderField(currentQuestion)}
              </CardContent>
            </Card>
            
            <div className="mt-6 flex justify-between">
              {currentQuestionIndex > 0 ? (
                <Button 
                  variant="outline"
                  onClick={goToPrevious}
                  className="font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  Previous
                </Button>
              ) : (
                <div></div> 
              )}
              
              <Button 
                onClick={goToNext}
                disabled={!canProceed() || submitResponseMutation.isPending}
                className="bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
              >
                {submitResponseMutation.isPending ? (
                  <span className="animate-spin mr-2">●</span>
                ) : currentQuestionIndex === questions.length - 1 ? (
                  "Submit"
                ) : (
                  <>Next <i className="ri-arrow-right-line ml-2"></i></>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="mt-10 flex justify-center">
          <div className="flex gap-1">
            {questions.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentQuestionIndex 
                    ? "bg-black" 
                    : index < currentQuestionIndex 
                      ? "bg-gray-500" 
                      : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
