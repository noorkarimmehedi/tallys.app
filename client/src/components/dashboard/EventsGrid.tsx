import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, Calendar, Pencil } from 'lucide-react';
import { Event } from '@shared/schema';
import { EmptyStateForEvents } from '@/components/ui/empty-states';

export default function EventsGrid() {
  const { data: events = [], isLoading, error } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load events</p>
        <p className="text-sm text-gray-500 mt-1">Please try refreshing the page</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <EmptyStateForEvents />
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h3 className="text-xl font-semibold mb-4">Your Events</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event: Event) => (
          <Card key={event.id} className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-medium">{event.title}</CardTitle>
                <div className={`px-2 py-1 text-xs rounded-full ${event.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {event.published ? 'Published' : 'Draft'}
                </div>
              </div>
              <CardDescription className="line-clamp-2 mt-1">
                {event.description || 'No description'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>{event.duration} minutes</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-2 border-t">
              <Button variant="ghost" asChild size="sm">
                <a href={`/e/${event.shortId}`} target="_blank" rel="noopener noreferrer">
                  <Calendar className="mr-1 h-4 w-4" />
                  View Booking
                </a>
              </Button>
              <Button variant="ghost" asChild size="sm">
                <Link href={`/event-builder/${event.id}`}>
                  <Pencil className="mr-1 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}