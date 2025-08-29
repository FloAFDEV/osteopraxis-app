import { PatientRelationship } from "@/types/patient-relationship";
import { delay, USE_SUPABASE } from "./config";

export const demoPatientRelationshipService = {
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
      const patientRelationshipService = await import("../supabase-api/patient-relationship-service");
      return await patientRelationshipService.default.getAllPatientRelationships(patientId);
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
      const patientRelationshipService = await import("../supabase-api/patient-relationship-service");
      return await patientRelationshipService.default.getPatientRelationships(patientId);
    }

    return [];
  },

  // Les autres méthodes nécessitent Supabase
  async createPatientRelationship(payload: any): Promise<PatientRelationship> {
    if (USE_SUPABASE) {
      const patientRelationshipService = await import("../supabase-api/patient-relationship-service");
      return await patientRelationshipService.default.createPatientRelationship(payload);
    }
    throw new Error("Fonctionnalité non disponible en mode démo");
  },

  async updatePatientRelationship(relationshipId: number, updates: any): Promise<PatientRelationship> {
    if (USE_SUPABASE) {
      const patientRelationshipService = await import("../supabase-api/patient-relationship-service");
      return await patientRelationshipService.default.updatePatientRelationship(relationshipId, updates);
    }
    throw new Error("Fonctionnalité non disponible en mode démo");
  },

  async deletePatientRelationship(relationshipId: number): Promise<void> {
    if (USE_SUPABASE) {
      const patientRelationshipService = await import("../supabase-api/patient-relationship-service");
      return await patientRelationshipService.default.deletePatientRelationship(relationshipId);
    }
    throw new Error("Fonctionnalité non disponible en mode démo");
  },
};