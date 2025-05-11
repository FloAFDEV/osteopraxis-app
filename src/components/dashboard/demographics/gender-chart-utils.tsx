
import React from 'react';
import { User, UserRound, Baby, UserCircle } from 'lucide-react';
import { Patient } from '@/types';
import { GenderChartData } from './gender-pie-chart';

// Function to determine if a patient is a child (age < 12)
export const isChild = (patient: Patient): boolean => {
  if (!patient.birthDate) return false;
  
  const birthDate = new Date(patient.birthDate);
  const today = new Date();
  
  // Calculate age more precisely
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age < 12;
};

export const calculateGenderData = (patientsList: Patient[], totalPatients: number): GenderChartData[] => {
  console.log(`calculateGenderData - Input data: Patients list length: ${patientsList?.length || 0}, Total patients: ${totalPatients}`);
  
  // Pour garantir que les données sont calculées correctement
  const result: GenderChartData[] = [];
  
  // Si nous n'avons pas de patients mais un nombre total, utiliser des valeurs par défaut
  if ((!patientsList || patientsList.length === 0) && totalPatients > 0) {
    console.log("Using default values for chart data as patient list is empty");
    // Utiliser des valeurs par défaut (qui seront remplacées par les vraies données)
    return [
      {
        name: "Homme",
        value: Math.round(totalPatients * 0.4), 
        percentage: 40,
        icon: <User className="h-5 w-5 text-blue-600" />
      },
      {
        name: "Femme",
        value: Math.round(totalPatients * 0.4), 
        percentage: 40,
        icon: <UserRound className="h-5 w-5 text-pink-600" />
      },
      {
        name: "Enfant",
        value: Math.round(totalPatients * 0.2), 
        percentage: 20,
        icon: <Baby className="h-5 w-5 text-emerald-600" />
      }
    ];
  }
  
  // Safety check - ensure patientsList is an array
  const patients = Array.isArray(patientsList) ? patientsList : [];
  
  // Séparer les enfants et les adultes
  const childPatients = patients.filter(isChild);
  const adultPatients = patients.filter(patient => !isChild(patient));
  
  console.log(`Chart data calculation: ${childPatients.length} children and ${adultPatients.length} adults`);
  
  // Compter les adultes hommes et femmes
  const adultMales = adultPatients.filter(p => p.gender === "Homme").length;
  const adultFemales = adultPatients.filter(p => p.gender === "Femme").length;
  const otherOrUndefined = adultPatients.filter(p => p.gender !== "Homme" && p.gender !== "Femme").length;
  
  // Calculer les pourcentages réels
  const malePercentage = totalPatients > 0 ? Math.round((adultMales / totalPatients) * 100) : 0;
  const femalePercentage = totalPatients > 0 ? Math.round((adultFemales / totalPatients) * 100) : 0;
  const childrenPercentage = totalPatients > 0 ? Math.round((childPatients.length / totalPatients) * 100) : 0;
  const otherPercentage = totalPatients > 0 ? Math.round((otherOrUndefined / totalPatients) * 100) : 0;
  
  console.log(`Percentages - Male: ${malePercentage}%, Female: ${femalePercentage}%, Children: ${childrenPercentage}%, Other: ${otherPercentage}%`);
  console.log(`Raw counts - Male: ${adultMales}, Female: ${adultFemales}, Children: ${childPatients.length}, Other: ${otherOrUndefined}`);
  
  // Ajouter les adultes hommes seulement s'ils existent
  if (adultMales > 0) {
    result.push({
      name: "Homme",
      value: adultMales,
      percentage: malePercentage,
      icon: <User className="h-5 w-5 text-blue-600" />
    });
  }
  
  // Ajouter les adultes femmes seulement si elles existent
  if (adultFemales > 0) {
    result.push({
      name: "Femme",
      value: adultFemales,
      percentage: femalePercentage,
      icon: <UserRound className="h-5 w-5 text-pink-600" />
    });
  }
  
  // Ajouter les enfants seulement s'ils existent
  if (childPatients.length > 0) {
    result.push({
      name: "Enfant",
      value: childPatients.length,
      percentage: childrenPercentage,
      icon: <Baby className="h-5 w-5 text-emerald-600" />
    });
  }
  
  // Ajouter les autres/non définis si présents
  if (otherOrUndefined > 0) {
    result.push({
      name: "Non spécifié",
      value: otherOrUndefined,
      percentage: otherPercentage,
      icon: <UserCircle className="h-5 w-5 text-gray-600" />
    });
  }
  
  // Si après tout ça nous n'avons toujours pas de données, créer des données factices
  if (result.length === 0 && totalPatients > 0) {
    console.warn("Generated fallback data because no valid data categories were found");
    result.push({
      name: "Patients",
      value: totalPatients,
      percentage: 100,
      icon: <UserCircle className="h-5 w-5 text-blue-600" />
    });
  }
  
  console.log("Final chart data:", result);
  return result;
};
