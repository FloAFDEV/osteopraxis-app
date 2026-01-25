/**
 * Hero Stat - Stat principale XXL avec hiérarchie visuelle forte
 * Utilisé pour la métrique la plus importante du dashboard
 */

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HeroStatProps {
	label: string;
	value: string | number;
	icon: LucideIcon;
	trend?: {
		value: number;
		label: string;
		isPositive?: boolean;
	};
	description?: string;
	className?: string;
}

export function HeroStat({
	label,
	value,
	icon: Icon,
	trend,
	description,
	className,
}: HeroStatProps) {
	return (
		<Card className={cn("border-0 shadow-lg", className)}>
			<CardContent className="p-8">
				{/* Label + Icon */}
				<div className="flex items-center justify-between mb-4">
					<span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
						{label}
					</span>
					<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
						<Icon className="h-6 w-6 text-primary" />
					</div>
				</div>

				{/* Valeur principale XXL */}
				<div className="mb-2">
					<span className="text-6xl font-bold tracking-tight">
						{value}
					</span>
				</div>

				{/* Tendance */}
				{trend && (
					<div className="flex items-center gap-2 mb-2">
						<span
							className={cn(
								"text-sm font-semibold",
								trend.isPositive
									? "text-green-600 dark:text-green-400"
									: "text-red-600 dark:text-red-400",
							)}
						>
							{trend.isPositive ? "+" : ""}
							{trend.value}%
						</span>
						<span className="text-sm text-muted-foreground">
							{trend.label}
						</span>
					</div>
				)}

				{/* Description */}
				{description && (
					<p className="text-sm text-muted-foreground leading-relaxed">
						{description}
					</p>
				)}
			</CardContent>
		</Card>
	);
}

/**
 * Compact Stat - Stats secondaires medium
 * Utilisé pour les métriques complémentaires
 */
interface CompactStatProps {
	label: string;
	value: string | number;
	icon: LucideIcon;
	change?: string;
	className?: string;
}

export function CompactStat({
	label,
	value,
	icon: Icon,
	change,
	className,
}: CompactStatProps) {
	return (
		<Card className={cn("border-0 shadow", className)}>
			<CardContent className="p-6">
				<div className="flex items-center justify-between">
					<div className="flex-1">
						<p className="text-sm font-medium text-muted-foreground mb-1">
							{label}
						</p>
						<p className="text-3xl font-bold tracking-tight">
							{value}
						</p>
						{change && (
							<p className="text-sm text-muted-foreground mt-1">
								{change}
							</p>
						)}
					</div>
					<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
						<Icon className="h-5 w-5 text-primary" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
