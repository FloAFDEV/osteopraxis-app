
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

  // Fonction pour déterminer la classe CSS de couleur en fonction de la valeur de l'IMC
  const getBmiColorClass = (bmi: number | null): string => {
    if (bmi === null) return "bg-gray-100"; // Valeur par défaut si pas de BMI
    
    if (bmi < 18.5) return "bg-blue-100"; // Sous la normale
    if (bmi >= 18.5 && bmi <= 24.9) return "bg-green-100"; // Normale
    if (bmi >= 25.0 && bmi <= 29.9) return "bg-yellow-100"; // Surpoids
    return "bg-red-100"; // Obèse (≥ 30)
  };

  // Observer les changements de poids et de taille pour calculer l'IMC
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Calculer l'IMC uniquement quand le poids ou la taille changent
      if (name === "weight" || name === "height") {
        // Convert string values to numbers for calculation
        const weightValue = value.weight;
        const heightValue = value.height;
        
        // S'assurer que les valeurs sont des nombres
        const weight = typeof weightValue === 'number' ? weightValue : 
                      weightValue ? parseFloat(String(weightValue)) : 0;
                      
        const height = typeof heightValue === 'number' ? heightValue : 
                      heightValue ? parseFloat(String(heightValue)) : 0;
        
        const bmi = calculateBMI(weight, height);
        
        if (bmi !== null) {
          // Set BMI as a number in the form
          form.setValue("bmi", bmi, { shouldValidate: true });
        } else {
          form.setValue("bmi", null, { shouldValidate: true });
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Déterminer la couleur du champ BMI
  const bmiValue = form.watch("bmi");
  const numericBmi = typeof bmiValue === 'number' ? bmiValue : 
                    bmiValue ? parseFloat(String(bmiValue)) : null;
  const bmiColorClass = getBmiColorClass(numericBmi);

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
                placeholder="Taille en cm" 
                {...field} 
                onChange={(e) => {
                  // Assurez-vous que la valeur est un nombre
                  const value = e.target.value;
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    field.onChange(value === "" ? null : parseFloat(value));
                  }
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
                placeholder="Poids en kg" 
                {...field} 
                onChange={(e) => {
                  // Assurez-vous que la valeur est un nombre
                  const value = e.target.value;
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    field.onChange(value === "" ? null : parseFloat(value));
                  }
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
            <FormLabel>IMC</FormLabel>
            <FormControl>
              <Input 
                placeholder="IMC (calculé)" 
                {...field} 
                readOnly 
                className={`${bmiColorClass}`} // Appliquer la classe de couleur conditionnelle
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
