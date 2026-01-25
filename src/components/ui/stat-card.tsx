import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
	title: string;
	value: string | number | React.ReactNode;
	description: string;
	color?: string; // ex: "text-blue-500"
	icon?: React.ReactNode;
	subtitle?: string;
}

const StatCard = ({
	title,
	value,
	description,
	color = "text-slate-500",
	icon,
	subtitle,
}: StatCardProps) => {
	return (
		<Card className="overflow-hidden rounded-md border-l-2 border-l-slate-300 dark:border-l-slate-600">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
				<div>
					<CardTitle className="text-xs font-medium text-muted-foreground leading-none">
						{title}
					</CardTitle>
					{subtitle && (
						<p className="text-xs text-muted-foreground mt-0.5 leading-none">
							{subtitle}
						</p>
					)}
				</div>
				{icon && (
					<div className={cn("h-5 w-5", color)}>
						{icon}
					</div>
				)}
			</CardHeader>

			<CardContent className="flex flex-col justify-between p-3 pt-0">
				<div className="text-lg font-semibold leading-none">{value}</div>
				<p className="text-xs text-muted-foreground mt-1 leading-none">
					{description}
				</p>
			</CardContent>
		</Card>
	);
};

export default StatCard;
