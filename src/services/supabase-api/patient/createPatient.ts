
import { Patient } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";

export async function createPatient(
	patientData: Omit<Patient, "id" | "createdAt" | "updatedAt">
): Promise<Patient> {
	try {
		// Récupérer l'ID de l'ostéopathe connecté
		const osteopathId = await getCurrentOsteopathId();
		console.log("Creating patient for osteopathId:", osteopathId);

		// S'assurer que le patient est associé à l'ostéopathe connecté
		const patientWithOsteopath = {
			...patientData,
			osteopathId,
		};

		// Enlever les champs non supportés ou les convertir en types corrects
		const formattedData = {
			...patientWithOsteopath,
			// Convertir tout type spécifique en chaîne si nécessaire
			contraception: String(patientWithOsteopath.contraception || ""),
			gender: String(patientWithOsteopath.gender || ""),
			handedness: String(patientWithOsteopath.handedness || ""),
			maritalStatus: String(patientWithOsteopath.maritalStatus || ""),
		};

		const { data, error } = await supabase
			.from("Patient")
			.insert(formattedData)
			.select()
			.single();

		if (error) {
			console.error("[SUPABASE ERROR]", error.code, error.message);
			throw error;
		}

		return adaptPatientFromSupabase(data);
	} catch (error) {
		console.error("Erreur createPatient:", error);
		throw error;
	}
}
