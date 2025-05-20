
import { Patient } from "@/types";
import { adaptPatientFromSupabase } from "../patient-adapter";
import { supabase } from "../utils";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";

export async function getPatients(): Promise<Patient[]> {
	try {
		// Récupérer l'ID de l'ostéopathe connecté
		const osteopathId = await getCurrentOsteopathId();
		console.log("Filtrage des patients par osteopathId:", osteopathId);

		// Si aucun osteopathId n'est trouvé, retourner un tableau vide
		// Cela évite de récupérer des données non associées à l'ostéopathe connecté
		// et permet de gérer le cas où l'utilisateur n'a pas encore configuré son profil
		if (!osteopathId) {
			console.log("Aucun osteopathId trouvé pour l'utilisateur connecté, retour d'une liste vide");
			return [];
		}

		// Appliquer le filtre par osteopathId
		const { data, error } = await supabase
			.from("Patient")
			.select("*")
			.eq("osteopathId", osteopathId);

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

		// Ton code de comptage, calcul d'âge, etc.
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
