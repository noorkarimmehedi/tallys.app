import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { format, addDays, isSameDay } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { AppointmentPicker } from '@/components/ui/appointment-picker';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Loader2, Clock, MapPin, User, Check, ArrowLeft, ArrowRight, Calendar as CalendarIcon, Globe, Video, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tiles } from '@/components/ui/tiles';
import logoPath from '@assets/lgoooo.png';

export default function EventBooking() {
  const params = useParams();
  const shortId = params.shortId;
  const today = new Date();
  
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string>("event-details");
  
  // Fetch event details
  const { data: event, isLoading, error } = useQuery({
    queryKey: [`/api/events/by-shortid/${shortId}`],
    queryFn: async () => {
      const response = await fetch(`/api/events/by-shortid/${shortId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }
      const data = await response.json();
      console.log("Event data loaded:", data);
      console.log("Event theme:", data.theme);
      
      // Make sure theme exists with default values
      if (!data.theme) {
        data.theme = {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          primaryColor: '#3b82f6',
          fontFamily: 'Inter, sans-serif'
        };
      }
      
      return data;
    }
  });
  
  // Update accordion when steps change
  useEffect(() => {
    if (selectedDate && selectedTime) {
      setActiveAccordion("your-info");
    } else if (selectedDate) {
      setActiveAccordion("date-time");
    }
    // No else case - this allows the initial "event-details" to remain on first load
  }, [selectedDate, selectedTime]);
  
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <Tiles 
            rows={30} 
            cols={12}
            tileSize="md"
            tileClassName="opacity-40 border-primary/20"
          />
        </div>
        <div className="relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <Tiles 
            rows={30} 
            cols={12}
            tileSize="md"
            tileClassName="opacity-40 border-primary/20"
          />
        </div>
        <Card className="w-full max-w-md relative z-10 bg-white/80 backdrop-blur-sm">
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <Tiles 
            rows={30} 
            cols={12}
            tileSize="md"
            tileClassName="opacity-40 border-primary/20"
          />
        </div>
        <Card className="w-full max-w-md relative z-10 bg-white/80 backdrop-blur-sm">
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
            <div className="bg-white/80 p-4 rounded-lg mb-4 backdrop-blur-sm">
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
    <div className="min-h-screen relative bg-white">
      {/* Interactive Tiles Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <Tiles 
          rows={30} 
          cols={12}
          tileSize="md"
          tileClassName="opacity-40 border-primary/20"
        />
      </div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed top-0 left-0 right-0 py-1.5 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <div className="flex items-center">
            {/* Check if logo URL exists and is valid, otherwise fallback to default */}
            <img 
              src={event?.theme?.logoUrl ? event.theme.logoUrl : logoPath}
              alt="Logo" 
              className="h-7 max-w-[140px] object-contain" 
              onError={(e) => {
                console.error('Error loading image:', e);
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite error loop
                target.src = logoPath; // Fallback to default logo
              }}
            />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] relative z-10 px-4 py-6 md:py-8" style={{ marginTop: event?.theme?.logoUrl ? '40px' : '0' }}>
        <div className="flex flex-col space-y-6 md:space-y-8 w-full max-w-full sm:max-w-lg">
          {/* Event Title */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center justify-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{event.duration} min</span>
            </div>
          </div>
          
          {/* Using FormSectionAccordion component exactly as in the template */}
          <Accordion
            type="single"
            collapsible
            className="w-full max-w-full sm:max-w-md mx-auto bg-white/90 backdrop-blur-md rounded-lg p-3 md:p-4 shadow-sm border border-gray-100"
            value={activeAccordion}
            onValueChange={setActiveAccordion}
          >
            <AccordionItem value="event-details" className="mb-2 rounded-md border overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
              <AccordionTrigger className="group px-3 py-3 hover:no-underline hover:bg-muted/20">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 stroke-2 text-muted-foreground" />
                  <span className="font-medium">Event Details</span>
                  {activeAccordion !== "event-details" && (
                    <span className="ml-2 text-sm text-green-500">✓</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 sm:px-4">
                <div className="flex flex-col gap-2 py-2">
                  <p className="text-gray-600 text-sm sm:text-base">
                    {event.description || "No description provided."}
                  </p>
                  
                  <div className="mt-2 space-y-2">
                    <div className="flex items-start">
                      <div className="mt-1">
                        <Clock className="h-5 w-5 text-gray-500 mr-2" />
                      </div>
                      <div>
                        <h3 className="font-medium">Duration</h3>
                        <p className="text-sm text-gray-600">{event.duration} minutes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1">
                        <Video className="h-5 w-5 text-gray-500 mr-2" />
                      </div>
                      <div>
                        <h3 className="font-medium">Video call</h3>
                        <p className="text-sm text-gray-600">
                          A video call will be added to this event
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mt-1">
                        <Globe className="h-5 w-5 text-gray-500 mr-2" />
                      </div>
                      <div>
                        <h3 className="font-medium">Time zone</h3>
                        <p className="text-sm text-gray-600">
                          {Intl.DateTimeFormat().resolvedOptions().timeZone}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      onClick={() => setActiveAccordion("date-time")}
                      className="w-full"
                    >
                      Continue to Date & Time
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="date-time" className="mb-2 rounded-md border overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
              <AccordionTrigger className="group px-3 py-3 hover:no-underline hover:bg-muted/20">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="size-4 stroke-2 text-muted-foreground" />
                  <span className="font-medium">Date & Time</span>
                  {selectedDate && selectedTime && (
                    <span className="ml-2 text-sm text-green-500">✓</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 sm:px-4">
                <div className="flex flex-col gap-2 py-2">
                  <div className="rounded-md overflow-hidden">
                    <AppointmentPicker
                      initialDate={selectedDate || undefined}
                      initialTime={selectedTime}
                      timeSlots={availableTimeSlots.map((time: string) => ({
                        time,
                        available: true
                      }))}
                      onDateChange={(date) => {
                        setSelectedDate(date);
                      }}
                      onTimeChange={(time: string | null) => {
                        setSelectedTime(time);
                        if (time && selectedDate) {
                          // Automatically open the Your Information section when both date and time are selected
                          setActiveAccordion("your-info");
                        }
                      }}
                      disabledDates={[
                        { before: today }
                      ]}
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs text-muted-foreground">Select a date and time for your appointment</p>
                  </div>
                  {/* Button removed as the section now opens automatically */}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="your-info" className="mb-2 rounded-md border overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
              <AccordionTrigger className="group px-3 py-3 hover:no-underline hover:bg-muted/20">
                <div className="flex items-center gap-2">
                  <User className="size-4 stroke-2 text-muted-foreground" />
                  <span className="font-medium">Your Information</span>
                  {name && email && (
                    <span className="ml-2 text-sm text-green-500">✓</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 sm:px-4">
                <div className="flex flex-col gap-2 py-2">
                  {selectedDate && selectedTime && (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {formatTimeSlot(selectedTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="name" className="font-medium">
                      Your name
                    </Label>
                    <Input 
                      id="name" 
                      className={`mt-1 w-full ${!name.trim() && 'border-red-500'}`}
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      aria-invalid={!name.trim() ? "true" : undefined}
                      aria-describedby="name-error"
                    />
                    {!name.trim() && (
                      <p id="name-error" className="text-xs text-red-500 mt-1">
                        Your name is required
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <Label htmlFor="email" className="font-medium">
                      Email address
                    </Label>
                    <Input 
                      id="email" 
                      type="email"
                      className={`mt-1 w-full ${(email.trim() === '' || (email.trim() && !email.includes('@'))) && 'border-red-500'}`}
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      aria-invalid={(email.trim() === '' || (email.trim() && !email.includes('@'))) ? "true" : undefined}
                      aria-describedby="email-error"
                    />
                    {(email.trim() === '' || (email.trim() && !email.includes('@'))) && (
                      <p id="email-error" className="text-xs text-red-500 mt-1">
                        {!email.trim() ? "Email address is required" : "Please enter a valid email address"}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      onClick={handleBooking}
                      disabled={!name || !email || bookingMutation.isPending || !selectedDate || !selectedTime}
                      className="w-full"
                    >
                      {bookingMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Confirm Booking
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </div>
  );
}