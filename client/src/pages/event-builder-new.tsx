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
import { Loader2, Save, Share2, Copy, Check, Calendar, Clock, MapPin, Info, Users, Link as LinkIcon, Settings, Eye, User, ChevronLeft, Globe, Image as ImageIcon, Upload as UploadIcon, Trash2, X as XIcon, FileImage as FileImageIcon, Pencil as PencilIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Calendar as CalendarComponent } from '@/components/ui/calendar-new';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  
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
      setIsPublished(event.published || false);
      
      // Get logo URL if available
      if (event.metadata && typeof event.metadata === 'object' && event.metadata.theme) {
        const theme = event.metadata.theme;
        if (theme.logoUrl) {
          setLogoUrl(theme.logoUrl);
        }
      }
      
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
        availableTimes,
        // Add theme object to match what event-builder-weekly.tsx does
        theme: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          primaryColor: '#3b82f6',
          fontFamily: 'Inter, sans-serif',
          logoUrl: logoUrl // Use the actual logo URL
        },
        // Also include weekly schedule as it may be expected by the schema
        weeklySchedule: JSON.stringify({
          monday: { enabled: true, timeSlots: [] },
          tuesday: { enabled: true, timeSlots: [] },
          wednesday: { enabled: true, timeSlots: [] },
          thursday: { enabled: true, timeSlots: [] },
          friday: { enabled: true, timeSlots: [] },
          saturday: { enabled: false, timeSlots: [] },
          sunday: { enabled: false, timeSlots: [] }
        })
      };
      
      console.log("Saving event with ID:", eventId, "is new:", eventId === 'new');
      console.log("Event data being sent:", JSON.stringify(eventData, null, 2));
      
      // Always use POST for new events
      if (eventId === 'new' || !eventId) {
        console.log("Creating a new event with POST request");
        try {
          // Use fetch directly for more control
          const response = await fetch('/api/events', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
          });
          
          const responseText = await response.text();
          console.log("Raw server response:", responseText);
          
          if (!response.ok) {
            console.error("Error creating event, status:", response.status);
            throw new Error(responseText || "Failed to create event");
          }
          
          return JSON.parse(responseText);
        } catch (error) {
          console.error("Exception during event creation:", error);
          throw error;
        }
      } else {
        // Update existing event
        console.log("Updating existing event with ID:", eventId);
        const response = await apiRequest('PATCH', `/api/events/${eventId}`, eventData);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error updating event:", errorText);
          throw new Error(errorText || "Failed to update event");
        }
        return response.json();
      }
    },
    onSuccess: (data) => {
      console.log("Event saved successfully:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      
      if (eventId === 'new' && data && data.shortId) {
        // For newly created events, show a success message with the link
        const eventLink = `${window.location.origin}/e/${data.shortId}`;
        
        toast({
          title: 'Event published successfully!',
          description: (
            <div>
              <p>Your event is now available at:</p>
              <a 
                href={eventLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {eventLink}
              </a>
            </div>
          ),
          duration: 5000,
        });
        
        // Navigate to dashboard after a delay
        setTimeout(() => {
          navigate('/dashboard?tab=events');
        }, 3000);
      } else {
        toast({
          title: 'Success',
          description: 'Event updated successfully',
        });
      }
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
  
  // Handle logo file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "File too large",
          description: "Logo image must be less than 2MB",
          variant: "destructive"
        });
        return;
      }
      setLogoFile(file);
    }
  };
  
  // Handle logo upload
  const handleLogoUpload = async () => {
    if (!logoFile) return;
    
    try {
      const formData = new FormData();
      formData.append('file', logoFile);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setLogoUrl(data.url);
      setLogoFile(null);
      setLogoDialogOpen(false);
      
      toast({
        title: "Logo uploaded",
        description: "Your logo has been uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive"
      });
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
            {eventId === 'new' ? 'Publish' : 'Update'}
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
                    
                    {/* Logo Section */}
                    <div className="py-2 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">Company Logo</h3>
                          <p className="text-sm text-gray-500">Add your brand identity to customize the event booking experience</p>
                        </div>
                      </div>
                      
                      {logoUrl ? (
                        <div className="group relative">
                          <div className="overflow-hidden border border-gray-200 rounded-lg bg-white p-4 transition-all duration-300 shadow-sm hover:shadow-md">
                            <div className="flex justify-center items-center py-3">
                              <img 
                                src={logoUrl} 
                                alt="Company logo" 
                                className="max-h-16 object-contain"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="flex gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="bg-white shadow-md"
                                  onClick={() => setLogoDialogOpen(true)}
                                >
                                  <PencilIcon className="h-3 w-3 mr-1" /> 
                                  Change
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="bg-white shadow-md text-red-600 hover:text-red-700"
                                  onClick={() => setLogoUrl("")}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" /> 
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 text-center mt-1">
                            Recommended size: 427px × 118px
                          </p>
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed border-gray-200 rounded-lg p-5 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => setLogoDialogOpen(true)}
                        >
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                            <ImageIcon className="h-6 w-6 text-primary" />
                          </div>
                          <p className="font-medium text-sm">Upload your logo</p>
                          <p className="text-xs text-gray-500 mt-1">Recommended size: 427px × 118px</p>
                        </div>
                      )}
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
      
      {/* Logo Upload Dialog */}
      <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Company Logo</DialogTitle>
            <p className="text-sm text-gray-500">
              Add your brand identity to customize the event booking experience
            </p>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Current logo preview */}
            {logoUrl && !logoFile && (
              <div className="rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">Current Logo</h3>
                </div>
                <div className="p-6 flex items-center justify-center">
                  <img 
                    src={logoUrl} 
                    alt="Current logo" 
                    className="max-h-24 max-w-full object-contain" 
                  />
                </div>
              </div>
            )}
            
            {/* Selected file preview */}
            {logoFile ? (
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">Selected File</h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-4">
                        <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileImageIcon className="h-7 w-7 text-primary" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{logoFile.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{(logoFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setLogoFile(null)}
                    >
                      <XIcon className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                  <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ImageIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Drop your image here
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    SVG, PNG, JPG or GIF (max. 800x400px)
                  </p>
                  
                  <label htmlFor="logo-upload" className="relative inline-block">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Button variant="outline" className="pointer-events-none">
                      <UploadIcon className="h-4 w-4 mr-2" />
                      Select File
                    </Button>
                  </label>
                  
                  <p className="text-xs text-gray-500 mt-6">
                    Recommended size: 427px × 118px
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setLogoDialogOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogoUpload}
              disabled={!logoFile}
              className="flex-1 sm:flex-none bg-black hover:bg-gray-800 text-white"
            >
              {logoFile ? (
                <>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload Logo
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}