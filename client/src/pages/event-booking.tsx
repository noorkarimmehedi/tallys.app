import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { format } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar-new';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Clock, MapPin, User, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function EventBooking() {
  const params = useParams();
  const shortId = params.shortId;
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  
  // Fetch event details
  const { data: event, isLoading, error } = useQuery({
    queryKey: [`/api/events/by-shortid/${shortId}`],
    queryFn: async () => {
      const response = await fetch(`/api/events/by-shortid/${shortId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }
      return response.json();
    }
  });
  
  // Get available time slots for selected date
  const getTimeSlotsForDate = (date?: Date) => {
    if (!date || !event?.weeklySchedule) return [];
    
    try {
      // Get day of week from selected date
      const dayOfWeek = format(date, 'EEEE').toLowerCase();
      
      // Parse weekly schedule from event
      const weeklySchedule = JSON.parse(event.weeklySchedule);
      
      // Check if this day is enabled
      if (weeklySchedule[dayOfWeek]?.enabled) {
        return weeklySchedule[dayOfWeek].timeSlots;
      }
      
      return [];
    } catch (err) {
      console.error("Error getting time slots:", err);
      return [];
    }
  };
  
  // Calculate available days based on weekly schedule
  const getAvailableDays = () => {
    if (!event?.weeklySchedule) return [];
    
    try {
      const weeklySchedule = JSON.parse(event.weeklySchedule);
      return Object.entries(weeklySchedule)
        .filter(([_, data]: [string, any]) => data.enabled && data.timeSlots.length > 0)
        .map(([day]: [string, any]) => day);
    } catch (err) {
      console.error("Error getting available days:", err);
      return [];
    }
  };
  
  // Check if a date should be disabled (no availability)
  const isDateDisabled = (date: Date) => {
    const dayOfWeek = format(date, 'EEEE').toLowerCase();
    const availableDays = getAvailableDays();
    return !availableDays.includes(dayOfWeek);
  };
  
  // Create booking mutation
  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedTime || !name || !email) {
        throw new Error('Please fill in all required fields');
      }
      
      const bookingData = {
        eventId: event.id,
        name,
        email,
        date: selectedDate.toISOString(),
        time: selectedTime
      };
      
      const response = await apiRequest('POST', '/api/bookings', bookingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/by-shortid/${shortId}`] });
      setBookingComplete(true);
      toast({
        title: 'Booking confirmed',
        description: `Your appointment has been scheduled for ${format(selectedDate!, 'MMMM d, yyyy')} at ${selectedTime}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Booking failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  const handleBooking = () => {
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your name',
        variant: 'destructive'
      });
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      toast({
        title: 'Valid email required',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }
    
    if (!selectedDate) {
      toast({
        title: 'Date required',
        description: 'Please select a date for your appointment',
        variant: 'destructive'
      });
      return;
    }
    
    if (!selectedTime) {
      toast({
        title: 'Time required',
        description: 'Please select a time for your appointment',
        variant: 'destructive'
      });
      return;
    }
    
    bookingMutation.mutate();
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-xl">Event Not Found</CardTitle>
            <CardDescription>The event you're looking for doesn't exist or has been removed.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (bookingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">Booking Confirmed!</CardTitle>
            <CardDescription>
              Your appointment has been scheduled for {format(selectedDate!, 'MMMM d, yyyy')} at {selectedTime}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-gray-900">{event.title}</h3>
              <p className="text-sm text-gray-500">{event.duration} minutes</p>
            </div>
            <p className="text-sm text-gray-500">
              We've sent a confirmation email to <span className="font-medium">{email}</span>
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Done
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Get available time slots for the selected date
  const availableTimeSlots = selectedDate ? getTimeSlotsForDate(selectedDate) : [];
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Event details */}
          <div>
            <div className="sticky top-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Host Name</h3>
                  <p className="text-sm text-gray-500">Tallys Calendar</p>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{event.duration} minutes</span>
                    {event.location && (
                      <>
                        <div className="mx-2 w-1 h-1 rounded-full bg-gray-300"></div>
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.location}</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {event.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Right column - Booking form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Book your appointment</CardTitle>
                <CardDescription>Select a date and time to book your appointment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date picker */}
                <div>
                  <Label className="block mb-2">Select a date</Label>
                  <div className="border rounded-md p-3 bg-white">
                    <Calendar 
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setSelectedTime(null); // Reset time selection when date changes
                      }}
                      disabled={[
                        { before: new Date() }, // Disable past dates
                        isDateDisabled // Disable dates with no availability
                      ]}
                      className="mx-auto"
                    />
                  </div>
                </div>
                
                {/* Time slots */}
                {selectedDate && (
                  <div>
                    <Label className="block mb-2">
                      Select a time on {format(selectedDate, 'EEEE, MMMM d')}
                    </Label>
                    {availableTimeSlots.length === 0 ? (
                      <p className="text-sm text-gray-500 p-4 text-center border rounded-md">
                        No available times on this day.
                      </p>
                    ) : (
                      <div className="border rounded-md p-4 bg-white max-h-48">
                        <ScrollArea className="h-full pr-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {availableTimeSlots.map((time) => (
                              <Button
                                key={time}
                                type="button"
                                variant={selectedTime === time ? "default" : "outline"}
                                size="sm"
                                className="w-full"
                                onClick={() => setSelectedTime(time)}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Contact information */}
                <div className="pt-4 space-y-4">
                  <div>
                    <Label htmlFor="name" className="block mb-1">Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="block mb-1">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime || !name || !email || bookingMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {bookingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Confirm Booking
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}