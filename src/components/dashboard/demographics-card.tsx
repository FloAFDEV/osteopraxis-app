
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
            <div className="h-[200px] bg-white dark:bg-slate-900 rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
                      const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                      return (
                        <text
                          x={x}
                          y={y}
                          fill={name === "Hommes" ? "#3b82f6" : "#8b5cf6"}
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          className="font-medium"
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
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    formatter={(value, entry, index) => (
                      <span style={{ color: index === 0 ? "#3b82f6" : "#8b5cf6", fontWeight: 500 }}>
                        {value}
                      </span>
                    )}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} patients`, "Total"]} 
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      padding: '8px 12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
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
              <div className="w-full h-3 bg-muted rounded-full">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${Math.min((data.averageAge / 100) * 100, 100)}%` }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hommes</span>
                <span className="font-medium">{data.averageAgeMale} ans</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((data.averageAgeMale / 100) * 100, 100)}%` }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Femmes</span>
                <span className="font-medium">{data.averageAgeFemale} ans</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min((data.averageAgeFemale / 100) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
