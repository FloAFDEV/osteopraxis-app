import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
	title: string;
	value: string | number;
	description: string;
	color?: string; // ex: "text-blue-500"
	icon?: React.ReactNode;
	subtitle?: string;
}

const StatCard = ({
	title,
	value,
	description,
	color = "text-blue-500",
	icon,
	subtitle,
}: StatCardProps) => {
	const colorName = color.replace("text-", "");

	return (
		<Card
			className={cn(
				"overflow-hidden rounded-lg shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-[2px]",
				"border-t-4",
				{
					"border-green-500": colorName === "green-500",
					"border-purple-500": colorName === "purple-500",
					"border-amber-500": colorName === "amber-500",
					"border-blue-500": colorName === "blue-500",
					"border-indigo-500": colorName === "indigo-500",
					"border-orange-500": colorName === "orange-500",
				}
			)}
		>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div>
					<CardTitle className="text-sm font-medium">
						{title}
					</CardTitle>
					{subtitle && (
						<p className="text-xs text-muted-foreground mt-0.5">
							{subtitle}
						</p>
					)}
				</div>
				{icon && (
					<div className={cn("h-7 w-7 font-medium", color)}>
						{icon}
					</div>
				)}
			</CardHeader>

			<CardContent className="flex flex-col justify-between h-24 pt-0">
				<div className="text-2xl font-bold">{value}</div>
				<p className={cn("text-xs text-muted-foreground", color)}>
					{description}
				</p>
			</CardContent>
		</Card>
	);
};

export default StatCard;
