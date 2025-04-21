
import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { fr } from "date-fns/locale";
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
  placeholder = "JJ/MM/AAAA",
  format: dateFormat = "dd/MM/yyyy",
  className,
  disabled = false
}: DateInputProps) {
  const [inputValue, setInputValue] = React.useState<string>(
    value ? format(value, dateFormat) : ""
  );
  const [open, setOpen] = React.useState(false);

  // Pour indiquer visuellement une date invalide
  const [isInvalid, setIsInvalid] = React.useState(false);

  React.useEffect(() => {
    setInputValue(value ? format(value, dateFormat) : "");
  }, [value, dateFormat]);

  // Vérifie la validité au changement clavier
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    try {
      const parsedDate = parse(newValue, dateFormat, new Date(), { locale: fr });
      const valid = isValid(parsedDate);
      setIsInvalid(!valid);
      if (valid) {
        onChange(parsedDate);
      }
    } catch {
      setIsInvalid(true);
    }
  };

  // Vérifie ou reset la validité lors du blur
  const handleBlur = () => {
    if (!inputValue) {
      setIsInvalid(false);
      onChange(undefined);
      return;
    }
    try {
      const parsedDate = parse(inputValue, dateFormat, new Date(), { locale: fr });
      const valid = isValid(parsedDate);
      setIsInvalid(!valid);
      if (valid) {
        onChange(parsedDate);
        setInputValue(format(parsedDate, dateFormat));
      } else {
        setInputValue(value ? format(value, dateFormat) : "");
      }
    } catch {
      setIsInvalid(true);
      setInputValue(value ? format(value, dateFormat) : "");
    }
  };

  // Fermeture du popover à la sélection
  const handleCalendarSelect = (date?: Date) => {
    onChange(date);
    setOpen(false);
  };

  return (
    <div className={cn("relative grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              "pr-10",
              isInvalid && "border-destructive"
            )}
            inputMode="numeric"
            pattern="\d{2}/\d{2}/\d{4}"
            disabled={disabled}
            aria-invalid={isInvalid}
          />
        </PopoverTrigger>
        {/* Icône calendrier en absolu, non interactive */}
        <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleCalendarSelect}
            initialFocus
            disabled={disabled}
            captionLayout="dropdown"
            fromYear={1900}
            toYear={new Date().getFullYear()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

