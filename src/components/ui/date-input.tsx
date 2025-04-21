
import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";

export interface DateInputProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  format?: string;
  className?: string;
  disabled?: boolean;
}

export function DateInput({
  value,
  onChange,
  placeholder = "Sélectionner une date",
  format: dateFormat = "dd/MM/yyyy",
  className,
  disabled = false
}: DateInputProps) {
  const [inputValue, setInputValue] = React.useState<string>(
    value ? format(value, dateFormat) : ""
  );

  React.useEffect(() => {
    setInputValue(value ? format(value, dateFormat) : "");
  }, [value, dateFormat]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    try {
      const parsedDate = parse(newValue, dateFormat, new Date());
      if (isValid(parsedDate)) {
        onChange(parsedDate);
      }
    } catch {}
  };

  const handleBlur = () => {
    if (!inputValue) {
      onChange(undefined);
      return;
    }
    try {
      const parsedDate = parse(inputValue, dateFormat, new Date());
      if (isValid(parsedDate)) {
        onChange(parsedDate);
        setInputValue(format(parsedDate, dateFormat));
      } else {
        setInputValue(value ? format(value, dateFormat) : "");
      }
    } catch {
      setInputValue(value ? format(value, dateFormat) : "");
    }
  };

  return (
    <div className={cn("relative grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="pr-10"
            disabled={disabled}
          />
        </PopoverTrigger>
        {/* Icône calendrier en absolu, non interactive */}
        <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
