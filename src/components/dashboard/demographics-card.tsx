
import React from 'react';
import { User, UserRound, Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export interface DemographicsCardProps {
  maleCount: number;
  femaleCount: number;
  otherCount: number;
}

export function DemographicsCard({ maleCount, femaleCount, otherCount }: DemographicsCardProps) {
  const total = maleCount + femaleCount + otherCount;
  
  const data = [
    {
      name: 'Hommes',
      value: maleCount,
      color: '#3b82f6',
      icon: <User className="h-4 w-4 text-blue-500" />
    },
    {
      name: 'Femmes',
      value: femaleCount,
      color: '#ec4899',
      icon: <UserRound className="h-4 w-4 text-pink-500" />
    },
    {
      name: 'Autres',
      value: otherCount,
      color: '#a855f7',
      icon: <Users className="h-4 w-4 text-purple-500" />
    }
  ].filter(item => item.value > 0);

  const getPercentage = (value: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-[200px] mb-4">
        {total > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} (${getPercentage(value)}%)`, 'Patients']}
                labelFormatter={(label) => `${label}`}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center">
              {item.icon}
              <span className="ml-2 text-sm">{item.name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium">{item.value}</span>
              <span className="text-xs text-muted-foreground ml-1">
                ({getPercentage(item.value)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
