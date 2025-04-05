
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface DemographicsCardProps {
  data: DashboardData;
}

export function DemographicsCard({ data }: DemographicsCardProps) {
  const genderData = [
    { name: "Hommes", value: data.maleCount, color: "#3b82f6" },
    { name: "Femmes", value: data.femaleCount, color: "#8b5cf6" }
  ];

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Démographie des patients</span>
          <span className="text-sm font-normal text-muted-foreground">
            {data.totalPatients} patients
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip formatter={(value) => [`${value} patients`, "Total"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Âge moyen (tout)</span>
                <span className="font-medium">{data.averageAge} ans</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${(data.averageAge / 100) * 100}%` }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hommes</span>
                <span className="font-medium">{data.averageAgeMale} ans</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(data.averageAgeMale / 100) * 100}%` }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Femmes</span>
                <span className="font-medium">{data.averageAgeFemale} ans</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(data.averageAgeFemale / 100) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
