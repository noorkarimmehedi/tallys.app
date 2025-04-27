import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Clock, User, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

// Booking interface matching our API response
interface Booking {
  id: number;
  eventId: number;
  name: string;
  email: string;
  date: string;
  time: string;
  status: string;
  eventTitle?: string;
  eventDuration?: number;
}

export default function Calendar() {
  const { user, isLoading: authLoading } = useAuth();
  const today = new Date();
  const [date, setDate] = useState<Date | undefined>(today);

  // Format date string for API call
  // We need to ensure timezone consistency by using UTC date
  const dateObj = date || today;
  const dateParam = format(dateObj, 'yyyy-MM-dd');
  
  // For debugging - log the selected date
  console.log(`Selected date: ${dateParam}`);
  
  const { 
    data: bookings,
    isLoading: bookingsLoading,
    refetch: refetchBookings
  } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/date', dateParam],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/date/${dateParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      return response.json();
    },
    enabled: !!user && !!date
  });

  // When date changes, refetch bookings
  useEffect(() => {
    if (date && user) {
      refetchBookings();
    }
  }, [date, refetchBookings, user]);
  
  if (authLoading) {
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
        <p className="mt-1 text-sm text-gray-500">View your appointments and bookings</p>
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
              <CardDescription>
                {bookings && bookings.length > 0 
                  ? `${bookings.length} booking${bookings.length === 1 ? '' : 's'} scheduled`
                  : 'No bookings scheduled for this day'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookingsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <div className="divide-y">
                    {bookings.map(booking => (
                      <div key={booking.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{booking.eventTitle || 'Appointment'}</h3>
                            <p className="text-sm text-gray-600">{booking.name}</p>
                          </div>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'outline'}>
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-blue-500" />
                            <span>
                              {(() => {
                                // Format time in 12-hour format with AM/PM
                                const [hour, minute] = booking.time.split(':').map(Number);
                                const startDate = new Date();
                                startDate.setHours(hour, minute, 0);
                                
                                const startTime = startDate.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true
                                });
                                
                                if (!booking.eventDuration) return startTime;
                                
                                // Calculate and format end time
                                const endDate = new Date(startDate.getTime() + booking.eventDuration * 60000);
                                const endTime = endDate.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true
                                });
                                
                                return (
                                  <>
                                    {startTime} <ArrowRight className="inline h-3 w-3 mx-1" /> {endTime}
                                  </>
                                );
                              })()}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2 text-blue-500" />
                            <span>{booking.email}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4 text-blue-300">
                      <CalendarIcon className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2 font-['Alternate_Gothic', 'sans-serif']">
                      No bookings for this day
                    </h3>
                    <p className="text-gray-600">
                      When customers book appointments, they'll appear here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
