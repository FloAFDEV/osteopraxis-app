
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

		// Convertir les types pour qu'ils correspondent aux attentes de Supabase
		// Utiliser "as any" pour contourner les vérifications de type strictes
		// Cela est nécessaire car Supabase accepte ces valeurs comme des chaînes
		const formattedData = {
			...patientWithOsteopath,
			// S'assurer que tous les tableaux sont correctement gérés
			childrenAges: Array.isArray(patientWithOsteopath.childrenAges) 
				? patientWithOsteopath.childrenAges 
				: null
		} as any;

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
