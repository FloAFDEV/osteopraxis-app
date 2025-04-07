import { Patient, Gender, MaritalStatus, Handedness, Contraception } from "@/types";
import { supabase } from "./utils";

const adaptPatientFromSupabase = (data: any): Patient => ({
  id: data.id,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
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
  cabinetId: data.cabinetId
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
    const { data, error } = await supabase
      .from('Patient')
      .insert({
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
        contraception: patient.contraception,
        hdlm: patient.hdlm,
        avatarUrl: patient.avatarUrl,
        cabinetId: patient.cabinetId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating patient:', error);
      throw error;
    }

    return adaptPatientFromSupabase(data);
  },
};

export const updatePatient = async (patient: Patient): Promise<Patient> => {
  const { data, error } = await supabase
    .from('Patient')
    .update({
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
      contraception: patient.contraception === "IMPLANTS" ? "IMPLANT" : patient.contraception,
      hdlm: patient.hdlm,
      avatarUrl: patient.avatarUrl,
      cabinetId: patient.cabinetId,
      updatedAt: new Date().toISOString()
    })
    .eq('id', patient.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating patient:', error);
    throw error;
  }

  return adaptPatientFromSupabase(data);
};
