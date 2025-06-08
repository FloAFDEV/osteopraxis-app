import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useSectionNavigation } from "@/hooks/useSectionNavigation";
import { Patient } from "@/types";
import { differenceInYears, parseISO } from "date-fns";
import {
	Activity,
	AlertTriangle,
	Baby,
	Briefcase,
	Mail,
	MapPin,
	Phone,
	Ruler,
	Weight,
} from "lucide-react";
import { InfoBubble } from "./InfoBubble";

interface PatientInfoProps {
	patient: Patient;
}

export function PatientInfo({ patient }: PatientInfoProps) {
	const { navigateToSection } = useSectionNavigation();

	const getInitials = (firstName: string, lastName: string) =>
		`${firstName.charAt(0)}${lastName.charAt(0)}`;

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

	const getBmiCategory = (bmi: number) => {
		if (bmi < 18.5)
			return {
				category: "Insuffisance pondérale",
				variant: "warning" as const,
			};
		if (bmi < 25)
			return { category: "Normal", variant: "success" as const };
		if (bmi < 30)
			return { category: "Surpoids", variant: "warning" as const };
		return { category: "Obésité", variant: "destructive" as const };
	};

	const handleCurrentTreatmentClick = () => {
		navigateToSection("informations-medicales-generales");
	};

	const handleAllergiesClick = () => {
		navigateToSection("informations-medicales-generales");
	};

	return (
		<Card className="w-auto max-w-[400px] h-fit">
			<CardContent className="p-3 md:p-4 lg:p-5">
				{/* En-tête patient */}
				<div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
					<Avatar className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 flex-shrink-0">
						<AvatarFallback
							className={`${getAvatarBg(
								patient.gender
							)} ${getAvatarTextColor(
								patient.gender
							)} flex items-center justify-center text-xs md:text-sm font-bold`}
						>
							{getInitials(patient.firstName, patient.lastName)}
						</AvatarFallback>
					</Avatar>
					<div className="flex-1 min-w-0">
						<CardTitle className="text-sm md:text-base lg:text-lg font-bold truncate">
							{patient.firstName} {patient.lastName}
						</CardTitle>
						<p className="text-xs md:text-sm text-muted-foreground">
							{patient.gender ?? "Genre non spécifié"},{" "}
							{age !== null ? `${age} ans` : "Âge non spécifié"}
						</p>
						{age !== null && age < 12 && (
							<div className="text-amber-600 text-xs flex items-center mt-1">
								<Baby className="h-3 w-3 mr-1" />
								Enfant
							</div>
						)}
					</div>
				</div>

				{/* Informations prioritaires en bulles - responsives */}
				<div className="grid grid-cols-1 gap-2 mb-3 md:mb-4">
					{patient.currentTreatment && (
						<InfoBubble
							icon={Activity}
							label="Traitement actuel"
							value={patient.currentTreatment}
							variant="warning"
							size="sm"
							onClick={handleCurrentTreatmentClick}
							showTooltip={true}
						/>
					)}
					{patient.allergies && patient.allergies !== "NULL" && (
						<InfoBubble
							icon={AlertTriangle}
							label="Allergies"
							value={patient.allergies}
							variant="destructive"
							size="sm"
							onClick={handleAllergiesClick}
							showTooltip={true}
						/>
					)}
					{patient.bmi && (
						<InfoBubble
							icon={Activity}
							label="IMC"
							value={`${patient.bmi} (${
								getBmiCategory(patient.bmi).category
							})`}
							variant={getBmiCategory(patient.bmi).variant}
							size="sm"
						/>
					)}
				</div>

				{/* Informations de contact compactes */}
				<div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<MapPin className="h-3 w-3 flex-shrink-0" />
						<span className="truncate">
							{patient.address || "Adresse non renseignée"}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Mail className="h-3 w-3 flex-shrink-0" />
						<span className="truncate">
							{patient.email || "Email non renseigné"}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Phone className="h-3 w-3 flex-shrink-0" />
						<span className="truncate">
							{patient.phone || "Téléphone non renseigné"}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Briefcase className="h-3 w-3 flex-shrink-0" />
						<span className="truncate">
							{patient.occupation || "Profession non renseignée"}
						</span>
					</div>
					{(patient.height || patient.weight) && (
						<div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm">
							{patient.height && (
								<div className="flex items-center gap-1">
									<Ruler className="h-3 w-3" />
									<span>{patient.height}cm</span>
								</div>
							)}
							{patient.weight && (
								<div className="flex items-center gap-1">
									<Weight className="h-3 w-3" />
									<span>{patient.weight}kg</span>
								</div>
							)}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
