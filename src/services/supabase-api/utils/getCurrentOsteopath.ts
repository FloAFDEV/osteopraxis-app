import { supabase } from "../utils";
import { ensureOsteopathProfile } from "./ensureOsteopathProfile";

/**
 * Récupère l'ID de l'ostéopathe connecté à partir de son auth_id
 * @returns L'ID de l'ostéopathe ou une erreur si non trouvé
 */
export async function getCurrentOsteopathId(): Promise<number> {
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		throw new Error("Utilisateur non connecté");
	}

	// Typage manuel pour éviter le TS2589
	type MinimalUser = { id: string };

	const { data: userData, error: userError } = await supabase
		.from("User")
		.select("id")
		.eq("auth_id", user.id)
		.single();

	if (userError || !userData) {
		throw new Error("Utilisateur non trouvé");
	}

	const { id } = userData as MinimalUser;

	return ensureOsteopathProfile(id);
}

/**
 * Vérifie si deux ostéopathes sont identiques (utilisé pour autorisations)
 */
export function isSameOsteopath(osteoId1: number, osteoId2: number): boolean {
	return osteoId1 === osteoId2;
}
