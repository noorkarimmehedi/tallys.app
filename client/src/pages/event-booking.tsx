import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { format, addDays, isSameDay } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Clock, MapPin, User, Check, ArrowLeft, ArrowRight, Calendar as CalendarIcon, Globe, Video } from 'lucide-react';
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
    if (!date) {
      console.log("No date provided to getTimeSlotsForDate");
      return [];
    }
    
    if (!event?.weeklySchedule) {
      console.log("No weekly schedule found in event data", event);
      // Default time slots for demonstration when no schedule exists
      return ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];
    }
    
    try {
      // Get day of week from selected date
      const dayOfWeek = format(date, 'EEEE').toLowerCase();
      console.log("Getting time slots for day:", dayOfWeek);
      
      // Parse weekly schedule from event
      let weeklySchedule;
      try {
        weeklySchedule = JSON.parse(event.weeklySchedule);
      } catch (e) {
        console.log("Failed to parse weekly schedule:", e);
        // If parsing fails, provide default time slots
        return ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];
      }
      
      // Check if this day is enabled
      console.log("Is day enabled?", dayOfWeek, weeklySchedule[dayOfWeek]?.enabled);
      
      if (weeklySchedule[dayOfWeek]?.enabled) {
        const slots = weeklySchedule[dayOfWeek].timeSlots;
        console.log("Available time slots:", slots);
        
        // If slots array exists but is empty, provide default slots
        if (!slots || slots.length === 0) {
          console.log("Time slots array is empty, using defaults");
          return ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];
        }
        
        return slots;
      } else {
        console.log("Day is not enabled in weekly schedule");
        
        // For testing, provide default slots for all days
        return ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];
      }
    } catch (err) {
      console.error("Error getting time slots:", err);
      return ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];
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
    console.log("Available days:", availableDays, "Current day:", dayOfWeek);
    // Temporarily return false to allow all dates for testing
    return false;
    // return !availableDays.includes(dayOfWeek);
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
  
  // Current date for calendar
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const today = new Date();
  
  // Format time slot for display
  const formatTimeSlot = (timeString: string) => {
    try {
      // Parse the time string (assuming format like "10:00" or "14:30")
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0);
      
      // Format using 12-hour clock with am/pm
      return format(date, 'h:mma').toLowerCase();
    } catch (e) {
      return timeString; // Return the original if parsing fails
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">T</span>
            </div>
            <h1 className="text-xl font-medium">Tallys</h1>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container max-w-6xl mx-auto px-4 py-6 md:py-12">
        <div className="flex flex-col md:flex-row md:space-x-8">
          {/* Left Column: Event Info */}
          <div className="w-full md:w-1/3 mb-8 md:mb-0">
            <h2 className="text-2xl font-semibold mb-2">{event.title}</h2>
            <div className="flex items-center text-gray-600 mb-6">
              <Clock className="h-4 w-4 mr-2" />
              <span>{event.duration} min</span>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <p className="text-gray-600 mb-6">
                {event.description || "No description provided."}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mt-1">
                    <Clock className="h-5 w-5 text-gray-500 mr-4" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Duration</h3>
                    <p className="text-gray-600">{event.duration} minutes</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mt-1">
                    <Video className="h-5 w-5 text-gray-500 mr-4" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Video call</h3>
                    <p className="text-gray-600">
                      A video call will be added to this event
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mt-1">
                    <Globe className="h-5 w-5 text-gray-500 mr-4" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Time zone</h3>
                    <p className="text-gray-600">
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column: Calendar and Form */}
          <div className="w-full md:w-2/3">
            {selectedTime && selectedDate ? (
              /* Step 2: Contact Form */
              <div>
                <div className="mb-8">
                  <button 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    onClick={() => setSelectedTime(null)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </button>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-900">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <p className="text-gray-600">
                      {formatTimeSlot(selectedTime)}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="font-medium">
                      Your name
                    </Label>
                    <Input 
                      id="name" 
                      className={`mt-2 w-full ${!name.trim() && 'border-red-500'}`}
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      aria-invalid={!name.trim()}
                      aria-describedby="name-error"
                    />
                    {!name.trim() && (
                      <p id="name-error" className="text-sm text-red-500 mt-1">
                        Your name is required
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="font-medium">
                      Email address
                    </Label>
                    <Input 
                      id="email" 
                      type="email"
                      className={`mt-2 w-full ${(email.trim() === '' || (email.trim() && !email.includes('@'))) && 'border-red-500'}`}
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      aria-invalid={email.trim() === '' || (email.trim() && !email.includes('@'))}
                      aria-describedby="email-error"
                    />
                    {(email.trim() === '' || (email.trim() && !email.includes('@'))) && (
                      <p id="email-error" className="text-sm text-red-500 mt-1">
                        {!email.trim() ? "Email address is required" : "Please enter a valid email address"}
                      </p>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleBooking}
                      disabled={!name || !email || bookingMutation.isPending}
                      className="w-full bg-black hover:bg-gray-800 text-white py-3"
                    >
                      {bookingMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Confirm
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Step 1: Date & Time Selection */
              <div>
                {/* Calendar Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium">Select a date and time</h2>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        const prevMonth = new Date(currentMonth);
                        prevMonth.setMonth(prevMonth.getMonth() - 1);
                        setCurrentMonth(prevMonth);
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        const nextMonth = new Date(currentMonth);
                        nextMonth.setMonth(nextMonth.getMonth() + 1);
                        setCurrentMonth(nextMonth);
                      }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:space-x-6 mb-8">
                  {/* Calendar */}
                  <div className="w-full md:w-2/3 mb-6 md:mb-0">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-center mb-4">
                        <h3 className="font-medium">
                          {format(currentMonth, 'MMMM yyyy')}
                        </h3>
                      </div>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          console.log("Date selected:", date);
                          if (date) {
                            setSelectedDate(date);
                            // Automatically scroll to time slots
                            setTimeout(() => {
                              document.getElementById('time-slots')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }
                        }}
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        classNames={{
                          day_selected: "bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white",
                          day_today: "border border-gray-200 bg-gray-50 text-black",
                          day: "focus:bg-gray-100 focus:text-black hover:bg-gray-100 hover:text-black"
                        }}
                        disabled={[
                          { before: today }
                        ]}
                        fromMonth={today}
                        toMonth={new Date(today.getFullYear(), today.getMonth() + 3, 0)}
                      />
                    </div>
                  </div>
                  
                  {/* Time Slots */}
                  <div className="w-full md:w-1/3" id="time-slots">
                    {selectedDate ? (
                      <>
                        <div className="mb-4">
                          <h3 className="font-medium text-gray-900">
                            {format(selectedDate, 'EEEE, MMMM d')}
                          </h3>
                        </div>
                        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                          {availableTimeSlots && availableTimeSlots.length > 0 ? (
                            availableTimeSlots.map((time: string) => (
                              <Button
                                key={time}
                                variant="outline"
                                className="w-full justify-start text-left h-auto py-3 font-normal hover:border-black hover:text-black"
                                onClick={() => {
                                  console.log("Time selected:", time);
                                  setSelectedTime(time);
                                }}
                              >
                                {formatTimeSlot(time)}
                              </Button>
                            ))
                          ) : (
                            <div className="text-center p-4 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                              No available time slots for this day
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 text-gray-500 border border-dashed border-gray-300 rounded-lg h-full flex items-center justify-center">
                        <div>
                          <CalendarIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                          <p>Select a date to view available times</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}