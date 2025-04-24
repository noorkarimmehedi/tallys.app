"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar-new";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useState } from "react";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AppointmentPickerProps {
  initialDate?: Date;
  initialTime?: string | null;
  timeSlots: TimeSlot[];
  onDateChange?: (date: Date | undefined) => void;
  onTimeChange?: (time: string | null) => void;
  disabledDates?: any[];
}

export function AppointmentPicker({
  initialDate = new Date(),
  initialTime = null,
  timeSlots,
  onDateChange,
  onTimeChange,
  disabledDates = []
}: AppointmentPickerProps) {
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [time, setTime] = useState<string | null>(initialTime);
  const today = new Date();

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    setTime(null); // Reset time when date changes
    if (onDateChange) onDateChange(newDate);
    if (onTimeChange) onTimeChange(null);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (onTimeChange) onTimeChange(newTime);
  };

  return (
    <div>
      <div className="rounded-lg border border-border">
        <div className="flex max-sm:flex-col">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            className="p-2 sm:pe-5 bg-background"
            disabled={[
              { before: today },
              ...disabledDates
            ]}
          />
          <div className="relative w-full max-sm:h-48 sm:w-40">
            <div className="absolute inset-0 border-border py-4 max-sm:border-t">
              <ScrollArea className="h-full border-border sm:border-s">
                <div className="space-y-3">
                  <div className="flex h-5 shrink-0 items-center px-5">
                    <p className="text-sm font-medium">{date ? format(date, "EEEE, d") : "Select a date"}</p>
                  </div>
                  <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                    {date && timeSlots.map(({ time: timeSlot, available }) => (
                      <Button
                        key={timeSlot}
                        variant={time === timeSlot ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => handleTimeChange(timeSlot)}
                        disabled={!available}
                      >
                        {timeSlot}
                      </Button>
                    ))}
                    {!date && (
                      <div className="text-center text-sm text-muted-foreground p-4">
                        Please select a date to view available times
                      </div>
                    )}
                    {date && timeSlots.length === 0 && (
                      <div className="text-center text-sm text-muted-foreground p-4">
                        No time slots available for this date
                      </div>
                    )}
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