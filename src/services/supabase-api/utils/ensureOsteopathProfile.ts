import { supabase } from "../utils";

/**
 * Vérifie si un profil Ostéopathe existe pour l'utilisateur et en crée un si nécessaire
 * @param userId L'ID de l'utilisateur authentifié (champ id dans table User)
 * @returns L'ID de l'ostéopathe créé ou existant
 */
export async function ensureOsteopathProfile(userId: string): Promise<number> {
	if (!userId) throw new Error("UserID invalide");

	// Vérifier si profil ostéo existe (userId est UUID ici)
	const { data: existingProfile, error: checkError } = await supabase
		.from("Osteopath")
		.select("id")
		.eq("userId", userId) // userId en UUID dans Osteopath ?
		.maybeSingle();

	if (checkError && checkError.code !== "PGRST116") {
		throw checkError;
	}

	if (existingProfile) return existingProfile.id;

	// Sinon, créer un profil ostéopathe
	const now = new Date().toISOString();

	// Récupérer prénom + nom depuis User (id = userId)
	const { data: userData, error: userError } = await supabase
		.from("User")
		.select("first_name, last_name")
		.eq("id", userId)
		.maybeSingle();

	const userName =
		userData && !userError
			? `${userData.first_name || ""} ${
					userData.last_name || ""
			  }`.trim() || "Ostéopathe"
			: "Ostéopathe";

	const { data: newProfile, error: insertError } = await supabase
		.from("Osteopath")
		.insert({
			userId, // doit être UUID ici, assure-toi que la colonne userId dans Osteopath est aussi UUID
			name: userName,
			professional_title: "Ostéopathe D.O.",
			ape_code: "8690F",
			createdAt: now,
			updatedAt: now,
		})
		.select("id")
		.single();

	if (insertError) throw insertError;

	return newProfile.id;
}
