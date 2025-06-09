
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

export function MedicalAccordion({ sections }: MedicalAccordionProps) {
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

	const getTitleColor = (category?: string) => {
		switch (category) {
			case "general":
				return "text-red-700 dark:text-red-300";
			case "lifestyle":
				return "text-green-700 dark:text-green-300";
			case "sensory":
				return "text-purple-700 dark:text-purple-300";
			case "digestive":
				return "text-orange-700 dark:text-orange-300";
			case "reproductive":
				return "text-pink-700 dark:text-pink-300";
			case "pediatric":
				return "text-sky-700 dark:text-sky-300";
			case "additional":
				return "text-gray-700 dark:text-gray-300";
			default:
				return "text-blue-700 dark:text-blue-300";
		}
	};

	const getDefaultValue = () => {
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
			(item) => item.isImportant && item.value
		);

		if (criticalItems.length > 0) {
			return {
				level: "critique",
				badge: "Critique",
				variant: "destructive" as const,
			};
		}
		if (importantItems.length >= 2) {
			return {
				level: "important",
				badge: "Important",
				variant: "destructive" as const,
			};
		}
		if (importantItems.length === 1) {
			return {
				level: "attention",
				badge: "Attention",
				variant: "warning" as const,
			};
		}
		return null;
	};

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
				defaultValue={getDefaultValue()}
				className="space-y-3"
			>
				{sections.map((section, index) => {
					const Icon = section.icon;
					const iconColor = getIconColor(section.category);
					const titleColor = getTitleColor(section.category);
					const importance = getImportanceLevel(section);

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
							<AccordionTrigger className="px-4 py-3 hover:no-underline bg-gray-50/80 dark:bg-gray-900/30 rounded-t-lg">
								<div className="flex items-center gap-3 text-left w-full">
									<Icon className={`h-5 w-5 ${iconColor}`} />
									<span className={`font-semibold text-base ${titleColor} flex-1`}>
										{section.title}
									</span>
									{importance && (
										<Badge
											variant={importance.variant}
											className="ml-auto"
										>
											{importance.badge}
										</Badge>
									)}
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4 bg-white/70 dark:bg-gray-800/50">
								<dl className="space-y-3 pt-2">
									{section.items.map((item, itemIndex) => {
										if (!item.value) return null;

										const isHighPriority =
											item.isCritical || item.isImportant;

										return (
											<div
												key={itemIndex}
												className={
													isHighPriority
														? `p-3 rounded border-l-4 ${
																item.isCritical
																	? "bg-red-50 dark:bg-red-900/10 border-red-500"
																	: " border-yellow-500"
														  }`
														: ""
												}
											>
												<dt className="text-sm font-medium text-muted-foreground">
													{item.label}
													{item.isCritical && (
														<Badge
															variant="destructive"
															className="ml-2 text-xs"
														>
															Critique
														</Badge>
													)}
													{item.isImportant &&
														!item.isCritical && (
															<Badge
																variant="warning"
																className="ml-2 text-xs"
															>
																Important
															</Badge>
														)}
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
