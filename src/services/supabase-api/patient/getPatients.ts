import { Patient } from "@/types";
import { adaptPatientFromSupabase } from "../patient-adapter";
import { supabase } from "../utils";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";

export async function getPatients(): Promise<Patient[]> {
	try {
		// Récupérer l'ID de l'ostéopathe connecté
		const osteopathId = await getCurrentOsteopathId();
		console.log("Filtrage des patients par osteopathId:", osteopathId);

		let query = supabase.from("Patient").select("*");

		if (osteopathId) {
			// Appliquer le filtre uniquement si osteopathId est défini et non null
			query = query.eq("osteopathId", osteopathId);
		} else {
			// Optionnel : si tu veux récupérer les patients sans ostéopathe assigné
			// query = query.is("osteopathId", null);
			// Sinon, ne mets aucun filtre pour récupérer tous les patients
		}

		const { data, error } = await query;

		if (error) {
			console.error("Error fetching patients:", error);
			throw error;
		}

		const patients = data.map(adaptPatientFromSupabase);

		// Ton code de comptage, calcul d’âge, etc.
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
