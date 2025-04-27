"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useState, useEffect } from "react";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AppointmentPickerProps {
  initialDate?: Date;
  initialTime?: string | null;
  timeSlots?: TimeSlot[];
  onDateChange?: (date: Date) => void;
  onTimeChange?: (time: string | null) => void;
  disabledDates?: any[];
}

function AppointmentPicker({
  initialDate,
  initialTime = null,
  timeSlots = [],
  onDateChange,
  onTimeChange,
  disabledDates = []
}: AppointmentPickerProps) {
  const today = new Date();
  const [date, setDate] = useState<Date | undefined>(initialDate || today);
  const [time, setTime] = useState<string | null>(initialTime);

  // Use default time slots if none provided
  const defaultTimeSlots = timeSlots.length > 0 ? timeSlots : [
    { time: "09:00", available: false },
    { time: "09:30", available: false },
    { time: "10:00", available: true },
    { time: "10:30", available: true },
    { time: "11:00", available: true },
    { time: "11:30", available: true },
    { time: "12:00", available: false },
    { time: "12:30", available: true },
    { time: "13:00", available: true },
    { time: "13:30", available: true },
    { time: "14:00", available: true },
    { time: "14:30", available: false },
    { time: "15:00", available: false },
    { time: "15:30", available: true },
    { time: "16:00", available: true },
    { time: "16:30", available: true },
    { time: "17:00", available: true },
    { time: "17:30", available: true },
  ];

  // Update when props change
  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    }
    if (initialTime !== undefined) {
      setTime(initialTime);
    }
  }, [initialDate, initialTime]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      if (onDateChange) {
        onDateChange(newDate);
      }
      // Reset time when date changes
      setTime(null);
      if (onTimeChange) {
        onTimeChange(null);
      }
    }
  };

  const handleTimeSelect = (timeSlot: string) => {
    setTime(timeSlot);
    if (onTimeChange) {
      onTimeChange(timeSlot);
    }
  };
  
  // Format time slot for display (12-hour format with am/pm)
  const formatTimeSlot = (timeString: string) => {
    try {
      // Parse the time string (assuming format like "10:00" or "14:30")
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0);
      
      // Format using 12-hour clock with am/pm
      return format(date, 'h:mm a').toLowerCase();
    } catch (e) {
      return timeString; // Return the original if parsing fails
    }
  };

  return (
    <div>
      <div className="rounded-lg border border-border shadow-sm">
        <div className="flex flex-col">
          {/* Calendar - full width on both mobile and desktop */}
          <div className="w-full max-w-full">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="p-2 bg-background/80 rounded-t-lg w-full max-w-full"
              disabled={disabledDates}
              initialFocus
            />
          </div>
          
          {/* Time slots - below calendar */}
          <div className="w-full border-t border-border p-4 bg-background/90">
            <div className="mb-3">
              <p className="text-sm font-medium text-foreground/80">
                {date ? format(date, "EEEE, MMMM d") : "Select a date"}
              </p>
            </div>
            <ScrollArea className="max-h-60">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {defaultTimeSlots.map(({ time: timeSlot, available }) => (
                  <Button
                    key={timeSlot}
                    variant={time === timeSlot ? "default" : "outline"}
                    size="sm"
                    className={`w-full text-sm transition-all ${time === timeSlot ? 'shadow-sm scale-[1.02]' : ''}`}
                    onClick={() => handleTimeSelect(timeSlot)}
                    disabled={!available}
                  >
                    {formatTimeSlot(timeSlot)}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AppointmentPicker };