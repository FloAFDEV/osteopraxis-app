
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Patient } from "@/types";
import { AlertTriangle, Activity, Heart, Users, Scissors, Bone, Stethoscope } from "lucide-react";

interface PersonalInfoCardProps {
	patient: Patient;
}

function getItemIcon(label: string) {
	// Associe chaque label à une icône adaptée
	switch (label) {
		case "Antécédents de traumatismes":
		case "Traumatismes":
			return <Activity className="w-4 h-4 text-red-400" />;
		case "Fractures":
			return <Bone className="w-4 h-4 text-yellow-600" />;
		case "Chirurgies":
			return <Scissors className="w-4 h-4 text-sky-700" />;
		case "Antécédents médicaux familiaux":
			return <Users className="w-4 h-4 text-purple-600" />;
		case "Antécédents cardiaques":
			return <Heart className="w-4 h-4 text-red-600" />;
		case "Antécédents pulmonaires":
			return <Stethoscope className="w-4 h-4 text-blue-700" />;
		case "Rhumatologie":
			return <AlertTriangle className="w-4 h-4 text-orange-600" />;
		case "Scoliose":
			return <AlertTriangle className="w-4 h-4 text-yellow-700" />;
		default:
			return <AlertTriangle className="w-4 h-4 text-gray-400" />;
	}
}

function getImportance(label: string, value: string | null) {
	if (!value) return null;
	if (label === "Antécédents cardiaques") {
		return { label: "Critique", variant: "destructive" as const };
	}
	// Les autres considérés comme importants
	return { label: "Important", variant: "warning" as const };
}

export function PersonalInfoCard({ patient }: PersonalInfoCardProps) {
	const getCombinedHistory = () => {
		const items: {
			label: string;
			value: string | null;
			// Add isImportant/isCritical if needed in the future
		}[] = [];

		if (patient.traumaHistory)
			items.push({ label: "Antécédents de traumatismes", value: patient.traumaHistory });
		if (patient.fracture_history)
			items.push({ label: "Fractures", value: patient.fracture_history });
		if (patient.surgicalHistory)
			items.push({ label: "Chirurgies", value: patient.surgicalHistory });
		if (patient.familyStatus)
			items.push({ label: "Antécédents médicaux familiaux", value: patient.familyStatus });
		if (patient.cardiac_history)
			items.push({ label: "Antécédents cardiaques", value: patient.cardiac_history });
		if (patient.pulmonary_history)
			items.push({ label: "Antécédents pulmonaires", value: patient.pulmonary_history });
		if (patient.rheumatologicalHistory)
			items.push({ label: "Rhumatologie", value: patient.rheumatologicalHistory });
		if (patient.scoliosis)
			items.push({ label: "Scoliose", value: patient.scoliosis });
		return items;
	};

	const antecedentsItems = getCombinedHistory();

	return (
		<Card className="w-auto max-w-[400px] h-fit">
			<CardContent className="p-3 md:p-4 lg:p-5">
				<CardTitle className="text-base md:text-lg font-bold mb-3 md:mb-4 flex gap-2 items-center text-red-700">
					<AlertTriangle className="w-5 h-5 text-red-500" />
					Antécédents importants
				</CardTitle>
				<div className="space-y-3">
					{antecedentsItems.length === 0 ? (
						<span className="text-sm text-gray-500">Aucun antécédent important renseigné</span>
					) : (
						antecedentsItems.map((item, idx) => {
							const importance = getImportance(item.label, item.value);
							const icon = getItemIcon(item.label);
							return (
								<div key={idx} className="text-xs md:text-sm flex gap-2 items-center">
									{icon}
									<span className="font-medium">{item.label} :</span>
									<span className="text-foreground">{item.value}</span>
									{importance && (
										<Badge variant={importance.variant} className="ml-2">{importance.label}</Badge>
									)}
								</div>
							);
						})
					)}
				</div>
			</CardContent>
		</Card>
	);
}
