
import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Building, Info } from "lucide-react";
import { Cabinet } from "@/types";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { TranslatedSelect } from "@/components/ui/translated-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";

interface CabinetSelectorProps {
  form: UseFormReturn<PatientFormValues>;
  selectedCabinetId: string | null;
  onCabinetChange: (cabinetId: string) => void;
}

export const CabinetSelector = ({ form, selectedCabinetId, onCabinetChange }: CabinetSelectorProps) => {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | null>(null);

  useEffect(() => {
    const loadCabinets = async () => {
      try {
        const userCabinets = await api.getCabinets();
        setCabinets(userCabinets);
        
        // Sélectionner automatiquement le premier cabinet en mode démo
        if (userCabinets.length > 0 && !selectedCabinetId) {
          const firstCabinet = userCabinets[0];
          setSelectedCabinet(firstCabinet);
          onCabinetChange(firstCabinet.id.toString());
          form.setValue('cabinetId', firstCabinet.id);
        }
        
        // Trouver le cabinet sélectionné
        if (selectedCabinetId) {
          const cabinet = userCabinets.find(c => c.id === parseInt(selectedCabinetId));
          setSelectedCabinet(cabinet || null);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des cabinets:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCabinets();
  }, [selectedCabinetId, onCabinetChange, form]);

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
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Aucun cabinet trouvé. Vous devez d'abord créer un cabinet.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
