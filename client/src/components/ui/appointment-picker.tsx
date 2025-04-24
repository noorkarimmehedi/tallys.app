"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useState } from "react";

export interface TimeSlot {
  time: string;
  available: boolean;
}

interface AppointmentPickerProps {
  disabled?: ((date: Date) => boolean) | undefined;
  timeSlots: TimeSlot[];
  date: Date;
  onDateChange: (date: Date) => void;
  time: string | null;
  onTimeChange: (time: string) => void;
}

export function AppointmentPicker({
  disabled,
  timeSlots,
  date,
  onDateChange,
  time,
  onTimeChange
}: AppointmentPickerProps) {
  const today = new Date();

  return (
    <div>
      <div className="rounded-lg border border-border">
        <div className="flex max-sm:flex-col">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              if (newDate) {
                onDateChange(newDate);
              }
            }}
            className="p-2 sm:pe-5 bg-background"
            disabled={[
              { before: today },
              ...(disabled ? [disabled] : [])
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
                        onClick={() => onTimeChange(timeSlot)}
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