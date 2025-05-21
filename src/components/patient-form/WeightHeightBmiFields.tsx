
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
        const weight = parseFloat(value.weight as string);
        const height = parseFloat(value.height as string);
        
        const bmi = calculateBMI(weight, height);
        
        if (bmi !== null) {
          // Convertir en string avant de l'assigner au formulaire
          form.setValue("bmi", bmi.toString(), { shouldValidate: true });
        } else {
          form.setValue("bmi", "", { shouldValidate: true });
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Déterminer la couleur du champ BMI
  const bmiValue = form.watch("bmi");
  const bmiColorClass = getBmiColorClass(bmiValue ? parseFloat(bmiValue) : null);

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
                    field.onChange(value);
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
                    field.onChange(value);
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
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
