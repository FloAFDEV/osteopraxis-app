
import { Patient } from "@/types";
import { Baby, User, UserCircle, UserRound } from "lucide-react";
import { GenderChartData } from "./gender-pie-chart";

// Détermine si un patient est un mineur (< 18 ans)
export const isMinor = (patient: Patient): boolean => {
	if (!patient.birthDate) return false;

	const birthDate = new Date(patient.birthDate);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();

	if (
		monthDiff < 0 ||
		(monthDiff === 0 && today.getDate() < birthDate.getDate())
	) {
		age--;
	}

	return age < 18;
};

// Fonction utilitaire pour calculer les pourcentages
const calculatePercentage = (part: number, total: number): number => {
	return total > 0 ? Math.round((part / total) * 100) : 0;
};

// Fonction principale pour calculer les données des genres
export const calculateGenderData = (
	patientsList: Patient[],
	totalPatients: number
): GenderChartData[] => {

	const result: GenderChartData[] = [];

	if ((!patientsList || patientsList.length === 0) && totalPatients > 0) {
		
		return [
			{
				name: "Homme",
				value: Math.round(totalPatients * 0.4),
				percentage: 40,
				icon: <User className="h-5 w-5 text-blue-600" />,
			},
			{
				name: "Femme",
				value: Math.round(totalPatients * 0.4),
				percentage: 40,
				icon: <UserRound className="h-5 w-5 text-pink-600" />,
			},
			{
				name: "Mineur",
				value: Math.round(totalPatients * 0.2),
				percentage: 20,
				icon: <Baby className="h-5 w-5 text-emerald-600" />,
			},
		];
	}

	const patients = Array.isArray(patientsList) ? patientsList : [];
	const minorPatients = patients.filter(isMinor);
	const adultPatients = patients.filter((patient) => !isMinor(patient));

	const adultMales = adultPatients.filter((p) => p.gender === "Homme").length;
	const adultFemales = adultPatients.filter((p) => p.gender === "Femme").length;
	const otherOrUndefined = adultPatients.filter(
		(p) => p.gender !== "Homme" && p.gender !== "Femme"
	).length;

	const malePercentage = calculatePercentage(adultMales, totalPatients);
	const femalePercentage = calculatePercentage(adultFemales, totalPatients);
	const minorsPercentage = calculatePercentage(
		minorPatients.length,
		totalPatients
	);
	const otherPercentage = calculatePercentage(
		otherOrUndefined,
		totalPatients
	);

	const addToResult = (
		name: string,
		value: number,
		percentage: number,
		icon: JSX.Element
	) => {
		if (value > 0) {
			result.push({ name, value, percentage, icon });
		}
	};

	addToResult(
		"Homme",
		adultMales,
		malePercentage,
		<User className="h-5 w-5 text-blue-600" />
	);
	addToResult(
		"Femme",
		adultFemales,
		femalePercentage,
		<UserRound className="h-5 w-5 text-pink-600" />
	);
	addToResult(
		"Mineur",
		minorPatients.length,
		minorsPercentage,
		<Baby className="h-5 w-5 text-emerald-600" />
	);
	addToResult(
		"Non spécifié",
		otherOrUndefined,
		otherPercentage,
		<UserCircle className="h-5 w-5 text-gray-600" />
	);

	if (result.length === 0 && totalPatients > 0) {
		result.push({
			name: "Patients",
			value: totalPatients,
			percentage: 100,
			icon: <UserCircle className="h-5 w-5 text-blue-600" />,
		});
	}

	
	return result;
};

