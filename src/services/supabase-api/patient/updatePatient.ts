
import { Patient } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";

export async function updatePatient(patient: Patient): Promise<Patient> {
	try {
		// Enlever les champs qui ne doivent pas être mis à jour
		const { id, createdAt, ...updateData } = patient;

		// Utiliser "as any" pour contourner les vérifications de type strictes
		// Cela est nécessaire car Supabase accepte ces valeurs comme des chaînes
		const formattedData = {
			...updateData,
			// S'assurer que tous les tableaux sont correctement gérés
			childrenAges: Array.isArray(updateData.childrenAges) 
				? updateData.childrenAges 
				: null
		} as any;

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
