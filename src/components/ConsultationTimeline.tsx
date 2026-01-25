/**
 * Timeline des consultations et comptes-rendus
 * Affichage chronologique clair pour l'historique patient
 */

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, FileText, Clock, MapPin, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConsultationReport } from "@/types";

interface TimelineEvent {
	id: number;
	type: "consultation" | "appointment" | "note";
	date: string;
	title: string;
	description?: string;
	status?: "completed" | "upcoming" | "cancelled";
	cr?: ConsultationReport;
}

interface ConsultationTimelineProps {
	events: TimelineEvent[];
	onViewCR?: (cr: ConsultationReport) => void;
	className?: string;
}

export function ConsultationTimeline({
	events,
	onViewCR,
	className,
}: ConsultationTimelineProps) {
	if (events.length === 0) {
		return (
			<Card className={cn("p-12 text-center", className)}>
				<Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
				<p className="text-muted-foreground">
					Aucune consultation pour l'instant
				</p>
			</Card>
		);
	}

	return (
		<div className={cn("space-y-6", className)}>
			{events.map((event, index) => {
				const isLast = index === events.length - 1;
				const eventDate = new Date(event.date);

				return (
					<div key={event.id} className="relative flex gap-4">
						{/* Timeline bar */}
						{!isLast && (
							<div
								className="absolute left-5 top-12 w-0.5 h-full bg-border"
								aria-hidden="true"
							/>
						)}

						{/* Icon */}
						<div className="relative flex-shrink-0">
							<div
								className={cn(
									"h-10 w-10 rounded-full flex items-center justify-center",
									"bg-primary/10 border-2 border-background",
									event.status === "completed" &&
										"bg-green-50 dark:bg-green-950/30",
									event.status === "upcoming" &&
										"bg-blue-50 dark:bg-blue-950/30",
									event.status === "cancelled" &&
										"bg-gray-50 dark:bg-gray-950/30",
								)}
							>
								{event.type === "consultation" ? (
									<FileText className="h-5 w-5 text-primary" />
								) : (
									<Calendar className="h-5 w-5 text-primary" />
								)}
							</div>
						</div>

						{/* Content */}
						<Card className="flex-1">
							<CardContent className="p-4">
								{/* Header */}
								<div className="flex items-start justify-between mb-3">
									<div className="flex-1">
										<h3 className="font-semibold text-base mb-1">
											{event.title}
										</h3>
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<Clock className="h-3.5 w-3.5" />
											<time dateTime={event.date}>
												{format(
													eventDate,
													"EEEE d MMMM yyyy 'à' HH:mm",
													{ locale: fr },
												)}
											</time>
										</div>
									</div>

									{/* Status badge */}
									{event.status && (
										<Badge
											variant={
												event.status === "completed"
													? "default"
													: event.status ===
														  "upcoming"
														? "secondary"
														: "outline"
											}
											className="flex-shrink-0"
										>
											{event.status === "completed" &&
												"Terminé"}
											{event.status === "upcoming" &&
												"À venir"}
											{event.status === "cancelled" &&
												"Annulé"}
										</Badge>
									)}
								</div>

								{/* Description */}
								{event.description && (
									<p className="text-sm text-muted-foreground mb-3 leading-relaxed">
										{event.description}
									</p>
								)}

								{/* CR details (si consultation avec CR) */}
								{event.cr && (
									<div className="bg-muted/30 rounded-lg p-3 space-y-2">
										{/* Motif */}
										{event.cr.chiefComplaint && (
											<div className="text-sm">
												<span className="font-medium text-foreground">
													Motif :{" "}
												</span>
												<span className="text-muted-foreground">
													{event.cr.chiefComplaint}
												</span>
											</div>
										)}

										{/* Diagnostic */}
										{event.cr.diagnosis && (
											<div className="text-sm">
												<span className="font-medium text-foreground">
													Diagnostic :{" "}
												</span>
												<span className="text-muted-foreground">
													{event.cr.diagnosis}
												</span>
											</div>
										)}

										{/* Techniques utilisées */}
										{event.cr.techniquesUsed &&
											event.cr.techniquesUsed.length >
												0 && (
												<div className="text-sm">
													<span className="font-medium text-foreground block mb-1">
														Techniques :
													</span>
													<div className="flex flex-wrap gap-1">
														{event.cr.techniquesUsed
															.slice(0, 3)
															.map(
																(
																	technique,
																	i,
																) => (
																	<Badge
																		key={i}
																		variant="outline"
																		className="text-sm"
																	>
																		{
																			technique
																		}
																	</Badge>
																),
															)}
														{event.cr.techniquesUsed
															.length > 3 && (
															<Badge
																variant="outline"
																className="text-sm"
															>
																+
																{event.cr
																	.techniquesUsed
																	.length - 3}
															</Badge>
														)}
													</div>
												</div>
											)}

										{/* Action */}
										{onViewCR && (
											<Button
												variant="ghost"
												size="sm"
												className="w-full mt-2"
												onClick={() =>
													onViewCR(event.cr!)
												}
											>
												<FileText className="h-4 w-4 mr-2" />
												Voir le compte-rendu complet
											</Button>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				);
			})}
		</div>
	);
}

/**
 * Timeline compacte pour sidebar
 */
interface CompactTimelineProps {
	events: TimelineEvent[];
	maxItems?: number;
	className?: string;
}

export function CompactTimeline({
	events,
	maxItems = 5,
	className,
}: CompactTimelineProps) {
	const displayEvents = events.slice(0, maxItems);

	return (
		<div className={cn("space-y-3", className)}>
			{displayEvents.map((event, index) => {
				const eventDate = new Date(event.date);

				return (
					<div key={event.id} className="flex gap-3 items-start">
						<div
							className={cn(
								"h-2 w-2 rounded-full mt-2 flex-shrink-0",
								event.status === "completed" && "bg-green-500",
								event.status === "upcoming" && "bg-blue-500",
								event.status === "cancelled" && "bg-gray-400",
							)}
						/>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium truncate">
								{event.title}
							</p>
							<p className="text-sm text-muted-foreground">
								{format(eventDate, "d MMM yyyy", {
									locale: fr,
								})}
							</p>
						</div>
					</div>
				);
			})}

			{events.length > maxItems && (
				<p className="text-sm text-muted-foreground text-center pt-2">
					+{events.length - maxItems} consultations
				</p>
			)}
		</div>
	);
}
