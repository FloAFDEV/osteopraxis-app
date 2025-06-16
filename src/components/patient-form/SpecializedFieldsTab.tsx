import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Activity,
	Brain,
	ChevronDown,
	Cpu,
	Heart,
	Smile,
	TrendingUp,
} from "lucide-react";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";

interface SpecializedFieldsTabProps {
	form: UseFormReturn<PatientFormValues>;
}

export function SpecializedFieldsTab({ form }: SpecializedFieldsTabProps) {
	const renderTextareaCard = (
		title: string,
		name: keyof PatientFormValues,
		placeholder: string
	) => (
		<Card className="bg-muted/40 border rounded-lg">
			<CardHeader className="py-2 px-4">
				<CardTitle className="text-base font-semibold text-primary">
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent className="pb-3">
				<textarea
					className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2
		dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
	"
					{...form.register(name)}
					placeholder={placeholder}
				/>
			</CardContent>
		</Card>
	);

	const Section = ({
		title,
		icon: Icon,
		iconColor = "text-primary",
		children,
	}: {
		title: string;
		icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
		iconColor?: string;
		children: React.ReactNode;
	}) => {
		const [isOpen, setIsOpen] = React.useState(false);
		return (
			<Collapsible
				open={isOpen}
				onOpenChange={setIsOpen}
				className="space-y-2"
			>
				<CollapsibleTrigger asChild>
					<div className="flex items-center justify-between px-2 py-2 bg-muted hover:bg-muted/60 rounded-md cursor-pointer group">
						<div
							className={`flex items-center gap-2 text-lg font-semibold ${iconColor}`}
						>
							<Icon className="w-5 h-5" />
							<span className="text-muted-foreground">
								{title}
							</span>
						</div>
						<ChevronDown
							className={`transition-transform duration-300 group-hover:scale-110 text-muted-foreground ${
								isOpen ? "rotate-180" : ""
							}`}
						/>
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
						{children}
					</div>
				</CollapsibleContent>
			</Collapsible>
		);
	};

	return (
		<div className="p-0 md:p-2 space-y-8">
			<Section
				title="Cardio-Respiratoire"
				icon={Heart}
				iconColor="text-red-600 dark:text-red-400"
			>
				{renderTextareaCard(
					"Cardiaque",
					"cardiac_history",
					"Antécédents cardiaques"
				)}
				{renderTextareaCard(
					"Pulmonaire",
					"pulmonary_history",
					"Antécédents pulmonaires"
				)}
				{renderTextareaCard(
					"Examen vasculaire",
					"vascular_exam",
					"Examen vasculaire"
				)}
			</Section>

			<Section
				title="Neurologique"
				icon={Brain}
				iconColor="text-purple-600 dark:text-purple-400"
			>
				{renderTextareaCard(
					"Neurologique",
					"neurological_history",
					"Historique neurologique"
				)}
				{renderTextareaCard(
					"Neurodéveloppemental",
					"neurodevelopmental_history",
					"Historique neurodéveloppemental"
				)}
				{renderTextareaCard(
					"Examen nerfs crâniens",
					"cranial_nerve_exam",
					"Compte-rendu examen nerfs crâniens"
				)}
			</Section>

			<Section
				title="Musculo-squelettique"
				icon={TrendingUp}
				iconColor="text-green-600 dark:text-green-400"
			>
				{renderTextareaCard(
					"Historique musculo-sq.",
					"musculoskeletal_history",
					"Historique musculo-squelettique"
				)}
				{renderTextareaCard(
					"Examen membre inf.",
					"lower_limb_exam",
					"Examen membre inférieur"
				)}
				{renderTextareaCard(
					"Examen membre sup.",
					"upper_limb_exam",
					"Examen membre supérieur"
				)}
				{renderTextareaCard(
					"Examen épaule",
					"shoulder_exam",
					"Examen épaule"
				)}{" "}
				{renderTextareaCard("Scoliose", "scoliosis", "Scoliose")}
			</Section>

			<Section
				title="Crânien et Oro-facial"
				icon={Smile}
				iconColor="text-yellow-600 dark:text-yellow-400"
			>
				{renderTextareaCard(
					"Examen crânien",
					"cranial_exam",
					"Examen crânien"
				)}
				{renderTextareaCard(
					"Membranes crâniennes",
					"cranial_membrane_exam",
					"Membranes crâniennes"
				)}
				{renderTextareaCard(
					"Examen dentaire",
					"dental_exam",
					"Examen dentaire"
				)}
				{renderTextareaCard(
					"Masque facial",
					"facial_mask_exam",
					"Examen masque facial"
				)}
			</Section>

			<Section
				title="Pelvien / Gynéco-Uro"
				icon={Cpu}
				iconColor="text-pink-600 dark:text-pink-400"
			>
				{renderTextareaCard(
					"Pelvien / Gynéco-Uro",
					"pelvic_history",
					"Historique pelvien/gynéco-uro"
				)}
			</Section>

			<Section
				title="Tests fonctionnels"
				icon={Activity}
				iconColor="text-cyan-600 dark:text-cyan-400"
			>
				{renderTextareaCard(
					"Tests LMO",
					"lmo_tests",
					"Compte-rendu du diagnostic ostéopathique selon la méthode LMO (examen global, tests de mobilité, tests de tension, tests de douleur, tests de posture)"
				)}{" "}
				{renderTextareaCard(
					"Examen fascias",
					"fascia_exam",
					"Examen fascias"
				)}
			</Section>
		</div>
	);
}
