
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { DayPicker, DayProps } from "react-day-picker";
import { format, isSameDay, parseISO } from "date-fns";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AppointmentTooltip } from "@/components/ui/appointment-tooltip";
import { CalendarAppointment } from "@/types/calendar";

export type EnhancedCalendarProps = React.ComponentProps<typeof DayPicker> & {
  appointmentDates?: string[];
  appointments?: CalendarAppointment[];
  onDateSelect?: (date: Date) => void;
};

function EnhancedCalendar({
  className,
  classNames,
  showOutsideDays = true,
  appointmentDates = [],
  appointments = [],
  onDateSelect,
  ...props
}: EnhancedCalendarProps) {
  // Custom day component to show appointment indicators with tooltips
  const CustomDay = ({ date, ...dayProps }: DayProps) => {
    const hasAppointment = appointmentDates.some(aptDate => 
      isSameDay(new Date(aptDate), date)
    );
    
    // Filter appointments for this specific date
    const dayAppointments = appointments.filter(apt => 
      isSameDay(new Date(apt.time), date)
    );
    
    const dayButton = (
      <button
        {...dayProps}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 relative",
          hasAppointment && "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/50"
        )}
        onClick={() => onDateSelect?.(date)}
      >
        {format(date, "d")}
        {hasAppointment && (
          <Badge 
            variant="secondary" 
            className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-blue-500 dark:bg-blue-400"
          />
        )}
      </button>
    );

    // Wrap with tooltip if there are appointments
    if (dayAppointments.length > 0) {
      return (
        <div className="relative">
          <AppointmentTooltip date={date} appointments={dayAppointments}>
            {dayButton}
          </AppointmentTooltip>
        </div>
      );
    }
    
    return <div className="relative">{dayButton}</div>;
  };

  return (
    <DayPicker
      locale={fr}
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Day: CustomDay,
      }}
      {...props}
    />
  );
}

EnhancedCalendar.displayName = "EnhancedCalendar";

export { EnhancedCalendar };
