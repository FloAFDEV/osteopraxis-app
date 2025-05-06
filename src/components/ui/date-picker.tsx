
"use client";

import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  date?: Date;
  onSelect: (date: Date | undefined | DateRange | Date[]) => void;
  defaultMonth?: Date;
  selected?: Date | DateRange | Date[];
  mode?: "single" | "range" | "multiple";
}

export function DatePicker({
  date,
  onSelect,
  defaultMonth,
  selected,
  mode = "single"
}: DatePickerProps) {
  // Function to format the display date
  const formatDisplayDate = () => {
    if (!date) return <span>Sélectionner une date</span>;
    return format(date, "dd/MM/yyyy", { locale: fr });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayDate()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        {mode === "single" && (
          <Calendar
            mode="single"
            selected={selected as Date | undefined}
            defaultMonth={defaultMonth}
            onSelect={onSelect as (date: Date | undefined) => void}
            initialFocus
            locale={fr}
            className="pointer-events-auto"
          />
        )}
        {mode === "range" && (
          <Calendar
            mode="range"
            selected={selected as DateRange | undefined}
            defaultMonth={defaultMonth}
            onSelect={onSelect as (range: DateRange | undefined) => void}
            initialFocus
            locale={fr}
            className="pointer-events-auto"
          />
        )}
        {mode === "multiple" && (
          <Calendar
            mode="multiple"
            selected={selected as Date[] | undefined}
            defaultMonth={defaultMonth}
            onSelect={onSelect as (dates: Date[] | undefined) => void}
            initialFocus
            locale={fr}
            className="pointer-events-auto"
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
