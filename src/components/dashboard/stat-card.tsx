
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  change?: string;
  explanation?: string;
  subtitle?: string;
  className?: string;
  changeDirection?: 'up' | 'down' | 'neutral';
}

export const StatCard = ({
  title,
  value,
  icon,
  change,
  explanation,
  subtitle,
  className,
  changeDirection = 'neutral'
}: StatCardProps) => {
  return (
    <Card className={cn("overflow-hidden bg-card transition-all hover:shadow-lg", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
          {icon && <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">{icon}</div>}
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</div>
          
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
          
          {change && (
            <div className="flex items-center mt-2">
              <div 
                className={cn(
                  "flex items-center text-xs font-medium",
                  changeDirection === 'up' ? "text-green-500" : 
                  changeDirection === 'down' ? "text-red-500" : 
                  "text-gray-500"
                )}
              >
                {changeDirection === 'up' && <ArrowUpIcon className="mr-1 h-3 w-3" />}
                {changeDirection === 'down' && <ArrowDownIcon className="mr-1 h-3 w-3" />}
                {changeDirection === 'neutral' && <MinusIcon className="mr-1 h-3 w-3" />}
                {change}
              </div>
            </div>
          )}
        </div>
        
        {explanation && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">{explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
