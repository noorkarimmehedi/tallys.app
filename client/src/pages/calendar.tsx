import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function Calendar() {
  const { data: forms, isLoading } = useQuery({
    queryKey: ['/api/forms'],
  });

  const today = new Date();
  const [date, setDate] = React.useState<Date | undefined>(today);
  
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  // Format date for display
  const formattedDate = date ? date.toLocaleDateString('en-US', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  }) : '';
  
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 font-['Alternate_Gothic', 'sans-serif'] tracking-wide">Calendar</h2>
        <p className="mt-1 text-sm text-gray-500">View form activity and schedule</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
                Date Picker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg font-['Alternate_Gothic', 'sans-serif'] tracking-wide">
                {formattedDate || 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {date ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4 text-gray-300">
                      <i className="ri-calendar-line"></i>
                    </div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2 font-['Alternate_Gothic', 'sans-serif']">
                      No events for this day
                    </h3>
                    <p className="text-gray-600">
                      Form responses and scheduled events will appear here
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">
                    Select a date to view events and form activities
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
