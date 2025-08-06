
import { Patient } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";
import { getCurrentOsteopathId } from "../utils/getCurrentOsteopath";

export async function createPatient(
	patientData: Omit<Patient, "id" | "createdAt" | "updatedAt">
): Promise<Patient> {
	try {
		console.log('🏥 createPatient: Début de la création du patient');
		console.log('📝 createPatient: Données reçues:', patientData);
		
		// Récupérer l'ID de l'ostéopathe connecté
		const osteopathId = await getCurrentOsteopathId();
		
		if (!osteopathId) {
			console.error("❌ createPatient: Impossible de créer un patient: aucun ostéopathe connecté");
			throw new Error("Non autorisé: vous devez être connecté en tant qu'ostéopathe");
		}
		
		console.log("✅ createPatient: Ostéopathe ID récupéré:", osteopathId);

		// SÉCURITÉ RENFORCÉE: Vérifier si le client tente de spécifier un osteopathId différent
		if (patientData.osteopathId && patientData.osteopathId !== osteopathId) {
			console.error(`⚠️ createPatient: TENTATIVE DE VIOLATION DE SÉCURITÉ: Tentative de création avec osteopathId ${patientData.osteopathId} différent de l'utilisateur connecté ${osteopathId}`);
		}

		// S'assurer que le patient est associé à l'ostéopathe connecté
		// Écraser toute tentative de définir un autre osteopathId
		const patientWithOsteopath = {
			...patientData,
			osteopathId, // Garantir que c'est l'osteopathId de l'utilisateur connecté
		};

		// Convertir les types pour qu'ils correspondent aux attentes de Supabase
		const formattedData = {
			...patientWithOsteopath,
			// S'assurer que tous les tableaux sont correctement gérés
			childrenAges: Array.isArray(patientWithOsteopath.childrenAges) 
				? patientWithOsteopath.childrenAges 
				: null,
			// Assurer que les valeurs numériques sont correctement formatées
			height: patientWithOsteopath.height ? Number(patientWithOsteopath.height) : null,
			weight: patientWithOsteopath.weight ? Number(patientWithOsteopath.weight) : null,
			bmi: patientWithOsteopath.bmi ? Number(patientWithOsteopath.bmi) : null,
			// Dates
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		} as any;

		console.log('💾 createPatient: Données formatées pour Supabase:', formattedData);

		// Tenter d'insérer le patient directement
		const { data, error } = await supabase
			.from("Patient")
			.insert(formattedData)
			.select()
			.single();

		if (error) {
			console.error("[SUPABASE ERROR] createPatient:", error.code, error.message, error.details);
			
			// Messages d'erreur plus explicites
			if (error.code === 'PGRST301') {
				throw new Error("Accès refusé : Vous n'avez pas les permissions pour créer un patient");
			}
			
			if (error.message.includes('row-level security')) {
				throw new Error("Erreur de sécurité : Vérifiez vos permissions d'accès");
			}
			
			if (error.message.includes('violates check constraint') || error.message.includes('null value')) {
				throw new Error("Données invalides : Vérifiez que tous les champs obligatoires sont remplis");
			}
			
			throw new Error(`Erreur lors de la création du patient : ${error.message}`);
		}

		if (!data) {
			throw new Error("Aucune donnée retournée après la création du patient");
		}

		console.log('✅ createPatient: Patient créé avec succès:', data.id);
		return adaptPatientFromSupabase(data);
		
	} catch (error) {
		console.error("❌ createPatient: Erreur globale:", error);
		throw error;
	}
}
