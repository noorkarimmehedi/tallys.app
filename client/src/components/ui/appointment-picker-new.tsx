"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar-new";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useState } from "react";

interface AppointmentPickerProps {
  onDateTimeSelected?: (date: Date, time: string) => void;
  availableTimeSlots?: { time: string; available: boolean }[];
  className?: string;
}

export function AppointmentPicker({ 
  onDateTimeSelected, 
  availableTimeSlots,
  className
}: AppointmentPickerProps) {
  const today = new Date();
  const [date, setDate] = useState<Date>(today);
  const [time, setTime] = useState<string | null>(null);

  const defaultTimeSlots = [
    { time: "09:00", available: true },
    { time: "09:30", available: true },
    { time: "10:00", available: true },
    { time: "10:30", available: true },
    { time: "11:00", available: true },
    { time: "11:30", available: true },
    { time: "12:00", available: true },
    { time: "12:30", available: true },
    { time: "13:00", available: true },
    { time: "13:30", available: true },
    { time: "14:00", available: true },
    { time: "14:30", available: true },
    { time: "15:00", available: true },
    { time: "15:30", available: true },
    { time: "16:00", available: true },
    { time: "16:30", available: true },
    { time: "17:00", available: true },
    { time: "17:30", available: true },
  ];

  const timeSlots = availableTimeSlots || defaultTimeSlots;

  const handleTimeSelect = (selectedTime: string) => {
    setTime(selectedTime);
    
    if (onDateTimeSelected && date) {
      const selectedDate = new Date(date);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      selectedDate.setHours(hours, minutes);
      onDateTimeSelected(selectedDate, selectedTime);
    }
  };

  return (
    <div className={className}>
      <div className="rounded-lg border border-border">
        <div className="flex max-sm:flex-col">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              if (newDate) {
                setDate(newDate);
                setTime(null);
              }
            }}
            className="p-2 sm:pe-5 bg-background"
            disabled={[
              { before: today },
            ]}
          />
          <div className="relative w-full max-sm:h-48 sm:w-40">
            <div className="absolute inset-0 border-border py-4 max-sm:border-t">
              <ScrollArea className="h-full border-border sm:border-s">
                <div className="space-y-3">
                  <div className="flex h-5 shrink-0 items-center px-5">
                    <p className="text-sm font-medium">{format(date, "EEEE, d")}</p>
                  </div>
                  <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                    {timeSlots.map(({ time: timeSlot, available }) => (
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