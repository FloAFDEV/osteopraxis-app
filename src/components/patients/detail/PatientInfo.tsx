import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";
import { Patient } from "@/types";
import { differenceInYears, parseISO } from "date-fns";
import { Baby, Mail, MapPin, Phone, User } from "lucide-react";

interface PatientInfoProps {
	patient: Patient;
}

export function PatientInfo({ patient }: PatientInfoProps) {
	const getInitials = (firstName: string, lastName: string) => {
		return `${firstName.charAt(0)}${lastName.charAt(0)}`;
	};

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
				? "text-blue-500"
				: patient?.gender === "Femme"
				? "text-pink-500"
				: "text-gray-500",
		avatarBg:
			patient?.gender === "Homme"
				? "bg-blue-200"
				: patient?.gender === "Femme"
				? "bg-pink-200"
				: "bg-gray-200",
	};

	// Calculer l'âge du patient
	const age = patient.birthDate
		? differenceInYears(new Date(), parseISO(patient.birthDate))
		: null;

	return (
		<Card>
			<CardContent
				className={`p-6 rounded-md ${genderColors.lightBg} ${genderColors.darkBg}`}
			>
				<div className="flex items-center space-x-4">
					<Avatar
						className={`h-16 w-16 ${genderColors.darkBg} ${genderColors.textColor}`}
					>
						<AvatarFallback className={genderColors.avatarBg}>
							{getInitials(patient.firstName, patient.lastName)}
						</AvatarFallback>
					</Avatar>
					<div>
						<CardTitle
							className={`text-2xl font-bold ${genderColors.textColor}`}
						>
							<User className="mr-2 h-6 w-6" />
							{patient.firstName} {patient.lastName}
						</CardTitle>
						<CardDescription>
							{patient.gender === "Homme"
								? "Homme"
								: patient.gender === "Femme"
								? "Femme"
								: "Non spécifié"}
							, {age !== null ? `${age} ans` : "âge non spécifié"}
						</CardDescription>{" "}
						{/* Affichage de l'icône enfant si moins de 12 ans */}
						{age !== null && age < 12 && (
							<span className="flex items-center text-amber-500 text-sm">
								<Baby className="h-6 w-6 mr-1" />
								Enfant -12 ans
							</span>
						)}
					</div>
				</div>

				{/* Informations de contact */}
				<div className="mt-6 space-y-4">
					<div className="flex items-center space-x-2">
						<MapPin className="h-4 w-4 text-muted-foreground" />
						<span>{patient.address}</span>
					</div>
					<div className="flex items-center space-x-2">
						<Mail className="h-4 w-4 text-muted-foreground" />
						<a
							href={`mailto:${patient.email}`}
							className="hover:underline"
						>
							{patient.email}
						</a>
					</div>
					<div className="flex items-center space-x-2">
						<Phone className="h-4 w-4 text-muted-foreground" />
						<span>{patient.phone}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
