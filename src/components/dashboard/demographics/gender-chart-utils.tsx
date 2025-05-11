
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
  // Pour garantir que les enfants sont toujours affichés même s'il n'y a pas de données
  const result: GenderChartData[] = [];
  
  if (patientsList.length > 0) {
    // Séparer les enfants et les adultes
    const childPatients = patientsList.filter(isChild);
    const adultPatients = patientsList.filter(patient => !isChild(patient));
    
    console.log(`Chart data calculation: ${childPatients.length} children and ${adultPatients.length} adults`);
    
    // Compter les adultes hommes et femmes
    const adultMales = adultPatients.filter(p => p.gender === "Homme").length;
    const adultFemales = adultPatients.filter(p => p.gender === "Femme").length;
    const otherOrUndefined = adultPatients.filter(p => p.gender !== "Homme" && p.gender !== "Femme").length;
    
    // Ajouter les adultes hommes si présents
    if (adultMales > 0) {
      result.push({
        name: "Homme",
        value: adultMales,
        percentage: Math.round((adultMales / totalPatients) * 100),
        icon: <User className="h-5 w-5 text-blue-600" />
      });
    }
    
    // Ajouter les adultes femmes si présents
    if (adultFemales > 0) {
      result.push({
        name: "Femme",
        value: adultFemales,
        percentage: Math.round((adultFemales / totalPatients) * 100),
        icon: <UserRound className="h-5 w-5 text-pink-600" />
      });
    }
    
    // Toujours ajouter les enfants, même si le compte est 0
    result.push({
      name: "Enfant",
      value: childPatients.length,
      percentage: totalPatients > 0 ? Math.round((childPatients.length / totalPatients) * 100) : 0,
      icon: <Baby className="h-5 w-5 text-emerald-600" />
    });
    
    // Ajouter les autres/non définis si présents
    if (otherOrUndefined > 0) {
      result.push({
        name: "Non spécifié",
        value: otherOrUndefined,
        percentage: Math.round((otherOrUndefined / totalPatients) * 100),
        icon: <UserCircle className="h-5 w-5 text-gray-600" />
      });
    }
    
    return result;
  }
  
  // Données par défaut pour la démonstration (toujours inclure les enfants)
  return [{
    name: "Homme",
    value: 1,
    percentage: 33,
    icon: <User className="h-5 w-5 text-blue-600" />
  }, {
    name: "Femme",
    value: 1,
    percentage: 33,
    icon: <UserRound className="h-5 w-5 text-pink-600" />
  }, {
    name: "Enfant",
    value: 1,
    percentage: 34,
    icon: <Baby className="h-5 w-5 text-emerald-600" />
  }];
};
