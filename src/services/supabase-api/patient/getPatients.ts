
import { Patient } from "@/types";
import { adaptPatientFromSupabase } from "../patient-adapter";
import { supabase } from "../utils";

export async function getPatients(): Promise<Patient[]> {
	try {
		// Récupérer l'utilisateur actuel
		const { data: { user } } = await supabase.auth.getUser();
		
		if (!user) {
			console.warn("GetPatients: No authenticated user found");
			return [];
		}
		
		// Obtenir l'osteopathId associé à cet utilisateur
		const { data: osteopathData } = await supabase
			.from("Osteopath")
			.select("id")
			.eq("userId", user.id)
			.single();
			
		if (!osteopathData) {
			console.warn("GetPatients: No osteopath profile found for user", user.id);
			return [];
		}
		
		console.log(`GetPatients: Filtering by osteopathId ${osteopathData.id} for user ${user.id}`);
		
		// Filtrer les patients par l'osteopathId
		const { data, error } = await supabase
			.from("Patient")
			.select("*")
			.eq("osteopathId", osteopathData.id);

		if (error) {
			console.error("Error fetching patients:", error);
			throw error;
		}

		const patients = data.map(adaptPatientFromSupabase);

		// Calculer les comptages par genre et âge pour le graphique
		const maleCount = patients.filter(p => p.gender === "Homme").length;
		const femaleCount = patients.filter(p => p.gender === "Femme").length;
		
		// Calculate children count using precise age calculation
		const childrenPatients = patients.filter((p) => {
			if (!p.birthDate) return false;

			const birthDate = new Date(p.birthDate);
			const today = new Date();

			// Calculate age more precisely
			let age = today.getFullYear() - birthDate.getFullYear();
			const monthDiff = today.getMonth() - birthDate.getMonth();

			// Adjust age if birthday hasn't occurred this year yet
			if (
				monthDiff < 0 ||
				(monthDiff === 0 && today.getDate() < birthDate.getDate())
			) {
				age--;
			}

			return age < 12;
		});

		console.log(`GetPatients: Found ${childrenPatients.length} children among ${patients.length} total patients for osteopath ${osteopathData.id}`);
		console.log(`GetPatients: Gender distribution - ${maleCount} men, ${femaleCount} women`);

		return patients;
	} catch (error) {
		console.error("Error in getPatients:", error);
		throw error;
	}
}
