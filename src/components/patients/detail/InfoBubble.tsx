
import { Badge } from "@/components/ui/badge";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface InfoBubbleProps {
	icon: LucideIcon;
	label: string;
	value: string | null | undefined;
	variant?: "default" | "warning" | "success" | "destructive";
	size?: "sm" | "md" | "lg";
	onClick?: () => void;
	showTooltip?: boolean;
}

export function InfoBubble({ 
	icon: Icon, 
	label, 
	value, 
	variant = "default",
	size = "md",
	onClick,
	showTooltip = false
}: InfoBubbleProps) {
	if (!value) return null;

	const sizeClasses = {
		sm: "text-xs px-2 py-1",
		md: "text-sm px-3 py-2", 
		lg: "text-base px-4 py-3"
	};

	const variantClasses = {
		default: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
		warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
		success: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
		destructive: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
	};

	const bubbleContent = (
		<div className={cn(
			"flex items-center gap-2 rounded-lg border transition-all duration-200",
			sizeClasses[size],
			variantClasses[variant],
			onClick ? "cursor-pointer hover:shadow-md hover:scale-105" : "",
		)}>
			<Icon className="h-4 w-4 flex-shrink-0" />
			<div className="flex flex-col min-w-0">
				<span className="font-medium text-xs opacity-75">{label}</span>
				<span className="font-semibold truncate">{value}</span>
			</div>
		</div>
	);

	const interactiveBubble = onClick ? (
		<div onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onClick();
			}
		}}>
			{bubbleContent}
		</div>
	) : bubbleContent;

	if (showTooltip && value && value.length > 30) {
		return (
			<CustomTooltip content={value} side="top">
				{interactiveBubble}
			</CustomTooltip>
		);
	}

	return interactiveBubble;
}
