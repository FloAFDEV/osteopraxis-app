import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { ReactNode } from "react";
import { ChartLoader } from "./chart-loader";

interface ChartWrapperProps {
	title: ReactNode;
	subtitle?: string;
	isLoading?: boolean;
	children: ReactNode;
	height?: string;
}

/**
 * Composant wrapper pour les graphiques avec titre, sous-titre et gestion de l'état de chargement
 */
export const ChartWrapper: React.FC<ChartWrapperProps> = ({
	title,
	subtitle,
	isLoading = false,
	children,
	height = "400px",
}) => {
	return (
		<div className="w-full h-full">
			<Card className="overflow-hidden rounded-lg bg-gradient-to-r from-white to-gray-100 dark:bg-neutral-800 p-1 sm:p-1 shadow-lg h-full">
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center justify-between">
						<span>{title}</span>
						{subtitle && (
							<span className="text-sm font-normal text-muted-foreground">
								{subtitle}
							</span>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent className="flex-1 flex flex-col p-4">
					{isLoading ? <ChartLoader /> : children}
				</CardContent>
			</Card>
		</div>
	);
};
