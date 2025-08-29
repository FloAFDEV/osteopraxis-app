import { PatientRelationship } from "@/types/patient-relationship";
import { delay, USE_SUPABASE } from "./config";
import patientRelationshipService from "../supabase-api/patient-relationship-service";

export const apiPatientRelationshipService = {
  async getAllPatientRelationships(patientId: number): Promise<PatientRelationship[]> {
    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      console.log('🎭 Mode démo: Pas de relations familiales - retour liste vide');
      // Mode démo éphémère: retourner une liste vide (pas de relations familiales en démo)
      await delay(100);
      return [];
    }

    // Mode connecté: utiliser Supabase
    if (USE_SUPABASE) {
      return await patientRelationshipService.getAllPatientRelationships(patientId);
    }

    return [];
  },

  async getPatientRelationships(patientId: number): Promise<PatientRelationship[]> {
    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      console.log('🎭 Mode démo: Pas de relations familiales - retour liste vide');
      // Mode démo éphémère: retourner une liste vide (pas de relations familiales en démo)
      await delay(100);
      return [];
    }

    // Mode connecté: utiliser Supabase
    if (USE_SUPABASE) {
      return await patientRelationshipService.getPatientRelationships(patientId);
    }

    return [];
  },

  // Les autres méthodes délèguent directement au service Supabase
  createPatientRelationship: patientRelationshipService.createPatientRelationship,
  updatePatientRelationship: patientRelationshipService.updatePatientRelationship,
  deletePatientRelationship: patientRelationshipService.deletePatientRelationship,
};