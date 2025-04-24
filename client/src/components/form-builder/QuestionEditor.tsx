import React from "react";
import { FormQuestion } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import ShortText from "@/components/ui/form-fields/ShortText";
import Paragraph from "@/components/ui/form-fields/Paragraph";
import MultipleChoice from "@/components/ui/form-fields/MultipleChoice";
import Email from "@/components/ui/form-fields/Email";
import FileUpload from "@/components/ui/form-fields/FileUpload";
import Rating from "@/components/ui/form-fields/Rating";

interface QuestionEditorProps {
  question: FormQuestion;
  onChange: (id: string, updates: Partial<FormQuestion>) => void;
  onDelete: () => void;
}

export function QuestionEditor({ question, onChange, onDelete }: QuestionEditorProps) {
  const handleChange = (key: keyof FormQuestion, value: any) => {
    onChange(question.id, { [key]: value });
  };
  
  const renderFieldEditor = () => {
    const baseProps = {
      value: "",
      onChange: () => {},
      preview: true
    };
    
    switch (question.type) {
      case "shortText":
        return <ShortText {...baseProps} />;
      case "paragraph":
        return <Paragraph {...baseProps} />;
      case "email":
        return <Email {...baseProps} />;
      case "multipleChoice":
        return (
          <MultipleChoice 
            {...baseProps} 
            options={question.options || []}
            onOptionsChange={(options) => handleChange('options', options)} 
          />
        );
      case "fileUpload":
        return <FileUpload {...baseProps} />;
      case "rating":
        return (
          <Rating 
            {...baseProps} 
            maxRating={question.maxRating || 5}
            onMaxRatingChange={(max) => handleChange('maxRating', max)}
          />
        );
      default:
        return <div className="p-4 text-gray-500">Unsupported question type</div>;
    }
  };
  
  return (
    <div className="animate-fadeIn transition-all duration-300">
      <div className="text-center mb-8">
        <Input
          value={question.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Question title"
          className="text-xl font-bold mb-2 text-center border-none focus:ring-0 font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
        />
        <Textarea
          value={question.description || ""}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Add a description (optional)"
          className="text-gray-600 text-center resize-none border-none focus:ring-0"
        />
      </div>
      
      <Card className="bg-white rounded-lg shadow-md">
        <CardContent className="p-6">
          {renderFieldEditor()}
          
          <div className="mt-6 flex items-center gap-2">
            <Checkbox 
              id="required" 
              checked={question.required} 
              onCheckedChange={(checked) => handleChange('required', checked)}
            />
            <Label htmlFor="required">Required question</Label>
          </div>
          
          {question.type === "shortText" || question.type === "paragraph" || question.type === "number" ? (
            <div className="mt-4">
              <Label htmlFor="variable" className="mb-1 block">Variable name (for calculations)</Label>
              <Input
                id="variable"
                value={question.variableName || ""}
                onChange={(e) => handleChange('variableName', e.target.value)}
                placeholder="e.g. price, score, etc."
                className="w-full"
              />
            </div>
          ) : null}
        </CardContent>
      </Card>
      
      <div className="mt-6 flex justify-end">
        <Button 
          variant="outline" 
          onClick={onDelete} 
          className="mr-2"
        >
          <i className="ri-delete-bin-line mr-2"></i>
          Delete
        </Button>
        
        <Button className="bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
          Next
          <i className="ri-arrow-right-line ml-2"></i>
        </Button>
      </div>
    </div>
  );
}
