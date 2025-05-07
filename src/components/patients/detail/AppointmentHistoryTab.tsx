import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TooltipContent, TooltipProvider, TooltipTrigger, Tooltip } from "@/components/ui/tooltip";
import { Appointment, AppointmentStatus } from "@/types";
import { formatAppointmentTime } from "@/utils/date-utils";
import { format } from "date-fns";
import { Activity, Edit, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AppointmentStatusDropdown } from "./AppointmentStatusDropdown";
interface AppointmentHistoryTabProps {
  appointments: Appointment[];
  onStatusChange: (appointmentId: number, status: AppointmentStatus) => Promise<void>;
  viewMode: "cards" | "table";
  setViewMode: (mode: "cards" | "table") => void;
}
export function AppointmentHistoryTab({
  appointments,
  onStatusChange,
  viewMode,
  setViewMode
}: AppointmentHistoryTabProps) {
  return <div className="space-y-4 mt-6">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-semibold">
					Historique des séances
				</h3>
				<div className="flex space-x-2">
					<Button variant={viewMode === "cards" ? "default" : "outline"} size="sm" onClick={() => setViewMode("cards")}>
						Vue cards
					</Button>
					<Button variant={viewMode === "table" ? "default" : "outline"} size="sm" onClick={() => setViewMode("table")}>
						Vue tableau
					</Button>
				</div>
			</div>

			{appointments.length === 0 ? <div className="text-center py-8">
					<Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
					<h3 className="text-xl font-medium">Aucun historique</h3>
					<p className="text-muted-foreground mt-2">
						Ce patient n'a pas d'historique de séance.
					</p>
				</div> : viewMode === "cards" ? <div className="grid gap-4">
					{appointments.map(appointment => <div key={appointment.id} className="border rounded-lg p-4">
							<div className="flex justify-between items-center mb-2">
								<div>
									<h3 className="font-medium">
										{format(new Date(appointment.date), "dd/MM/yyyy")}
									</h3>
									<p className="text-sm text-muted-foreground">
										{formatAppointmentTime(appointment.date)}
									</p>
								</div>
								<AppointmentStatusDropdown status={appointment.status as AppointmentStatus} onStatusChange={status => onStatusChange(appointment.id, status)} />
							</div>
							<div className="mt-1 text-sm">
								<span className="font-medium">Motif:</span> {appointment.reason}
							</div>
							{appointment.notes && <div className="mt-2 pl-3 border-l-2 border-purple-200">
									<p className="text-sm text-muted-foreground italic whitespace-pre-line">
										<span className="font-medium text-purple-700 dark:text-purple-400">hdlm: </span>
										{appointment.notes}
									</p>
								</div>}
							<div className="mt-4 flex justify-end gap-2">
								<Button variant="outline" size="sm" asChild>
									<Link to={`/appointments/${appointment.id}/edit`}>
										<Edit className="mr-1 h-4 w-4" />
										Détails
									</Link>
								</Button>
							</div>
						</div>)}
				</div> : <div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Heure</TableHead>
								<TableHead>Motif</TableHead>
								<TableHead>Statut</TableHead>
								<TableHead>Hdlm</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{appointments.map(appointment => <TableRow key={appointment.id}>
									<TableCell className="font-medium">
										{format(new Date(appointment.date), "dd/MM/yyyy")}
									</TableCell>
									<TableCell>
										{formatAppointmentTime(appointment.date)}
									</TableCell>
									<TableCell>{appointment.reason}</TableCell>
									<TableCell>
										<AppointmentStatusDropdown status={appointment.status as AppointmentStatus} onStatusChange={status => onStatusChange(appointment.id, status)} />
									</TableCell>
									<TableCell>
										{appointment.notes ? <TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button variant="ghost" size="sm" className="h-8 flex items-center gap-1" onClick={() => {
                      toast.info(<div>
																		<h3 className="font-medium mb-1">
																			Notes de séance
																		</h3>
																		<p className="whitespace-pre-line text-sm">
																			<span className="font-medium text-purple-700 dark:text-purple-400">hdlm: </span>
																			{appointment.notes}
																		</p>
																	</div>, {
                        duration: 10000
                      });
                    }}>
															<MessageSquare className="h-3 w-3" />
															Voir
														</Button>
													</TooltipTrigger>
													<TooltipContent>
														<p className="max-w-xs">
															<span className="font-medium text-purple-700 dark:text-purple-400">hdlm: </span>
															{appointment.notes.slice(0, 60)}
															{appointment.notes.length > 60 ? "..." : ""}
														</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider> : <span className="text-muted-foreground text-sm">
												Aucune
											</span>}
									</TableCell>
									<TableCell className="text-right">
										<Button variant="outline" size="sm" asChild className="h-8">
											<Link to={`/appointments/${appointment.id}/edit`}>
												Détails
											</Link>
										</Button>
									</TableCell>
								</TableRow>)}
						</TableBody>
					</Table>
				</div>}
		</div>;
}