
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
	}[];
	defaultOpen?: boolean;
	priority?: "high" | "medium" | "low";
}

interface MedicalAccordionProps {
	sections: MedicalSectionProps[];
}

export function MedicalAccordion({ sections }: MedicalAccordionProps) {
	const getPriorityColor = (priority?: string) => {
		switch (priority) {
			case "high": return "text-red-600";
			case "medium": return "text-amber-600";
			case "low": return "text-gray-600";
			default: return "text-blue-600";
		}
	};

	const getDefaultValue = () => {
		const highPrioritySections = sections
			.filter(section => section.defaultOpen || section.priority === "high")
			.map((_, index) => `section-${index}`);
		return highPrioritySections;
	};

	return (
		<Accordion 
			type="multiple" 
			defaultValue={getDefaultValue()}
			className="space-y-2"
		>
			{sections.map((section, index) => {
				const Icon = section.icon;
				const hasImportantItems = section.items.some(item => item.isImportant && item.value);
				
				return (
					<AccordionItem 
						key={`section-${index}`} 
						value={`section-${index}`}
						className="border rounded-lg"
					>
						<AccordionTrigger className="px-4 py-3 hover:no-underline">
							<div className="flex items-center gap-3 text-left">
								<Icon className={`h-5 w-5 ${getPriorityColor(section.priority)}`} />
								<span className="font-medium">{section.title}</span>
								{hasImportantItems && (
									<Badge variant="destructive" className="ml-auto mr-2">
										Important
									</Badge>
								)}
							</div>
						</AccordionTrigger>
						<AccordionContent className="px-4 pb-3">
							<dl className="space-y-3">
								{section.items.map((item, itemIndex) => {
									if (!item.value) return null;
									
									return (
										<div key={itemIndex} className={item.isImportant ? "p-2 bg-red-50 dark:bg-red-900/10 rounded border-l-4 border-red-500" : ""}>
											<dt className="text-sm font-medium text-muted-foreground">
												{item.label}
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
	);
}
