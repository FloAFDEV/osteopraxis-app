
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface YearPickerProps {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
  minYear?: number;
  maxYear?: number;
}

export function YearPicker({ 
  date, 
  onChange, 
  minYear = 1900, 
  maxYear = new Date().getFullYear() 
}: YearPickerProps) {
  const currentYear = date ? date.getFullYear() : new Date().getFullYear();
  const currentMonth = date ? date.getMonth() : new Date().getMonth();
  const currentDay = date ? date.getDate() : new Date().getDate();
  
  // Générer la liste des années
  const years = React.useMemo(() => {
    const yearsList = [];
    for (let year = maxYear; year >= minYear; year--) {
      yearsList.push(year);
    }
    return yearsList;
  }, [minYear, maxYear]);
  
  // Générer la liste des mois
  const months = [
    { value: 0, label: "Janvier" },
    { value: 1, label: "Février" },
    { value: 2, label: "Mars" },
    { value: 3, label: "Avril" },
    { value: 4, label: "Mai" },
    { value: 5, label: "Juin" },
    { value: 6, label: "Juillet" },
    { value: 7, label: "Août" },
    { value: 8, label: "Septembre" },
    { value: 9, label: "Octobre" },
    { value: 10, label: "Novembre" },
    { value: 11, label: "Décembre" }
  ];
  
  const handleYearChange = (value: string) => {
    if (!date) {
      const newDate = new Date();
      newDate.setFullYear(parseInt(value));
      onChange(newDate);
      return;
    }
    
    const newDate = new Date(date);
    newDate.setFullYear(parseInt(value));
    onChange(newDate);
  };
  
  const handleMonthChange = (value: string) => {
    if (!date) {
      const newDate = new Date();
      newDate.setMonth(parseInt(value));
      onChange(newDate);
      return;
    }
    
    const newDate = new Date(date);
    newDate.setMonth(parseInt(value));
    onChange(newDate);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <Select value={String(currentMonth)} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Mois" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={String(month.value)}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={String(currentYear)} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Année" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
