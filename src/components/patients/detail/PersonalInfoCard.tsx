
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Patient } from "@/types";
import { AlertTriangle, Activity, Heart, Users } from "lucide-react";

interface PersonalInfoCardProps {
	patient: Patient;
}

export function PersonalInfoCard({ patient }: PersonalInfoCardProps) {
	const getCombinedHistory = () => {
		const items: { label: string; value: string | null }[] = [];
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
						antecedentsItems.map((item, idx) => (
							<div key={idx} className="text-xs md:text-sm flex gap-1 items-center">
								<span className="font-medium">{item.label} :</span>
								<span className="text-foreground">{item.value}</span>
							</div>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}
