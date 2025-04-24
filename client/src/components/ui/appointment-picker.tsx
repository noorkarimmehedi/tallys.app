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

  return (
    <div>
      <div className="rounded-lg border border-border">
        <div className="flex max-sm:flex-col">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="p-2 sm:pe-5 bg-background"
            disabled={disabledDates}
          />
          <div className="relative w-full max-sm:h-48 sm:w-40">
            <div className="absolute inset-0 border-border py-4 max-sm:border-t">
              <ScrollArea className="h-full border-border sm:border-s">
                <div className="space-y-3">
                  <div className="flex h-5 shrink-0 items-center px-5">
                    <p className="text-sm font-medium">{date ? format(date, "EEEE, d") : "Select a date"}</p>
                  </div>
                  <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                    {defaultTimeSlots.map(({ time: timeSlot, available }) => (
                      <Button
                        key={timeSlot}
                        variant={time === timeSlot ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => handleTimeSelect(timeSlot)}
                        disabled={!available}
                      >
                        {timeSlot}
                      </Button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AppointmentPicker };