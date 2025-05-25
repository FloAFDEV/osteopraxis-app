
import { z } from "zod";

// Fonction pour convertir hasChildren de string à boolean
export const convertHasChildrenToBoolean = (
	value: string | boolean | null | undefined
): boolean => {
	if (typeof value === "boolean") {
		return value;
	}
	if (value === "true") {
		return true;
	}
	return false;
};

// Schéma de validation pour le formulaire patient
const getPatientSchema = (emailRequired: boolean) =>
	z.object({
		address: z.string().optional().nullable(),
		email: emailRequired
			? z.string().email("Email invalide").min(1, "Email requis")
			: z.string().email("Email invalide").optional().nullable(),
		phone: z.string().optional().nullable(),
		// Corriger le type pour birthDate - accepter string pour le formulaire
		birthDate: z.string().optional().nullable(),
		childrenAges: z.array(z.number()).optional().nullable(),
		firstName: z.string().min(1, "Prénom requis"),
		lastName: z.string().min(1, "Nom requis"),
		gender: z.string().optional().nullable(),
		hasChildren: z.string().optional().nullable(), // Garder en string pour le switch
		occupation: z.string().optional().nullable(),
		maritalStatus: z.string().optional().nullable(),
		contraception: z.string().optional().nullable(),
		physicalActivity: z.string().optional().nullable(),
		isSmoker: z.boolean().optional().nullable(),
		isExSmoker: z.boolean().optional().nullable(),
		smokingSince: z.string().optional().nullable(),
		smokingAmount: z.string().optional().nullable(),
		quitSmokingDate: z.string().optional().nullable(),
		generalPractitioner: z.string().optional().nullable(),
		ophtalmologistName: z.string().optional().nullable(),
		hasVisionCorrection: z.boolean().optional().nullable(),
		entDoctorName: z.string().optional().nullable(),
		entProblems: z.string().optional().nullable(),
		digestiveDoctorName: z.string().optional().nullable(),
		digestiveProblems: z.string().optional().nullable(),
		surgicalHistory: z.string().optional().nullable(),
		traumaHistory: z.string().optional().nullable(),
		rheumatologicalHistory: z.string().optional().nullable(),
		currentTreatment: z.string().optional().nullable(),
		handedness: z.string().optional().nullable(),
		familyStatus: z.string().optional().nullable(),
		cabinetId: z.number().optional(),
		
		// Champs existants pour tous les patients
		complementaryExams: z.string().optional().nullable(),
		generalSymptoms: z.string().optional().nullable(),
		// Champs existants pour les enfants
		pregnancyHistory: z.string().optional().nullable(),
		birthDetails: z.string().optional().nullable(),
		developmentMilestones: z.string().optional().nullable(),
		sleepingPattern: z.string().optional().nullable(),
		feeding: z.string().optional().nullable(),
		behavior: z.string().optional().nullable(),
		childCareContext: z.string().optional().nullable(),

		// Nouveaux champs généraux
		ent_followup: z.string().optional().nullable(),
		intestinal_transit: z.string().optional().nullable(),
		sleep_quality: z.string().optional().nullable(),
		fracture_history: z.string().optional().nullable(),
		dental_health: z.string().optional().nullable(),
		sport_frequency: z.string().optional().nullable(),
		gynecological_history: z.string().optional().nullable(),
		other_comments_adult: z.string().optional().nullable(),

		// Nouveaux champs spécifiques aux enfants
		fine_motor_skills: z.string().optional().nullable(),
		gross_motor_skills: z.string().optional().nullable(),
		weight_at_birth: z.number().optional().nullable(),
		height_at_birth: z.number().optional().nullable(),
		head_circumference: z.number().optional().nullable(),
		apgar_score: z.string().optional().nullable(),
		childcare_type: z.string().optional().nullable(),
		school_grade: z.string().optional().nullable(),
		pediatrician_name: z.string().optional().nullable(),
		paramedical_followup: z.string().optional().nullable(),
		other_comments_child: z.string().optional().nullable(),
        
        // Ajout pour poids, taille et IMC
        weight: z.number().optional().nullable(),
        height: z.number().optional().nullable(),
        bmi: z.number().optional().nullable(),
        
        // Champs manquants ajoutés
        allergies: z.string().optional().nullable(),
        avatarUrl: z.string().optional().nullable(),
        userId: z.string().optional().nullable(),
        osteopathId: z.number().optional().nullable(),
        city: z.string().optional().nullable(),
        postalCode: z.string().optional().nullable(),
        country: z.string().optional().nullable(),
        job: z.string().optional().nullable(),
        alcoholConsumption: z.string().optional().nullable(),
        hdlm: z.string().optional().nullable(),
        isDeceased: z.boolean().optional().nullable(),
        smoker: z.boolean().optional().nullable(),
        smokerSince: z.number().optional().nullable(),
        sportActivity: z.string().optional().nullable(),
        medicalHistory: z.string().optional().nullable(),
        currentMedication: z.string().optional().nullable(),
        otherContraception: z.string().optional().nullable(),
	});

export default getPatientSchema;

// Fonction pour obtenir les options enum selon le type
export function getEnumOptions(
	enumType: "MaritalStatus" | "Handedness" | "Contraception" | "Gender"
) {
	switch (enumType) {
		case "MaritalStatus":
			return [
				{ value: "SINGLE", label: "Célibataire" },
				{ value: "MARRIED", label: "Marié(e)" },
				{ value: "DIVORCED", label: "Divorcé(e)" },
				{ value: "WIDOWED", label: "Veuf/Veuve" },
				{ value: "SEPARATED", label: "Séparé(e)" },
				{ value: "ENGAGED", label: "Fiancé(e)" },
				{ value: "PARTNERED", label: "En couple" },
			];
		case "Handedness":
			return [
				{ value: "LEFT", label: "Gaucher" },
				{ value: "RIGHT", label: "Droitier" },
				{ value: "AMBIDEXTROUS", label: "Ambidextre" },
			];
		case "Contraception":
			return [
				{ value: "NONE", label: "Aucune méthode" },
				{ value: "PILLS", label: "Pilule (orale)" },
				{ value: "CONDOM", label: "Préservatif (interne/externe)" },
				{
					value: "IMPLANTS",
					label: "Implant contraceptif (sous-cutané)",
				},
				{ value: "DIAPHRAGM", label: "Diaphragme (barrière)" },
				{ value: "IUD", label: "Stérilet (cuivre, non hormonal)" },
				{ value: "IUD_HORMONAL", label: "Stérilet (hormonal, DIU)" },
				{
					value: "INJECTION",
					label: "Injection contraceptive (progestatif, tous les 3 mois)",
				},
				{
					value: "PATCH",
					label: "Patch contraceptif (hormonal, cutané)",
				},
				{ value: "RING", label: "Anneau vaginal (hormonal)" },
				{
					value: "NATURAL_METHODS",
					label: "Méthodes naturelles (calendrier, température...)",
				},
				{ value: "STERILIZATION", label: "Stérilisation définitive" },
			];

		case "Gender":
			return [
				{ value: "Homme", label: "Homme" },
				{ value: "Femme", label: "Femme" },
			];
		default:
			return [];
	}
}

// Fonctions de traduction pour les valeurs d'enum
export function translateMaritalStatus(
	status: string | null | undefined
): string {
	if (!status) return "Non spécifié";

	const options = getEnumOptions("MaritalStatus");
	const option = options.find((opt) => opt.value === status);
	return option ? option.label : "Non spécifié";
}

export function translateHandedness(
	handedness: string | null | undefined
): string {
	if (!handedness) return "Non spécifié";

	const options = getEnumOptions("Handedness");
	const option = options.find((opt) => opt.value === handedness);
	return option ? option.label : "Non spécifié";
}

export function translateContraception(
	contraception: string | null | undefined
): string {
	if (!contraception) return "Non spécifiée";

	const options = getEnumOptions("Contraception");
	const option = options.find((opt) => opt.value === contraception);
	return option ? option.label : "Non spécifiée";
}
