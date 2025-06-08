import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface MedicalInfoCardProps {
	title: string;
	icon?: React.ReactNode;
	items: {
		label: string | JSX.Element;
		value: string | null | undefined;
		showSeparatorAfter?: boolean; // ✅ Nouvelle prop pour afficher un séparateur après cet item
	}[];
}

export function MedicalInfoCard({ title, items, icon }: MedicalInfoCardProps) {
	return (
		<Card className="max-h-max overflow-y-auto">
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					{icon}
					<span>{title}</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="px-6 pb-6 pt-0">
				<dl className="space-y-3">
					{items.map(
						({ label, value, showSeparatorAfter }, index) => (
							<div key={index}>
								<div>
									<dt className="text-sm font-medium text-muted-foreground">
										{label}
									</dt>
									<dd className="mt-1 text-sm">
										{value || "Non spécifié"}
									</dd>
								</div>
								{showSeparatorAfter && (
									<Separator className="my-3" />
								)}
							</div>
						)
					)}
				</dl>
			</CardContent>
		</Card>
	);
}
