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
      if (!osteopathId) {
        console.error("Impossible de récupérer l'ID ostéopathe");
        return [];
      }

      console.log(`Récupération des patients pour l'ostéopathe ${osteopathId}`);
      const { data, error } = await supabase
        .from('Patient')
        .select('*')
        .eq('osteopathId', osteopathId)
        .order('lastName', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des patients:', error);
        return [];
      }

      console.log(`${data?.length || 0} patients trouvés`);
      return data?.map(adaptPatientFromSupabase) || [];
    } catch (err) {
      console.error("Erreur critique dans getPatients:", err);
      return [];
    }
  },

  async getPatientById(id: number): Promise<Patient | null> {
    try {
      console.log(`Récupération directe du patient ID ${id}`);
      
      // Récupérer l'ID ostéopathe associé à l'utilisateur authentifié
      const osteopathId = await getCurrentOsteopathId();
      
      // Essayons d'abord avec le client standard
      let result = await supabase
        .from('Patient')
        .select('*')
        .eq('id', id);
      
      // Si erreur ou pas de données, essayons avec le client admin
      if (result.error || !result.data || result.data.length === 0) {
        console.log(`Tentative avec client admin pour le patient ${id}...`);
        result = await supabaseAdmin
          .from('Patient')
          .select('*')
          .eq('id', id);
      }
      
      const { data, error } = result;

      if (error) {
        console.error(`Error fetching patient with id ${id}:`, error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.error(`Aucun patient trouvé avec l'ID ${id}`);
        return null;
      }

      // Vérifier que le patient appartient bien à l'ostéopathe connecté
      if (osteopathId && data[0].osteopathId !== osteopathId) {
        console.error(`Le patient ${id} n'appartient pas à l'ostéopathe ${osteopathId}`);
        return null;
      }

      console.log(`Patient ID ${id} trouvé:`, data[0]);
      return adaptPatientFromSupabase(data[0]);
    } catch (err) {
      console.error(`Erreur lors de la récupération du patient ID ${id}:`, err);
      throw err;
    }
  },

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    // Add current timestamps
    const now = new Date().toISOString();
    
    // Get current osteopathId or create a new one if needed
    const osteopathId = await getCurrentOsteopathId();
    if (!osteopathId) {
      console.error("Impossible de créer un patient sans ID ostéopathe");
      throw new Error("ID ostéopathe manquant");
    }
    
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
      updatedAt: now, // Add the updatedAt field
      createdAt: now  // Add the createdAt field
    };

    // Tenter avec client admin pour contourner les RLS
    const { data, error } = await supabaseAdmin
      .from('Patient')
      .insert(patientData)
      .select()
      .single();

    if (error) {
      console.error('Error creating patient:', error);
      throw error;
    }

    return adaptPatientFromSupabase(data);
  },

  async updatePatient(patient: Patient): Promise<Patient> {
    // Use explicit ID for the update operation
    const id = patient.id;
    
    // Get current osteopathId and verify ownership
    const osteopathId = await getCurrentOsteopathId();
    if (!osteopathId) {
      console.error("Impossible de mettre à jour un patient sans ID ostéopathe");
      throw new Error("ID ostéopathe manquant");
    }
    
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

    // Using admin client to bypass RLS
    console.log("Updating patient with id:", id);
    const { data, error } = await supabaseAdmin
      .from('Patient')
      .update(patientData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating patient:', error);
      throw error;
    }

    return adaptPatientFromSupabase(data);
  },
  
  async deletePatient(id: number): Promise<{ error: any | null }> {
    try {
      console.log(`Deleting patient with ID ${id} from Supabase...`);
      
      // Get current osteopathId and verify ownership
      const osteopathId = await getCurrentOsteopathId();
      if (!osteopathId) {
        console.error("Impossible de supprimer un patient sans ID ostéopathe");
        return { error: new Error("ID ostéopathe manquant") };
      }
      
      // Vérifier que le patient appartient à cet ostéopathe
      const { data: patient } = await supabaseAdmin
        .from('Patient')
        .select('osteopathId')
        .eq('id', id)
        .single();
      
      if (!patient) {
        console.error(`Patient ${id} non trouvé`);
        return { error: new Error("Patient non trouvé") };
      }
      
      if (patient.osteopathId !== osteopathId) {
        console.error(`Tentative de suppression du patient ${id} qui appartient à l'ostéopathe ${patient.osteopathId} par l'ostéopathe ${osteopathId}`);
        return { error: new Error("Vous n'êtes pas autorisé à supprimer ce patient") };
      }
      
      // Using admin client to bypass RLS
      const { error } = await supabaseAdmin
        .from('Patient')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting patient:', error);
        return { error };
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
