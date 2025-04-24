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
        <div className="absolute inset-0 bg-gray-50"></div>
        <Tiles 
          rows={30} 
          cols={12}
          tileSize="md"
          tileClassName="opacity-30 border-primary/10"
        />
      </div>
      
      <div className="relative z-10 max-w-5xl pt-8 pb-16 px-2 sm:px-6 mx-auto">
        {/* Header with back button and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="mr-2 rounded-full h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {eventId === 'new' ? 'New Event Type' : (title || 'Edit Event Type')}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {eventId === 'new' ? 'Create a new event type for your calendar' : 'Update your event booking settings'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {event?.shortId && (
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="rounded-full text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                {copySuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="outline"
              className="rounded-full text-gray-700 border-gray-300 hover:bg-gray-50"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={eventMutation.isPending}
              className="rounded-full bg-black hover:bg-gray-800 text-white"
            >
              {eventMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {eventId === 'new' ? 'Create Event' : 'Save Changes'}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tabs */}
          <div className="col-span-2">
            <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-md rounded-xl overflow-hidden">
              <CardContent className="p-0">
                <Tabs 
                  defaultValue="what" 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="w-full grid grid-cols-3 bg-transparent p-0 border-b">
                    <TabsTrigger 
                      value="what" 
                      className={`py-4 rounded-none transition-all ${activeTab === 'what' ? 'border-b-2 border-black font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      What
                    </TabsTrigger>
                    <TabsTrigger 
                      value="when" 
                      className={`py-4 rounded-none transition-all ${activeTab === 'when' ? 'border-b-2 border-black font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      When
                    </TabsTrigger>
                    <TabsTrigger 
                      value="advanced" 
                      className={`py-4 rounded-none transition-all ${activeTab === 'advanced' ? 'border-b-2 border-black font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Advanced
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* What Tab */}
                  <TabsContent value="what" className="p-8 focus:outline-none">
                    <div className="space-y-8">
                      <div>
                        <Label htmlFor="title" className="text-sm font-medium block mb-2 text-gray-700">
                          Title
                        </Label>
                        <Input 
                          id="title" 
                          value={title} 
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="30 Minute Meeting"
                          className="rounded-lg border-gray-300 focus:ring-black focus:border-black"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description" className="text-sm font-medium block mb-2 text-gray-700">
                          Description
                        </Label>
                        <Textarea 
                          id="description" 
                          value={description} 
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="A brief description of what this meeting is about"
                          rows={4}
                          className="rounded-lg border-gray-300 focus:ring-black focus:border-black"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <Label htmlFor="duration" className="text-sm font-medium block mb-2 text-gray-700">
                            Duration
                          </Label>
                          <Select 
                            value={duration.toString()} 
                            onValueChange={(value) => setDuration(parseInt(value))}
                          >
                            <SelectTrigger className="rounded-lg border-gray-300 w-full focus:ring-black">
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
                          <Label htmlFor="location" className="text-sm font-medium block mb-2 text-gray-700">
                            Location
                          </Label>
                          <Select 
                            value={location} 
                            onValueChange={setLocation}
                          >
                            <SelectTrigger className="rounded-lg border-gray-300 w-full focus:ring-black">
                              <SelectValue placeholder="Select location type" />
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
                  <TabsContent value="when" className="p-8 focus:outline-none">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Weekly availability</h3>
                        <p className="text-sm text-gray-500 mb-6">
                          Define which days and times you're available for bookings.
                        </p>
                        
                        {/* Weekly Schedule */}
                        <div className="space-y-5">
                          {Object.entries(weeklySchedule).map(([day, { enabled, timeSlots }]) => (
                            <div key={day} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                              <div className="flex items-center justify-between px-5 py-4 bg-gray-50">
                                <div className="flex items-center">
                                  <Switch 
                                    checked={enabled} 
                                    onCheckedChange={() => toggleDay(day)}
                                    className="mr-4 data-[state=checked]:bg-black"
                                  />
                                  <span className="text-sm font-medium capitalize">{day}</span>
                                </div>
                                
                                {enabled && (
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => selectAllTimesForDay(day)}
                                      className="text-xs h-8 rounded-full border-gray-300"
                                    >
                                      Select all
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => clearAllTimesForDay(day)}
                                      className="text-xs h-8 rounded-full border-gray-300"
                                    >
                                      Clear all
                                    </Button>
                                  </div>
                                )}
                              </div>
                              
                              {enabled && (
                                <div className="p-5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                  {allTimeSlots.map(time => (
                                    <Button 
                                      key={time}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toggleTimeSlot(day, time)}
                                      className={`h-8 w-full text-xs rounded-full transition-all ${
                                        timeSlots.includes(time) 
                                          ? 'bg-black text-white border-black hover:bg-gray-800' 
                                          : 'text-gray-700 border-gray-300 hover:bg-gray-100'
                                      }`}
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
                  <TabsContent value="advanced" className="p-8 focus:outline-none">
                    <div className="space-y-8">
                      <div className="bg-gray-50 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <Label htmlFor="published" className="text-base font-medium block">
                              Event Visibility
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                              {isPublished 
                                ? 'Your event is published and available for booking.' 
                                : 'Your event is hidden and not available for booking.'}
                            </p>
                          </div>
                          <Switch 
                            id="published"
                            checked={isPublished} 
                            onCheckedChange={setIsPublished}
                            className="data-[state=checked]:bg-black"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-md rounded-xl overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Preview</CardTitle>
                  <CardDescription className="text-sm">
                    How your booking page will appear
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-gray-200">
                      <h3 className="font-medium">{title || "30 Minute Meeting"}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Clock className="h-4 w-4 mr-1.5" />
                        <span>{duration} minutes</span>
                      </div>
                    </div>
                    
                    <div className="p-5 space-y-4">
                      <div className="text-sm">
                        <p className="text-gray-600 leading-relaxed">
                          {description || "This is a 30 minute meeting to discuss your needs."}
                        </p>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Select a date & time</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{location || "Google Meet"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Event Link */}
              {event?.shortId && (
                <Card className="border-0 shadow-sm mt-5 bg-white/90 backdrop-blur-md rounded-xl overflow-hidden">
                  <CardHeader className="py-4 px-5">
                    <CardTitle className="text-base font-medium">Share your event</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="flex items-center space-x-2">
                      <Input 
                        readOnly 
                        value={getShareableLink()}
                        className="text-sm rounded-lg border-gray-300 focus:ring-black focus:border-black"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyLink}
                        className="shrink-0 h-10 w-10 rounded-full p-0 border-gray-300"
                      >
                        {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full rounded-full text-gray-700 border-gray-300 hover:bg-gray-50"
                        onClick={() => window.open(getShareableLink(), '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview booking page
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}