import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedStats } from "@/services/stats/advanced-stats-service";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface RevenueChartProps {
	data: AdvancedStats["revenue"]["monthlyBreakdown"];
}

export function RevenueChart({ data }: RevenueChartProps) {
	const chartData = data.map((item) => ({
		month: item.month,
		revenus: item.amount,
		factures: item.count,
	}));

	return (
		<Card className="border-l-4 border-l-green-500">
			<CardHeader>
				<CardTitle className="text-green-700 dark:text-green-300">
					Évolution des Revenus (12 derniers mois)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<LineChart data={chartData} width={600} height={300}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="hsl(var(--muted-foreground))"
							opacity={0.3}
						/>
						<XAxis
							dataKey="month"
							fontSize={12}
							tickMargin={10}
							stroke="hsl(var(--muted-foreground))"
						/>
						<YAxis
							fontSize={12}
							tickFormatter={(value) => `${value}€`}
							stroke="hsl(var(--muted-foreground))"
						/>
						<Tooltip
							formatter={(value: number, name: string) => [
								name === "revenus"
									? `${value.toFixed(2)}€`
									: `${value}`,
								name === "revenus" ? "Revenus" : "Factures",
							]}
							labelStyle={{ color: "hsl(var(--foreground))" }}
							contentStyle={{
								backgroundColor: "hsl(var(--background))",
								border: "1px solid hsl(var(--border))",
								borderRadius: "8px",
								boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
							}}
						/>
						<Line
							type="monotone"
							dataKey="revenus"
							stroke="#10b981"
							strokeWidth={2}
							dot={{
								stroke: "#10b981",
								strokeWidth: 2,
								r: 3,
								fill: "#ffffff", 
							}}
							activeDot={{
								r: 5,
								stroke: "#10b981",
								strokeWidth: 2,
								fill: "#ffffff",
							}}
						/>
					</LineChart>
			</CardContent>
		</Card>
	);
}
