
"use client";

import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

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
  onSelect: (date: Date | undefined) => void;
  defaultMonth?: Date;
  selected?: Date;
  mode?: "single" | "range" | "multiple";
}

export function DatePicker({
  date,
  onSelect,
  defaultMonth,
  selected,
  mode = "single"
}: DatePickerProps) {
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
          {date ? format(date, "PPP", { locale: fr }) : <span>Sélectionner une date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        {mode === "single" && (
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={defaultMonth}
            onSelect={onSelect}
            initialFocus
            locale={fr}
            className="pointer-events-auto"
          />
        )}
        {mode === "range" && (
          <Calendar
            mode="range"
            selected={selected as any}
            defaultMonth={defaultMonth}
            onSelect={onSelect}
            initialFocus
            locale={fr}
            className="pointer-events-auto"
          />
        )}
        {mode === "multiple" && (
          <Calendar
            mode="multiple"
            selected={selected as any}
            defaultMonth={defaultMonth}
            onSelect={onSelect}
            initialFocus
            locale={fr}
            className="pointer-events-auto"
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
