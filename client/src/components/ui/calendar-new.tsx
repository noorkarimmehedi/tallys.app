import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DropdownProps } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CustomCaption({
  displayMonth,
  currMonth,
  onMonthChange,
}: {
  displayMonth: Date;
  currMonth: Date;
  onMonthChange: (date: Date) => void;
}) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from({ length: 10 }, (_, i) => currMonth.getFullYear() - 2 + i);

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-1">
        <Select
          value={displayMonth.getMonth().toString()}
          onValueChange={(value) => {
            const newMonth = new Date(displayMonth);
            newMonth.setMonth(parseInt(value));
            onMonthChange(newMonth);
          }}
        >
          <SelectTrigger className="h-8 w-[110px] border-none focus:ring-0">
            <SelectValue>
              {months[displayMonth.getMonth()]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={index} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={displayMonth.getFullYear().toString()}
          onValueChange={(value) => {
            const newMonth = new Date(displayMonth);
            newMonth.setFullYear(parseInt(value));
            onMonthChange(newMonth);
          }}
        >
          <SelectTrigger className="h-8 w-[80px] border-none focus:ring-0">
            <SelectValue>
              {displayMonth.getFullYear()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => {
            const previousMonth = new Date(displayMonth);
            previousMonth.setMonth(previousMonth.getMonth() - 1);
            onMonthChange(previousMonth);
          }}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-7 w-7 bg-transparent border-none"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            const nextMonth = new Date(displayMonth);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            onMonthChange(nextMonth);
          }}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-7 w-7 bg-transparent border-none"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [displayMonth, setDisplayMonth] = React.useState(new Date());

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center relative items-center",
        caption_label: "hidden", // Hide default caption label
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "hidden", // Hide default nav buttons
        nav_button_next: "hidden", // Hide default nav buttons
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-xs flex items-center justify-center h-9",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm relative rounded-md [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: ({ displayMonth, ...captionProps }) => (
          <CustomCaption 
            displayMonth={displayMonth} 
            currMonth={displayMonth}
            onMonthChange={setDisplayMonth}
            {...captionProps}
          />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }