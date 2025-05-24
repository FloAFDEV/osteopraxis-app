
import { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";

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
        const weight = parseFloat(String(value.weight));
        const height = parseFloat(String(value.height));
        
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

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [form]);

  // Fonction pour déterminer la couleur du fond en fonction de la valeur de l'IMC
  const getBmiBackgroundColor = (bmi: number | null): string => {
    if (bmi === null || isNaN(bmi)) return "bg-gray-100";
    
    if (bmi < 18.5) return "bg-blue-100"; // Sous la normale
    if (bmi >= 18.5 && bmi <= 24.9) return "bg-green-100"; // Normale
    if (bmi >= 25 && bmi <= 29.9) return "bg-yellow-100"; // Surpoids
    if (bmi >= 30) return "bg-red-100"; // Obèse
    
    return "bg-gray-100"; // Valeur par défaut
  };

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
        render={({ field }) => {
          const bmiValue = field.value as number | null;
          const backgroundColor = getBmiBackgroundColor(bmiValue);
          
          return (
            <FormItem>
              <FormLabel>IMC (calculé automatiquement)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="IMC"
                  readOnly
                  {...field}
                  value={field.value || ""}
                  className={`${backgroundColor} border-gray-300`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
};
