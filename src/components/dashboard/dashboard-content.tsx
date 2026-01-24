import { DashboardData } from "@/types";
import { ChartLine } from "lucide-react";
import React, { useState } from "react";
import { GrowthChart as SimpleGrowthChart } from "../growth-chart";
import { GrowthChart as DashboardGrowthChart } from "./growth-chart";
import { CollapsibleSection } from "./CollapsibleSection";

interface DashboardContentProps {
	dashboardData: DashboardData;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
	dashboardData,
}) => {
	const [chartType, setChartType] = useState<"detailed" | "simple">(
		"detailed"
	);

	return (
		<CollapsibleSection
			title="Évolution de l'activité"
			icon={<ChartLine className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
			defaultOpen={true}
			storageKey="dashboard-activity-section"
			className="animate-fade-in animate-delay-300"
		>
			<div className="space-y-4">
				{/* Graphique avec hauteur fixe */}
				<div className="w-full h-[400px]">
					{chartType === "detailed" ? (
						<DashboardGrowthChart data={dashboardData} />
					) : (
						<SimpleGrowthChart data={dashboardData} />
					)}
				</div>

				{/* Bouton en bas */}
				<div className="flex items-center gap-2 justify-start">
					<span className="text-sm font-medium">
						Type de graphique :
					</span>

					<button
						type="button"
						aria-label={`Changer le type de graphique (actuellement : ${
							chartType === "detailed"
								? "Évolution mensuelle"
								: "Comparaison avec N-1"
						})`}
						onClick={() =>
							setChartType(
								chartType === "detailed"
									? "simple"
									: "detailed"
							)
						}
						className="relative w-44 h-9 text-xs rounded border border-gray-300 bg-gray-100 dark:text-gray-300 dark:bg-slate-700 perspective-[1000px] focus:outline-none"
					>
						<div
							className={`relative w-full h-full transition-transform duration-700 ease-&lsqb;cubic-bezier(0.4,0.0,0.2,1)&rsqb; [transform-style:preserve-3d] will-change-transform ${
								chartType === "simple"
									? "[transform:rotateY(180deg)]"
									: ""
							}`}
						>
							<div className="absolute inset-0 flex items-center justify-center px-2 font-bold text-center text-teal-700 dark:text-sky-400 [backface-visibility:hidden]">
								Évolution mensuelle
							</div>
							<div className="absolute inset-0 flex items-center justify-center px-2 font-bold text-center text-teal-700 dark:text-sky-400 [backface-visibility:hidden] [transform:rotateY(180deg)]">
								Comparaison avec N-1
							</div>
						</div>
					</button>
				</div>
			</div>
		</CollapsibleSection>
	);
};
