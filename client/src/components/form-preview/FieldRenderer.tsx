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

const FieldRenderer: React.FC<FieldRendererProps> = ({ 
  question, 
  value, 
  onChange,
  preview = false 
}) => {
  switch (question.type) {
    case 'shortText':
      return (
        <ShortText
          value={value}
          onChange={onChange}
          preview={preview}
        />
      );
    case 'paragraph':
      return (
        <Paragraph
          value={value}
          onChange={onChange}
          preview={preview}
        />
      );
    case 'email':
      return (
        <Email
          value={value}
          onChange={onChange}
          preview={preview}
        />
      );
    case 'multipleChoice':
      return (
        <MultipleChoice
          value={value}
          options={question.options || []}
          onChange={onChange}
          onOptionsChange={() => {}}
          preview={preview}
        />
      );
    case 'fileUpload':
      return (
        <FileUpload
          value={value}
          onChange={onChange}
          preview={preview}
        />
      );
    case 'rating':
      return (
        <Rating
          value={value || 0}
          maxRating={question.maxRating || 5}
          onChange={onChange}
          onMaxRatingChange={() => {}}
          preview={preview}
        />
      );
    default:
      return <div>Unsupported field type: {question.type}</div>;
  }
};

export default FieldRenderer;