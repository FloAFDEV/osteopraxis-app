
import { supabase } from "../utils";

/**
 * Récupère l'ID de l'ostéopathe actuellement connecté
 * Ne crée plus automatiquement un profil Ostéopathe s'il n'existe pas
 */
export const getCurrentOsteopathId = async (): Promise<number | null> => {
	try {
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			console.error("Utilisateur non connecté", userError);
			return null;
		}

		// Recherche dans ta table 'User' le profil lié à l'auth_id
		const { data: userProfile, error: userProfileError } = await supabase
			.from("User") 
			.select("osteopathId, role")
			.eq("id", user.id)
			.maybeSingle();

		if (userProfileError || !userProfile) {
			console.warn("Profil utilisateur non trouvé");
			
			// Essayer avec auth_id si la recherche par id ne fonctionne pas
			const { data: userProfileByAuthId, error: authIdError } = await supabase
				.from("User")
				.select("osteopathId, role")
				.eq("auth_id", user.id)
				.maybeSingle();
				
			if (authIdError || !userProfileByAuthId) {
				console.warn("Profil utilisateur non trouvé même avec auth_id");
				return null;
			}
			
			// On a trouvé un profil utilisateur avec auth_id
			if (userProfileByAuthId.role !== "OSTEOPATH") {
				console.warn("L'utilisateur n'est pas un ostéopathe");
				return null;
			}
			
			// Si l'osteopathId est null, l'utilisateur doit d'abord configurer son profil
			if (!userProfileByAuthId.osteopathId) {
				console.warn("L'utilisateur n'a pas encore configuré son profil d'ostéopathe (trouvé via auth_id)");
				return null;
			}
			
			return userProfileByAuthId.osteopathId;
		}

		// Vérifie le rôle (en supposant que role est une string ou un enum)
		if (userProfile.role !== "OSTEOPATH") {
			console.warn("L'utilisateur n'est pas un ostéopathe");
			return null;
		}

		// Si l'osteopathId est null, l'utilisateur doit d'abord configurer son profil
		if (!userProfile.osteopathId) {
			console.warn("L'utilisateur n'a pas encore configuré son profil d'ostéopathe");
			return null;
		}

		// Retourne l'ID de l'ostéopathe
		return userProfile.osteopathId;
	} catch (error) {
		console.error("Erreur inattendue dans getCurrentOsteopathId:", error);
		return null;
	}
};

/**
 * Vérifie si l'ostéopathe donné correspond à l'utilisateur connecté
 */
export const isSameOsteopath = async (
	osteopathId: number
): Promise<boolean> => {
	try {
		const currentOsteopathId = await getCurrentOsteopathId();
		return currentOsteopathId === osteopathId;
	} catch (error) {
		console.error("Erreur lors de la vérification de l'ostéopathe:", error);
		return false;
	}
};
