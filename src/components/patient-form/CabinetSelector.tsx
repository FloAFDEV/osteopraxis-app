
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/services/api";
import { Building, Info, Plus, ArrowRight } from "lucide-react";
import { Cabinet } from "@/types";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { TranslatedSelect } from "@/components/ui/translated-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
        // Vérifier d'abord le cache de session
        const cacheKey = 'user_cabinets';
        const cachedCabinets = sessionStorage.getItem(cacheKey);
        
        if (cachedCabinets) {
          // Utiliser les données en cache pour un chargement instantané
          const userCabinets = JSON.parse(cachedCabinets);
          setCabinets(userCabinets);
          setLoading(false);
          
          // Configuration automatique du premier cabinet
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
          
          return; // Sortir si on a des données en cache
        }
        
        // Sinon, charger depuis l'API
        const userCabinets = await api.getCabinets();
        setCabinets(userCabinets);
        
        // Mettre en cache pour 5 minutes
        sessionStorage.setItem(cacheKey, JSON.stringify(userCabinets));
        setTimeout(() => sessionStorage.removeItem(cacheKey), 5 * 60 * 1000);
        
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
