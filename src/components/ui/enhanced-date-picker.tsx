
import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarAppointment } from "@/types/calendar";

interface EnhancedDatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  appointmentDates?: string[];
  appointments?: CalendarAppointment[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function EnhancedDatePicker({
  date,
  onSelect,
  appointmentDates = [],
  appointments = [],
  disabled = false,
  placeholder = "Choisir une date",
  className,
}: EnhancedDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onSelect?.(selectedDate);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: fr }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <EnhancedCalendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          appointmentDates={appointmentDates}
          appointments={appointments}
          onDateSelect={handleDateSelect}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
