
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardData, Patient } from "@/types";
import { ChartPie } from "lucide-react";
import React, { useEffect } from "react";
import { ChildrenStats } from "./demographics/children-stats";
import {
	calculateGenderData,
	isMinor,
} from "./demographics/gender-chart-utils";
import { GenderPieChart } from "./demographics/gender-pie-chart";
import { BlurredNumber } from "@/components/ui/blurred-amount";

interface DemographicsCardProps {
	patients?: Patient[];
	data?: DashboardData;
}

export const DemographicsCard: React.FC<DemographicsCardProps> = ({
	patients,
	data,
}) => {
	const { isMobile } = useIsMobile();
	const patientsList = patients || [];
	const totalPatients = patientsList.length || data?.totalPatients || 0;

	// Calculate children count directly from patients list or use the one from data
	const childrenCount = React.useMemo(() => {
		if (patientsList.length > 0) {
			const children = patientsList.filter(isMinor);

			return children.length;
		}

		return data?.childrenCount || 0;
	}, [patientsList, data?.childrenCount]);

	// Log the final children count for debugging
	useEffect(() => {}, [childrenCount, totalPatients]);

	const chartData = calculateGenderData(patientsList, totalPatients);

	// Add DEBUG: Log chart data just before rendering
	useEffect(() => {}, [chartData, patients, data]);

	const isLoading = (!patientsList || patientsList.length === 0) && !data;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[250px]">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				Répartition par genre sur un total de {totalPatients} patients
			</p>

			{chartData && chartData.length > 0 ? (
				<GenderPieChart
					chartData={chartData}
					totalPatients={totalPatients}
				/>
			) : (
				<div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
					<ChartPie className="h-12 w-12 mb-2" />
					<p>Aucune donnée démographique disponible</p>
				</div>
			)}

			{/* Children statistics summary - always displayed with real values */}
			<ChildrenStats
				childrenCount={childrenCount}
				totalPatients={totalPatients}
			/>
		</div>
	);
};
