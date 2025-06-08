import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardData } from "@/types";
import { useEffect, useState } from "react";
import {
	CartesianGrid,
	Legend,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	TooltipProps,
	XAxis,
	YAxis,
} from "recharts";
import { ChartWrapper } from "./chart/chart-wrapper";
import { CustomLegend } from "./chart/custom-legend";
import { NAME_MAP, renderGrowthLines } from "./chart/growth-chart-config";
import {
	ProcessedGrowthData,
	processGrowthData,
} from "./chart/growth-data-processor";

export const CustomMinimalTooltip = ({
	active,
	payload,
	label,
}: TooltipProps<any, any>) => {
	if (!active || !payload || payload.length === 0) return null;

	return (
		<div className="rounded-md border bg-white px-3 py-2 text-sm text-gray-800 shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
			<p className="font-medium mb-1">{label}</p>
			{payload.map((entry, index) => (
				<div key={index} className="flex items-center gap-2">
					<span
						className="inline-block w-2 h-2 rounded-full"
						style={{ backgroundColor: entry.color }}
					/>
					<span>
						{entry.name}: {entry.value}
					</span>
				</div>
			))}
		</div>
	);
};

interface GrowthChartProps {
	data: DashboardData;
}

/**
 * Graphique d'évolution de la croissance des patients
 */
export function GrowthChart({ data }: GrowthChartProps) {
	const { isMobile } = useIsMobile();
	const [chartData, setChartData] = useState<ProcessedGrowthData[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!data || !data.monthlyGrowth) return;

		const formattedData = processGrowthData(data);
		console.log("Données du graphique:", formattedData);

		setChartData(formattedData);
		setIsLoading(false);
	}, [data]);

	if (!data || !data.monthlyGrowth) {
		return (
			<ChartWrapper title="Croissance mensuelle" isLoading={true}>
				<div>Aucune donnée disponible</div>
			</ChartWrapper>
		);
	}

	return (
		<ChartWrapper
			title="Évolution mensuelle du nombre de patients"
			isLoading={isLoading}
		>
			<div className="w-full flex-1 min-h-0">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={chartData}
						margin={{
							top: 5,
							right: 10,
							left: isMobile ? 0 : 1,
							bottom: 20,
						}}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#ccc" />

						<XAxis
							dataKey="month"
							tick={{ fill: "#64748b", fontSize: 12 }}
						/>
						<YAxis
							tick={{ fill: "#64748b", fontSize: 12 }}
							domain={[0, "auto"]}
						/>

						{/* Utilisation du tooltip personnalisé */}
						<Tooltip content={<CustomMinimalTooltip />} />

						<Legend content={<CustomLegend nameMap={NAME_MAP} />} />

						{renderGrowthLines()}
					</LineChart>
				</ResponsiveContainer>
			</div>
		</ChartWrapper>
	);
}
