
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
	category?: "general" | "lifestyle" | "sensory" | "digestive" | "reproductive" | "pediatric" | "additional";
	sectionId?: string;
}

interface MedicalAccordionProps {
	sections: MedicalSectionProps[];
}

export function MedicalAccordion({ sections }: MedicalAccordionProps) {
	const getCategoryColors = (category?: string) => {
		switch (category) {
			case "general": 
				return {
					bg: "bg-red-50 dark:bg-red-950/20",
					border: "border-red-200 dark:border-red-800",
					icon: "text-red-600 dark:text-red-400",
					accent: "border-l-red-500"
				};
			case "lifestyle": 
				return {
					bg: "bg-green-50 dark:bg-green-950/20",
					border: "border-green-200 dark:border-green-800",
					icon: "text-green-600 dark:text-green-400",
					accent: "border-l-green-500"
				};
			case "sensory": 
				return {
					bg: "bg-purple-50 dark:bg-purple-950/20",
					border: "border-purple-200 dark:border-purple-800",
					icon: "text-purple-600 dark:text-purple-400",
					accent: "border-l-purple-500"
				};
			case "digestive": 
				return {
					bg: "bg-orange-50 dark:bg-orange-950/20",
					border: "border-orange-200 dark:border-orange-800",
					icon: "text-orange-600 dark:text-orange-400",
					accent: "border-l-orange-500"
				};
			case "reproductive": 
				return {
					bg: "bg-pink-50 dark:bg-pink-950/20",
					border: "border-pink-200 dark:border-pink-800",
					icon: "text-pink-600 dark:text-pink-400",
					accent: "border-l-pink-500"
				};
			case "pediatric": 
				return {
					bg: "bg-sky-50 dark:bg-sky-950/20",
					border: "border-sky-200 dark:border-sky-800",
					icon: "text-sky-600 dark:text-sky-400",
					accent: "border-l-sky-500"
				};
			case "additional": 
				return {
					bg: "bg-gray-50 dark:bg-gray-950/20",
					border: "border-gray-200 dark:border-gray-800",
					icon: "text-gray-600 dark:text-gray-400",
					accent: "border-l-gray-500"
				};
			default: 
				return {
					bg: "bg-blue-50 dark:bg-blue-950/20",
					border: "border-blue-200 dark:border-blue-800",
					icon: "text-blue-600 dark:text-blue-400",
					accent: "border-l-blue-500"
				};
		}
	};

	const getDefaultValue = () => {
		const highPrioritySections = sections
			.filter(section => section.defaultOpen || section.priority === "high")
			.map((_, index) => `section-${index}`);
		return highPrioritySections;
	};

	const getImportanceLevel = (section: MedicalSectionProps) => {
		const criticalItems = section.items.filter(item => item.isCritical && item.value);
		const importantItems = section.items.filter(item => item.isImportant && item.value);
		
		if (criticalItems.length > 0) {
			return { level: "critique", badge: "Critique", variant: "destructive" as const };
		}
		if (importantItems.length >= 2) {
			return { level: "important", badge: "Important", variant: "destructive" as const };
		}
		if (importantItems.length === 1) {
			return { level: "attention", badge: "Attention", variant: "warning" as const };
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
					const colors = getCategoryColors(section.category);
					const importance = getImportanceLevel(section);
					
					return (
						<AccordionItem 
							key={`section-${index}`} 
							value={`section-${index}`}
							className={`border rounded-lg transition-all duration-200 hover:shadow-sm ${colors.border}`}
							data-section={section.sectionId || section.title.toLowerCase().replace(/\s+/g, '-')}
						>
							<AccordionTrigger className={`px-4 py-3 hover:no-underline ${colors.bg} rounded-t-lg border-l-4 ${colors.accent}`}>
								<div className="flex items-center gap-3 text-left w-full">
									<Icon className={`h-5 w-5 ${colors.icon}`} />
									<span className="font-medium flex-1">{section.title}</span>
									{importance && (
										<Badge variant={importance.variant} className="ml-auto">
											{importance.badge}
										</Badge>
									)}
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4 bg-white dark:bg-gray-950/50">
								<dl className="space-y-3 pt-2">
									{section.items.map((item, itemIndex) => {
										if (!item.value) return null;
										
										const isHighPriority = item.isCritical || item.isImportant;
										
										return (
											<div key={itemIndex} className={isHighPriority ? 
												`p-3 rounded border-l-4 ${item.isCritical ? 
													'bg-red-50 dark:bg-red-900/10 border-red-500' : 
													'bg-amber-50 dark:bg-amber-900/10 border-amber-500'
												}` : ""
											}>
												<dt className="text-sm font-medium text-muted-foreground">
													{item.label}
													{item.isCritical && (
														<Badge variant="destructive" className="ml-2 text-xs">
															Critique
														</Badge>
													)}
													{item.isImportant && !item.isCritical && (
														<Badge variant="warning" className="ml-2 text-xs">
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
