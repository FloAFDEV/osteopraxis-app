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
    // Détection d'un patient démo par email technique OU mode démo général
    const isDemoPatient = patient.email?.endsWith('@temp.local') || 
                         patient.email?.endsWith('@exemple.local') || 
                         patient.osteopathId === 999 || // ID factice démo
                         false;
    
    if (isDemoPatient) {
      // Extraire un identifiant court de l'ID patient pour générer un alias unique
      const shortId = patient.id.toString().slice(-4);
      
      return {
        displayName: `Patient Démo #${shortId}`,
        displayEmail: '', // Ne pas afficher d'email factice
        isDemoPatient: true,
      };
    }

    // Patient normal - affichage standard
    return {
      displayName: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Patient',
      displayEmail: patient.email || '',
      isDemoPatient: false,
    };
  }, [patient.id, patient.firstName, patient.lastName, patient.email, patient.osteopathId]);
};

/**
 * Fonction utilitaire pour obtenir le nom d'affichage d'un patient
 * @param patient - Le patient
 * @returns Le nom à afficher (alias si patient démo)
 */
export const getPatientDisplayName = (patient: Patient): string => {
  const isDemoPatient = patient.email?.endsWith('@temp.local') || 
                       patient.email?.endsWith('@exemple.local') || 
                       patient.osteopathId === 999 || // ID factice démo
                       false;
  
  if (isDemoPatient) {
    const shortId = patient.id.toString().slice(-4);
    return `Patient Démo #${shortId}`;
  }

  return `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Patient';
};

/**
 * Fonction utilitaire pour obtenir l'email d'affichage d'un patient
 * @param patient - Le patient
 * @returns L'email à afficher (vide si patient démo)
 */
export const getPatientDisplayEmail = (patient: Patient): string => {
  const isDemoPatient = patient.email?.endsWith('@temp.local') || 
                       patient.email?.endsWith('@exemple.local') || 
                       patient.osteopathId === 999 || // ID factice démo
                       false;
  
  if (isDemoPatient) {
    // Ne pas afficher d'email pour les patients démo
    return '';
  }

  return patient.email || '';
};