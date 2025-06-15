
import { Baby } from "lucide-react";
import React from "react";

interface ChildrenStatsProps {
	childrenCount: number;
	totalPatients: number;
}

export const ChildrenStats: React.FC<ChildrenStatsProps> = ({
	childrenCount,
	totalPatients,
}) => {
	// Calculer le pourcentage de mineurs (< 18 ans)
	const childrenPercentage =
		totalPatients > 0
			? Math.round((childrenCount / totalPatients) * 100)
			: 0;

	console.log(
		`ChildrenStats - mineursCount: ${childrenCount}, totalPatients: ${totalPatients}, percentage: ${childrenPercentage}`
	);

	return (
		<div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex justify-center">
			<div className="flex items-center gap-2 text-sm">
				<Baby className="h-4 w-4 text-emerald-600" />
				<span className="font-medium">Mineurs (-18 ans): </span>
				<span>
					{childrenCount} patient
					{childrenCount !== 1 ? "s" : ""} (
					{childrenPercentage}% du total)
				</span>
			</div>
		</div>
	);
};
