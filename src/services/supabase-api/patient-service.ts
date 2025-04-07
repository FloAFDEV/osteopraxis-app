
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
    // Add current timestamps
    const now = new Date().toISOString();
    
    // Map the patient data to match the Supabase column names
    const patientData = {
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
      gender: patient.gender,
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
      // If contraception is IMPLANT in our code, convert it to IMPLANTS for Supabase
      contraception: patient.contraception,
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

  async updatePatient(id: number, patientUpdates: Partial<Patient>): Promise<Patient> {
    // Add updatedAt timestamp
    const now = new Date().toISOString();
    
    // Map the update data to match Supabase column names
    const updateData = {
      ...(patientUpdates.firstName !== undefined && { firstName: patientUpdates.firstName }),
      ...(patientUpdates.lastName !== undefined && { lastName: patientUpdates.lastName }),
      ...(patientUpdates.email !== undefined && { email: patientUpdates.email }),
      ...(patientUpdates.phone !== undefined && { phone: patientUpdates.phone }),
      ...(patientUpdates.address !== undefined && { address: patientUpdates.address }),
      ...(patientUpdates.gender !== undefined && { gender: patientUpdates.gender }),
      ...(patientUpdates.maritalStatus !== undefined && { maritalStatus: patientUpdates.maritalStatus }),
      ...(patientUpdates.occupation !== undefined && { occupation: patientUpdates.occupation }),
      ...(patientUpdates.hasChildren !== undefined && { hasChildren: patientUpdates.hasChildren }),
      ...(patientUpdates.childrenAges !== undefined && { childrenAges: patientUpdates.childrenAges }),
      ...(patientUpdates.birthDate !== undefined && { birthDate: patientUpdates.birthDate ? new Date(patientUpdates.birthDate).toISOString() : null }),
      ...(patientUpdates.generalPractitioner !== undefined && { generalPractitioner: patientUpdates.generalPractitioner }),
      ...(patientUpdates.surgicalHistory !== undefined && { surgicalHistory: patientUpdates.surgicalHistory }),
      ...(patientUpdates.traumaHistory !== undefined && { traumaHistory: patientUpdates.traumaHistory }),
      ...(patientUpdates.rheumatologicalHistory !== undefined && { rheumatologicalHistory: patientUpdates.rheumatologicalHistory }),
      ...(patientUpdates.currentTreatment !== undefined && { currentTreatment: patientUpdates.currentTreatment }),
      ...(patientUpdates.handedness !== undefined && { handedness: patientUpdates.handedness }),
      ...(patientUpdates.hasVisionCorrection !== undefined && { hasVisionCorrection: patientUpdates.hasVisionCorrection }),
      ...(patientUpdates.ophtalmologistName !== undefined && { ophtalmologistName: patientUpdates.ophtalmologistName }),
      ...(patientUpdates.entProblems !== undefined && { entProblems: patientUpdates.entProblems }),
      ...(patientUpdates.entDoctorName !== undefined && { entDoctorName: patientUpdates.entDoctorName }),
      ...(patientUpdates.digestiveProblems !== undefined && { digestiveProblems: patientUpdates.digestiveProblems }),
      ...(patientUpdates.digestiveDoctorName !== undefined && { digestiveDoctorName: patientUpdates.digestiveDoctorName }),
      ...(patientUpdates.physicalActivity !== undefined && { physicalActivity: patientUpdates.physicalActivity }),
      ...(patientUpdates.isSmoker !== undefined && { isSmoker: patientUpdates.isSmoker }),
      ...(patientUpdates.isDeceased !== undefined && { isDeceased: patientUpdates.isDeceased }),
      ...(patientUpdates.contraception !== undefined && { contraception: patientUpdates.contraception }),
      ...(patientUpdates.hdlm !== undefined && { hdlm: patientUpdates.hdlm }),
      ...(patientUpdates.avatarUrl !== undefined && { avatarUrl: patientUpdates.avatarUrl }),
      ...(patientUpdates.cabinetId !== undefined && { cabinetId: patientUpdates.cabinetId }),
      updatedAt: now
    };

    const { data, error } = await supabase
      .from('Patient')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating patient:', error);
      throw error;
    }

    return adaptPatientFromSupabase(data);
  }
};

// Make this function available for direct import
export const updatePatient = async (patient: Patient): Promise<Patient> => {
  return patientService.updatePatient(patient.id, patient);
};

// Export as supabasePatientService to be used in the API service
export { patientService as supabasePatientService };
