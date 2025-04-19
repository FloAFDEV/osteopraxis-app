
import { Patient, Gender, Contraception, MaritalStatus, Handedness } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { delay, USE_SUPABASE } from "./config";

// Sample data for development
const patients: Patient[] = [];

export const patientService = {
  async getPatients(): Promise<Patient[]> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Patient')
          .select('*');
          
        if (error) throw error;
        
        // Map Supabase DB values to our application types
        const mappedData = data.map(patient => ({
          ...patient,
          gender: mapDbGenderToAppGender(patient.gender),
          contraception: mapDbContraceptionToAppContraception(patient.contraception),
          maritalStatus: mapDbMaritalStatusToAppMaritalStatus(patient.maritalStatus),
          handedness: mapDbHandednessToAppHandedness(patient.handedness),
          childrenAges: patient.childrenAges as unknown as string[]
        }));
        
        return mappedData as Patient[];
      } catch (error) {
        console.error("Error fetching patients:", error);
        throw error;
      }
    }
    
    await delay(300);
    return [...patients];
  },
  
  async getPatientById(id: number): Promise<Patient | null> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Patient')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }
        
        // Map DB values to our application types
        const mappedData = {
          ...data,
          gender: mapDbGenderToAppGender(data.gender),
          contraception: mapDbContraceptionToAppContraception(data.contraception),
          maritalStatus: mapDbMaritalStatusToAppMaritalStatus(data.maritalStatus),
          handedness: mapDbHandednessToAppHandedness(data.handedness),
          childrenAges: data.childrenAges as unknown as string[]
        };
        
        return mappedData as Patient;
      } catch (error) {
        console.error("Error fetching patient by ID:", error);
        throw error;
      }
    }
    
    await delay(200);
    return patients.find(patient => patient.id === id) || null;
  },
  
  async createPatient(patient: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<Patient> {
    if (USE_SUPABASE) {
      try {
        const now = new Date().toISOString();
        
        // Map application values to DB values
        const patientPayload = {
          ...patient,
          gender: mapAppGenderToDbGender(patient.gender),
          contraception: mapAppContraceptionToDbContraception(patient.contraception),
          maritalStatus: mapAppMaritalStatusToDbMaritalStatus(patient.maritalStatus),
          handedness: mapAppHandednessToDbHandedness(patient.handedness),
          childrenAges: patient.childrenAges as unknown as number[],
          createdAt: now,
          updatedAt: now
        };
        
        const { data, error } = await supabase
          .from('Patient')
          .insert(patientPayload)
          .select()
          .single();
          
        if (error) throw error;
        
        // Map DB values back to our application types
        const mappedData = {
          ...data,
          gender: mapDbGenderToAppGender(data.gender),
          contraception: mapDbContraceptionToAppContraception(data.contraception),
          maritalStatus: mapDbMaritalStatusToAppMaritalStatus(data.maritalStatus),
          handedness: mapDbHandednessToAppHandedness(data.handedness),
          childrenAges: data.childrenAges as unknown as string[]
        };
        
        return mappedData as Patient;
      } catch (error) {
        console.error("Error creating patient:", error);
        throw error;
      }
    }
    
    await delay(400);
    const now = new Date().toISOString();
    const newPatient = {
      ...patient,
      id: patients.length + 1,
      createdAt: now,
      updatedAt: now,
    } as Patient;
    
    patients.push(newPatient);
    return newPatient;
  },
  
  async updatePatient(patient: Patient): Promise<Patient> {
    if (USE_SUPABASE) {
      try {
        // Map application values to DB values
        const patientPayload = {
          ...patient,
          gender: mapAppGenderToDbGender(patient.gender),
          contraception: mapAppContraceptionToDbContraception(patient.contraception),
          maritalStatus: mapAppMaritalStatusToDbMaritalStatus(patient.maritalStatus),
          handedness: mapAppHandednessToDbHandedness(patient.handedness),
          childrenAges: patient.childrenAges as unknown as number[],
          updatedAt: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('Patient')
          .update(patientPayload)
          .eq('id', patient.id)
          .select()
          .single();
          
        if (error) throw error;
        
        // Map DB values back to our application types
        const mappedData = {
          ...data,
          gender: mapDbGenderToAppGender(data.gender),
          contraception: mapDbContraceptionToAppContraception(data.contraception),
          maritalStatus: mapDbMaritalStatusToAppMaritalStatus(data.maritalStatus),
          handedness: mapDbHandednessToAppHandedness(data.handedness),
          childrenAges: data.childrenAges as unknown as string[]
        };
        
        return mappedData as Patient;
      } catch (error) {
        console.error("Error updating patient:", error);
        throw error;
      }
    }
    
    await delay(300);
    const index = patients.findIndex(p => p.id === patient.id);
    
    if (index === -1) {
      throw new Error(`Patient with ID ${patient.id} not found.`);
    }
    
    patients[index] = {
      ...patient,
      updatedAt: new Date().toISOString(),
    };
    
    return patients[index];
  },
  
  async deletePatient(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        const { error } = await supabase
          .from('Patient')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        return true;
      } catch (error) {
        console.error("Error deleting patient:", error);
        throw error;
      }
    }
    
    await delay(300);
    const index = patients.findIndex(p => p.id === id);
    
    if (index !== -1) {
      patients.splice(index, 1);
      return true;
    }
    
    return false;
  },
  
  async getPatientsByLetter(letter: string): Promise<Patient[]> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Patient')
          .select('*')
          .ilike('lastName', `${letter}%`);
          
        if (error) throw error;
        
        // Map DB values to our application types
        const mappedData = data.map(patient => ({
          ...patient,
          gender: mapDbGenderToAppGender(patient.gender),
          contraception: mapDbContraceptionToAppContraception(patient.contraception),
          maritalStatus: mapDbMaritalStatusToAppMaritalStatus(patient.maritalStatus),
          handedness: mapDbHandednessToAppHandedness(patient.handedness),
          childrenAges: patient.childrenAges as unknown as string[]
        }));
        
        return mappedData as Patient[];
      } catch (error) {
        console.error("Error fetching patients by letter:", error);
        throw error;
      }
    }
    
    await delay(300);
    return patients.filter(p => p.lastName.toLowerCase().startsWith(letter.toLowerCase()));
  },
  
  async searchPatients(query: string): Promise<Patient[]> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Patient')
          .select('*')
          .or(`firstName.ilike.%${query}%,lastName.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`);
          
        if (error) throw error;
        
        // Map DB values to our application types
        const mappedData = data.map(patient => ({
          ...patient,
          gender: mapDbGenderToAppGender(patient.gender),
          contraception: mapDbContraceptionToAppContraception(patient.contraception),
          maritalStatus: mapDbMaritalStatusToAppMaritalStatus(patient.maritalStatus),
          handedness: mapDbHandednessToAppHandedness(patient.handedness),
          childrenAges: patient.childrenAges as unknown as string[]
        }));
        
        return mappedData as Patient[];
      } catch (error) {
        console.error("Error searching patients:", error);
        throw error;
      }
    }
    
    await delay(300);
    const lowerQuery = query.toLowerCase();
    return patients.filter(
      p => 
        p.firstName?.toLowerCase().includes(lowerQuery) || 
        p.lastName?.toLowerCase().includes(lowerQuery) || 
        p.email?.toLowerCase().includes(lowerQuery) || 
        p.phone?.includes(query)
    );
  }
};

// Helper functions to map between Supabase DB values and our application types
function mapDbGenderToAppGender(dbGender: any): Gender {
  if (dbGender === "Homme") return "MALE";
  if (dbGender === "Femme") return "FEMALE";
  return null;
}

function mapAppGenderToDbGender(appGender: Gender | undefined): string | null {
  if (appGender === "MALE") return "Homme";
  if (appGender === "FEMALE") return "Femme";
  return null;
}

function mapDbContraceptionToAppContraception(dbContraception: any): Contraception {
  switch (dbContraception) {
    case "PILLS": return "PILL";
    case "CONDOM": return "CONDOM";
    case "IMPLANTS": return "IMPLANT";
    case "IUD": return "IUD";
    case "NONE": return "NONE";
    default: return null;
  }
}

function mapAppContraceptionToDbContraception(appContraception: Contraception | undefined): string | null {
  switch (appContraception) {
    case "PILL": return "PILLS";
    case "CONDOM": return "CONDOM";
    case "IMPLANT": return "IMPLANTS";
    case "IUD": return "IUD";
    case "NONE": return "NONE";
    case "OTHER": return "OTHER";
    default: return null;
  }
}

function mapDbMaritalStatusToAppMaritalStatus(dbMaritalStatus: any): MaritalStatus {
  switch (dbMaritalStatus) {
    case "SINGLE": return "SINGLE";
    case "MARRIED": return "MARRIED";
    case "DIVORCED": return "DIVORCED";
    case "WIDOWED": return "WIDOWED";
    default: return null;
  }
}

function mapAppMaritalStatusToDbMaritalStatus(appMaritalStatus: MaritalStatus | undefined): string | null {
  switch (appMaritalStatus) {
    case "SINGLE": return "SINGLE";
    case "MARRIED": return "MARRIED";
    case "DIVORCED": return "DIVORCED";
    case "WIDOWED": return "WIDOWED";
    case "OTHER": return "OTHER";
    default: return null;
  }
}

function mapDbHandednessToAppHandedness(dbHandedness: any): Handedness {
  switch (dbHandedness) {
    case "LEFT": return "LEFT";
    case "RIGHT": return "RIGHT";
    case "AMBIDEXTROUS": return "AMBIDEXTROUS";
    default: return null;
  }
}

function mapAppHandednessToDbHandedness(appHandedness: Handedness | undefined): string | null {
  switch (appHandedness) {
    case "LEFT": return "LEFT";
    case "RIGHT": return "RIGHT";
    case "AMBIDEXTROUS": return "AMBIDEXTROUS";
    default: return null;
  }
}
