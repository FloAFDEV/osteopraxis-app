
import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

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

  // Met à jour la valeur de l'input quand la prop value change
  React.useEffect(() => {
    setInputValue(value ? format(value, dateFormat) : "");
  }, [value, dateFormat]);

  // Gère le changement de l'input texte
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Tente de parser la date depuis l'input
    try {
      // Pour le format dd/MM/yyyy
      const parsedDate = parse(newValue, dateFormat, new Date());
      
      // Vérifie si la date est valide
      if (isValid(parsedDate)) {
        onChange(parsedDate);
      }
    } catch (error) {
      // Ne fait rien si le parsing échoue, l'utilisateur est peut-être en train de taper
    }
  };

  // Gère la perte de focus de l'input
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
        // Réinitialise l'input à la valeur précédente si la date n'est pas valide
        setInputValue(value ? format(value, dateFormat) : "");
      }
    } catch (error) {
      // Réinitialise l'input à la valeur précédente si le parsing échoue
      setInputValue(value ? format(value, dateFormat) : "");
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <div className="flex-1 flex gap-2 items-center">
              <CalendarIcon className="h-4 w-4" />
              <Input
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={disabled}
              />
            </div>
          </Button>
        </PopoverTrigger>
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
