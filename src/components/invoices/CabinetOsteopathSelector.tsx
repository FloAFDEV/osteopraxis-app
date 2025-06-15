
import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Osteopath, Cabinet } from "@/types";
import { useOsteopaths } from "@/hooks/useOsteopaths";
import { useCabinetsByOsteopath } from "@/hooks/useCabinetsByOsteopath";

interface CabinetOsteopathSelectorProps {
  selectedOsteopathId?: number | null;
  selectedCabinetId?: number | null;
  onOsteopathChange: (osteoId: number) => void;
  onCabinetChange: (cabId: number) => void;
}

export function CabinetOsteopathSelector({
  selectedOsteopathId,
  selectedCabinetId,
  onOsteopathChange,
  onCabinetChange,
}: CabinetOsteopathSelectorProps) {
  const { osteopaths, loading: loadingOsteo, error: errorOsteo } = useOsteopaths();
  const { cabinets, loading: loadingCabs, error: errorCabs } = useCabinetsByOsteopath(selectedOsteopathId ?? undefined);

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-3">
      <div className="flex-1">
        <label className="block text-xs mb-1 font-medium text-muted-foreground">
          Praticien
        </label>
        {loadingOsteo ? (
          <Skeleton className="h-9 w-full rounded" />
        ) : errorOsteo ? (
          <div className="text-sm text-red-500">Erreur de chargement</div>
        ) : (
          <Select
            value={selectedOsteopathId ? String(selectedOsteopathId) : ""}
            onValueChange={(id: string) => onOsteopathChange(Number(id))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un ostéopathe" />
            </SelectTrigger>
            <SelectContent>
              {osteopaths.map((ost) => (
                <SelectItem key={ost.id} value={String(ost.id)}>
                  {ost.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="flex-1">
        <label className="block text-xs mb-1 font-medium text-muted-foreground">
          Cabinet
        </label>
        {loadingCabs ? (
          <Skeleton className="h-9 w-full rounded" />
        ) : errorCabs ? (
          <div className="text-sm text-red-500">Erreur de chargement</div>
        ) : !selectedOsteopathId ? (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner d'abord un praticien" />
            </SelectTrigger>
          </Select>
        ) : cabinets.length === 0 ? (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Aucun cabinet disponible" />
            </SelectTrigger>
          </Select>
        ) : (
          <Select
            value={selectedCabinetId ? String(selectedCabinetId) : ""}
            onValueChange={(id: string) => onCabinetChange(Number(id))}
            disabled={!selectedOsteopathId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un cabinet" />
            </SelectTrigger>
            <SelectContent>
              {cabinets.map((cab) => (
                <SelectItem key={cab.id} value={String(cab.id)}>
                  {cab.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
