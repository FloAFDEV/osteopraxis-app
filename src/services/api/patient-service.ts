
import { Patient } from "@/types";
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
        return data as Patient[];
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
        
        return data as Patient;
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
        
        const { data, error } = await supabase
          .from('Patient')
          .insert({
            ...patient,
            createdAt: now,
            updatedAt: now
          })
          .select()
          .single();
          
        if (error) throw error;
        return data as Patient;
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
        const { data, error } = await supabase
          .from('Patient')
          .update({
            ...patient,
            updatedAt: new Date().toISOString()
          })
          .eq('id', patient.id)
          .select()
          .single();
          
        if (error) throw error;
        return data as Patient;
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
  
  // Add the missing getPatientsByLetter function
  async getPatientsByLetter(letter: string): Promise<Patient[]> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Patient')
          .select('*')
          .ilike('lastName', `${letter}%`);
          
        if (error) throw error;
        return data as Patient[];
      } catch (error) {
        console.error("Error fetching patients by letter:", error);
        throw error;
      }
    }
    
    await delay(300);
    return patients.filter(p => p.lastName.toLowerCase().startsWith(letter.toLowerCase()));
  },
  
  // Add the missing searchPatients function
  async searchPatients(query: string): Promise<Patient[]> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('Patient')
          .select('*')
          .or(`firstName.ilike.%${query}%,lastName.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`);
          
        if (error) throw error;
        return data as Patient[];
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
