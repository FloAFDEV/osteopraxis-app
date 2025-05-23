
import { Patient } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { adaptPatientFromSupabase } from "../patient-adapter";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";

export async function updatePatient(patient: Patient): Promise<Patient> {
	try {
		// Récupérer l'ID de l'ostéopathe connecté
		const osteopathId = await getCurrentOsteopathId();
		
		if (!osteopathId) {
			console.error("Impossible de mettre à jour un patient: aucun ostéopathe connecté");
			throw new Error("Non autorisé: vous devez être connecté en tant qu'ostéopathe");
		}
		
		// Vérifier d'abord que le patient appartient bien à l'ostéopathe connecté
		const { data: existingPatient, error: checkError } = await supabase
			.from("Patient")
			.select("id, osteopathId")
			.eq("id", patient.id)
			.eq("osteopathId", osteopathId)
			.maybeSingle();
			
		if (checkError) {
			console.error("Erreur lors de la vérification du patient:", checkError);
			throw checkError;
		}
		
		if (!existingPatient) {
			console.error(`Patient avec ID ${patient.id} non trouvé ou n'appartient pas à l'ostéopathe ${osteopathId}`);
			throw new Error("Patient non trouvé ou accès non autorisé");
		}
		
		// SÉCURITÉ RENFORCÉE: Vérifier si le client tente de modifier l'osteopathId
		if (patient.osteopathId && patient.osteopathId !== osteopathId) {
			console.error(`TENTATIVE DE VIOLATION DE SÉCURITÉ: Tentative de modification d'osteopathId ${osteopathId} vers ${patient.osteopathId}`);
			throw new Error("Modification non autorisée: vous ne pouvez pas changer l'appartenance du patient");
		}
		
		// Enlever les champs qui ne doivent pas être mis à jour
		const { id, createdAt, ...updateData } = patient;

		// S'assurer que l'osteopathId est conservé et correspond à l'utilisateur connecté
		const formattedData = {
			...updateData,
			osteopathId, // Garantir que l'osteopathId reste celui de l'utilisateur connecté
			// S'assurer que tous les tableaux sont correctement gérés
			childrenAges: Array.isArray(updateData.childrenAges) 
				? updateData.childrenAges 
				: null,
            // Assurer que les valeurs numériques sont correctement formatées
            height: updateData.height !== undefined ? Number(updateData.height) || null : null,
            weight: updateData.weight !== undefined ? Number(updateData.weight) || null : null,
            bmi: updateData.bmi !== undefined ? Number(updateData.bmi) || null : null,
            // Assurer que toutes les autres valeurs numériques sont correctement formatées
            weight_at_birth: updateData.weight_at_birth !== undefined ? Number(updateData.weight_at_birth) || null : null,
            height_at_birth: updateData.height_at_birth !== undefined ? Number(updateData.height_at_birth) || null : null,
            head_circumference: updateData.head_circumference !== undefined ? Number(updateData.head_circumference) || null : null
		} as any;

		console.log("Envoi des données formatées via PUT:", formattedData);

		// Utiliser PUT explicitement au lieu de PATCH pour éviter les problèmes CORS
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
