
import { api } from "@/services/api";
import { PATIENT_FIELDS, type ImportData, type ImportMapping, type ImportResult, type ValidationError, type PatientImportData } from "@/types/import";

interface ImportOptions {
	onProgress?: (processed: number, total: number) => void;
}

export const importPatients = async (
	data: ImportData, 
	mapping?: ImportMapping,
	options?: ImportOptions
): Promise<ImportResult> => {
	const result: ImportResult = {
		totalProcessed: 0,
		successful: 0,
		failed: 0,
		duplicates: 0,
		errors: [],
		duration: 0
	};

	const startTime = Date.now();

	try {
		// Si pas de mapping fourni, utiliser un mapping par défaut
		const finalMapping = mapping || createDefaultMapping(data);

		for (let i = 0; i < data.rows.length; i++) {
			const row = data.rows[i];
			const rowNumber = i + 2; // +2 car ligne 1 = headers, et on commence à 0

			try {
				// Convertir la ligne en données patient
				const patientData = convertRowToPatientData(row, data.headers, finalMapping);
				
				// Valider les données
				const validationErrors = validatePatientData(patientData, rowNumber);
				if (validationErrors.length > 0) {
					result.errors.push(...validationErrors);
					result.failed++;
					continue;
				}

				// Vérifier les doublons
				const isDuplicate = await checkForDuplicate(patientData);
				if (isDuplicate) {
					result.duplicates++;
					continue;
				}

				// Créer le patient
				await api.createPatient(patientData);
				result.successful++;

			} catch (error) {
				result.failed++;
				result.errors.push({
					row: rowNumber,
					column: "general",
					value: "",
					error: error instanceof Error ? error.message : "Erreur inconnue"
				});
			}

			result.totalProcessed++;
			
			// Notifier du progrès
			if (options?.onProgress) {
				options.onProgress(result.totalProcessed, data.rows.length);
			}

			// Petit délai pour éviter de surcharger l'API
			if (i % 10 === 0) {
				await new Promise(resolve => setTimeout(resolve, 100));
			}
		}

	} catch (error) {
		console.error("Erreur générale durant l'import:", error);
		throw error;
	}

	result.duration = Date.now() - startTime;
	return result;
};

const createDefaultMapping = (data: ImportData): ImportMapping => {
	const mapping: ImportMapping = {};
	
	data.headers.forEach(header => {
		mapping[header] = {
			sourceColumn: header,
			targetField: null,
			isRequired: false,
			dataType: 'text'
		};
	});

	return mapping;
};

const convertRowToPatientData = (
	row: string[], 
	headers: string[], 
	mapping: ImportMapping
): PatientImportData => {
	const patientData: any = {};

	headers.forEach((header, index) => {
		const columnMapping = mapping[header];
		if (columnMapping?.targetField) {
			const value = row[index]?.trim();
			if (value) {
				patientData[columnMapping.targetField] = value;
			}
		}
	});

	return patientData as PatientImportData;
};

const validatePatientData = (data: PatientImportData, rowNumber: number): ValidationError[] => {
	const errors: ValidationError[] = [];

	// Vérifier les champs obligatoires
	if (!data.firstName?.trim()) {
		errors.push({
			row: rowNumber,
			column: "firstName",
			value: data.firstName || "",
			error: "Le prénom est obligatoire"
		});
	}

	if (!data.lastName?.trim()) {
		errors.push({
			row: rowNumber,
			column: "lastName", 
			value: data.lastName || "",
			error: "Le nom est obligatoire"
		});
	}

	// Valider l'email
	if (data.email && !isValidEmail(data.email)) {
		errors.push({
			row: rowNumber,
			column: "email",
			value: data.email,
			error: "Format d'email invalide"
		});
	}

	// Valider le téléphone
	if (data.phone && !isValidPhone(data.phone)) {
		errors.push({
			row: rowNumber,
			column: "phone",
			value: data.phone,
			error: "Format de téléphone invalide"
		});
	}

	// Valider la date de naissance
	if (data.birthDate && !isValidDate(data.birthDate)) {
		errors.push({
			row: rowNumber,
			column: "birthDate",
			value: data.birthDate,
			error: "Format de date invalide (attendu: DD/MM/YYYY ou YYYY-MM-DD)"
		});
	}

	return errors;
};

const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
	// Accepter différents formats de téléphone français
	const phoneRegex = /^(?:(?:\+33|0)[1-9](?:[0-9]{8}))$/;
	const cleanPhone = phone.replace(/[\s.-]/g, '');
	return phoneRegex.test(cleanPhone);
};

const isValidDate = (dateString: string): boolean => {
	// Formats acceptés: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
	const date1 = /^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/;
	const date2 = /^\d{4}-\d{2}-\d{2}$/;
	
	if (!date1.test(dateString) && !date2.test(dateString)) {
		return false;
	}

	let day: number, month: number, year: number;

	if (date2.test(dateString)) {
		// Format YYYY-MM-DD
		const [yearStr, monthStr, dayStr] = dateString.split('-');
		year = parseInt(yearStr);
		month = parseInt(monthStr);
		day = parseInt(dayStr);
	} else {
		// Format DD/MM/YYYY ou DD-MM-YYYY
		const separator = dateString.includes('/') ? '/' : '-';
		const [dayStr, monthStr, yearStr] = dateString.split(separator);
		day = parseInt(dayStr);
		month = parseInt(monthStr);
		year = parseInt(yearStr);
	}

	const date = new Date(year, month - 1, day);
	return date.getDate() === day && 
		   date.getMonth() === month - 1 && 
		   date.getFullYear() === year &&
		   year >= 1900 && year <= new Date().getFullYear();
};

const checkForDuplicate = async (patientData: PatientImportData): Promise<boolean> => {
	try {
		// Rechercher des patients avec le même nom et prénom
		const existingPatients = await api.getPatients();
		
		return existingPatients.some(patient => 
			patient.firstName.toLowerCase().trim() === patientData.firstName.toLowerCase().trim() &&
			patient.lastName.toLowerCase().trim() === patientData.lastName.toLowerCase().trim()
		);
	} catch (error) {
		console.error("Erreur lors de la vérification des doublons:", error);
		// En cas d'erreur, on continue sans vérification de doublon
		return false;
	}
};
