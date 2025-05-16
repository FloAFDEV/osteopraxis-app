import { Patient } from "@/types";
import { adaptPatientFromSupabase } from "../patient-adapter";
import { supabase } from "../utils";

export async function getPatients(): Promise<Patient[]> {
	try {
		const { data, error } = await supabase.from("Patient").select("*");

		if (error) {
			console.error("Error fetching patients:", error);
			throw error;
		}

		const patients = data.map(adaptPatientFromSupabase);

		// Calculer les comptages par genre et âge pour le graphique
		const maleCount = patients.filter((p) => p.gender === "Homme").length;
		const femaleCount = patients.filter((p) => p.gender === "Femme").length;

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

		console.log(
			`GetPatients: Found ${childrenPatients.length} children among ${patients.length} total patients`
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
