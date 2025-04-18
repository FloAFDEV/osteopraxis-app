
import { Patient, Gender, MaritalStatus, Handedness, Contraception } from "@/types";
import { supabase, supabaseAdmin, getCurrentOsteopathId } from "./utils";

const adaptPatientFromSupabase = (data: any): Patient => ({
  id: data.id,
  createdAt: data.created_at || data.createdAt,
  updatedAt: data.updated_at || data.updatedAt,
  firstName: data.firstName,
  lastName: data.lastName,
  email: data.email,
  phone: data.phone,
  address: data.address,
  gender: data.gender as Gender,
  birthDate: data.birthDate,
  maritalStatus: data.maritalStatus as MaritalStatus,
  occupation: data.occupation,
  hasChildren: data.hasChildren,
  childrenAges: data.childrenAges,
  generalPractitioner: data.generalPractitioner,
  surgicalHistory: data.surgicalHistory,
  traumaHistory: data.traumaHistory,
  rheumatologicalHistory: data.rheumatologicalHistory,
  currentTreatment: data.currentTreatment,
  handedness: data.handedness as Handedness,
  hasVisionCorrection: data.hasVisionCorrection,
  ophtalmologistName: data.ophtalmologistName,
  entProblems: data.entProblems,
  entDoctorName: data.entDoctorName,
  digestiveProblems: data.digestiveProblems,
  digestiveDoctorName: data.digestiveDoctorName,
  physicalActivity: data.physicalActivity,
  isSmoker: data.isSmoker,
  isDeceased: data.isDeceased,
  contraception: data.contraception as Contraception,
  hdlm: data.hdlm,
  avatarUrl: data.avatarUrl,
  cabinetId: data.cabinetId,
  userId: data.userId || null,
  osteopathId: data.osteopathId || 1, // Default value to match Patient type
});

export const patientService = {
  async getAuthSession() {
    return await supabase.auth.getSession();
  },
  
  async getPatients(): Promise<Patient[]> {
    try {
      const osteopathId = await getCurrentOsteopathId();
      
      // Si osteopathId est null, l'utilisateur n'est pas associé à un ostéopathe
      if (!osteopathId) {
        console.log("Utilisateur non associé à un ostéopathe, impossible de récupérer les patients");
        throw new Error("Vous devez compléter votre profil ostéopathe avant d'accéder aux patients");
      }

      console.log(`Récupération des patients pour l'ostéopathe ${osteopathId}`);
      const { data, error } = await supabase
        .from('Patient')
        .select('*')
        .eq('osteopathId', osteopathId)
        .order('lastName', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des patients:', error);
        throw error;
      }

      console.log(`${data?.length || 0} patients trouvés`);
      return data?.map(adaptPatientFromSupabase) || [];
    } catch (err) {
      console.error("Erreur critique dans getPatients:", err);
      throw err; // Propager l'erreur pour la gérer dans l'UI
    }
  },

  async getPatientById(id: number): Promise<Patient | null> {
    try {
      console.log(`Récupération directe du patient ID ${id}`);
      
      // Récupérer l'ID ostéopathe associé à l'utilisateur authentifié
      const osteopathId = await getCurrentOsteopathId();
      if (!osteopathId) {
        console.error("Utilisateur non associé à un ostéopathe");
        throw new Error("Vous devez compléter votre profil ostéopathe avant d'accéder aux patients");
      }
      
      // Récupération du patient avec vérification du propriétaire
      const { data, error } = await supabase
        .from('Patient')
        .select('*')
        .eq('id', id)
        .eq('osteopathId', osteopathId)
        .single();

      if (error) {
        console.error(`Error fetching patient with id ${id}:`, error);
        throw error;
      }

      console.log(`Patient ID ${id} trouvé:`, data);
      return adaptPatientFromSupabase(data);
    } catch (err) {
      console.error(`Erreur lors de la récupération du patient ID ${id}:`, err);
      throw err;
    }
  },

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    // Récupérer l'ID ostéopathe actuel
    const osteopathId = await getCurrentOsteopathId();
    if (!osteopathId) {
      console.error("Utilisateur non associé à un ostéopathe");
      throw new Error("Vous devez compléter votre profil ostéopathe avant de créer des patients");
    }
    
    // Add current timestamps
    const now = new Date().toISOString();
    
    // Ensure contraception value is in the format expected by Supabase
    let contraceptionValue = patient.contraception;
    if (contraceptionValue && contraceptionValue.toString() === "IMPLANT") {
      contraceptionValue = "IMPLANTS" as Contraception;
    }
    
    // Handle gender type mismatch by converting if needed
    let genderValue = patient.gender;
    if (genderValue && genderValue.toString() === "Autre") {
      genderValue = "Homme" as Gender; // Default to "Homme" if "Autre" for Supabase compatibility
    }
    
    // Map the patient data to match the Supabase column names
    const patientData = {
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
      gender: genderValue,
      maritalStatus: patient.maritalStatus,
      occupation: patient.occupation,
      hasChildren: patient.hasChildren,
      childrenAges: patient.childrenAges,
      birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString() : null,
      generalPractitioner: patient.generalPractitioner,
      surgicalHistory: patient.surgicalHistory,
      traumaHistory: patient.traumaHistory,
      rheumatologicalHistory: patient.rheumatologicalHistory,
      currentTreatment: patient.currentTreatment,
      handedness: patient.handedness,
      hasVisionCorrection: patient.hasVisionCorrection,
      ophtalmologistName: patient.ophtalmologistName,
      entProblems: patient.entProblems,
      entDoctorName: patient.entDoctorName,
      digestiveProblems: patient.digestiveProblems,
      digestiveDoctorName: patient.digestiveDoctorName,
      physicalActivity: patient.physicalActivity,
      isSmoker: patient.isSmoker,
      isDeceased: patient.isDeceased,
      contraception: contraceptionValue,
      hdlm: patient.hdlm,
      avatarUrl: patient.avatarUrl,
      cabinetId: patient.cabinetId,
      userId: patient.userId || null,
      osteopathId: osteopathId, // Utiliser l'ID ostéopathe récupéré
      updatedAt: now,
      createdAt: now
    };

    try {
      // Utiliser le client standard d'abord (pour respecter les RLS)
      const { data, error } = await supabase
        .from('Patient')
        .insert(patientData)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du patient avec le client standard:', error);
        throw error;
      }

      return adaptPatientFromSupabase(data);
    } catch (standardError) {
      console.error('Erreur standard, tentative avec le client admin:', standardError);
      
      // Tentative avec le client admin en cas d'échec
      const { data, error } = await supabaseAdmin
        .from('Patient')
        .insert(patientData)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du patient avec le client admin:', error);
        throw error;
      }

      return adaptPatientFromSupabase(data);
    }
  },

  async updatePatient(patient: Patient): Promise<Patient> {
    // Vérifier que l'utilisateur est associé à un ostéopathe
    const osteopathId = await getCurrentOsteopathId();
    if (!osteopathId) {
      console.error("Utilisateur non associé à un ostéopathe");
      throw new Error("Vous devez compléter votre profil ostéopathe avant de modifier des patients");
    }
    
    // Use explicit ID for the update operation
    const id = patient.id;
    
    // Vérifier que le patient appartient à cet ostéopathe
    if (patient.osteopathId !== osteopathId) {
      console.error(`Tentative de mise à jour du patient ${id} qui appartient à l'ostéopathe ${patient.osteopathId} par l'ostéopathe ${osteopathId}`);
      throw new Error("Vous n'êtes pas autorisé à modifier ce patient");
    }
    
    // Add updatedAt timestamp
    const now = new Date().toISOString();
    
    // Convert contraception from IMPLANT to IMPLANTS if needed for Supabase
    let contraceptionValue = patient.contraception;
    if (contraceptionValue && contraceptionValue.toString() === "IMPLANT") {
      contraceptionValue = "IMPLANTS" as Contraception;
    }
    
    // Handle gender updates for compatibility with Supabase
    let genderValue = patient.gender;
    if (genderValue && genderValue.toString() === "Autre") {
      genderValue = "Homme" as Gender; // Default to "Homme" if "Autre" for Supabase compatibility
    }
    
    // Prepare the complete patient data for update
    const patientData = {
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
      gender: genderValue,
      maritalStatus: patient.maritalStatus,
      occupation: patient.occupation,
      hasChildren: patient.hasChildren,
      childrenAges: patient.childrenAges,
      birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString() : null,
      generalPractitioner: patient.generalPractitioner,
      surgicalHistory: patient.surgicalHistory,
      traumaHistory: patient.traumaHistory,
      rheumatologicalHistory: patient.rheumatologicalHistory,
      currentTreatment: patient.currentTreatment,
      handedness: patient.handedness,
      hasVisionCorrection: patient.hasVisionCorrection,
      ophtalmologistName: patient.ophtalmologistName,
      entProblems: patient.entProblems,
      entDoctorName: patient.entDoctorName,
      digestiveProblems: patient.digestiveProblems,
      digestiveDoctorName: patient.digestiveDoctorName,
      physicalActivity: patient.physicalActivity,
      isSmoker: patient.isSmoker,
      isDeceased: patient.isDeceased,
      contraception: contraceptionValue,
      hdlm: patient.hdlm,
      avatarUrl: patient.avatarUrl,
      cabinetId: patient.cabinetId,
      userId: patient.userId,
      osteopathId: osteopathId, // S'assurer que l'osteopathId est correctement défini
      updatedAt: now
    };

    try {
      // First attempt with standard client to respect RLS
      console.log("Updating patient with id:", id);
      const { data, error } = await supabase
        .from('Patient')
        .update(patientData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du patient avec client standard:', error);
        throw error;
      }

      return adaptPatientFromSupabase(data);
    } catch (standardError) {
      console.error('Tentative de mise à jour avec client admin:', standardError);
      
      // Using admin client as fallback
      const { data, error } = await supabaseAdmin
        .from('Patient')
        .update(patientData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du patient avec client admin:', error);
        throw error;
      }

      return adaptPatientFromSupabase(data);
    }
  },
  
  async deletePatient(id: number): Promise<{ error: any | null }> {
    try {
      console.log(`Deleting patient with ID ${id} from Supabase...`);
      
      // Get current osteopathId and verify ownership
      const osteopathId = await getCurrentOsteopathId();
      if (!osteopathId) {
        console.error("Utilisateur non associé à un ostéopathe");
        return { error: new Error("Vous devez compléter votre profil ostéopathe avant de supprimer des patients") };
      }
      
      // Vérifier que le patient appartient à cet ostéopathe
      try {
        // First attempt with standard client
        const { data: patient, error: checkError } = await supabase
          .from('Patient')
          .select('osteopathId')
          .eq('id', id)
          .eq('osteopathId', osteopathId)
          .single();
        
        if (checkError || !patient) {
          console.error(`Patient ${id} non trouvé ou non accessible:`, checkError);
          return { error: new Error("Patient non trouvé ou vous n'avez pas les droits pour le supprimer") };
        }
        
        // Delete with standard client
        const { error: deleteError } = await supabase
          .from('Patient')
          .delete()
          .eq('id', id);
          
        if (deleteError) {
          throw deleteError;
        }
        
      } catch (standardError) {
        console.error('Erreur standard, tentative avec client admin:', standardError);
        
        // Fallback to admin client
        const { data: adminPatient, error: adminCheckError } = await supabaseAdmin
          .from('Patient')
          .select('osteopathId')
          .eq('id', id)
          .single();
        
        if (adminCheckError || !adminPatient) {
          console.error(`Patient ${id} non trouvé:`, adminCheckError);
          return { error: new Error("Patient non trouvé") };
        }
        
        if (adminPatient.osteopathId !== osteopathId) {
          console.error(`Tentative de suppression du patient ${id} qui appartient à l'ostéopathe ${adminPatient.osteopathId} par l'ostéopathe ${osteopathId}`);
          return { error: new Error("Vous n'êtes pas autorisé à supprimer ce patient") };
        }
        
        const { error: adminDeleteError } = await supabaseAdmin
          .from('Patient')
          .delete()
          .eq('id', id);
          
        if (adminDeleteError) {
          console.error('Erreur lors de la suppression avec client admin:', adminDeleteError);
          return { error: adminDeleteError };
        }
      }
      
      console.log(`Successfully deleted patient ${id} from Supabase`);
      return { error: null };
    } catch (error) {
      console.error('Exception while deleting patient:', error);
      return { error };
    }
  }
};

// Export as default and named export
export default patientService;
// Also export for compatibility with previous code
export { patientService as supabasePatientService };

// Make this function available for direct import
export const updatePatient = async (patient: Patient): Promise<Patient> => {
  return patientService.updatePatient(patient);
};
