
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
	FileText,
	Calendar,
	Euro,
	Info,
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

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "EUR",
		}).format(amount);
	};

	const getPaymentMethod = (method?: string) => {
		if (!method) return "Non spécifié";
		switch (method) {
			case "CB":
				return "Carte Bancaire";
			case "ESPECES":
				return "Espèces";
			case "CHEQUE":
				return "Chèque";
			case "VIREMENT":
				return "Virement bancaire";
			default:
				return method;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "PAID":
				return "bg-green-100 text-green-800 border-green-200";
			case "PENDING":
				return "bg-amber-100 text-amber-800 border-amber-200";
			case "CANCELED":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "PAID":
				return "ACQUITTÉE";
			case "PENDING":
				return "EN ATTENTE";
			case "CANCELED":
				return "ANNULÉE";
			default:
				return "STATUT INCONNU";
		}
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
										<div className="p-4 space-y-4">
											{periodInvoices.map((invoice) => (
												<div
													key={invoice.id}
													className="border rounded-lg p-4 bg-white dark:bg-gray-800 space-y-4"
												>
													{/* En-tête de la facture */}
													<div className="flex justify-between items-start">
														<div className="flex items-center gap-3">
															<FileText className="h-6 w-6 text-blue-600" />
															<div>
																<h4 className="font-semibold text-lg">
																	Note d'honoraire n°{" "}
																	{invoice.id
																		.toString()
																		.padStart(4, "0")}
																</h4>
																<div className="flex items-center gap-2 text-sm text-muted-foreground">
																	<Calendar className="h-4 w-4" />
																	<span>
																		Date de consultation:{" "}
																		{formatAppointmentDate(
																			invoice.date,
																			"dd MMMM yyyy"
																		)}
																	</span>
																</div>
															</div>
														</div>
														<div
															className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
																invoice.paymentStatus
															)}`}
														>
															{getStatusText(
																invoice.paymentStatus
															)}
														</div>
													</div>

													{/* Montant et détails */}
													<div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-b border-gray-100 dark:border-gray-700">
														<div>
															<div className="text-sm text-muted-foreground mb-1">
																Montant
															</div>
															<div className="flex items-center gap-2">
																<Euro className="h-4 w-4 text-green-600" />
																<span className="font-bold text-xl text-green-600">
																	{formatCurrency(
																		invoice.amount
																	)}
																</span>
															</div>
														</div>
														<div>
															<div className="text-sm text-muted-foreground mb-1">
																Mode de règlement
															</div>
															<div className="flex items-center gap-2">
																<CreditCard className="h-4 w-4 text-blue-600" />
																<span className="font-medium">
																	{getPaymentMethod(
																		invoice.paymentMethod
																	)}
																</span>
															</div>
														</div>
														<div>
															<div className="text-sm text-muted-foreground mb-1">
																Statut TVA
															</div>
															<div className="flex items-center gap-2">
																<Info className="h-4 w-4 text-orange-600" />
																<span className="text-sm">
																	{invoice.tvaExoneration
																		? "Exonérée"
																		: "Soumise à TVA"}
																</span>
															</div>
														</div>
													</div>

													{/* Motif TVA */}
													<div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
														<div className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
															Motif d'exonération TVA:
														</div>
														<div className="text-sm text-amber-700 dark:text-amber-300">
															{invoice.tvaMotif ||
																"TVA non applicable - Article 261-4-1° du CGI"}
														</div>
													</div>

													{/* Prestation */}
													<div className="border rounded-md overflow-hidden">
														<div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b">
															<h5 className="font-medium text-sm">
																Désignation des prestations
															</h5>
														</div>
														<div className="p-4">
															<div className="flex justify-between items-center">
																<span className="text-sm">
																	Consultation d'ostéopathie
																</span>
																<span className="font-semibold">
																	{formatCurrency(
																		invoice.amount
																	)}
																</span>
															</div>
														</div>
													</div>

													{/* Notes */}
													{invoice.notes && (
														<div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
															<div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
																Notes:
															</div>
															<div className="text-sm text-blue-700 dark:text-blue-300">
																{invoice.notes}
															</div>
														</div>
													)}

													{/* Actions */}
													<div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-700">
														<Button
															variant="outline"
															size="sm"
															onClick={() => {
																window.location.href = `/invoices/${invoice.id}`;
															}}
														>
															<FileText className="mr-2 h-4 w-4" />
															Voir les détails
														</Button>
													</div>
												</div>
											))}
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
