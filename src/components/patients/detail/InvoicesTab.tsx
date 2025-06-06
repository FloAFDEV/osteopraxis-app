import { InvoiceDetails } from "@/components/invoice-details";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Invoice, Patient } from "@/types";
import { formatAppointmentDate } from "@/utils/date-utils";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
	ChevronDown,
	ChevronUp,
	Plus,
	Receipt,
	CreditCard,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface InvoicesTabProps {
	patient: Patient;
	invoices: Invoice[];
}

export function InvoicesTab({ patient, invoices }: InvoicesTabProps) {
	const [expandedPeriods, setExpandedPeriods] = useState<
		Record<string, boolean>
	>({});

	const sortedInvoices = [...invoices].sort((a, b) => {
		return new Date(b.date).getTime() - new Date(a.date).getTime();
	});

	// Grouper les factures par mois et année
	const invoicesByPeriod: Record<string, Invoice[]> = {};

	sortedInvoices.forEach((invoice) => {
		const date = parseISO(invoice.date);
		const periodKey = format(date, "yyyy-MM"); // Format année-mois pour le tri
		const periodLabel = format(date, "MMMM yyyy", { locale: fr }); // Format pour l'affichage

		if (!invoicesByPeriod[periodKey]) {
			invoicesByPeriod[periodKey] = [];
		}

		invoicesByPeriod[periodKey].push(invoice);
	});

	// Toggle l'état d'expansion d'une période
	const togglePeriod = (periodKey: string) => {
		setExpandedPeriods((prev) => ({
			...prev,
			[periodKey]: !prev[periodKey],
		}));
	};

	return (
		<div className="space-y-4 mt-6">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-semibold">
					Notes d'honoraires du patient
				</h3>
				<Button asChild>
					<Link to={`/invoices/new?patientId=${patient.id}`}>
						<Plus className="mr-2 h-4 w-4" />
						Nouvelle Note d'honoraire
					</Link>
				</Button>
			</div>

			{sortedInvoices.length === 0 ? (
				<div className="text-center py-8">
					<Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
					<h3 className="text-xl font-medium">
						Aucune Note d'honoraire
					</h3>
					<p className="text-muted-foreground mt-2">
						Ce patient n'a pas encore de notes d'honoraires.
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{Object.entries(invoicesByPeriod).map(
						([periodKey, periodInvoices]) => {
							const isExpanded =
								expandedPeriods[periodKey] !== false; // Par défaut, les périodes sont développées
							const periodLabel = format(
								parseISO(`${periodKey}-01`),
								"MMMM yyyy",
								{ locale: fr }
							);

							return (
								<div
									key={periodKey}
									className="border rounded-lg overflow-hidden"
								>
									<div
										className="flex justify-between items-center bg-muted/50 p-3 cursor-pointer"
										onClick={() => togglePeriod(periodKey)}
									>
										<h4 className="font-medium capitalize">
											{periodLabel}
										</h4>
										<div className="flex items-center">
											<span className="text-sm text-muted-foreground mr-2">
												{periodInvoices.length}{" "}
												{periodInvoices.length > 1
													? "notes"
													: "note"}
											</span>
											{isExpanded ? (
												<ChevronUp className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											)}
										</div>
									</div>

									{isExpanded && (
										<div className="p-3">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>
															Date
														</TableHead>
														<TableHead>
															Montant
														</TableHead>
														<TableHead>
															Paiement
														</TableHead>
														<TableHead>
															Statut
														</TableHead>
														<TableHead className="text-right">
															Actions
														</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{periodInvoices.map(
														(invoice) => (
															<TableRow
																key={invoice.id}
															>
																<TableCell>
																	{formatAppointmentDate(
																		invoice.date,
																		"dd MMMM yyyy"
																	)}
																</TableCell>
																<TableCell>
																	{
																		invoice.amount
																	}{" "}
																	€
																</TableCell>
																<TableCell className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
																	<CreditCard className="h-4 w-4 text-gray-400" />
																	{invoice.paymentMethod ||
																		"—"}
																</TableCell>
																<TableCell>
																	<div
																		className={`inline-block px-2 py-1 rounded-full text-xs font-medium 
        ${
			invoice.paymentStatus === "PAID"
				? "bg-green-100 text-green-800"
				: invoice.paymentStatus === "PENDING"
				? "bg-amber-100 text-amber-800"
				: "bg-red-100 text-red-800"
		}`}
																	>
																		{invoice.paymentStatus ===
																		"PAID"
																			? "Payée"
																			: invoice.paymentStatus ===
																			  "PENDING"
																			? "En attente"
																			: "Annulée"}
																	</div>
																</TableCell>
																<TableCell className="text-right">
																	<Button
																		variant="ghost"
																		size="sm"
																		onClick={() => {
																			window.location.href = `/invoices/${invoice.id}`;
																		}}
																	>
																		Détails
																	</Button>
																</TableCell>
															</TableRow>
														)
													)}
												</TableBody>
											</Table>
										</div>
									)}
								</div>
							);
						}
					)}
				</div>
			)}
		</div>
	);
}
