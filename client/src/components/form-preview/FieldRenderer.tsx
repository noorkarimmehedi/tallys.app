import React from 'react';
import { FormQuestion } from '@shared/schema';
import ShortText from '@/components/ui/form-fields/ShortText';
import Paragraph from '@/components/ui/form-fields/Paragraph';
import Email from '@/components/ui/form-fields/Email';
import MultipleChoice from '@/components/ui/form-fields/MultipleChoice';
import FileUpload from '@/components/ui/form-fields/FileUpload';
import Rating from '@/components/ui/form-fields/Rating';
import DateField from '@/components/ui/form-fields/DateField';

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
    case "name":  // Handle "name" type using the same ShortText component
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
    case "number":
      return (
        <ShortText
          value={value as string}
          onChange={onChange}
        />
      );
    case "phone":
      return (
        <ShortText
          value={value as string}
          onChange={onChange}
        />
      );
    case "address":
      return (
        <Paragraph
          value={value as string}
          onChange={onChange}
        />
      );
    case "date":
      return (
        <DateField
          value={value as string}
          onChange={onChange}
          label={question.title}
          description={question.description}
          required={question.required}
          preview={preview}
        />
      );
    default:
      return <div className="p-2 border border-red-300 rounded bg-red-50 text-red-600">Unsupported question type: {question.type}</div>;
  }
}