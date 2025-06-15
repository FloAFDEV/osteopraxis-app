
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
	console.log(
		`calculateGenderData - Input data: Patients list length: ${
			patientsList?.length || 0
		}, Total patients: ${totalPatients}`
	);

	const result: GenderChartData[] = [];

	if ((!patientsList || patientsList.length === 0) && totalPatients > 0) {
		console.log("Using default values for chart data as patient list is empty");
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

	console.log(
		`Chart data calculation: ${minorPatients.length} mineurs and ${adultPatients.length} adults`
	);

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

	console.log(
		`Percentages - Male: ${malePercentage}%, Female: ${femalePercentage}%, Mineurs: ${minorsPercentage}%, Other: ${otherPercentage}%`
	);
	console.log(
		`Raw counts - Male: ${adultMales}, Female: ${adultFemales}, Mineurs: ${minorPatients.length}, Other: ${otherOrUndefined}`
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
		console.warn(
			"Generated fallback data because no valid data categories were found"
		);
		result.push({
			name: "Patients",
			value: totalPatients,
			percentage: 100,
			icon: <UserCircle className="h-5 w-5 text-blue-600" />,
		});
	}

	console.log("Final chart data:", result);
	return result;
};

