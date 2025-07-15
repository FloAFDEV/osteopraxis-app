
import { Patient } from "@/types";
import { adaptPatientFromSupabase } from "../patient-adapter";
import { supabase } from "../utils";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";

export async function getPatients(): Promise<Patient[]> {
	try {
		// Récupérer l'ID de l'ostéopathe connecté
		const osteopathId = await getCurrentOsteopathId();
		
		// Si aucun osteopathId n'est trouvé, retourner un tableau vide et journaliser clairement
		if (!osteopathId) {
			console.warn("ACCÈS REFUSÉ: Tentative d'accès à la liste des patients sans profil ostéopathe");
			console.log("L'utilisateur doit compléter son profil ostéopathe avant de pouvoir accéder aux patients");
			// On pourrait ici notifier l'utilisateur qu'il doit configurer son profil
			return [];
		}
		
		console.log("Filtrage des patients par osteopathId:", osteopathId);

		// Pour les admins (osteopathId = -1), récupérer tous les patients (y compris supprimés)
		// Pour les ostéopathes, appliquer le filtre par osteopathId et exclure les supprimés
		let query = supabase.from("Patient").select("*");
		
		if (osteopathId !== -1) {
			query = query.eq("osteopathId", osteopathId).is("deleted_at", null);
		} else {
			console.log("Accès admin - récupération de tous les patients (y compris supprimés)");
		}

		const { data, error } = await query;

		if (error) {
			console.error("Error fetching patients:", error);
			throw error;
		}

		// Vérifier si data est null ou undefined
		if (!data) {
			console.log("Aucune donnée de patients retournée");
			return [];
		}

		const patients = data.map(adaptPatientFromSupabase);

		// Statistiques et logs
		const maleCount = patients.filter((p) => p.gender === "Homme").length;
		const femaleCount = patients.filter((p) => p.gender === "Femme").length;

		const childrenPatients = patients.filter((p) => {
			if (!p.birthDate) return false;
			const birthDate = new Date(p.birthDate);
			const today = new Date();
			let age = today.getFullYear() - birthDate.getFullYear();
			const monthDiff = today.getMonth() - birthDate.getMonth();
			if (
				monthDiff < 0 ||
				(monthDiff === 0 && today.getDate() < birthDate.getDate())
			) {
				age--;
			}
			return age < 12;
		});

		console.log(
			`GetPatients: Found ${childrenPatients.length} children among ${patients.length} total patients for osteopath ${osteopathId}`
		);
		console.log(
			`GetPatients: Gender distribution - ${maleCount} men, ${femaleCount} women`
		);

		return patients;
	} catch (error) {
		console.error("Error in getPatients:", error);
		throw error;
	}
}
