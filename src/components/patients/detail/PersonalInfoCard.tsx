
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Patient } from "@/types";
import {
	Users,
	Baby,
	Hand,
	Cigarette,
	Heart,
	AlertTriangle,
} from "lucide-react";

interface PersonalInfoCardProps {
	patient: Patient;
}

export function PersonalInfoCard({ patient }: PersonalInfoCardProps) {
	const getSmokerInfo = () => {
		if (patient.isSmoker) {
			return `Fumeur${
				patient.smokingAmount ? ` (${patient.smokingAmount})` : ""
			}${patient.smokingSince ? ` depuis ${patient.smokingSince}` : ""}`;
		} else if (patient.isExSmoker) {
			return `Ex-fumeur${
				patient.smokingAmount ? ` (${patient.smokingAmount})` : ""
			}${
				patient.quitSmokingDate
					? `, arrêt depuis ${patient.quitSmokingDate}`
					: ""
			}`;
		} else {
			return "Non-fumeur";
		}
	};

	const formatChildrenAges = (ages: number[]): string => {
		if (!ages || ages.length === 0) return "Aucun enfant";

		const sortedAges = ages.sort((a, b) => a - b);
		const nb = sortedAges.length;

		const agesText = sortedAges
			.map((age, i) => {
				if (i === nb - 1 && nb > 1) return `et ${age}`;
				return `${age}`;
			})
			.join(nb === 2 ? " " : ", ");

		return `${
			nb === 1 ? "Un enfant de" : `${nb} enfants de`
		} ${agesText} ans`;
	};

	const translateMaritalStatus = (status: string | null) => {
		switch (status) {
			case "SINGLE":
				return "Célibataire";
			case "MARRIED":
				return "Marié(e)";
			case "DIVORCED":
				return "Divorcé(e)";
			case "WIDOWED":
				return "Veuf/Veuve";
			case "CIVIL_PARTNERSHIP":
				return "Partenariat civil";
			default:
				return "Non renseigné";
		}
	};

	const translateHandedness = (handedness: string | null) => {
		switch (handedness) {
			case "RIGHT":
				return "Droitier";
			case "LEFT":
				return "Gaucher";
			case "AMBIDEXTROUS":
				return "Ambidextre";
			default:
				return "Non renseignée";
		}
	};

	const translateContraception = (contraception: string | null) => {
		switch (contraception) {
			case "PILL":
				return "Pilule";
			case "IUD":
				return "Stérilet";
			case "IMPLANT":
				return "Implant";
			case "INJECTION":
				return "Injection";
			case "PATCH":
				return "Patch";
			case "RING":
				return "Anneau";
			case "CONDOM":
				return "Préservatif";
			case "DIAPHRAGM":
				return "Diaphragme";
			case "SPERMICIDE":
				return "Spermicide";
			case "NATURAL":
				return "Méthode naturelle";
			case "STERILIZATION":
				return "Stérilisation";
			case "NONE":
				return "Aucune";
			default:
				return "Non concerné(e) / Non renseigné(e)";
		}
	};

	const getTraumaAndFractureHistory = () => {
		const trauma = patient.traumaHistory;
		const fractures = patient.fracture_history;
		
		if (trauma && fractures) {
			return `${trauma} | ${fractures}`;
		}
		return trauma || fractures || null;
	};

	const personalInfoItems = [
		{
			label: (
				<span className="flex items-center gap-2 text-pink-600">
					<Users className="w-3 h-3 md:w-4 md:h-4 text-pink-500" />
					Statut marital
				</span>
			),
			value: translateMaritalStatus(patient.maritalStatus) || "Non renseigné",
		},
		{
			label: (
				<span className="flex items-center gap-2 text-blue-700">
					<Baby className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
					Enfants
				</span>
			),
			value: formatChildrenAges(patient.childrenAges || []),
		},
		{
			label: (
				<span className="flex items-center gap-2 text-green-500">
					<Hand className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
					Latéralité
				</span>
			),
			value: translateHandedness(patient.handedness) || "Non renseignée",
		},
		{
			label: (
				<span className="flex items-center gap-2 text-orange-700">
					<Cigarette className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
					Tabagisme
				</span>
			),
			value: getSmokerInfo() || "Non renseigné",
		},
		{
			label: (
				<span className="flex items-center gap-2 text-purple-700">
					<Heart className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />
					Contraception
				</span>
			),
			value: translateContraception(patient.contraception) || "Non concerné(e) / Non renseigné(e)",
		},
	];

	// Ajouter traumatismes et fractures s'il y en a
	const traumaHistory = getTraumaAndFractureHistory();
	if (traumaHistory) {
		personalInfoItems.push({
			label: (
				<span className="flex items-center gap-2 text-red-600">
					<AlertTriangle className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
					Traumatismes et fractures
				</span>
			),
			value: traumaHistory,
		});
	}

	return (
		<Card className="w-auto max-w-[400px] h-fit sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pb-8">
			<CardContent className="p-3 md:p-4 lg:p-5">
				<CardTitle className="text-sm md:text-base lg:text-lg font-bold mb-3 md:mb-4">
					Informations personnelles
				</CardTitle>
				
				<div className="space-y-3">
					{personalInfoItems.map((item, index) => (
						<div key={index} className="text-xs md:text-sm">
							<div className="font-medium text-muted-foreground mb-1">
								{item.label}
							</div>
							<div className="text-foreground">
								{item.value}
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
