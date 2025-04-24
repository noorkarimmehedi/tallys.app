import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { FormSectionAccordion } from '@/components/ui/form-section-accordion';

export default function FormDemo() {
  return (
    <MainLayout>
      <div className="container py-10 mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 font-['Alternate_Gothic', 'sans-serif']">Form Demo</h1>
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-sm">
          <FormSectionAccordion />
        </div>
      </div>
    </MainLayout>
  );
}