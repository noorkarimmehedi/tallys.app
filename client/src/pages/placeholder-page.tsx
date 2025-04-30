import React from "react";
import { useLocation } from "wouter";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const [location] = useLocation();
  const path = location.substring(1); // Remove the leading slash
  const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
  
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-6">
      <h1 className="text-3xl font-bold mb-4">{title || formattedPath}</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        {description || `This is a placeholder page for the ${formattedPath} section. This feature will be implemented in a future update.`}
      </p>
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-100 text-blue-800 font-medium">
        Coming Soon
      </div>
    </div>
  );
}