import {
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
	Tooltip as UITooltip,
} from "@/components/ui/tooltip";
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

// Couleurs plus douces (500) pour cohérence design
export const GENDER_COLORS = {
	Homme: "#3b82f6", // blue-500
	Femme: "#8b5cf6", // purple-500
	Enfant: "#10b981", // emerald-500
	"Non spécifié": "#6b7280", // gray-500
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

	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-cyan-600 p-3 rounded-md shadow text-white space-y-2">
					<p className="font-medium">{data.name}s</p>
					<p className="text-sm">
						<span className="text-white">{data.value} </span>
						patients
					</p>
					<p className="text-sm">{data.percentage}% du total</p>
				</div>
			);
		}
		return null;
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
						<TooltipProvider>
							<UITooltip>
								<TooltipTrigger asChild>
									<span className="text-sm cursor-help">
										{entry.value} (
										{entry.payload.percentage}%)
									</span>
								</TooltipTrigger>
								<TooltipContent>
									<p>
										{entry.payload.value} patients (
										{entry.payload.percentage}% du total)
									</p>
								</TooltipContent>
							</UITooltip>
						</TooltipProvider>
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
						data={validChartData}
						cx="50%"
						cy="50%"
						labelLine={false}
						label={renderCustomizedLabel}
						outerRadius={isMobile ? 100 : 130}
						fill="#8884d8"
						dataKey="value"
						nameKey="name"
					>
						{validChartData.map((entry, index) => (
							<Cell
								key={`cell-${index}`}
								fill={
									GENDER_COLORS[
										entry.name as keyof typeof GENDER_COLORS
									] || "#6b7280"
								}
							/>
						))}
					</Pie>
					<Tooltip content={<CustomTooltip />} />
					<Legend content={<CustomLegend />} />
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
};
