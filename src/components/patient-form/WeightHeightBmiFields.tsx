
import { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "../patient-form";

interface WeightHeightBmiFieldsProps {
  form: UseFormReturn<PatientFormValues>;
}

export const WeightHeightBmiFields = ({ form }: WeightHeightBmiFieldsProps) => {
  // Fonction pour calculer l'IMC (poids / (taille en m)²)
  const calculateBMI = (weight: number, height: number): number | null => {
    if (!weight || !height || height <= 0) return null;
    
    // Convertir la hauteur en mètres (si elle est en cm)
    const heightInMeters = height / 100;
    // Calculer l'IMC et arrondir à 1 décimale
    return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
  };

  // Observer les changements de poids et de taille pour calculer l'IMC
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Calculer l'IMC uniquement si le poids ou la taille change
      if (name === "weight" || name === "height") {
        const weight = parseFloat(value.weight as string);
        const height = parseFloat(value.height as string);
        
        if (!isNaN(weight) && !isNaN(height) && weight > 0 && height > 0) {
          const bmi = calculateBMI(weight, height);
          if (bmi) {
            form.setValue("bmi", bmi);
          }
        } else {
          // Si l'une des valeurs est invalide, réinitialiser l'IMC
          form.setValue("bmi", null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField
        control={form.control}
        name="height"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Taille (cm)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ex: 175"
                min={0}
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  field.onChange(e.target.value === "" ? null : Number(e.target.value));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="weight"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Poids (kg)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ex: 70"
                min={0}
                step="0.1"
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  field.onChange(e.target.value === "" ? null : Number(e.target.value));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bmi"
        render={({ field }) => (
          <FormItem>
            <FormLabel>IMC (calculé automatiquement)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="IMC"
                readOnly
                {...field}
                value={field.value || ""}
                className="bg-gray-100"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
