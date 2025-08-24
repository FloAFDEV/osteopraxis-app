
import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { Cabinet, Osteopath } from "@/types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";

interface InvoiceCabinetInputProps {
  control: any;
  isSubmitting: boolean;
  selectedOsteopathId: number | undefined;
  value?: number;
}

export function InvoiceCabinetInput({ control, isSubmitting, selectedOsteopathId }: InvoiceCabinetInputProps) {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedOsteopathId) {
      setCabinets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api.getCabinetsByOsteopathId(selectedOsteopathId)
      .then((cabs) => setCabinets(cabs ?? []))
      .finally(() => setLoading(false));
  }, [selectedOsteopathId]);

  if (!selectedOsteopathId) {
    return (
      <div>
        <Label htmlFor="cabinet-select-disabled" className="block text-sm mb-1 font-semibold text-muted-foreground">Cabinet</Label>
        <Input id="cabinet-select-disabled" disabled value="Sélectionnez d'abord un praticien" />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <Label htmlFor="cabinet-select-loading" className="block text-sm mb-1 font-semibold text-muted-foreground">Cabinet</Label>
        <Input id="cabinet-select-loading" disabled value="Chargement..." />
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor="cabinet-select" className="block text-sm mb-1 font-semibold text-muted-foreground">Cabinet</Label>
      <Controller
        control={control}
        name="cabinetId"
        render={({ field }) => (
          <Select
            value={field.value ? String(field.value) : ""}
            onValueChange={v => field.onChange(Number(v))}
            disabled={isSubmitting}
          >
            <SelectTrigger id="cabinet-select">
              <SelectValue placeholder="Choisir le cabinet" />
            </SelectTrigger>
            <SelectContent>
              {cabinets.map(cab => (
                <SelectItem key={cab.id} value={String(cab.id)}>
                  {cab.name ?? `#${cab.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}
