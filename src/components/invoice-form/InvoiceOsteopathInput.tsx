
import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { Osteopath } from "@/types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";

interface InvoiceOsteopathInputProps {
  control: any;
  isSubmitting: boolean;
  value?: number;
}

export function InvoiceOsteopathInput({ control, isSubmitting }: InvoiceOsteopathInputProps) {
  const [osteopaths, setOsteopaths] = useState<Osteopath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOsteopaths().then(os => {
      setOsteopaths(os ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div>
        <label className="block text-sm mb-1">Émetteur</label>
        <Input disabled value="Chargement..." />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm mb-1 font-semibold text-muted-foreground">Émetteur (Ostéopathe)</label>
      <Controller
        control={control}
        name="osteopathId"
        render={({ field }) => (
          <Select
            value={field.value ? String(field.value) : ""}
            onValueChange={v => field.onChange(Number(v))}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir l’ostéopathe" />
            </SelectTrigger>
            <SelectContent>
              {osteopaths.map(ost => (
                <SelectItem key={ost.id} value={String(ost.id)}>
                  {ost.name ?? `#${ost.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}
