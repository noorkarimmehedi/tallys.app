import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { TimeSlot, EventAvailability, Event as EventType } from '@shared/schema';

// Extended Event type with our custom properties
interface Event extends EventType {
  weeklySchedule: string | null;
  availableTimes: EventAvailability[];
}
import MainLayout from '@/components/layouts/MainLayout';
import { Loader2, Save, Copy, Check, Calendar, Clock, MapPin, User, ChevronLeft, Globe, Eye } from 'lucide-react';
import { Tiles } from '@/components/ui/tiles';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

interface WeekdayAvailability {
  enabled: boolean;
  timeSlots: string[];
}

interface WeeklySchedule {
  [key: string]: WeekdayAvailability;
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
  
  // Weekly availability schedule
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    monday: { enabled: true, timeSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"] },
    tuesday: { enabled: true, timeSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"] },
    wednesday: { enabled: true, timeSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"] },
    thursday: { enabled: true, timeSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"] },
    friday: { enabled: true, timeSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"] },
    saturday: { enabled: false, timeSlots: [] },
    sunday: { enabled: false, timeSlots: [] },
  });
  
  // All possible time slots
  const allTimeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];
  
  // Fetch event data if editing an existing event
  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ['/api/events', eventId],
    queryFn: eventId === 'new' ? undefined : undefined,
    // @ts-ignore - Using undefined for queryFn is valid when we don't want to fetch in certain conditions
  });
  
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setDuration(event.duration);
      setIsPublished(event.published || false);
      setAvailableTimes(event.availableTimes || []);
      
      // If the event has a weekly schedule stored, use it
      if (event.weeklySchedule) {
        try {
          const parsedSchedule = JSON.parse(event.weeklySchedule);
          if (parsedSchedule && typeof parsedSchedule === 'object') {
            setWeeklySchedule(parsedSchedule);
          }
        } catch (err) {
          console.error("Failed to parse weekly schedule:", err);
        }
      }
    }
  }, [event]);
  
  // Toggle a day's enabled status
  const toggleDay = (day: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        // If enabling, add default times if none exist
        timeSlots: !prev[day].enabled && prev[day].timeSlots.length === 0 
          ? ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"]
          : prev[day].timeSlots
      }
    }));
  };
  
  // Toggle a specific time slot for a day
  const toggleTimeSlot = (day: string, time: string) => {
    setWeeklySchedule(prev => {
      const currentSlots = prev[day].timeSlots;
      const newSlots = currentSlots.includes(time)
        ? currentSlots.filter(t => t !== time)
        : [...currentSlots, time].sort();
        
      return {
        ...prev,
        [day]: {
          ...prev[day],
          timeSlots: newSlots
        }
      };
    });
  };
  
  // Select all time slots for a day
  const selectAllTimesForDay = (day: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [...allTimeSlots]
      }
    }));
  };
  
  // Clear all time slots for a day
  const clearAllTimesForDay = (day: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: []
      }
    }));
  };
  
  // Create or update event mutation
  const eventMutation = useMutation({
    mutationFn: async () => {
      // Convert weekly schedule to available times
      // In a real app, this would be handled server-side
      // For this demo, we're just storing the weekly schedule as JSON
      
      const eventData = {
        title,
        description,
        location,
        duration,
        published: isPublished,
        availableTimes: [], // this would be generated server-side from weekly schedule
        weeklySchedule: JSON.stringify(weeklySchedule) // Store schedule as JSON string
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
      console.log("Event saved successfully:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      
      toast({
        title: 'Success',
        description: eventId === 'new' ? 'Event created successfully' : 'Event updated successfully',
      });
      
      // Navigate to the dashboard after creating/updating
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
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
    return event ? `${window.location.origin}/e/${event.shortId}` : '';
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
    <>
      {/* Background Tiles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-white"></div>
        <Tiles 
          rows={30} 
          cols={12}
          tileSize="md"
          tileClassName="opacity-40 border-primary/20"
        />
      </div>
      
      <div className="container relative z-10 mx-auto max-w-screen-xl py-6 px-4 sm:px-6">
        {/* Header with back button and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
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
                    <Copy className="h-4 w-4 mr-1" />
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
            <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
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
                      className={`py-3 rounded-none ${activeTab === 'what' ? 'border-b-2 border-black font-medium' : ''}`}
                    >
                      What
                    </TabsTrigger>
                    <TabsTrigger 
                      value="when" 
                      className={`py-3 rounded-none ${activeTab === 'when' ? 'border-b-2 border-black font-medium' : ''}`}
                    >
                      When
                    </TabsTrigger>
                    <TabsTrigger 
                      value="advanced" 
                      className={`py-3 rounded-none ${activeTab === 'advanced' ? 'border-b-2 border-black font-medium' : ''}`}
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
                              <SelectItem value="Phone Call">Phone Call</SelectItem>
                              <SelectItem value="In-Person">In-Person</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* When Tab */}
                  <TabsContent value="when" className="p-6 focus:outline-none">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-medium mb-3">Set your weekly availability</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Define which days and times you're available for bookings.
                        </p>
                        
                        {/* Weekly Schedule */}
                        <div className="space-y-4">
                          {Object.entries(weeklySchedule).map(([day, { enabled, timeSlots }]) => (
                            <div key={day} className="border border-gray-200 rounded-md overflow-hidden">
                              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                                <div className="flex items-center">
                                  <Switch 
                                    checked={enabled} 
                                    onCheckedChange={() => toggleDay(day)}
                                    className="mr-3"
                                  />
                                  <span className="text-sm font-medium capitalize">{day}</span>
                                </div>
                                
                                {enabled && (
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => selectAllTimesForDay(day)}
                                      className="text-xs"
                                    >
                                      Select all
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => clearAllTimesForDay(day)}
                                      className="text-xs"
                                    >
                                      Clear all
                                    </Button>
                                  </div>
                                )}
                              </div>
                              
                              {enabled && (
                                <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                  {allTimeSlots.map(time => (
                                    <Button 
                                      key={time}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toggleTimeSlot(day, time)}
                                      className={`w-full text-xs ${timeSlots.includes(time) ? 'bg-primary text-primary-foreground' : 'text-gray-700'}`}
                                    >
                                      {time}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Advanced Tab */}
                  <TabsContent value="advanced" className="p-6 focus:outline-none">
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label htmlFor="published" className="text-sm font-medium">
                            Event Status
                          </Label>
                          <Switch 
                            id="published"
                            checked={isPublished} 
                            onCheckedChange={setIsPublished}
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          {isPublished 
                            ? 'Your event is published and available for booking.' 
                            : 'Your event is hidden and not available for booking.'}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Preview */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Event Preview</CardTitle>
                <CardDescription className="text-sm">
                  Here's how your event booking page will look.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-gray-200 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-medium">{title || "30 Minute Meeting"}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{duration} minutes</span>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="text-sm">
                      <p className="text-gray-500">
                        {description || "This is a 30 minute meeting to discuss your needs."}
                      </p>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Select a date & time</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{location || "Google Meet"}</span>
                    </div>
                  </div>
                  
                  {event?.shortId && (
                    <div className="p-4 border-t border-gray-200">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={handleCopyLink}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        {copySuccess ? "Link copied!" : "Copy booking link"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Event Link */}
            {event?.shortId && (
              <Card className="border border-gray-200 shadow-sm mt-4 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Share your event</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Input 
                      readOnly 
                      value={getShareableLink()}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyLink}
                      className="shrink-0"
                    >
                      {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(getShareableLink(), '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}