
export type ImportStep = "upload" | "preview" | "mapping" | "import" | "report";

export interface ImportData {
	fileName: string;
	fileType: "excel" | "csv";
	headers: string[];
	rows: string[][];
	totalRows: number;
}

export interface ColumnMapping {
	sourceColumn: string;
	targetField: string | null;
	isRequired: boolean;
	dataType: "text" | "email" | "phone" | "date" | "number";
}

export interface ImportMapping {
	[sourceColumn: string]: ColumnMapping;
}

export interface ValidationError {
	row: number;
	column: string;
	value: string;
	error: string;
}

export interface ImportResult {
	totalProcessed: number;
	successful: number;
	failed: number;
	duplicates: number;
	errors: ValidationError[];
	duration: number;
}

export interface PatientImportData {
	firstName: string;
	lastName: string;
	email?: string;
	phone?: string;
	birthDate?: string;
	gender?: string;
	address?: string;
	city?: string;
	postalCode?: string;
	occupation?: string;
	medicalHistory?: string;
	allergies?: string;
	currentTreatment?: string;
	notes?: string;
}

// Champs disponibles pour le mapping
export const PATIENT_FIELDS = {
	// Champs obligatoires
	firstName: { label: "Prénom", required: true, type: "text" as const },
	lastName: { label: "Nom", required: true, type: "text" as const },
	
	// Champs optionnels de contact
	email: { label: "Email", required: false, type: "email" as const },
	phone: { label: "Téléphone", required: false, type: "phone" as const },
	
	// Informations personnelles
	birthDate: { label: "Date de naissance", required: false, type: "date" as const },
	gender: { label: "Genre", required: false, type: "text" as const },
	
	// Adresse
	address: { label: "Adresse", required: false, type: "text" as const },
	city: { label: "Ville", required: false, type: "text" as const },
	postalCode: { label: "Code postal", required: false, type: "text" as const },
	country: { label: "Pays", required: false, type: "text" as const },
	
	// Informations professionnelles
	occupation: { label: "Profession", required: false, type: "text" as const },
	job: { label: "Métier", required: false, type: "text" as const },
	
	// Informations médicales
	medicalHistory: { label: "Antécédents médicaux", required: false, type: "text" as const },
	allergies: { label: "Allergies", required: false, type: "text" as const },
	currentTreatment: { label: "Traitement actuel", required: false, type: "text" as const },
	currentMedication: { label: "Médicaments actuels", required: false, type: "text" as const },
	
	// Habitudes de vie
	physicalActivity: { label: "Activité physique", required: false, type: "text" as const },
	smokingAmount: { label: "Tabac", required: false, type: "text" as const },
	alcoholConsumption: { label: "Consommation d'alcool", required: false, type: "text" as const },
	
	// Biométrie
	height: { label: "Taille (cm)", required: false, type: "number" as const },
	weight: { label: "Poids (kg)", required: false, type: "number" as const },
	
	// Notes
	notes: { label: "Notes", required: false, type: "text" as const },
} as const;

export type PatientFieldKey = keyof typeof PATIENT_FIELDS;
