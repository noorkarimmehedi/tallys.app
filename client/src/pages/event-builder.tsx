import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AppointmentPicker } from '@/components/ui/appointment-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { TimeSlot, EventAvailability } from '@shared/schema';
import MainLayout from '@/components/layouts/MainLayout';
import { Loader2, Save, Share2, Copy, Check, Calendar, Clock, MapPin, Info, Users, Link as LinkIcon, Settings, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function EventBuilder() {
  const params = useParams();
  const eventId = params.id;
  const [, navigate] = useLocation();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState(30);
  const [isPublished, setIsPublished] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<EventAvailability[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Fetch event data if editing an existing event
  const { data: event, isLoading } = useQuery({
    queryKey: ['/api/events', eventId],
    queryFn: eventId === 'new' ? undefined : undefined
  });
  
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setDuration(event.duration);
      setIsPublished(event.published);
      setAvailableTimes(event.availableTimes || []);
    }
  }, [event]);
  
  // Handle date selection in AppointmentPicker
  const handleDateTimeSelected = (date: Date, time: string) => {
    const dateString = date.toISOString().split('T')[0];
    const newAvailableTimes = [...availableTimes];
    
    // Find if we already have this date
    const dateIndex = newAvailableTimes.findIndex(at => at.date === dateString);
    
    if (dateIndex >= 0) {
      // Update existing date's time slots
      const timeIndex = newAvailableTimes[dateIndex].timeSlots.findIndex(ts => ts.time === time);
      
      if (timeIndex >= 0) {
        // Toggle available status
        newAvailableTimes[dateIndex].timeSlots[timeIndex].available = 
          !newAvailableTimes[dateIndex].timeSlots[timeIndex].available;
      } else {
        // Add new time slot
        newAvailableTimes[dateIndex].timeSlots.push({
          time,
          available: true
        });
      }
    } else {
      // Add new date with time slot
      newAvailableTimes.push({
        date: dateString,
        timeSlots: [{ time, available: true }]
      });
    }
    
    setAvailableTimes(newAvailableTimes);
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
      <MainLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex flex-col gap-4">
          {/* Header with title and action buttons */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {eventId === 'new' ? 'New Event Type' : title || 'Edit Event Type'}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Create a new event type for people to book appointments on your calendar
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={eventMutation.isPending}
                className="px-4"
              >
                {eventMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {eventId === 'new' ? 'Create' : 'Update'}
              </Button>
            </div>
          </div>
          
          {/* Main content with tabs */}
          <Card className="mb-4 border-none shadow-sm">
            <Tabs defaultValue="setup" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 rounded-none p-0 h-auto">
                <TabsTrigger 
                  value="setup" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none rounded-none py-3 data-[state=active]:bg-transparent text-sm"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Event Setup
                </TabsTrigger>
                <TabsTrigger 
                  value="availability" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none rounded-none py-3 data-[state=active]:bg-transparent text-sm"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Availability
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none rounded-none py-3 data-[state=active]:bg-transparent text-sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Advanced Settings
                </TabsTrigger>
              </TabsList>
              
              {/* Event setup tab */}
              <TabsContent value="setup" className="py-4 px-6">
                <div className="space-y-8">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="title" className="text-base font-medium">
                      Title
                    </Label>
                    <p className="text-muted-foreground text-sm mb-2">
                      The name of your event that people will see when booking
                    </p>
                    <Input 
                      id="title" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Meeting with Me"
                      className="max-w-md"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="description" className="text-base font-medium">
                      Description
                    </Label>
                    <p className="text-muted-foreground text-sm mb-2">
                      Explain what the event is about and what people should expect
                    </p>
                    <Textarea 
                      id="description" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="A brief description of the meeting and what it will cover..."
                      rows={4}
                      className="max-w-md"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="duration" className="text-base font-medium">
                        <Clock className="w-4 h-4 inline mr-1.5" />
                        Duration
                      </Label>
                      <p className="text-muted-foreground text-sm mb-2">
                        How long the meeting will last
                      </p>
                      <Select 
                        value={duration.toString()} 
                        onValueChange={(value) => setDuration(parseInt(value))}
                      >
                        <SelectTrigger className="max-w-[180px]">
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
                    
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="location" className="text-base font-medium">
                        <MapPin className="w-4 h-4 inline mr-1.5" />
                        Location
                      </Label>
                      <p className="text-muted-foreground text-sm mb-2">
                        Where the meeting will take place
                      </p>
                      <Select defaultValue="virtual">
                        <SelectTrigger className="w-full max-w-[220px]">
                          <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="virtual">Google Meet</SelectItem>
                          <SelectItem value="zoom">Zoom</SelectItem>
                          <SelectItem value="teams">Microsoft Teams</SelectItem>
                          <SelectItem value="inperson">In Person</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Custom location input that would show conditionally */}
                      <Input 
                        id="custom_location" 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter address or location details"
                        className="mt-2 max-w-md"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Availability tab */}
              <TabsContent value="availability" className="py-4 px-6">
                <div className="space-y-6">
                  <div className="flex flex-col gap-3">
                    <h3 className="text-base font-medium">Set your availability</h3>
                    <p className="text-muted-foreground text-sm">
                      Select dates and times when you're available for this event type
                    </p>
                  </div>
                  
                  <div className="bg-accent/20 rounded-lg p-4 border border-accent/30 mb-6">
                    <div className="flex items-center text-sm">
                      <Info className="w-4 h-4 mr-2 text-accent-foreground" />
                      <p>Click on time slots to toggle availability. Selected slots will be available for booking.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-3">
                      <Card className="shadow-none">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Date Selection</CardTitle>
                          <CardDescription>
                            Select a date to manage time slots
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <AppointmentPicker 
                            onDateTimeSelected={handleDateTimeSelected}
                            availableTimeSlots={availableTimes.length > 0 ? availableTimes[0].timeSlots : []}
                            className="max-w-full"
                          />
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <Card className="h-full shadow-none">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Selected Availability</CardTitle>
                          <CardDescription>
                            Your current availability schedule
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {availableTimes.length > 0 ? (
                            <div className="space-y-3">
                              {availableTimes.map((dateAvail, idx) => (
                                <div key={idx} className="pb-3 border-b last:border-b-0">
                                  <p className="text-sm font-medium mb-2">{dateAvail.date}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {dateAvail.timeSlots
                                      .filter(slot => slot.available)
                                      .map((slot, i) => (
                                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                          {slot.time}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-center">
                              <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
                              <p className="text-muted-foreground text-sm">
                                No availability set yet
                              </p>
                              <p className="text-muted-foreground text-xs mt-1">
                                Select dates and times from the calendar
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Advanced settings tab */}
              <TabsContent value="settings" className="py-4 px-6">
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 pb-4 border-b">
                    <h3 className="text-base font-medium">Event Settings</h3>
                    <p className="text-muted-foreground text-sm">
                      Configure additional options for your event
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <Label htmlFor="published" className="text-base font-medium">Published</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        When enabled, people can book this event
                      </p>
                    </div>
                    <Switch 
                      id="published"
                      checked={isPublished}
                      onCheckedChange={setIsPublished}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-t">
                    <div>
                      <Label className="text-base font-medium">Require Approval</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Manually approve bookings before they're confirmed
                      </p>
                    </div>
                    <Switch id="approval" />
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-t">
                    <div>
                      <Label className="text-base font-medium">Limit Bookings</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Set a maximum number of bookings per day
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        defaultValue="10"
                        className="w-20 h-8 mr-2"
                        min={1}
                      />
                      <Label className="text-sm">per day</Label>
                    </div>
                  </div>
                  
                  {event?.shortId && (
                    <div className="pt-4 mt-4 border-t">
                      <h3 className="text-base font-medium mb-3">Share Your Event</h3>
                      <div className="mb-4">
                        <Label className="text-sm">Booking Link</Label>
                        <div className="mt-1.5 flex">
                          <Input 
                            value={getShareableLink()}
                            readOnly
                            className="rounded-r-none font-mono text-xs"
                          />
                          <Button 
                            variant="outline" 
                            className="rounded-l-none"
                            onClick={handleCopyLink}
                          >
                            {copySuccess ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => window.open(`/e/${event.shortId}`, '_blank')}
                        >
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
          
          {/* Preview card */}
          <div className="flex flex-col md:flex-row gap-6 mt-4">
            <div className="w-full md:w-7/12 lg:w-8/12">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">EVENT TYPE PREVIEW</h3>
              <Card className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 md:w-3/5">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Your Name</h4>
                        <p className="text-sm text-muted-foreground">Tallys Calendar</p>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{title || "Event Title"}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{duration} minutes</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-6">
                      {description || "No description provided"}
                    </p>
                    
                    <div className="flex items-center text-sm mb-2">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Select a date</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Select a time</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-6 md:w-2/5">
                    <h4 className="font-medium mb-4">Provide your details</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs mb-1">Name</Label>
                        <Input disabled placeholder="John Doe" className="h-8" />
                      </div>
                      <div>
                        <Label className="text-xs mb-1">Email</Label>
                        <Input disabled placeholder="john@example.com" className="h-8" />
                      </div>
                      <Button disabled className="w-full mt-2">
                        Schedule Event
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="w-full md:w-5/12 lg:w-4/12">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">TIPS</h3>
              <Card className="bg-primary/5 border-primary/10">
                <CardContent className="p-6">
                  <h4 className="font-medium text-primary mb-3">Getting Started</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Set a clear title and description of what the meeting is about</li>
                    <li>Configure your availability on different days</li>
                    <li>Adjust advanced settings for a better booking experience</li>
                    <li>Toggle "Published" to make your event available for booking</li>
                    <li>Share your booking link with others</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}