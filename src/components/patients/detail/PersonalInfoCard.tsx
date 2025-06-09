import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Patient } from "@/types";
import {
	Users,
	Baby,
	Hand,
	Cigarette,
	Heart,
	AlertTriangle,
	Stethoscope,
} from "lucide-react";

interface PersonalInfoItem {
	label: JSX.Element;
	value: string;
	isColored?: boolean;
}

interface PersonalInfoCardProps {
	patient: Patient;
}

export function PersonalInfoCard({ patient }: PersonalInfoCardProps) {
	const { isMobile } = useIsMobile();

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

	// Fonction pour colorer les parties du texte selon le type médical
	const colorizeText = (text: string) => {
		// Définition des couleurs selon les catégories (comme dans MedicalAccordion)
		const patterns = [
			{
				pattern: /ORL:/g,
				replacement:
					'<span class="text-purple-600 dark:text-purple-400 font-semibold">ORL:</span>',
				category: "sensory",
			},
			{
				pattern: /Digestif:/g,
				replacement:
					'<span class="text-orange-600 dark:text-orange-400 font-semibold">Digestif:</span>',
				category: "digestive",
			},
			{
				pattern: /Allergies:/g,
				replacement:
					'<span class="text-red-600 dark:text-red-400 font-semibold">Allergies:</span>',
				category: "general",
			},
			{
				pattern: /Traitement:/g,
				replacement:
					'<span class="text-red-600 dark:text-red-400 font-semibold">Traitement:</span>',
				category: "general",
			},
			{
				pattern: /Chirurgie:/g,
				replacement:
					'<span class="text-red-600 dark:text-red-400 font-semibold">Chirurgie:</span>',
				category: "general",
			},
			{
				pattern: /Traumatismes:/g,
				replacement:
					'<span class="text-red-600 dark:text-red-400 font-semibold">Traumatismes:</span>',
				category: "general",
			},
			{
				pattern: /Fractures:/g,
				replacement:
					'<span class="text-red-600 dark:text-red-400 font-semibold">Fractures:</span>',
				category: "general",
			},
			{
				pattern: /Rhumatologie:/g,
				replacement:
					'<span class="text-red-600 dark:text-red-400 font-semibold">Rhumatologie:</span>',
				category: "general",
			},
			{
				pattern: /Dentaire:/g,
				replacement:
					'<span class="text-purple-600 dark:text-purple-400 font-semibold">Dentaire:</span>',
				category: "sensory",
			},
			{
				pattern: /Sommeil:/g,
				replacement:
					'<span class="text-green-600 dark:text-green-400 font-semibold">Sommeil:</span>',
				category: "lifestyle",
			},
			{
				pattern: /Gynécologique:/g,
				replacement:
					'<span class="text-pink-600 dark:text-pink-400 font-semibold">Gynécologique:</span>',
				category: "reproductive",
			},
		];

		let colorizedText = text;
		patterns.forEach(({ pattern, replacement }) => {
			colorizedText = colorizedText.replace(pattern, replacement);
		});

		return colorizedText;
	};

	// Collecte de tous les problèmes médicaux
	const getMedicalProblems = () => {
		const problems = [];

		if (patient.entProblems) problems.push(`ORL: ${patient.entProblems}`);
		if (patient.digestiveProblems)
			problems.push(`Digestif: ${patient.digestiveProblems}`);
		if (patient.allergies && patient.allergies !== "NULL")
			problems.push(`Allergies: ${patient.allergies}`);
		if (patient.currentTreatment)
			problems.push(`Traitement: ${patient.currentTreatment}`);
		if (patient.surgicalHistory)
			problems.push(`Chirurgie: ${patient.surgicalHistory}`);
		if (patient.traumaHistory) patient.fracture_history;
		problems.push(
			`Traumatismes: ${patient.traumaHistory}, ${patient.fracture_history}`
		);
		if (patient.fracture_history)
			problems.push(`Fractures: ${patient.fracture_history}`);
		if (patient.rheumatologicalHistory)
			problems.push(`Rhumatologie: ${patient.rheumatologicalHistory}`);
		if (
			patient.dental_health &&
			(patient.dental_health.toLowerCase().includes("problème") ||
				patient.dental_health.toLowerCase().includes("douleur"))
		) {
			problems.push(`Dentaire: ${patient.dental_health}`);
		}
		if (
			patient.sleep_quality &&
			(patient.sleep_quality.toLowerCase().includes("mauvais") ||
				patient.sleep_quality.toLowerCase().includes("trouble"))
		) {
			problems.push(`Sommeil: ${patient.sleep_quality}`);
		}
		if (patient.gynecological_history)
			problems.push(`Gynécologique: ${patient.gynecological_history}`);

		return problems;
	};

	const personalInfoItems: PersonalInfoItem[] = [
		{
			label: (
				<span className="flex items-center gap-2 text-pink-600">
					<Users className="w-3 h-3 md:w-4 md:h-4 text-pink-500" />
					Statut marital
				</span>
			),
			value:
				translateMaritalStatus(patient.maritalStatus) ||
				"Non renseigné",
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
			value:
				translateContraception(patient.contraception) ||
				"Non concerné(e) / Non renseigné(e)",
		},
		{
			label: (
				<span className="flex items-center gap-2 text-teal-700">
					<Stethoscope className="w-3 h-3 md:w-4 md:h-4 text-teal-500" />
					Médecin généraliste
				</span>
			),
			value: patient.generalPractitioner || "Non renseigné",
		},
	];

	// Ajouter les problèmes médicaux s'il y en a
	const medicalProblems = getMedicalProblems();
	if (medicalProblems.length > 0) {
		personalInfoItems.push({
			label: (
				<span className="flex items-center gap-2 text-red-600">
					<AlertTriangle className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
					Problèmes médicaux
				</span>
			),
			value: `<ul class="list-disc list-inside space-y-1">${medicalProblems
				.map((p) => `<li>${p}</li>`)
				.join("")}</ul>`,
			isColored: true, // Marquer cet item pour la colorisation
		});
	}

	// Ajouter traumatismes et fractures s'il y en a (en plus des problèmes médicaux pour les cas où ils ne sont pas déjà inclus)
	const traumaHistory = getTraumaAndFractureHistory();
	if (
		traumaHistory &&
		!medicalProblems.some(
			(p) => p.includes("Traumatismes") || p.includes("Fractures")
		)
	) {
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

	// Modifier le comportement sticky pour éviter le chevauchement avec PatientInfo
	const getStickyClasses = () => {
		if (isMobile) {
			return ""; // Pas de sticky sur mobile
		}
		// Sur desktop, positionner en dessous de la PatientInfo card
		// PatientInfo fait environ 300px + padding, on ajoute une marge de sécurité
		return (
			"sticky self-start max-h-[calc(100vh-25rem)] overflow-y-auto pb-8" +
			" top-[30rem]"
		); // Position en dessous de PatientInfo
	};

	return (
		<Card className={`w-auto max-w-[400px] h-fit ${getStickyClasses()}`}>
			<CardContent className="p-3 md:p-4 lg:p-5">
				<CardTitle className="text-sm md:text-base lg:text-lg font-bold mb-3 md:mb-4">
					Informations générales
				</CardTitle>

				<div className="space-y-3">
					{personalInfoItems.map((item, index) => (
						<div key={index} className="text-xs md:text-sm">
							<div className="font-medium text-muted-foreground mb-1">
								{item.label}
							</div>
							<div className="text-foreground">
								{item.isColored ? (
									<span
										dangerouslySetInnerHTML={{
											__html: colorizeText(item.value),
										}}
									/>
								) : (
									item.value
								)}
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
