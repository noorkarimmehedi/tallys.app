import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TimeSlot, EventAvailability, Event as EventType } from '@shared/schema';
import { 
  Loader2, Save, Copy, Check, Calendar, Clock, MapPin, User, ChevronLeft, 
  Globe, Eye, Upload, Pencil as PencilIcon, Trash2 as Trash2Icon, 
  Image as ImageIcon, Upload as UploadIcon, FileImage as FileImageIcon, X as XIcon 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

// Extended Event type with our custom properties
interface Event extends EventType {
  weeklySchedule: string | null;
  availableTimes?: EventAvailability[];
}

interface WeekdayAvailability {
  enabled: boolean;
  timeSlots: string[];
}

interface WeeklySchedule {
  [key: string]: WeekdayAvailability;
}

export default function EventBuilder() {
  const params = useParams();
  // Make sure we have a valid eventId, default to 'new' when undefined
  const eventId = params.id === undefined ? 'new' : params.id;
  const [, navigate] = useLocation();
  
  // Log to help debug the event ID issue
  console.log("Event Builder loaded with params:", params);
  console.log("Current eventId:", eventId);
  
  const [title, setTitle] = useState('30 Minute Meeting');
  const [description, setDescription] = useState('This is a 30 minute meeting to discuss your needs.');
  const [location, setLocation] = useState('Google Meet');
  const [duration, setDuration] = useState(30);
  const [isPublished, setIsPublished] = useState(true);
  const [availableTimes, setAvailableTimes] = useState<EventAvailability[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('what');
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
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
    queryFn: async () => {
      // Skip API call for new events
      if (eventId === 'new') {
        return null;
      }
      
      const res = await fetch(`/api/events/${eventId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch event');
      }
      return res.json();
    },
    enabled: eventId !== 'new' && eventId !== undefined
  });
  
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

  // Upload logo
  // Direct function to update just the event logo - completely separate from event data update
  const saveEventWithLogo = async (logoPath: string) => {
    try {
      console.log("Saving event with logo URL:", logoPath);
      
      // Only save if editing an existing event
      if (eventId !== 'new') {
        console.log("Making logo update request with logoUrl:", logoPath);
        
        // Simplify the request to avoid issues with nested objects
        const response = await fetch(`/api/events/${eventId}/logo`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            logoUrl: logoPath 
          })
        });
        
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        
        if (!response.ok) {
          console.error("Failed to save logo, status:", response.status);
          throw new Error(`Failed to save logo: ${responseText}`);
        }
        
        let updatedEvent;
        try {
          updatedEvent = JSON.parse(responseText);
        } catch (err) {
          console.error("Error parsing response:", err);
          throw new Error("Invalid response from server");
        }
        
        console.log("Updated event with logo:", updatedEvent);
        
        // Manually update the query cache to reflect the change
        queryClient.setQueryData([`/api/events/${eventId}`], updatedEvent);
        queryClient.invalidateQueries({ queryKey: ['/api/events'] });
        
        toast({
          title: "Logo saved",
          description: "Your logo has been saved to the event",
        });
      }
    } catch (error) {
      console.error("Error saving logo to event:", error);
      toast({
        title: "Failed to save logo",
        description: "There was an error saving your logo to the event",
        variant: "destructive"
      });
    }
  };

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
      console.log("Logo uploaded successfully:", data);
      
      // Make sure we use the correct property - server response has fileUrl
      const logoUrl = data.fileUrl || data.path;
      console.log("Using logo URL for save:", logoUrl);
      
      if (!logoUrl) {
        throw new Error('No logo URL in response');
      }
      
      // Update local state
      setLogoUrl(logoUrl);
      setLogoFile(null);
      setLogoDialogOpen(false);
      
      toast({
        title: "Logo uploaded",
        description: "Your company logo has been uploaded",
      });
      
      // Save the logo to the event
      await saveEventWithLogo(logoUrl);
      
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your logo",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setDuration(event.duration);
      setIsPublished(event.published || false);
      setAvailableTimes(event.availableTimes || []);
      
      // Load logo URL if available
      if (event.theme?.logoUrl) {
        setLogoUrl(event.theme.logoUrl);
      }
      
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
        weeklySchedule: JSON.stringify(weeklySchedule), // Store schedule as JSON string
        theme: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          primaryColor: '#3b82f6',
          fontFamily: 'Inter, sans-serif',
          logoUrl: logoUrl // Include logo URL even if it's empty string
        }
      };
      
      console.log("Saving event with ID:", eventId, "is new:", eventId === 'new');
      
      // Always use POST for new events
      if (eventId === 'new' || !eventId) {
        console.log("Creating a new event with POST request");
        const response = await apiRequest('POST', '/api/events', eventData);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error creating event:", errorText);
          throw new Error(errorText || "Failed to create event");
        }
        return response.json();
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
      } else {
        toast({
          title: 'Success',
          description: 'Event updated successfully',
        });
      }
      
      // Navigate to the dashboard events section after creating/updating
      setTimeout(() => {
        navigate('/dashboard?tab=events');
      }, 3000);
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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 p-4 rounded-lg">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate('/dashboard?tab=events')}
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
            onClick={() => navigate('/dashboard?tab=events')}
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
            Publish
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
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-base font-medium mb-2">Company Branding</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-medium">Company Logo</Label>
                          <p className="text-sm text-gray-500 mt-1 mb-3">
                            Add your logo to customize the branding of your event booking page
                          </p>
                          
                          {logoUrl ? (
                            <div className="mb-4 relative group">
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
                                      <Trash2Icon className="h-3 w-3 mr-1" /> 
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
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                              >
                                <UploadIcon className="h-3 w-3 mr-1" /> 
                                Select Image
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Preview */}
        <div className="col-span-1">
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