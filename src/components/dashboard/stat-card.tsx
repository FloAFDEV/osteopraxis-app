
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  explanation?: string;
  change?: string;
  changeDirection?: 'up' | 'down' | 'neutral';
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  subtitle, 
  explanation, 
  change,
  changeDirection = 'neutral' 
}: StatCardProps) {
  return (
    <Card className="overflow-hidden border-t-4 border-t-blue-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="font-medium text-sm text-gray-800 dark:text-gray-100">
            {title}
            {explanation && (
              <div className="tooltip">
                <span className="ml-1 text-gray-400 cursor-help text-xs">ⓘ</span>
                <span className="tooltiptext bg-blue-500 text-white text-xs rounded-xl p-2 w-48">
                  {explanation}
                </span>
              </div>
            )}
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
            {icon}
          </div>
        </div>
        
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {value}
        </div>
        
        {subtitle && <div className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>}
        
        {change && (
          <div className={`text-sm mt-2 flex items-center gap-1 
            ${changeDirection === 'up' ? 'text-green-600 dark:text-green-400' : 
              changeDirection === 'down' ? 'text-red-600 dark:text-red-400' : 
              'text-blue-600 dark:text-blue-400'}`}>
            {changeDirection === 'up' && <ArrowUpIcon className="h-3 w-3" />}
            {changeDirection === 'down' && <ArrowDownIcon className="h-3 w-3" />}
            {change}
          </div>
        )}
      </CardContent>
      <style jsx>{`
        .tooltip {
          position: relative;
          display: inline-block;
        }
        
        .tooltip .tooltiptext {
          visibility: hidden;
          position: absolute;
          z-index: 1;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.3s;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          white-space: normal;
        }
        
        .tooltip:hover .tooltiptext {
          visibility: visible;
          opacity: 1;
        }
      `}</style>
    </Card>
  );
}
