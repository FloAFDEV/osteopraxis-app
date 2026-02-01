import { Invoice, Patient } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Check,
	Clock,
	X,
	Printer,
	Download,
	Pencil,
	ChevronUp,
	ChevronDown,
	ChevronsUpDown,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InvoiceRegistryProps {
	invoices: Invoice[];
	patientDataMap: Map<number, Patient>;
	onPrintInvoice: (invoice: Invoice) => void;
	onDownloadInvoice: (invoice: Invoice) => void;
	onEditInvoice: (invoice: Invoice) => void;
	onDeleteInvoice: (id: number) => void;
}

type SortField = "id" | "date" | "patient" | "amount" | "status";
type SortDirection = "asc" | "desc";

const statusConfig = {
	PAID: {
		label: "Payée",
		icon: Check,
		className:
			"bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
	},
	PENDING: {
		label: "En attente",
		icon: Clock,
		className:
			"bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700",
	},
	CANCELED: {
		label: "Annulée",
		icon: X,
		className:
			"bg-gray-50 text-gray-500 border-gray-200 line-through dark:bg-gray-800/50 dark:text-gray-500 dark:border-gray-700",
	},
};

const paymentMethodLabels: Record<string, string> = {
	// Français
	CB: "CB",
	ESPECES: "Espèces",
	CHEQUE: "Chèque",
	VIREMENT: "Virement",
	// Anglais (mode démo)
	card: "CB",
	cash: "Espèces",
	check: "Chèque",
	transfer: "Virement",
};

export function InvoiceRegistry({
	invoices,
	patientDataMap,
	onPrintInvoice,
	onDownloadInvoice,
	onEditInvoice,
}: InvoiceRegistryProps) {
	const navigate = useNavigate();
	const [sortField, setSortField] = useState<SortField>("date");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("desc");
		}
	};

	const sortedInvoices = useMemo(() => {
		return [...invoices].sort((a, b) => {
			let comparison = 0;

			switch (sortField) {
				case "id":
					comparison = a.id - b.id;
					break;
				case "date":
					comparison =
						new Date(a.date).getTime() - new Date(b.date).getTime();
					break;
				case "patient": {
					const patientA = patientDataMap.get(a.patientId);
					const patientB = patientDataMap.get(b.patientId);
					const nameA = patientA
						? `${patientA.lastName} ${patientA.firstName}`
						: "";
					const nameB = patientB
						? `${patientB.lastName} ${patientB.firstName}`
						: "";
					comparison = nameA.localeCompare(nameB, "fr");
					break;
				}
				case "amount":
					comparison = a.amount - b.amount;
					break;
				case "status":
					comparison = a.paymentStatus.localeCompare(b.paymentStatus);
					break;
			}

			return sortDirection === "asc" ? comparison : -comparison;
		});
	}, [invoices, sortField, sortDirection, patientDataMap]);

	const total = useMemo(() => {
		return invoices
			.filter((inv) => inv.paymentStatus !== "CANCELED")
			.reduce((sum, inv) => sum + inv.amount, 0);
	}, [invoices]);

	const SortIcon = ({ field }: { field: SortField }) => {
		if (sortField !== field) {
			return <ChevronsUpDown className="h-3 w-3 ml-1 opacity-50" />;
		}
		return sortDirection === "asc" ? (
			<ChevronUp className="h-3 w-3 ml-1" />
		) : (
			<ChevronDown className="h-3 w-3 ml-1" />
		);
	};

	const handlePatientClick = (patientId: number) => {
		navigate(`/patients/${patientId}`);
	};

	const handleInvoiceClick = (invoiceId: number) => {
		navigate(`/invoices/${invoiceId}`);
	};

	if (invoices.length === 0) {
		return null;
	}

	return (
		<div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
			{/* Table */}
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
							<th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">
								<button
									onClick={() => handleSort("id")}
									className="flex items-center hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
								>
									N°
									<SortIcon field="id" />
								</button>
							</th>
							<th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">
								<button
									onClick={() => handleSort("date")}
									className="flex items-center hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
								>
									Date
									<SortIcon field="date" />
								</button>
							</th>
							<th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">
								<button
									onClick={() => handleSort("patient")}
									className="flex items-center hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
								>
									Patient
									<SortIcon field="patient" />
								</button>
							</th>
							<th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">
								<button
									onClick={() => handleSort("amount")}
									className="flex items-center justify-end w-full hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
								>
									Montant
									<SortIcon field="amount" />
								</button>
							</th>
							<th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">
								<button
									onClick={() => handleSort("status")}
									className="flex items-center hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
								>
									Statut
									<SortIcon field="status" />
								</button>
							</th>
							<th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">
								Règlement
							</th>
							<th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-400">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{sortedInvoices.map((invoice, index) => {
							const patient = patientDataMap.get(invoice.patientId);
							const status = statusConfig[invoice.paymentStatus];
							const StatusIcon = status.icon;
							const isPending = invoice.paymentStatus === "PENDING";

							return (
								<tr
									key={invoice.id}
									className={cn(
										"border-b border-gray-100 dark:border-gray-800 transition-colors",
										index % 2 === 0
											? "bg-white dark:bg-gray-900"
											: "bg-gray-50/50 dark:bg-gray-800/30",
										"hover:bg-gray-100 dark:hover:bg-gray-800",
										isPending && "border-l-3 border-l-amber-400"
									)}
								>
									{/* N° */}
									<td className="px-4 py-3">
										<button
											onClick={() => handleInvoiceClick(invoice.id)}
											className="font-mono text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
										>
											{invoice.id.toString().padStart(4, "0")}
										</button>
									</td>

									{/* Date */}
									<td className="px-4 py-3 text-gray-700 dark:text-gray-300">
										{format(new Date(invoice.date), "dd/MM/yyyy", {
											locale: fr,
										})}
									</td>

									{/* Patient */}
									<td className="px-4 py-3">
										{patient ? (
											<button
												onClick={() =>
													handlePatientClick(patient.id as number)
												}
												className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
											>
												<span className="font-medium">
													{patient.lastName}
												</span>{" "}
												<span>{patient.firstName}</span>
											</button>
										) : (
											<span className="text-gray-400 italic">
												Patient inconnu
											</span>
										)}
									</td>

									{/* Montant */}
									<td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-100 tabular-nums">
										{invoice.amount.toLocaleString("fr-FR", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}{" "}
										€
									</td>

									{/* Statut */}
									<td className="px-4 py-3">
										<span
											className={cn(
												"inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border",
												status.className
											)}
										>
											<StatusIcon className="h-3 w-3" />
											{status.label}
										</span>
									</td>

									{/* Règlement */}
									<td className="px-4 py-3 text-gray-600 dark:text-gray-400">
										{invoice.paymentMethod
											? paymentMethodLabels[invoice.paymentMethod] ||
											  invoice.paymentMethod
											: "—"}
									</td>

									{/* Actions */}
									<td className="px-4 py-3">
										<div className="flex items-center justify-center gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
												onClick={() => onPrintInvoice(invoice)}
												title="Imprimer"
												aria-label={`Imprimer la note ${invoice.id}`}
											>
												<Printer className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
												onClick={() => onDownloadInvoice(invoice)}
												title="Télécharger"
												aria-label={`Télécharger la note ${invoice.id}`}
											>
												<Download className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
												onClick={() => onEditInvoice(invoice)}
												title="Modifier"
												aria-label={`Modifier la note ${invoice.id}`}
											>
												<Pencil className="h-4 w-4" />
											</Button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>

					{/* Footer avec total */}
					<tfoot>
						<tr className="bg-gray-100 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-600">
							<td
								colSpan={3}
								className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400"
							>
								Total ({invoices.filter((i) => i.paymentStatus !== "CANCELED").length}{" "}
								notes)
							</td>
							<td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100 tabular-nums">
								{total.toLocaleString("fr-FR", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}{" "}
								€
							</td>
							<td colSpan={3}></td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
}
