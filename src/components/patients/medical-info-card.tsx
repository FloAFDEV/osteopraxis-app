
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface MedicalInfoCardProps {
	title: string;
	icon?: React.ReactNode;
	items: {
		label: string | JSX.Element;
		value: string | null | undefined;
		showSeparatorAfter?: boolean;
	}[];
}

export function MedicalInfoCard({ title, items, icon }: MedicalInfoCardProps) {
	return (
		<Card className="h-fit">
			<CardHeader className="pb-2 md:pb-3">
				<CardTitle className="text-base md:text-lg flex items-center gap-2">
					{icon}
					<span className="truncate">{title}</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="px-3 md:px-6 pb-3 md:pb-6 pt-0">
				<dl className="space-y-2 md:space-y-3">
					{items.map(
						({ label, value, showSeparatorAfter }, index) => (
							<div key={index}>
								<div>
									<dt className="text-xs md:text-sm font-medium text-muted-foreground leading-tight">
										{label}
									</dt>
									<dd className="mt-0.5 md:mt-1 text-xs md:text-sm leading-tight">
										{value || "Non spécifié"}
									</dd>
								</div>
								{showSeparatorAfter && (
									<Separator className="my-2 md:my-3" />
								)}
							</div>
						)
					)}
				</dl>
			</CardContent>
		</Card>
	);
}
