
import { Patient, Gender, MaritalStatus, Handedness, Contraception } from "@/types";
import { supabase } from "./utils";

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
      console.log("=== Début getPatients ===");
      
      // Vérification de la session d'authentification
      const { data: session } = await supabase.auth.getSession();
      console.log("État de la session:", session?.session ? "Active" : "Inactive");
      
      if (!session?.session) {
        console.error("Pas de session Supabase active");
        return [];
      }
      
      console.log("ID Utilisateur:", session.session.user.id);
      
      // Vérification du rôle et de l'ostéopathe associé
      // Utilisation de maybeSingle() au lieu de single() pour éviter l'erreur 406
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('role, osteopathId')
        .eq('id', session.session.user.id)
        .maybeSingle();
      
      if (userError) {
        console.error("Erreur lors de la récupération des données utilisateur:", userError);
      } else if (userData) {
        console.log("Rôle utilisateur:", userData.role);
        console.log("ID Ostéopathe associé:", userData.osteopathId);
      } else {
        // Si l'utilisateur est authentifié mais son profil n'est pas dans la table User,
        // afficher un message informatif mais ne pas essayer de créer automatiquement
        console.warn("Utilisateur authentifié mais non trouvé dans la table User");
        console.log("Redirection vers la configuration du profil nécessaire");
        
        // IMPORTANT: Nous allons quand même récupérer TOUS les patients si l'utilisateur n'a pas de profil
        // Cela permet de voir les données pendant la phase de développement/test
        console.log("Mode développement: Récupération de tous les patients sans filtrage");
        
        // Récupérer tous les patients sans filtrage en mode développement
        const { data, error } = await supabase.from('Patient').select('*');
        
        if (error) {
          console.error('Erreur lors de la récupération des patients:', error);
          throw error;
        }

        console.log(`${data?.length || 0} patients récupérés sans filtrage`);
        if (data && data.length > 0) {
          console.log('Premier patient:', data[0]);
        }
        
        console.log("=== Fin getPatients ===");
        return data?.map(adaptPatientFromSupabase) || [];
      }
      
      // Récupération des patients - Utiliser l'ID de l'ostéopathe de l'utilisateur si disponible
      let query = supabase.from('Patient').select('*');
      
      if (userData?.osteopathId) {
        console.log(`Filtrage des patients pour l'ostéopathe ID: ${userData.osteopathId}`);
        query = query.eq('osteopathId', userData.osteopathId);
      } else if (userData?.role === 'ADMIN') {
        // Si c'est un admin, ne pas filtrer par ostéopathe
        console.log("Utilisateur ADMIN: récupération de tous les patients");
      } else {
        // Modification: récupérer tous les patients si l'utilisateur n'a pas d'ID d'ostéopathe
        // mais n'est pas admin, pour faciliter le développement/test
        console.log("Utilisateur sans ID d'ostéopathe - mode développement: récupération de tous les patients");
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors de la récupération des patients:', error);
        throw error;
      }

      console.log(`${data?.length || 0} patients récupérés`);
      if (data && data.length > 0) {
        console.log('Premier patient:', data[0]);
      }
      
      console.log("=== Fin getPatients ===");
      return data?.map(adaptPatientFromSupabase) || [];
      
    } catch (err) {
      console.error("Erreur dans getPatients:", err);
      throw err;
    }
  },

  async getPatientById(id: number): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('Patient')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching patient with id ${id}:`, error);
      throw error;
    }

    return adaptPatientFromSupabase(data);
  },

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
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
      osteopathId: patient.osteopathId || 1, // Using default if not provided
      updatedAt: now, // Add the updatedAt field
      createdAt: now  // Add the createdAt field
    };

    const { data, error } = await supabase
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
      osteopathId: patient.osteopathId,
      updatedAt: now
    };

    // Using POST method instead of PATCH for better CORS compatibility
    console.log("Updating patient with id:", id);
    const { data, error } = await supabase
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
      
      const { error } = await supabase
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
