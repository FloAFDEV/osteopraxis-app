
import { Patient } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";

export async function getPatients(): Promise<Patient[]> {
  try {
    console.log("Fetching patients from Supabase");
    const { data, error } = await supabase.from("Patient").select("*");
    
    if (error) {
      console.error("Error fetching patients:", error);
      throw error;
    }
    
    const patients = data.map(adaptPatientFromSupabase);
    console.log(`Retrieved ${patients.length} patients from database`);
    
    // Log patients with birth dates to debug
    const patientsWithBirthDates = patients.filter(p => p.birthDate);
    console.log(`Patients with birth dates: ${patientsWithBirthDates.length}`);
    
    // Calculate children count using precise age calculation
    const childrenPatients = patients.filter(p => {
      if (!p.birthDate) return false;
      
      const birthDate = new Date(p.birthDate);
      const today = new Date();
      
      // Calculate age more precisely
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Adjust age if birthday hasn't occurred this year yet
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age < 12;
    });
    
    // Log detailed information about children for debugging
    console.log(`Found ${childrenPatients.length} children under 12 years old`);
    childrenPatients.forEach(child => {
      if (child.birthDate) {
        const birthDate = new Date(child.birthDate);
        console.log(`Child: ${child.firstName} ${child.lastName}, Birth date: ${child.birthDate}`);
      }
    });

    // Additional logging for gender distribution
    const maleCount = patients.filter(p => p.gender === "Homme").length;
    const femaleCount = patients.filter(p => p.gender === "Femme").length;
    const unknownGenderCount = patients.length - maleCount - femaleCount;
    
    console.log(`Gender distribution - Males: ${maleCount}, Females: ${femaleCount}, Unknown: ${unknownGenderCount}`);
    
    return patients;
  } catch (error) {
    console.error("Error in getPatients:", error);
    throw error;
  }
}
