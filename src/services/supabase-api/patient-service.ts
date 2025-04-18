
import { Patient, Gender, MaritalStatus, Handedness, Contraception } from "@/types";
import { supabase } from "./utils";
import { checkAuth } from "./utils";

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
    try {
      // Check authentication before proceeding
      const session = await checkAuth();
      console.log("Fetching patients with authenticated user:", session.user.id);
      
      // Check if the user is an admin first
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('role, osteopathId')
        .eq('id', session.user.id)
        .maybeSingle();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user role:', userError);
        throw userError;
      }

      // If the user is an admin, return all patients
      if (userData && userData.role === 'ADMIN') {
        console.log("Admin user detected, fetching all patients");
        const { data, error } = await supabase
          .from('Patient')
          .select('*')
          .order('lastName', { ascending: true });

        if (error) {
          console.error('Error fetching patients as admin:', error);
          throw error;
        }

        console.log(`Successfully fetched ${data?.length || 0} patients as admin`);
        return (data || []).map(adaptPatientFromSupabase);
      }

      // If the user has directly an osteopathId in their profile, use that
      if (userData && userData.osteopathId) {
        console.log(`User has direct osteopathId: ${userData.osteopathId}, using it to fetch patients`);
        const { data, error } = await supabase
          .from('Patient')
          .select('*')
          .eq('osteopathId', userData.osteopathId)
          .order('lastName', { ascending: true });

        if (error) {
          console.error('Error fetching patients with user osteopathId:', error);
          throw error;
        }

        console.log(`Successfully fetched ${data?.length || 0} patients for user with osteopathId ${userData.osteopathId}`);
        return (data || []).map(adaptPatientFromSupabase);
      }

      // Try to get osteopath ID from the Osteopath table
      const { data: osteopathData, error: osteopathError } = await supabase
        .from('Osteopath')
        .select('id')
        .eq('userId', session.user.id)
        .maybeSingle();

      // If no osteopath found, use edge function to create one
      if (!osteopathData) {
        console.log('No osteopath found for this user, using edge function to create one...');
        
        try {
          // Get the current session for the access token
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData || !sessionData.session) {
            throw new Error("No active session");
          }
          
          console.log("Calling edge function completer-profil");
          const response = await fetch("https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/completer-profil", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${sessionData.session.access_token}`
            },
            body: JSON.stringify({
              osteopathData: {
                name: "Nouvel Ostéopathe",
                professional_title: "Ostéopathe D.O.",
                ape_code: "8690F"
              }
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Edge function error:", errorText);
            throw new Error(`Edge function error: ${errorText}`);
          }
          
          const result = await response.json();
          console.log("Edge function result:", result);
          
          if (result && result.osteopath && result.osteopath.id) {
            // Now try to fetch patients for this new osteopath
            const { data: patients, error: patientsError } = await supabase
              .from('Patient')
              .select('*')
              .eq('osteopathId', result.osteopath.id)
              .order('lastName', { ascending: true });
              
            if (patientsError) {
              console.error('Error fetching patients for new osteopath:', patientsError);
              throw patientsError;
            }
            
            // If no patients found, create a test patient
            if (!patients || patients.length === 0) {
              console.log('No patients found for new osteopath, creating a test patient');
              
              const testPatient = {
                firstName: "Patient",
                lastName: "Test",
                gender: "Homme" as Gender,
                osteopathId: result.osteopath.id,
                cabinetId: result.cabinet ? result.cabinet.id : null,
                isSmoker: false,
                isDeceased: false,
                hasVisionCorrection: false
              };
              
              // Try to create a test patient using the edge function
              try {
                const createPatientResponse = await fetch("https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/create-test-data", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionData.session.access_token}`
                  },
                  body: JSON.stringify({
                    type: "patient",
                    data: testPatient
                  })
                });
                
                if (!createPatientResponse.ok) {
                  const errorText = await createPatientResponse.text();
                  console.error("Error creating test patient:", errorText);
                  return [];
                }
                
                const createPatientResult = await createPatientResponse.json();
                if (createPatientResult && createPatientResult.patient) {
                  console.log('Created test patient:', createPatientResult.patient);
                  return [adaptPatientFromSupabase(createPatientResult.patient)];
                }
              } catch (createError) {
                console.error('Error creating test patient:', createError);
                return [];
              }
            }
            
            console.log(`Successfully fetched ${patients?.length || 0} patients for new osteopath`);
            return (patients || []).map(adaptPatientFromSupabase);
          }
          
          return [];
        } catch (edgeError) {
          console.error('Error using edge function:', edgeError);
          throw edgeError;
        }
      }

      if (osteopathError && osteopathError.code !== 'PGRST116') {
        console.error('Error fetching osteopath id:', osteopathError);
        throw osteopathError;
      }

      if (!osteopathData || !osteopathData.id) {
        console.log('No osteopath ID found, returning empty patients list');
        return [];
      }

      // Regular osteopath user - fetch only their patients
      console.log(`Fetching patients for osteopath ID ${osteopathData.id}`);
      const { data, error } = await supabase
        .from('Patient')
        .select('*')
        .eq('osteopathId', osteopathData.id)
        .order('lastName', { ascending: true });

      if (error) {
        console.error('Error fetching patients for osteopath:', error);
        throw error;
      }

      console.log(`Successfully fetched ${data?.length || 0} patients for osteopath ID ${osteopathData.id}`);
      return (data || []).map(adaptPatientFromSupabase);
    } catch (error) {
      console.error('Error in getPatients:', error);
      throw error;
    }
  },

  async getPatientById(id: number): Promise<Patient | null> {
    try {
      // Check authentication before proceeding
      await checkAuth();
      console.log(`Fetching patient with id ${id}`);
      
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
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  },

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    try {
      // Check authentication before proceeding
      const session = await checkAuth();
      console.log("Creating patient with authenticated user:", session.user.id);
      
      // Get the osteopath ID for the current user
      const { data: osteopathData, error: osteopathError } = await supabase
        .from('Osteopath')
        .select('id')
        .eq('userId', session.user.id)
        .maybeSingle();

      if (osteopathError && osteopathError.code !== 'PGRST116') {
        console.error('Error fetching osteopath id:', osteopathError);
        throw osteopathError;
      }

      const now = new Date().toISOString();
      
      // Prepare patient data with the current osteopath's ID or default if not found
      const patientData = {
        ...patient,
        osteopathId: osteopathData?.id || 1, // Use default if not found
        createdAt: now,
        updatedAt: now
      };

      // Insert the patient
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
    } catch (error) {
      console.error('Error in createPatient:', error);
      throw error;
    }
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
      osteopathId: patient.osteopathId || 1,
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
};

// Export as default and named export
export default patientService;
export { patientService as supabasePatientService };

// Make this function available for direct import
export const updatePatient = async (patient: Patient): Promise<Patient> => {
  return patientService.updatePatient(patient);
};
