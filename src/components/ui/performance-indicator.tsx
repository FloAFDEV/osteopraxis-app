import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, TrendingUp } from "lucide-react";
import { useOptimization } from "@/contexts/OptimizationContext";
import { Button } from "@/components/ui/button";

interface PerformanceIndicatorProps {
	showInProduction?: boolean;
}

export const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({
	showInProduction = false,
}) => {
	const [isVisible, setIsVisible] = useState(false);
	const [renderCount, setRenderCount] = useState(0);
	const { stats } = useOptimization();

	// Hide in production unless explicitly shown
	if (process.env.NODE_ENV === "production" && !showInProduction) {
		return null;
	}

	// Track renders (increment once to avoid render loop)
	useEffect(() => {
		setRenderCount((prev) => prev + 1);
	}, []);

	// Toggle visibility with keyboard shortcut
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (event.ctrlKey && event.shiftKey && event.key === "P") {
				setIsVisible((prev) => !prev);
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, []);

	if (!isVisible) {
		return (
			<div className="fixed bottom-4 right-4 z-50">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setIsVisible(true)}
					className="bg-background/80 backdrop-blur-sm"
				>
					<Activity className="h-4 w-4 mr-2" />
					Perf
				</Button>
			</div>
		);
	}

	return (
		<div className="fixed bottom-4 right-4 z-50 max-w-sm">
			<Card className="bg-background/95 backdrop-blur-sm border-primary/20 shadow-lg">
				<CardContent className="p-4">
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<TrendingUp className="h-4 w-4 text-primary" />
							<span className="font-semibold text-sm">
								Performance
							</span>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsVisible(false)}
							className="h-6 w-6 p-0"
						>
							×
						</Button>
					</div>

					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span>Cache Hit Rate:</span>
							<Badge
								variant={
									stats.cacheHitRate > 0.8
										? "default"
										: "secondary"
								}
							>
								{Math.round(stats.cacheHitRate * 100)}%
							</Badge>
						</div>

						<div className="space-y-1">
							<div className="flex justify-between">
								<span>Patients:</span>
								<Badge
									variant={
										stats.dataFreshness.patients === "fresh"
											? "default"
											: "outline"
									}
								>
									{stats.dataFreshness.patients}
								</Badge>
							</div>

							<div className="flex justify-between">
								<span>Appointments:</span>
								<Badge
									variant={
										stats.dataFreshness.appointments ===
										"fresh"
											? "default"
											: "outline"
									}
								>
									{stats.dataFreshness.appointments}
								</Badge>
							</div>

							<div className="flex justify-between">
								<span>Cabinets:</span>
								<Badge
									variant={
										stats.dataFreshness.cabinets === "fresh"
											? "default"
											: "outline"
									}
								>
									{stats.dataFreshness.cabinets}
								</Badge>
							</div>
						</div>

						<div className="flex justify-between">
							<span>Renders:</span>
							<span className="text-muted-foreground">
								{renderCount}
							</span>
						</div>
					</div>

					<div className="mt-3 pt-2 border-t border-border/50">
						<p className="text-sm text-muted-foreground">
							<Zap className="h-3 w-3 inline mr-1" />
							Press Ctrl+Shift+P to toggle
						</p>
						<p className="text-sm text-muted-foreground">
							Optimizations run automatically
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default PerformanceIndicator;
