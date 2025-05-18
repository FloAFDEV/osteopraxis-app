
import { Patient } from "@/types";
import { supabase } from "../utils";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";

export async function createPatient(
  patientData: Omit<Patient, "id" | "createdAt" | "updatedAt">
): Promise<Patient> {
  try {
    // S'assurer que l'osteopathId est associé au patient
    if (!patientData.osteopathId) {
      const currentOsteopathId = await getCurrentOsteopathId();
      patientData.osteopathId = currentOsteopathId;
      console.log(`Association automatique de l'osteopathId ${currentOsteopathId} au patient`);
    } else {
      // Vérifier que l'osteopathId fourni correspond à celui de l'utilisateur
      const currentOsteopathId = await getCurrentOsteopathId();
      if (patientData.osteopathId !== currentOsteopathId) {
        console.error("Tentative de créer un patient pour un autre ostéopathe");
        throw new Error("Vous ne pouvez pas créer un patient pour un autre ostéopathe");
      }
    }

    const { data, error } = await supabase
      .from("Patient")
      .insert(patientData)
      .select()
      .single();

    if (error) {
      console.error("Error creating patient:", error);
      throw error;
    }

    return data as Patient;
  } catch (error) {
    console.error("Error in createPatient:", error);
    throw error;
  }
}
