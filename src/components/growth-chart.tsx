import { ChartWrapper } from "@/components/dashboard/chart/chart-wrapper";
import { DashboardData } from "@/types";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	LegendProps,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

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
					<span style={{ color: "#334155", fontSize: "14px" }}>
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
			title="Croissance mensuelle des patients"
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
					<XAxis dataKey="month" tick={{ fontSize: 12 }} />
					<YAxis tick={{ fontSize: 12 }} />
					<Tooltip
						formatter={(value, name) => [
							value,
							name === "patients"
								? "Patients"
								: "Année précédente",
						]}
						labelFormatter={(label) => `Mois: ${label}`}
						contentStyle={{
							backgroundColor: "var(--card)",
							borderColor: "var(--border)",
							borderRadius: "6px",
						}}
					/>
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
