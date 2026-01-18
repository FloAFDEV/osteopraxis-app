import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';

interface DemoLimitationTooltipProps {
  children: React.ReactNode;
  limitation: string;
  onUpgrade?: () => void;
}

export function DemoLimitationTooltip({
  children,
  limitation,
  onUpgrade,
}: DemoLimitationTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative inline-block">
            {children}
            <Lock className="absolute -top-1 -right-1 h-4 w-4 text-gray-400" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs space-y-2">
            <p className="text-sm">{limitation}</p>
            {onUpgrade && (
              <button
                onClick={onUpgrade}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium"
              >
                Passer à la version Pro →
              </button>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
