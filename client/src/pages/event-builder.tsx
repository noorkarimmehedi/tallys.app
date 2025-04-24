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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { TimeSlot, EventAvailability } from '@shared/schema';
import MainLayout from '@/components/layouts/MainLayout';
import { Loader2, Save, Share2, Copy, Check, Calendar, Clock, MapPin, Info, Users, Link as LinkIcon, Settings } from 'lucide-react';
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
      <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex flex-col gap-4">
          {/* Header with title and action buttons */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {eventId === 'new' ? 'New Event Type' : title || 'Edit Event Type'}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Create a new event type for people to book appointments
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Event details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>Configure your event's basic information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input 
                      id="title" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter event title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your event"
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Add a location (optional)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select 
                      value={duration.toString()} 
                      onValueChange={(value) => setDuration(parseInt(value))}
                    >
                      <SelectTrigger>
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
                  
                  <div className="pt-4 flex items-center justify-between">
                    <div>
                      <Label htmlFor="published">Published</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Make your event available for booking
                      </p>
                    </div>
                    <Switch 
                      id="published"
                      checked={isPublished}
                      onCheckedChange={setIsPublished}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {event?.shortId && (
                <Card>
                  <CardHeader>
                    <CardTitle>Share Event</CardTitle>
                    <CardDescription>Share your event with others</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Label>Shareable Link</Label>
                      <div className="mt-1.5 flex">
                        <Input 
                          value={getShareableLink()}
                          readOnly
                          className="rounded-r-none"
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
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(`/e/${event.shortId}`, '_blank')}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      View Booking Page
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Right column - Availability Calendar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Times</CardTitle>
                  <CardDescription>Set when you're available for appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Click on time slots to toggle availability for your event.
                    </p>
                    <AppointmentPicker 
                      onDateTimeSelected={handleDateTimeSelected}
                      availableTimeSlots={availableTimes.length > 0 ? availableTimes[0].timeSlots : []}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {availableTimes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Availability</CardTitle>
                    <CardDescription>Your current availability schedule</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}