import { Patient } from "@/types";
import { hybridDataManager } from "./hybrid-data-adapter";
import { getCurrentOsteopathId } from "@/services";

/**
 * Service patient hybride utilisant l'architecture Cloud + Local
 * Remplace progressivement l'ancien patient-service
 */
export class HybridPatientService {
  private static instance: HybridPatientService;

  static getInstance(): HybridPatientService {
    if (!HybridPatientService.instance) {
      HybridPatientService.instance = new HybridPatientService();
    }
    return HybridPatientService.instance;
  }

  async getPatients(): Promise<Patient[]> {
    console.log("🔄 HybridPatientService.getPatients: Using hybrid architecture");
    return await hybridDataManager.get<Patient>('patients');
  }

  async getPatientById(id: number): Promise<Patient | undefined> {
    console.log(`🔄 HybridPatientService.getPatientById: ${id}`);
    
    if (!id || isNaN(id) || id <= 0) {
      console.warn("getPatientById appelé avec un ID invalide:", id);
      return undefined;
    }

    const patient = await hybridDataManager.getById<Patient>('patients', id);
    return patient || undefined;
  }

  async createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    console.log("🔄 HybridPatientService.createPatient: Using hybrid architecture");
    
    // Récupérer l'osteopathId de l'utilisateur connecté
    const osteopathId = await getCurrentOsteopathId();
    if (!osteopathId) {
      throw new Error("Impossible de récupérer l'identifiant de l'ostéopathe connecté");
    }

    // S'assurer que l'osteopathId est correct
    const securedPatientData = {
      ...patientData,
      osteopathId,
      cabinetId: patientData.cabinetId || null
    };

    return await hybridDataManager.create<Patient>('patients', securedPatientData);
  }

  async updatePatient(patient: Patient): Promise<Patient> {
    console.log(`🔄 HybridPatientService.updatePatient: ${patient.id}`);
    
    if (!patient.id || isNaN(patient.id) || patient.id <= 0) {
      throw new Error("ID patient invalide pour la mise à jour");
    }

    const { id, ...updateData } = patient;
    return await hybridDataManager.update<Patient>('patients', id, updateData);
  }

  async deletePatient(id: number): Promise<boolean> {
    console.log(`🔄 HybridPatientService.deletePatient: ${id}`);
    
    if (!id || isNaN(id) || id <= 0) {
      console.warn("deletePatient appelé avec un ID invalide:", id);
      return false;
    }

    return await hybridDataManager.delete('patients', id);
  }
}

// Instance singleton
export const hybridPatientService = HybridPatientService.getInstance();