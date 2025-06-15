import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface MedicalSectionProps {
	title: string;
	icon: LucideIcon;
	items: {
		label: string;
		value: string | null | undefined;
		isImportant?: boolean;
		isCritical?: boolean;
		badge?: "critical" | "important" | null;
	}[];
	defaultOpen?: boolean;
	priority?: "high" | "medium" | "low";
	category?:
		| "general"
		| "lifestyle"
		| "sensory"
		| "digestive"
		| "reproductive"
		| "pediatric"
		| "additional";
	sectionId?: string;
}

interface MedicalAccordionProps {
	sections: MedicalSectionProps[];
}

const labelColorClasses: Record<string, string> = {
	"Antécédents de traumatismes": "text-red-400",
	"Traumatismes": "text-red-400",
	"Fractures": "text-yellow-600",
	"Chirurgies": "text-sky-700",
	"Antécédents médicaux familiaux": "text-purple-600",
	"Antécédents cardiaques": "text-red-600",
	"Antécédents pulmonaires": "text-blue-700",
	"Rhumatologie": "text-orange-600",
	"Scoliose": "text-yellow-700",
	// Ajoute d'autres si besoin pour nouveaux champs
};

const categoryTitleColorClasses: Record<string, string> = {
  "general": "text-red-700",
  "lifestyle": "text-green-700",
  "sensory": "text-purple-700",
  "digestive": "text-orange-700",
  "reproductive": "text-pink-700",
  "pediatric": "text-sky-700",
  "additional": "text-gray-700",
};

const getIconColor = (category?: string) => {
	switch (category) {
		case "general":
			return "text-red-600 dark:text-red-400";
		case "lifestyle":
			return "text-green-600 dark:text-green-400";
		case "sensory":
			return "text-purple-600 dark:text-purple-400";
		case "digestive":
			return "text-orange-600 dark:text-orange-400";
		case "reproductive":
			return "text-pink-600 dark:text-pink-400";
		case "pediatric":
			return "text-sky-600 dark:text-sky-400";
		case "additional":
			return "text-gray-600 dark:text-gray-400";
		default:
			return "text-blue-600 dark:text-blue-400";
	}
};

const getDefaultValue = (sections: MedicalSectionProps[]) => {
	const highPrioritySections = sections
		.filter(
			(section) => section.defaultOpen || section.priority === "high"
		)
		.map((_, index) => `section-${index}`);
	return highPrioritySections;
};

const getImportanceLevel = (section: MedicalSectionProps) => {
	const criticalItems = section.items.filter(
		(item) => item.isCritical && item.value
	);
	const importantItems = section.items.filter(
		(item) => item.isImportant && !item.isCritical && item.value
	);
	if (criticalItems.length > 0) {
		return {
			level: "critique",
			badge: "Critique",
			variant: "destructive" as const,
		};
	}
	if (importantItems.length > 0) {
		return {
			level: "important",
			badge: "Important",
			variant: "warning" as const,
		};
	}
	return null;
};

// Ajoute une fonction utilitaire locale pour savoir si la valeur est vraiment renseignée
function isValueFilled(value: string | null | undefined): boolean {
	if (value == null) return false;
	const trimmed = value.trim().toLowerCase();
	return (
		trimmed !== "" &&
		trimmed !== "non" &&
		trimmed !== "aucun" &&
		trimmed !== "non renseigné" &&
		trimmed !== "null" &&
		trimmed !== "-"
	);
}

export function MedicalAccordion({ sections }: MedicalAccordionProps) {
	return (
		<div className="space-y-3">
			<style>
				{`
					.highlight-section {
						animation: highlight 2s ease-in-out;
					}
					
					@keyframes highlight {
						0%, 100% { background-color: transparent; }
						50% { background-color: rgba(59, 130, 246, 0.1); }
					}
				`}
			</style>

			<Accordion
				type="multiple"
				defaultValue={getDefaultValue(sections)}
				className="space-y-3"
			>
				{sections.map((section, index) => {
					const Icon = section.icon;
					const iconColor = getIconColor(section.category);
					const titleColor = categoryTitleColorClasses[section.category ?? "general"] || "";

					return (
						<AccordionItem
							key={`section-${index}`}
							value={`section-${index}`}
							className="border rounded-lg transition-all duration-200 hover:shadow-sm border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/30"
							data-section={
								section.sectionId ||
								section.title.toLowerCase().replace(/\s+/g, "-")
							}
						>
							<AccordionTrigger className={`px-4 py-3 hover:no-underline bg-gray-50/80 dark:bg-gray-900/30 rounded-t-lg ${titleColor}`}>
								<div className="flex items-center gap-3 text-left w-full">
									<Icon className={`h-5 w-5 ${iconColor}`} />
									<span className={`font-medium flex-1 ${titleColor}`}>
										{section.title}
									</span>
									{/* plus de badge global section ici */}
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4 bg-white/70 dark:bg-gray-800/50">
								<dl className="space-y-3 pt-2">
									{section.items.map((item, itemIndex) => {
										if (!item.value) return null;

										const valueFilled = isValueFilled(item.value);

										let dtClass = "text-sm font-medium text-muted-foreground";
										let badge = null;
										// Afficher le badge critique/rouge UNIQUEMENT si la valeur est bien renseignée
										if (item.isCritical && valueFilled) {
											dtClass += " text-red-600";
											badge = (
												<Badge
													variant="destructive"
													className="ml-2 text-xs"
												>
													Critique
												</Badge>
											);
										} else if (item.isImportant) {
											dtClass += " text-yellow-700";
											badge = (
												<Badge
													variant="warning"
													className="ml-2 text-xs"
												>
													Important
												</Badge>
											);
										}
										// Si le champ est Critique mais valeur non renseigné, badge "important"/jaune si applicable (déjà géré par item.isImportant)

										return (
											<div
												key={itemIndex}
												className={
													item.isCritical && valueFilled
														? `p-3 rounded border-l-4 bg-red-50 dark:bg-red-900/10 border-red-500`
														: item.isImportant
															? "p-3 rounded border-l-4 bg-yellow-50 dark:bg-amber-900/10 border-yellow-500"
															: ""
												}
											>
												<dt className={dtClass}>
													{item.label}
													{badge}
												</dt>
												<dd className="mt-1 text-sm">
													{item.value}
												</dd>
											</div>
										);
									})}
								</dl>
							</AccordionContent>
						</AccordionItem>
					);
				})}
			</Accordion>
		</div>
	);
}
