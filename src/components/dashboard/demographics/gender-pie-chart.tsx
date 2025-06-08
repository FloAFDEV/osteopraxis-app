import { useIsMobile } from "@/hooks/use-mobile";
import { ChartPie } from "lucide-react";
import React from "react";
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	TooltipProps,
} from "recharts";

export interface GenderChartData {
	name: string;
	value: number;
	percentage: number;
	icon: React.ReactNode;
}

interface GenderPieChartProps {
	chartData: GenderChartData[];
	totalPatients: number;
}

export const GENDER_COLORS = {
	Homme: "#3b82f6", // bleu-500
	Femme: "#8b5cf6", // violet-500
	Enfant: "#10b981", // émeraude-500
	"Non spécifié": "#6b7280", // gris-500
};

const CustomMinimalTooltip = ({ active, payload }: TooltipProps<any, any>) => {
	if (!active || !payload || payload.length === 0) return null;

	return (
		<div className="rounded-md border bg-white px-3 py-2 text-sm text-gray-800 shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
			<p className="font-medium mb-1">{payload[0].name || "Détail"}</p>
			{payload.map((entry, index) => {
				const bgColor =
					entry.color ||
					entry.payload.color ||
					entry.payload.fill ||
					"#6b7280"; // fallback gris

				return (
					<div key={index} className="flex items-center gap-2">
						<span
							className="inline-block w-3 h-3 rounded-sm"
							style={{ backgroundColor: bgColor }}
						/>
						<span>
							{entry.name}: {entry.value} (
							{entry.payload.percentage}%)
						</span>
					</div>
				);
			})}
		</div>
	);
};

export const GenderPieChart: React.FC<GenderPieChartProps> = ({
	chartData,
}) => {
	const { isMobile } = useIsMobile();

	const validChartData =
		chartData?.filter((item) => item && item.value > 0) || [];

	if (!validChartData.length) {
		return (
			<div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
				<ChartPie className="h-12 w-12 mb-2" />
				<p>Aucune donnée démographique disponible</p>
			</div>
		);
	}

	// Injection de la couleur dans chaque élément du dataset
	const chartDataWithColors = validChartData.map((item) => ({
		...item,
		color:
			GENDER_COLORS[item.name as keyof typeof GENDER_COLORS] || "#6b7280",
	}));

	const renderCustomizedLabel = ({
		cx,
		cy,
		midAngle,
		innerRadius,
		outerRadius,
		percent,
	}: any) => {
		if (percent < 0.05) return null;
		const RADIAN = Math.PI / 180;
		const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);

		return (
			<text
				x={x}
				y={y}
				fill="white"
				fontWeight="bold"
				fontSize="14"
				dominantBaseline="central"
				textAnchor="middle"
			>
				{`${(percent * 100).toFixed(0)}%`}
			</text>
		);
	};

	const CustomLegend = ({ payload }: any) => {
		if (!payload) return null;
		return (
			<ul className="flex flex-wrap justify-center gap-4 pt-4">
				{payload.map((entry: any, index: number) => (
					<li
						key={`legend-${index}`}
						className="flex items-center gap-2"
					>
						<div
							className="h-3 w-3 rounded-full"
							style={{ backgroundColor: entry.color }}
						/>
						<span className="text-sm cursor-help">
							{entry.value} ({entry.payload.percentage}%)
						</span>
					</li>
				))}
			</ul>
		);
	};

	return (
		<div className="h-[300px] mt-4">
			<ResponsiveContainer width="100%" height="100%" debounce={1}>
				<PieChart>
					<Pie
						data={chartDataWithColors}
						cx="50%"
						cy="50%"
						labelLine={false}
						label={renderCustomizedLabel}
						outerRadius={isMobile ? 80 : 110}
						fill="#8884d8"
						dataKey="value"
						nameKey="name"
					>
						{chartDataWithColors.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.color} />
						))}
					</Pie>

					<Tooltip content={<CustomMinimalTooltip />} />

					<Legend content={<CustomLegend />} />
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
};
