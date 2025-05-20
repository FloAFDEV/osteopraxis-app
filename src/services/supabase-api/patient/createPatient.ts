
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
		
		if (!osteopathId) {
			console.error("Impossible de créer un patient: aucun ostéopathe connecté");
			throw new Error("Non autorisé: vous devez être connecté en tant qu'ostéopathe");
		}
		
		console.log("Creating patient for osteopathId:", osteopathId);

		// SÉCURITÉ RENFORCÉE: Vérifier si le client tente de spécifier un osteopathId différent
		if (patientData.osteopathId && patientData.osteopathId !== osteopathId) {
			console.error(`TENTATIVE DE VIOLATION DE SÉCURITÉ: Tentative de création avec osteopathId ${patientData.osteopathId} différent de l'utilisateur connecté ${osteopathId}`);
		}

		// S'assurer que le patient est associé à l'ostéopathe connecté
		// Écraser toute tentative de définir un autre osteopathId
		const patientWithOsteopath = {
			...patientData,
			osteopathId, // Garantir que c'est l'osteopathId de l'utilisateur connecté
		};

		// Convertir les types pour qu'ils correspondent aux attentes de Supabase
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
