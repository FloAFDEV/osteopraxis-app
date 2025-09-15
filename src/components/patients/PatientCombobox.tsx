
import * as React from "react";
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import type { Patient } from "@/types";

interface PatientComboboxProps {
  patients: Patient[];
  value: number | null;
  onChange: (id: number) => void;
  placeholder?: string;
  className?: string;
}

export function PatientCombobox({
  patients,
  value,
  onChange,
  placeholder = "Choisir le patient",
  className,
}: PatientComboboxProps) {
  const [open, setOpen] = React.useState(false);

  // Trier les patients par nom de famille
  const sortedPatients = React.useMemo(
    () =>
      [...patients].sort((a, b) =>
        a.lastName.localeCompare(b.lastName, "fr", { sensitivity: "base" })
      ),
    [patients]
  );

  // Patient sélectionné
  const selected = sortedPatients.find((p) => p.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={`w-full justify-between ${className || ""}`}
          aria-expanded={open}
        >
          <span className="truncate">
            {selected
              ? `${selected.lastName} ${selected.firstName} — ${
                  selected.birthDate
                    ? new Date(selected.birthDate).toLocaleDateString()
                    : ""
                }`
              : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 w-[320px]" side="bottom">
        <Command>
          <CommandInput placeholder="Recherche par nom ou prénom..." />
          <CommandList>
            <CommandEmpty>Aucun patient trouvé</CommandEmpty>
            {sortedPatients.map((patient) => (
              <CommandItem
                key={patient.id}
                value={`${patient.lastName} ${patient.firstName} ${patient.birthDate ?? ""}`}
                onSelect={() => {
                  onChange(patient.id);
                  setOpen(false);
                }}
              >
                <span>
                  {patient.lastName} {patient.firstName}
                  {patient.birthDate &&
                    <> — <span className="text-xs text-gray-500">{new Date(patient.birthDate).toLocaleDateString()}</span></>
                  }
                </span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
