import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AppointmentPicker } from '@/components/ui/appointment-picker-new';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { TimeSlot, EventAvailability, Event as EventType } from '@shared/schema';
import { Loader2, Save, Share2, Copy, Check, Calendar, Clock, MapPin, Info, Users, Link as LinkIcon, Settings, Eye, User, ChevronLeft, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Calendar as CalendarComponent } from '@/components/ui/calendar-new';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Event extends EventType {
  availableTimes?: EventAvailability[];
}

export default function EventBuilder() {
  const params = useParams();
  const eventId = params.id;
  const [, navigate] = useLocation();
  
  const [title, setTitle] = useState('30 Minute Meeting');
  const [description, setDescription] = useState('This is a 30 minute meeting to discuss your needs.');
  const [location, setLocation] = useState('Google Meet');
  const [duration, setDuration] = useState(30);
  const [isPublished, setIsPublished] = useState(true);
  const [availableTimes, setAvailableTimes] = useState<EventAvailability[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('what');
  const [date, setDate] = useState<Date>(new Date());
  const [selectedTimes, setSelectedTimes] = useState<{[key: string]: string[]}>({});
  
  // Fetch event data if editing an existing event
  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ['/api/events', eventId],
    queryFn: eventId === 'new' ? undefined : undefined,
  });
  
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setDuration(event.duration);
      setIsPublished(event.published);
      
      // Convert availableTimes to selectedTimes format
      if (event.availableTimes && event.availableTimes.length > 0) {
        const times: {[key: string]: string[]} = {};
        event.availableTimes.forEach((dateAvail: EventAvailability) => {
          const availableSlots = dateAvail.timeSlots
            .filter((slot: TimeSlot) => slot.available)
            .map((slot: TimeSlot) => slot.time);
            
          if (availableSlots.length > 0) {
            times[dateAvail.date] = availableSlots;
          }
        });
        setSelectedTimes(times);
        setAvailableTimes(event.availableTimes);
      }
    }
  }, [event]);
  
  // Time slots for the day
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];
  
  // Select all time slots for the day
  const handleSelectAll = () => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedTimes(prev => ({
      ...prev,
      [dateStr]: [...timeSlots]
    }));
    
    updateAvailableTimes(dateStr, timeSlots);
  };
  
  // Clear all time slots for the day
  const handleClearAll = () => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedTimes(prev => {
      const newTimes = {...prev};
      delete newTimes[dateStr];
      return newTimes;
    });
    
    updateAvailableTimes(dateStr, []);
  };
  
  // Toggle a specific time slot
  const handleTimeToggle = (time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentTimes = selectedTimes[dateStr] || [];
    let newTimes: string[];
    
    if (currentTimes.includes(time)) {
      // Remove time if already selected
      newTimes = currentTimes.filter(t => t !== time);
    } else {
      // Add time if not selected
      newTimes = [...currentTimes, time];
    }
    
    // Sort times
    newTimes.sort();
    
    // Update state
    setSelectedTimes(prev => ({
      ...prev,
      [dateStr]: newTimes
    }));
    
    // Update availableTimes for API
    updateAvailableTimes(dateStr, newTimes);
  };
  
  // Update availableTimes array for API
  const updateAvailableTimes = (dateStr: string, times: string[]) => {
    const newAvailableTimes = [...availableTimes];
    const dateIndex = newAvailableTimes.findIndex(at => at.date === dateStr);
    
    if (times.length === 0) {
      // If no times selected, remove the date entry
      if (dateIndex >= 0) {
        newAvailableTimes.splice(dateIndex, 1);
      }
    } else {
      // Create or update times for this date
      const allTimeSlots = timeSlots.map(slot => ({
        time: slot,
        available: times.includes(slot)
      }));
      
      if (dateIndex >= 0) {
        newAvailableTimes[dateIndex].timeSlots = allTimeSlots;
      } else {
        newAvailableTimes.push({
          date: dateStr,
          timeSlots: allTimeSlots
        });
      }
    }
    
    console.log("Updated availableTimes:", newAvailableTimes);
    setAvailableTimes(newAvailableTimes);
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM do');
  };
  
  // Helper for checking if a time is selected
  const isTimeSelected = (time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return selectedTimes[dateStr]?.includes(time) || false;
  };
  
  // Check if day has any times selected
  const hasTimesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return selectedTimes[dateStr] && selectedTimes[dateStr].length > 0;
  };
  
  // Create or update event mutation
  const eventMutation = useMutation({
    mutationFn: async () => {
      const eventData = {
        title,
        description,
        location,
        duration,
        published: isPublished,
        availableTimes
      };
      
      if (eventId === 'new') {
        // Create new event
        const response = await apiRequest('POST', '/api/events', eventData);
        return response.json();
      } else {
        // Update existing event
        const response = await apiRequest('PATCH', `/api/events/${eventId}`, eventData);
        return response.json();
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      if (eventId === 'new') {
        navigate(`/event-builder/${data.id}`);
      }
      toast({
        title: 'Success',
        description: eventId === 'new' ? 'Event created successfully' : 'Event updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save event. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  const handleSave = () => {
    eventMutation.mutate();
  };
  
  const getShareableLink = () => {
    return event?.shortId ? `${window.location.origin}/e/${event.shortId}` : '';
  };
  
  const handleCopyLink = () => {
    if (event?.shortId) {
      navigator.clipboard.writeText(getShareableLink());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate('/dashboard')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {eventId === 'new' ? 'New Event Type' : (title || 'Edit Event Type')}
            </h1>
            <p className="text-sm text-gray-500">
              {eventId === 'new' ? 'Create a new event type' : 'Update your event type'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {event?.shortId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="text-gray-700"
            >
              {copySuccess ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Copy Link
                </>
              )}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="text-gray-700"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={eventMutation.isPending}
            size="sm"
            className="bg-black hover:bg-gray-800 text-white"
          >
            {eventMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            {eventId === 'new' ? 'Create' : 'Update'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tabs */}
        <div className="col-span-2">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-0">
              <Tabs 
                defaultValue="what" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-3 bg-transparent p-0 border-b border-gray-200">
                  <TabsTrigger 
                    value="what" 
                    className={`py-3 rounded-none ${activeTab === 'what' ? 'border-b-2 border-black' : ''}`}
                  >
                    What
                  </TabsTrigger>
                  <TabsTrigger 
                    value="when" 
                    className={`py-3 rounded-none ${activeTab === 'when' ? 'border-b-2 border-black' : ''}`}
                  >
                    When
                  </TabsTrigger>
                  <TabsTrigger 
                    value="advanced" 
                    className={`py-3 rounded-none ${activeTab === 'advanced' ? 'border-b-2 border-black' : ''}`}
                  >
                    Advanced
                  </TabsTrigger>
                </TabsList>
                
                {/* What Tab */}
                <TabsContent value="what" className="p-6 focus:outline-none">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium">
                        Title
                      </Label>
                      <Input 
                        id="title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="30 Minute Meeting"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description
                      </Label>
                      <Textarea 
                        id="description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="A brief description of your meeting"
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="duration" className="text-sm font-medium">
                          Duration
                        </Label>
                        <Select 
                          value={duration.toString()} 
                          onValueChange={(value) => setDuration(parseInt(value))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="location" className="text-sm font-medium">
                          Location
                        </Label>
                        <Select 
                          value={location} 
                          onValueChange={setLocation}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Google Meet">Google Meet</SelectItem>
                            <SelectItem value="Zoom">Zoom</SelectItem>
                            <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                            <SelectItem value="In Person">In Person</SelectItem>
                            <SelectItem value="Phone Call">Phone Call</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* When Tab */}
                <TabsContent value="when" className="p-6 focus:outline-none">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/2">
                      <h3 className="text-sm font-medium mb-3">Select date</h3>
                      <div className="border rounded-md p-3 bg-white">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={(newDate) => newDate && setDate(newDate)}
                          modifiers={{
                            booked: date => hasTimesForDate(date)
                          }}
                          modifiersClassNames={{
                            booked: "border border-primary text-primary"
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="md:w-1/2">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium">{formatDate(date)}</h3>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={handleClearAll}
                          >
                            Clear
                          </Button>
                          <Button 
                            type="button" 
                            size="sm"
                            onClick={handleSelectAll}
                          >
                            Select All
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-4 bg-white h-[290px] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2">
                          {timeSlots.map(time => (
                            <Button
                              key={time}
                              type="button"
                              size="sm"
                              variant={isTimeSelected(time) ? "default" : "outline"}
                              onClick={() => handleTimeToggle(time)}
                              className={`w-full ${isTimeSelected(time) ? 'bg-primary text-primary-foreground' : 'text-gray-700'}`}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Advanced Tab */}
                <TabsContent value="advanced" className="p-6 focus:outline-none">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <div>
                        <h3 className="font-medium text-gray-900">Event Status</h3>
                        <p className="text-sm text-gray-500">Enable or disable your event</p>
                      </div>
                      <Switch 
                        checked={isPublished}
                        onCheckedChange={setIsPublished}
                      />
                    </div>
                    
                    {event?.shortId && (
                      <div className="flex flex-col py-2 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900">Public event link</h3>
                        <p className="text-sm text-gray-500 mb-2">Share this link with anyone to book this event</p>
                        
                        <div className="flex mt-1">
                          <div className="relative grow">
                            <Input 
                              readOnly
                              value={getShareableLink()}
                              className="pr-10"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute right-0 top-0 h-full"
                              onClick={handleCopyLink}
                            >
                              {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Preview */}
        <div className="col-span-1">
          <Card className="border border-gray-200 shadow-sm sticky top-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Booking Preview</CardTitle>
              <CardDescription>Preview of your booking page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="font-medium">{title}</h3>
                  <div className="flex items-center text-sm text-gray-500 space-x-2 mt-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{duration} minutes</span>
                  </div>
                </div>
                
                <div className="p-4 bg-white">
                  <p className="text-sm text-gray-500">{description}</p>
                  
                  <div className="flex items-center text-gray-500 text-xs mb-3">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="ml-1">Select a date</span>
                    <div className="mx-2 w-1 h-1 rounded-full bg-gray-300"></div>
                    <Clock className="h-3.5 w-3.5" />
                    <span className="ml-1">Select a time</span>
                  </div>
                  
                  <div className="border rounded-md mt-3 p-2">
                    <p className="text-xs text-center text-gray-500">Calendar view will appear here</p>
                    <div className="grid grid-cols-3 gap-1 mt-2">
                      {Array(6).fill(0).map((_, i) => (
                        <div 
                          key={i} 
                          className="h-6 bg-gray-100 rounded text-xs flex items-center justify-center text-gray-500"
                        >
                          {i % 2 === 0 ? '09:00' : '09:30'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}