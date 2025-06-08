
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";
import { Patient } from "@/types";
import { differenceInYears, parseISO } from "date-fns";
import {
	Baby,
	Mail,
	MapPin,
	Phone,
	Activity,
	Ruler,
	Weight,
	Briefcase,
} from "lucide-react";

interface PatientInfoProps {
	patient: Patient;
}

export function PatientInfo({ patient }: PatientInfoProps) {
	const getInitials = (firstName: string, lastName: string) =>
		`${firstName.charAt(0)}${lastName.charAt(0)}`;

	const genderColors = {
		lightBg:
			patient?.gender === "Homme"
				? "bg-blue-100"
				: patient?.gender === "Femme"
				? "bg-pink-100"
				: "bg-gray-100",
		darkBg:
			patient?.gender === "Homme"
				? "dark:bg-blue-950"
				: patient?.gender === "Femme"
				? "dark:bg-fuchsia-950"
				: "dark:bg-gray-800",
		textColor:
			patient?.gender === "Homme"
				? "text-blue-600"
				: patient?.gender === "Femme"
				? "text-pink-600"
				: "text-gray-600",
		avatarBg:
			patient?.gender === "Homme"
				? "bg-blue-200"
				: patient?.gender === "Femme"
				? "bg-pink-200"
				: "bg-gray-200",
	};

	function getAvatarBg(gender?: string) {
		switch (gender) {
			case "Homme":
				return "bg-blue-200 dark:bg-blue-700";
			case "Femme":
				return "bg-pink-200 dark:bg-pink-700";
			default:
				return "bg-gray-200 dark:bg-gray-700";
		}
	}

	function getAvatarTextColor(gender?: string) {
		switch (gender) {
			case "Homme":
				return "text-blue-900 dark:text-blue-100";
			case "Femme":
				return "text-pink-900 dark:text-pink-100";
			default:
				return "text-gray-900 dark:text-gray-100";
		}
	}

	const age = patient.birthDate
		? differenceInYears(new Date(), parseISO(patient.birthDate))
		: null;

	const bmiInfo = () => {
		if (!patient.bmi) return null;
		let category = "";
		let color = "text-gray-500";

		if (patient.bmi < 18.5) {
			category = "Insuffisance pondérale";
			color = "text-blue-500";
		} else if (patient.bmi < 25) {
			category = "Corpulence normale";
			color = "text-green-600";
		} else if (patient.bmi < 30) {
			category = "Surpoids";
			color = "text-yellow-500";
		} else {
			category = "Obésité";
			color = "text-red-500";
		}

		return (
			<div className="flex items-center gap-2 text-sm">
				<Activity className="h-4 w-4 text-muted-foreground" />
				<span className="font-medium">IMC:</span>
				<span className={`${color} font-semibold`}>{patient.bmi}</span>
				<span className="text-muted-foreground">({category})</span>
			</div>
		);
	};

	return (
		<Card>
			<CardContent
				className={`p-4 rounded-md ${genderColors.lightBg} ${genderColors.darkBg}`}
			>
				<div className="flex items-center gap-4 mb-4">
					<Avatar className="h-12 w-12">
						<AvatarFallback
							className={`${getAvatarBg(
								patient.gender
							)} ${getAvatarTextColor(
								patient.gender
							)} flex items-center justify-center text-lg font-bold`}
						>
							{getInitials(patient.firstName, patient.lastName)}
						</AvatarFallback>
					</Avatar>
					<div>
						<CardTitle
							className={`text-xl font-bold ${genderColors.textColor}`}
						>
							{patient.firstName} {patient.lastName}
						</CardTitle>
						<CardDescription className="text-sm">
							{patient.gender ?? "Genre non spécifié"},{" "}
							{age !== null ? `${age} ans` : "Âge non spécifié"}
						</CardDescription>
						{age !== null && age < 12 && (
							<div className="text-amber-600 text-xs flex items-center mt-1">
								<Baby className="h-3 w-3 mr-1" />
								Enfant
							</div>
						)}
					</div>
				</div>

				<div className="space-y-1.5 text-sm text-muted-foreground">
					{/* Adresse */}
					<div className="flex items-center gap-2">
						<MapPin className="h-3.5 w-3.5" />
						<span className="truncate">
							{patient.address || "Adresse non renseignée"}
						</span>
					</div>
					{/* Email */}
					<div className="flex items-center gap-2">
						<Mail className="h-3.5 w-3.5" />
						<a
							href={`mailto:${patient.email}`}
							className="hover:underline truncate"
						>
							{patient.email || "Email non renseigné"}
						</a>
					</div>
					{/* Téléphone */}
					<div className="flex items-center gap-2">
						<Phone className="h-3.5 w-3.5" />
						<span>
							{patient.phone || "Téléphone non renseigné"}
						</span>
					</div>
					{/* Taille et poids - en une ligne compacte */}
					{(patient.height || patient.weight) && (
						<div className="flex items-center gap-3 text-xs">
							{patient.height && (
								<div className="flex items-center gap-1">
									<Ruler className="h-3.5 w-3.5" />
									<span>{patient.height} cm</span>
								</div>
							)}
							{patient.weight && (
								<div className="flex items-center gap-1">
									<Weight className="h-3.5 w-3.5" />
									<span>{patient.weight} kg</span>
								</div>
							)}
						</div>
					)}
					{/* IMC */}
					{bmiInfo()}
					{/* Profession */}
					<div className="flex items-center gap-2">
						<Briefcase className="h-3.5 w-3.5" />
						<span className="truncate">
							{patient.occupation || "Profession non renseignée"}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
