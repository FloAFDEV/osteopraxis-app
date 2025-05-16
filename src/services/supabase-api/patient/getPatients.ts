import { Patient } from "@/types";
import { adaptPatientFromSupabase } from "../patient-adapter";
import { supabase } from "../utils";

export async function getPatientsForUser(userUUID: string): Promise<Patient[]> {
	try {
		// 1. Récupérer l'osteopathId (integer) lié à ce user UUID
		const { data: userData, error: userError } = await supabase
			.from("User")
			.select("osteopathId")
			.eq("id", userUUID)
			.single();

		if (userError) {
			console.error("Erreur fetching osteopathId du user :", userError);
			throw userError;
		}

		if (!userData || !userData.osteopathId) {
			console.log("No osteopathId found for user", userUUID);
			return [];
		}

		const osteopathId: number = userData.osteopathId;

		// 2. Récupérer les patients associés à cet osteopathId
		const { data: patientsData, error: patientsError } = await supabase
			.from("Patient")
			.select("*")
			.eq("osteopathId", osteopathId);

		if (patientsError) {
			console.error("Erreur fetching patients:", patientsError);
			throw patientsError;
		}

		const patients = patientsData.map(adaptPatientFromSupabase);

		// 3. Calculs des stats (facultatif, pour debug)
		const maleCount = patients.filter((p) => p.gender === "Homme").length;
		const femaleCount = patients.filter((p) => p.gender === "Femme").length;
		const childrenCount = patients.filter((p) => {
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
		}).length;

		console.log(
			`Patients for osteopathId ${osteopathId}: total=${patients.length}, men=${maleCount}, women=${femaleCount}, children=${childrenCount}`
		);

		return patients;
	} catch (error) {
		console.error("Error in getPatientsForUser:", error);
		throw error;
	}
}
