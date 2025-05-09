
import { z } from "zod";

// Fonction pour convertir hasChildren de string à boolean
export const convertHasChildrenToBoolean = (value: string | boolean | null | undefined): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === "true") {
    return true;
  }
  return false;
};

// Schéma de validation pour le formulaire patient
const getPatientSchema = (emailRequired: boolean) => z.object({
	address: z.string().optional().nullable(),
	email: emailRequired 
		? z.string().email("Email invalide").min(1, "Email requis")
		: z.string().email("Email invalide").optional().nullable(),
	phone: z.string().optional().nullable(),
	notes: z.string().optional().nullable(),
	birthDate: z.date().optional().nullable(),
	childrenAges: z.array(z.number()).optional().nullable(),
	firstName: z.string().min(1, "Prénom requis"),
	lastName: z.string().min(1, "Nom requis"),
	gender: z.string().optional().nullable(),
	hasChildren: z.boolean().optional().nullable(),
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
	cabinetId: z.number().optional(), // Ajout du champ cabinetId
	// Nouveaux champs pour tous les patients
	complementaryExams: z.string().optional().nullable(),
	generalSymptoms: z.string().optional().nullable(),
	// Nouveaux champs pour les enfants
	pregnancyHistory: z.string().optional().nullable(),
	birthDetails: z.string().optional().nullable(),
	developmentMilestones: z.string().optional().nullable(),
	sleepingPattern: z.string().optional().nullable(),
	feeding: z.string().optional().nullable(),
	behavior: z.string().optional().nullable(),
	childCareContext: z.string().optional().nullable(),
});

export default getPatientSchema;

// Fonction pour obtenir les options enum selon le type
export function getEnumOptions(enumType: 'MaritalStatus' | 'Handedness' | 'Contraception' | 'Gender') {
  switch (enumType) {
    case 'MaritalStatus':
      return [
        { value: 'SINGLE', label: 'Célibataire' },
        { value: 'MARRIED', label: 'Marié(e)' },
        { value: 'DIVORCED', label: 'Divorcé(e)' },
        { value: 'WIDOWED', label: 'Veuf/Veuve' },
        { value: 'SEPARATED', label: 'Séparé(e)' },
        { value: 'ENGAGED', label: 'Fiancé(e)' },
        { value: 'PARTNERED', label: 'En couple' },
      ];
    case 'Handedness':
      return [
        { value: 'LEFT', label: 'Gaucher' },
        { value: 'RIGHT', label: 'Droitier' },
        { value: 'AMBIDEXTROUS', label: 'Ambidextre' },
      ];
    case 'Contraception':
      return [
        { value: 'NONE', label: 'Aucune' },
        { value: 'PILLS', label: 'Pilule' },
        { value: 'CONDOM', label: 'Préservatif' },
        { value: 'IMPLANTS', label: 'Implant' },
        { value: 'DIAPHRAGM', label: 'Diaphragme' },
        { value: 'IUD', label: 'DIU/Stérilet' },
        { value: 'INJECTION', label: 'Injection' },
        { value: 'PATCH', label: 'Patch' },
        { value: 'RING', label: 'Anneau vaginal' },
        { value: 'NATURAL_METHODS', label: 'Méthodes naturelles' },
        { value: 'STERILIZATION', label: 'Stérilisation' },
      ];
    case 'Gender':
      return [
        { value: 'Homme', label: 'Homme' },
        { value: 'Femme', label: 'Femme' },
      ];
    default:
      return [];
  }
}

// Fonctions de traduction pour les valeurs d'enum
export function translateMaritalStatus(status: string | null | undefined): string {
  if (!status) return 'Non spécifié';
  
  const options = getEnumOptions('MaritalStatus');
  const option = options.find(opt => opt.value === status);
  return option ? option.label : 'Non spécifié';
}

export function translateHandedness(handedness: string | null | undefined): string {
  if (!handedness) return 'Non spécifié';
  
  const options = getEnumOptions('Handedness');
  const option = options.find(opt => opt.value === handedness);
  return option ? option.label : 'Non spécifié';
}

export function translateContraception(contraception: string | null | undefined): string {
  if (!contraception) return 'Non spécifiée';
  
  const options = getEnumOptions('Contraception');
  const option = options.find(opt => opt.value === contraception);
  return option ? option.label : 'Non spécifiée';
}
