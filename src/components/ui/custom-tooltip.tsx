
import * as React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CustomTooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  maxWidth?: string;
}

export function CustomTooltip({ 
  content, 
  children, 
  side = "top",
  maxWidth = "300px" 
}: CustomTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="z-[9999] max-w-xs p-3 text-sm break-words bg-popover border shadow-lg"
          style={{ maxWidth }}
          sideOffset={8}
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
