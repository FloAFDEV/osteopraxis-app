
import { Patient } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";

export async function updatePatient(patient: Patient): Promise<Patient> {
	try {
		// Enlever les champs qui ne doivent pas être mis à jour
		const { id, createdAt, ...updateData } = patient;

		// Convertir les types enum en chaînes si nécessaire
		const formattedData = {
			...updateData,
			// Convertir tout type spécifique en chaîne pour être compatibles avec Supabase
			contraception: String(updateData.contraception || ""),
			gender: String(updateData.gender || ""),
			handedness: String(updateData.handedness || ""),
			maritalStatus: String(updateData.maritalStatus || ""),
			childrenAges: Array.isArray(updateData.childrenAges) 
				? updateData.childrenAges 
				: null
		};

		const { data, error } = await supabase
			.from("Patient")
			.update(formattedData)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("[SUPABASE ERROR]", error.code, error.message);
			throw error;
		}

		return adaptPatientFromSupabase(data);
	} catch (error) {
		console.error("Erreur updatePatient:", error);
		throw error;
	}
}
