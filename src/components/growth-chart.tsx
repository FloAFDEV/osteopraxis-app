import { ChartWrapper } from "@/components/dashboard/chart/chart-wrapper";
import { DashboardData } from "@/types";
import { ChartColumn } from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	LegendProps,
	ResponsiveContainer,
	Tooltip,
	TooltipProps,
	XAxis,
	YAxis,
} from "recharts";

export const CustomMinimalTooltip = ({
	active,
	payload,
	label,
}: TooltipProps<any, any>) => {
	if (!active || !payload || payload.length === 0) return null;

	return (
		<div
			className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm
             dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100"
		>
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

const CustomBarLegend = ({ payload }: LegendProps) => {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				gap: "32px",
				marginTop: "8px",
			}}
		>
			{payload?.map((entry, index) => (
				<div
					key={index}
					style={{
						display: "flex",
						alignItems: "center",
						gap: "6px",
					}}
				>
					<div
						style={{
							width: 10,
							height: 10,
							borderRadius: "50%",
							backgroundColor: entry.color,
						}}
					/>
					<span className="text-gray-700 dark:text-white text-sm">
						{entry.value}
					</span>
				</div>
			))}
		</div>
	);
};

export function GrowthChart({ data }: GrowthChartProps) {
	return (
		<ChartWrapper
			title={
				<span className="flex items-center gap-2">
					<ChartColumn className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
					Évolution mensuelle comparée du nombre de patients
				</span>
			}
			subtitle={`${data.newPatientsLastYear} nouveaux patients cette année`}
			isLoading={!data?.monthlyGrowth?.length}
		>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={data.monthlyGrowth}
					margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
				>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="var(--border)"
					/>
					<XAxis
						dataKey="month"
						tick={{ fontSize: 12, fill: "#9CA3AF" }}
					/>
					<YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} />
					<Tooltip content={<CustomMinimalTooltip />} />
					<Legend content={<CustomBarLegend />} />
					<Bar
						dataKey="patients"
						name="Cette année"
						fill="#2563eb"
						radius={[4, 4, 0, 0]}
					/>
					<Bar
						dataKey="prevPatients"
						name="Année précédente"
						fill="#9333ea"
						radius={[4, 4, 0, 0]}
					/>
				</BarChart>
			</ResponsiveContainer>
		</ChartWrapper>
	);
}
