
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Appointment, AppointmentStatus } from "@/types";
import { formatAppointmentTime } from "@/utils/date-utils";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { useState } from "react";
import { AppointmentStatusDropdown } from "./AppointmentStatusDropdown";

interface RecentAppointmentsCardProps {
	appointments: Appointment[];
	onStatusChange: (
		appointmentId: number,
		status: AppointmentStatus
	) => Promise<void>;
	onNavigateToHistory: () => void;
}

export function RecentAppointmentsCard({
	appointments,
	onStatusChange,
	onNavigateToHistory,
}: RecentAppointmentsCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	return (
		<Card className="mt-6">
			<CardContent className="p-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="font-semibold text-lg flex items-center gap-2">
						<MessageSquare className="h-5 w-5 text-purple-500" />
						Dernières séances et comptes rendus
					</h3>
					{appointments.length > 0 && (
						<Button
							variant="secondary"
							size="sm"
							onClick={toggleExpanded}
							aria-label="Afficher les séances récentes"
						>
							Séances récentes
							{isExpanded ? (
								<ChevronUp className="ml-2 h-4 w-4" />
							) : (
								<ChevronDown className="ml-2 h-4 w-4" />
							)}
						</Button>
					)}
				</div>

				{appointments.length === 0 ? (
					<p className="text-center text-muted-foreground py-4">
						Aucune séance passée
					</p>
				) : (
					isExpanded && (
						<Accordion
							type="single"
							collapsible
							className="w-full"
							defaultValue="appointments"
						>
							<AccordionItem
								value="appointments"
								className="border-none"
							>
								<AccordionTrigger className="py-2 hover:no-underline">
									<span className="text-sm font-medium">
										{appointments.length} séances récentes
									</span>
								</AccordionTrigger>
								<AccordionContent>
									<div className="space-y-4 max-h-80 overflow-y-auto pr-2 pt-2">
										{appointments
											.slice(0, 3)
											.map((appointment) => (
												<div
													key={appointment.id}
													className="border-b pb-3 last:border-0"
												>
													<div className="flex justify-between items-center">
														<div className="font-medium text-amber-800 dark:text-amber-500">
															{format(
																new Date(
																	appointment.date
																),
																"dd/MM/yyyy"
															)}{" "}
															-{" "}
															{formatAppointmentTime(
																appointment.date
															)}
														</div>
														<AppointmentStatusDropdown
															status={
																appointment.status as AppointmentStatus
															}
															onStatusChange={(
																status
															) =>
																onStatusChange(
																	appointment.id,
																	status
																)
															}
														/>
													</div>
													<div className="text-sm text-muted-foreground mt-1">
														Motif :{" "}
														{appointment.reason}
													</div>
													{appointment.notes && (
														<div className="mt-2 pl-3 border-l-2 border-purple-200">
															<p className="text-sm text-muted-foreground italic whitespace-pre-line">
																<span className="font-medium text-purple-700 dark:text-purple-400">
																	hdlm:{" "}
																</span>
																{
																	appointment.notes
																}
															</p>
														</div>
													)}
												</div>
											))}
									</div>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					)
				)}
				
				{appointments.length > 3 && (
					<div className="mt-4 flex justify-center">
						<Button 
							variant="outline" 
							size="sm" 
							onClick={onNavigateToHistory}
						>
							Voir l'historique complet
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
