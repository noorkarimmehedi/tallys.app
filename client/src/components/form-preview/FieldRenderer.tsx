import React from 'react';
import { FormQuestion } from '@shared/schema';
import ShortText from '@/components/ui/form-fields/ShortText';
import Paragraph from '@/components/ui/form-fields/Paragraph';
import Email from '@/components/ui/form-fields/Email';
import MultipleChoice from '@/components/ui/form-fields/MultipleChoice';
import FileUpload from '@/components/ui/form-fields/FileUpload';
import Rating from '@/components/ui/form-fields/Rating';

interface FieldRendererProps {
  question: FormQuestion;
  value: any;
  onChange: (value: any) => void;
  preview?: boolean;
}

export function FieldRenderer({ 
  question, 
  value, 
  onChange, 
  preview = false 
}: FieldRendererProps) {
  switch (question.type) {
    case "shortText":
      return (
        <ShortText
          value={value as string}
          onChange={onChange}
        />
      );
    case "paragraph":
      return (
        <Paragraph
          value={value as string}
          onChange={onChange}
        />
      );
    case "email":
      return (
        <Email
          value={value as string}
          onChange={onChange}
        />
      );
    case "multipleChoice":
      return (
        <MultipleChoice
          value={value as string}
          onChange={onChange}
          options={question.options || []}
        />
      );
    case "fileUpload":
      return (
        <FileUpload
          value={value as string}
          onChange={onChange}
        />
      );
    case "rating":
      return (
        <Rating
          value={Number(value) || 0}
          onChange={onChange}
          maxRating={question.maxRating || 5}
        />
      );
    default:
      return <div>Unsupported question type</div>;
  }
}