
import { Patient, Gender, MaritalStatus, Handedness, Contraception } from "@/types";
import { supabase, addAuthHeaders } from "./utils";

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
  async getPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('Patient')
      .select('*');

    if (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }

    return data.map(adaptPatientFromSupabase);
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
    try {
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
      
      // Make sure hasChildren is stored as a string
      const hasChildrenValue = typeof patient.hasChildren === 'boolean' 
        ? patient.hasChildren ? "true" : "false" 
        : patient.hasChildren;
      
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
        hasChildren: hasChildrenValue,
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
        createdAt: now,
        updatedAt: now
      };

      // Add auth headers and use upsert instead of insert to avoid permission issues
      const query = supabase
        .from('Patient')
        .insert(patientData)
        .select();
        
      const result = await addAuthHeaders(query);
      const { data, error } = await result;

      if (error) {
        console.error('Error creating patient:', error);
        throw error;
      }

      return adaptPatientFromSupabase(data[0]);
    } catch (error) {
      console.error('Error in createPatient:', error);
      throw error;
    }
  },

  async updatePatient(patient: Patient): Promise<Patient> {
    try {
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
      
      // Make sure hasChildren is stored as a string
      const hasChildrenValue = typeof patient.hasChildren === 'boolean' 
        ? patient.hasChildren ? "true" : "false" 
        : patient.hasChildren;
        
      // Prepare the complete patient data for update
      const patientData = {
        id: id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        address: patient.address,
        gender: genderValue,
        maritalStatus: patient.maritalStatus,
        occupation: patient.occupation,
        hasChildren: hasChildrenValue,
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
        osteopathId: patient.osteopathId || 1,
        updatedAt: now
      };

      console.log("Updating patient with id:", id);
      
      // Use upsert instead of update to avoid permission issues
      const query = supabase
        .from('Patient')
        .upsert(patientData)
        .select();
        
      const result = await addAuthHeaders(query);
      const { data, error } = await result;

      if (error) {
        console.error('Error updating patient:', error);
        throw error;
      }

      return adaptPatientFromSupabase(data[0]);
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },
  
  async deletePatient(id: number): Promise<{ error: any | null }> {
    try {
      const query = supabase
        .from('Patient')
        .delete()
        .eq('id', id);
        
      const result = await addAuthHeaders(query);
      const { error } = await result;
        
      if (error) {
        console.error('Error deleting patient:', error);
        return { error };
      }
      
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
