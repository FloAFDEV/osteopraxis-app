
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
    <Card className={cn("overflow-hidden border rounded-xl shadow-sm hover:shadow-md transition-all duration-300", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
          {icon && <div className="p-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20">{icon}</div>}
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500">
            {value}
          </div>
          
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
          
          {change && (
            <div className="flex items-center mt-2">
              <div 
                className={cn(
                  "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                  changeDirection === 'up' ? "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400" : 
                  changeDirection === 'down' ? "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400" : 
                  "text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400"
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
          <div className="mt-3 pt-3 border-t border-border/40">
            <p className="text-xs text-muted-foreground">{explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
