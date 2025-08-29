
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building, Info, Plus, ArrowRight } from "lucide-react";
import { Cabinet } from "@/types";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { TranslatedSelect } from "@/components/ui/translated-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";
import { useCabinets } from "@/hooks/useCabinets";

interface CabinetSelectorProps {
  form: UseFormReturn<PatientFormValues>;
  selectedCabinetId: string | null;
  onCabinetChange: (cabinetId: string) => void;
}

export const CabinetSelector = ({ form, selectedCabinetId, onCabinetChange }: CabinetSelectorProps) => {
  const { data: cabinets = [], isLoading: loading } = useCabinets();
  const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | null>(null);

  useEffect(() => {
    if (cabinets.length > 0) {
      // Configuration automatique du premier cabinet
      if (!selectedCabinetId) {
        const firstCabinet = cabinets[0];
        setSelectedCabinet(firstCabinet);
        onCabinetChange(firstCabinet.id.toString());
        form.setValue('cabinetId', firstCabinet.id);
      } else {
        // Trouver le cabinet sélectionné
        const cabinet = cabinets.find(c => c.id === parseInt(selectedCabinetId));
        setSelectedCabinet(cabinet || null);
      }
    }
  }, [cabinets, selectedCabinetId, onCabinetChange, form]);

  const handleCabinetChange = (value: string) => {
    const cabinet = cabinets.find(c => c.id === parseInt(value));
    setSelectedCabinet(cabinet || null);
    onCabinetChange(value);
    form.setValue('cabinetId', parseInt(value));
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="cabinetId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Cabinet de rattachement
              <span className="text-red-500">*</span>
            </FormLabel>
            <FormDescription>
              Sélectionnez le cabinet auquel ce patient sera rattaché
            </FormDescription>
            <FormControl>
              <TranslatedSelect
                value={selectedCabinetId}
                onValueChange={handleCabinetChange}
                enumType="Cabinet"
                placeholder={loading ? "Chargement..." : "Sélectionner un cabinet"}
                disabled={loading}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {selectedCabinet && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Cabinet sélectionné :</strong> {selectedCabinet.name}
            {selectedCabinet.address && (
              <span className="block text-sm text-muted-foreground mt-1">
                📍 {selectedCabinet.address}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {cabinets.length === 0 && !loading && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <Plus className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong className="text-orange-800 dark:text-orange-200">Aucun cabinet configuré</strong>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Vous devez d'abord créer un cabinet pour pouvoir ajouter des patients.
              </p>
            </div>
            <Button 
              asChild 
              variant="outline" 
              className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900"
            >
              <Link to="/cabinets/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Créer un cabinet
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
