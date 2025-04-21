import { Patient } from "@/types";
import { supabase } from "./utils";
import { adaptPatientFromSupabase } from "./patient-adapter";
import { Contraception, Gender } from "@/types";

export async function getPatients(): Promise<Patient[]> {
  const { data, error } = await supabase.from('Patient').select('*');
  if (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
  return data.map(adaptPatientFromSupabase);
}

export async function getPatientById(id: number): Promise<Patient | null> {
  const { data, error } = await supabase
    .from('Patient')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error(`Error fetching patient with id ${id}:`, error);
    throw error;
  }
  
  return data ? adaptPatientFromSupabase(data) : null;
}

export async function createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
  try {
    const now = new Date().toISOString();
    let contraceptionValue = patient.contraception;
    if (contraceptionValue && contraceptionValue.toString() === "IMPLANT") {
      contraceptionValue = "IMPLANTS" as Contraception;
    }
    let genderValue = patient.gender;
    if (genderValue && genderValue.toString() === "Autre") {
      genderValue = "Homme" as Gender;
    }
    const hasChildrenValue = typeof patient.hasChildren === 'boolean'
      ? patient.hasChildren ? "true" : "false"
      : patient.hasChildren;
    
    // Prepare data without id for insert operation
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
      osteopathId: patient.osteopathId || 1,
      createdAt: now,
      updatedAt: now
    };
    
    // If patient has email, check if it already exists and use upsert if needed
    if (patient.email) {
      const { data: existingPatient } = await supabase
        .from('Patient')
        .select('id')
        .eq('email', patient.email)
        .maybeSingle();
      
      if (existingPatient) {
        console.log('Patient with this email already exists, updating instead:', patient.email);
        const { data, error } = await supabase
          .from('Patient')
          .upsert({ ...patientData, id: existingPatient.id })
          .select();
          
        if (error) {
          console.error('Error upserting patient:', error);
          throw error;
        }
        return adaptPatientFromSupabase(data[0]);
      }
    }
    
    // Otherwise do a regular insert
    const { data, error } = await supabase
      .from('Patient')
      .insert(patientData)
      .select();
      
    if (error) {
      console.error('Error creating patient:', error);
      if (error.message.includes('duplicate key')) {
        console.error('Duplicate key error, this might be a sequence issue');
      }
      throw error;
    }
    
    return adaptPatientFromSupabase(data[0]);
  } catch (error) {
    console.error('Error in createPatient:', error);
    throw error;
  }
}

export async function updatePatient(patient: Patient): Promise<Patient> {
  try {
    const id = patient.id;
    const now = new Date().toISOString();
    let contraceptionValue = patient.contraception;
    if (contraceptionValue && contraceptionValue.toString() === "IMPLANT") {
      contraceptionValue = "IMPLANTS" as Contraception;
    }
    let genderValue = patient.gender;
    if (genderValue && genderValue.toString() === "Autre") {
      genderValue = "Homme" as Gender;
    }
    const hasChildrenValue = typeof patient.hasChildren === 'boolean'
      ? patient.hasChildren ? "true" : "false"
      : patient.hasChildren;
    
    // Prepare data for update
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
    
    // Using upsert with onConflict to handle possible conflicts
    const { data, error } = await supabase
      .from('Patient')
      .upsert(patientData, { 
        onConflict: 'id',  // Specify which column to use for conflict resolution
        ignoreDuplicates: false // Update if there's a conflict
      })
      .select();
      
    if (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
    
    return adaptPatientFromSupabase(data[0]);
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
}

export async function deletePatient(id: number): Promise<{ error: any | null }> {
  try {
    const { error } = await supabase
      .from('Patient')
      .delete()
      .eq('id', id);
      
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
