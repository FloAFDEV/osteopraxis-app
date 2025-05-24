
import { Patient } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { adaptPatientFromSupabase } from "../patient-adapter";

export async function updatePatient(patient: Patient): Promise<Patient> {
	try {
		console.log("Mise à jour du patient via Edge Function:", patient);
		
		// Récupérer le token pour l'authentification
		const { data: { session } } = await supabase.auth.getSession();
		if (!session) {
			throw new Error("Non autorisé: vous devez être connecté");
		}
		
		// Formater les données pour la mise à jour
		const { id, createdAt, ...updateData } = patient;
		
		// Appeler l'Edge Function avec l'en-tête d'autorisation approprié
		const response = await fetch(`https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/patient?id=${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${session.access_token}`
			},
			body: JSON.stringify(updateData)
		});
		
		// Vérifier si la réponse est ok
		if (!response.ok) {
			const errorData = await response.json();
			console.error("Erreur de la fonction Edge:", errorData);
			throw new Error(errorData.error || "Erreur lors de la mise à jour du patient");
		}
		
		// Récupérer et adapter les données
		const responseData = await response.json();
		
		// Vérifier si les données sont dans le format attendu
		if (!responseData.data) {
			throw new Error("Format de réponse inattendu: les données du patient sont manquantes");
		}
		
		const updatedPatient = Array.isArray(responseData.data) ? responseData.data[0] : responseData.data;
		
		// Si aucune donnée n'a été retournée, lancer une erreur
		if (!updatedPatient) {
			throw new Error("La mise à jour a échoué: aucune donnée retournée");
		}
		
		return adaptPatientFromSupabase(updatedPatient);
	} catch (error) {
		console.error("Erreur updatePatient:", error);
		throw error;
	}
}
