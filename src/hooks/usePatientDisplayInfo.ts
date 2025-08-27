import { Patient } from '@/types';
import { useMemo } from 'react';

interface PatientDisplayInfo {
  displayName: string;
  displayEmail: string;
  isDemoPatient: boolean;
}

/**
 * Hook pour gérer l'affichage des informations patient en masquant les données techniques en mode démo
 * @param patient - Le patient à afficher
 * @returns Informations d'affichage avec alias pour les patients démo
 */
export const usePatientDisplayInfo = (patient: Patient): PatientDisplayInfo => {
  return useMemo(() => {
    // Détection d'un patient démo par email technique
    const isDemoPatient = patient.email?.endsWith('@temp.local') || false;
    
    if (isDemoPatient) {
      // Extraire un identifiant court de l'email pour générer un alias unique
      const emailMatch = patient.email?.match(/patient-(\d+)-(\d+)@temp\.local/);
      const shortId = emailMatch ? emailMatch[2].slice(-4) : Math.random().toString(36).slice(-4);
      
      return {
        displayName: `Patient Démo #${shortId}`,
        displayEmail: `demo-${shortId}@exemple.local`,
        isDemoPatient: true,
      };
    }

    // Patient normal - affichage standard
    return {
      displayName: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Patient',
      displayEmail: patient.email || '',
      isDemoPatient: false,
    };
  }, [patient.firstName, patient.lastName, patient.email]);
};

/**
 * Fonction utilitaire pour obtenir le nom d'affichage d'un patient
 * @param patient - Le patient
 * @returns Le nom à afficher (alias si patient démo)
 */
export const getPatientDisplayName = (patient: Patient): string => {
  const isDemoPatient = patient.email?.endsWith('@temp.local') || false;
  
  if (isDemoPatient) {
    const emailMatch = patient.email?.match(/patient-(\d+)-(\d+)@temp\.local/);
    const shortId = emailMatch ? emailMatch[2].slice(-4) : Math.random().toString(36).slice(-4);
    return `Patient Démo #${shortId}`;
  }

  return `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Patient';
};

/**
 * Fonction utilitaire pour obtenir l'email d'affichage d'un patient
 * @param patient - Le patient
 * @returns L'email à afficher (alias si patient démo)
 */
export const getPatientDisplayEmail = (patient: Patient): string => {
  const isDemoPatient = patient.email?.endsWith('@temp.local') || false;
  
  if (isDemoPatient) {
    const emailMatch = patient.email?.match(/patient-(\d+)-(\d+)@temp\.local/);
    const shortId = emailMatch ? emailMatch[2].slice(-4) : Math.random().toString(36).slice(-4);
    return `demo-${shortId}@exemple.local`;
  }

  return patient.email || '';
};