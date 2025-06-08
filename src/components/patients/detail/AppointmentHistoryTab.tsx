import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Appointment, AppointmentStatus, Invoice } from "@/types";
import { formatAppointmentTime } from "@/utils/date-utils";
import { format } from "date-fns";
import { Activity, Edit, MessageSquare, FileText, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AppointmentStatusDropdown } from "./AppointmentStatusDropdown";
import { useInvoiceByAppointment } from "@/hooks/useInvoiceByAppointment";

interface AppointmentHistoryTabProps {
	appointments: Appointment[];
	onStatusChange: (
		appointmentId: number,
		status: AppointmentStatus
	) => Promise<void>;
	viewMode: "cards" | "table";
	setViewMode: (mode: "cards" | "table") => void;
	invoices: Invoice[];
}

// Composant pour le bouton de facture avec logique améliorée
function InvoiceButton({ appointment, invoices }: { appointment: Appointment, invoices: Invoice[] }) {
	const existingInvoice = invoices.find(inv => inv.appointmentId === appointment.id);

	if (appointment.status === "COMPLETED") {
		if (existingInvoice) {
			return (
				<Button variant="outline" size="sm" asChild>
					<Link to={`/invoices/${existingInvoice.id}`}>
						<ExternalLink className="mr-1 h-4 w-4" />
						Voir facture
					</Link>
				</Button>
			);
		} else {
			return (
				<Button variant="outline" size="sm" asChild>
					<Link to={`/invoices/new?appointmentId=${appointment.id}`}>
						<FileText className="mr-1 h-4 w-4" />
						Créer facture
					</Link>
				</Button>
			);
		}
	}
	return null;
}

export function AppointmentHistoryTab({
	appointments,
	onStatusChange,
	viewMode,
	setViewMode,
	invoices,
}: AppointmentHistoryTabProps) {
	return (
		<div className="bg-white dark:bg-gray-800 p-3 border rounded-md shadow space-y-4 mt-6">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-semibold">
					Historique des séances
				</h3>
				<div className="flex space-x-2">
					<Button
						variant={viewMode === "cards" ? "default" : "outline"}
						size="sm"
						onClick={() => setViewMode("cards")}
					>
						Vue cards
					</Button>
					<Button
						variant={viewMode === "table" ? "default" : "outline"}
						size="sm"
						onClick={() => setViewMode("table")}
					>
						Vue tableau
					</Button>
				</div>
			</div>

			{appointments.length === 0 ? (
				<div className="text-center py-8">
					<Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
					<h3 className="text-xl font-medium">Aucun historique</h3>
					<p className="text-muted-foreground mt-2">
						Ce patient n'a pas d'historique de séance.
					</p>
				</div>
			) : viewMode === "cards" ? (
				<div className="grid gap-4">
					{appointments.map((appointment) => (
						<div
							key={appointment.id}
							className="border rounded-lg p-4"
						>
							<div className="flex justify-between items-center mb-2">
								<div>
									<h3 className="font-medium">
										{format(
											new Date(appointment.date),
											"dd/MM/yyyy"
										)}
									</h3>
									<p className="text-sm text-muted-foreground">
										{formatAppointmentTime(
											appointment.date
										)}
									</p>
								</div>
								<AppointmentStatusDropdown
									status={
										appointment.status as AppointmentStatus
									}
									onStatusChange={(status) =>
										onStatusChange(appointment.id, status)
									}
								/>
							</div>
							<div className="mt-1 text-sm">
								<span className="font-medium">Motif:</span>{" "}
								{appointment.reason}
							</div>
							{appointment.notes && (
								<div className="mt-2 pl-3 border-l-2 border-purple-200">
									<p className="text-sm text-muted-foreground italic whitespace-pre-line">
										<span className="font-medium text-purple-700 dark:text-purple-400">
											Compte-rendu:{" "}
										</span>
										{appointment.notes}
									</p>
								</div>
							)}
							<div className="mt-4 flex justify-end gap-2">
								<InvoiceButton appointment={appointment} invoices={invoices} />
								<Button variant="outline" size="sm" asChild>
									<Link
										to={`/appointments/${appointment.id}/edit`}
									>
										<Edit className="mr-1 h-4 w-4" />
										Détails
									</Link>
								</Button>
							</div>
						</div>
					))}
				</div>
			) : (
				<ScrollArea className="w-full">
					<div className="rounded-md border min-w-full">
						<Table className="w-full">
							<TableHeader>
								<TableRow>
									<TableHead className="w-[100px]">
										Date
									</TableHead>
									<TableHead className="w-[120px]">
										Motif
									</TableHead>
									<TableHead className="w-[120px]">
										Statut
									</TableHead>
									<TableHead className="text-purple-700 dark:text-purple-400 w-[200px] max-w-[200px]">
										Compte-rendu
									</TableHead>
									<TableHead className="text-center w-[150px]">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{appointments.map((appointment) => (
									<TableRow key={appointment.id}>
										<TableCell className="font-medium w-[100px]">
											{format(
												new Date(appointment.date),
												"dd/MM/yyyy"
											)}
										</TableCell>
										<TableCell className="w-[120px]">
											<div
												className="truncate max-w-[120px]"
												title={appointment.reason}
											>
												{appointment.reason}
											</div>
										</TableCell>
										<TableCell className="w-[120px]">
											<AppointmentStatusDropdown
												status={
													appointment.status as AppointmentStatus
												}
												onStatusChange={(status) =>
													onStatusChange(
														appointment.id,
														status
													)
												}
											/>
										</TableCell>
										<TableCell className="w-[200px] max-w-[200px]">
											{appointment.notes ? (
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																variant="ghost"
																size="sm"
																className="h-8 flex items-center gap-1 w-full justify-start px-2"
																onClick={() => {
																	toast.info(
																		<div>
																			<h3 className="font-medium mb-1">
																				Notes
																				de
																				séance
																			</h3>
																			<p className="whitespace-pre-line text-sm">
																				<span className="font-medium text-purple-700 dark:text-purple-400">
																					Compte-rendu:{" "}
																				</span>
																				{
																					appointment.notes
																				}
																			</p>
																		</div>,
																		{
																			duration: 10000,
																		}
																	);
																}}
															>
																<MessageSquare className="h-3 w-3 flex-shrink-0" />
																<span className="truncate text-left">
																	{appointment.notes.slice(
																		0,
																		30
																	)}
																	{appointment
																		.notes
																		.length >
																	30
																		? "..."
																		: ""}
																</span>
															</Button>
														</TooltipTrigger>
														<TooltipContent
															side="top"
															className="max-w-xs"
														>
															<p className="whitespace-pre-wrap">
																<span className="font-medium text-purple-700 dark:text-purple-400">
																	Compte-rendu:{" "}
																</span>
																{appointment.notes.slice(
																	0,
																	100
																)}
																{appointment
																	.notes
																	.length >
																100
																	? "..."
																	: ""}
															</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											) : (
												<span className="text-muted-foreground text-sm">
													Aucune
												</span>
											)}
										</TableCell>
										<TableCell className="text-right w-[150px]">
											<div className="flex gap-1 justify-end">
												<InvoiceButton appointment={appointment} invoices={invoices} />
												<Button
													variant="outline"
													size="sm"
													asChild
													className="h-8"
												>
													<Link
														to={`/appointments/${appointment.id}/edit`}
													>
														Détails
													</Link>
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</ScrollArea>
			)}
		</div>
	);
}
