import { Invoice, Patient } from "@/types";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Receipt, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface UnpaidInvoicesProps {
	invoices: Invoice[];
	patients: Patient[];
}

export function UnpaidInvoices({ invoices, patients }: UnpaidInvoicesProps) {
	const getPatient = (patientId: number | string) => {
		return patients.find((p) => p.id === patientId);
	};

	const unpaidInvoices = invoices
		.filter((inv) => inv.paymentStatus === "PENDING")
		.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

	const count = unpaidInvoices.length;
	const total = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

	return (
		<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
			{/* Header */}
			<div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
						Impayés
					</h2>
					{count > 0 && (
						<span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
							{count}
						</span>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="divide-y divide-gray-100 dark:divide-gray-800">
				{count === 0 ? (
					<div className="px-4 py-6 text-center">
						<Receipt className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Aucun impayé
						</p>
					</div>
				) : (
					unpaidInvoices.slice(0, 5).map((inv) => {
						const patient = getPatient(inv.patientId);
						const dateLabel = format(parseISO(inv.date), "dd/MM", { locale: fr });

						return (
							<Link
								key={inv.id}
								to={`/invoices/${inv.id}`}
								className="flex items-center px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
							>
								<span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
									{patient
										? `${patient.lastName} ${patient.firstName}`
										: `Patient #${inv.patientId}`}
								</span>
								<span className="text-xs text-gray-400 dark:text-gray-500 mr-3">
									{dateLabel}
								</span>
								<span className="text-sm font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
									{inv.amount.toLocaleString("fr-FR")} €
								</span>
							</Link>
						);
					})
				)}
			</div>

			{/* Footer avec total */}
			{count > 0 && (
				<div className="px-4 py-2.5 border-t border-gray-200 dark:border-gray-700 bg-amber-50/50 dark:bg-amber-900/10">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-gray-600 dark:text-gray-400">
							Total
						</span>
						<span className="text-sm font-bold text-amber-700 dark:text-amber-300 tabular-nums">
							{total.toLocaleString("fr-FR")} €
						</span>
					</div>
				</div>
			)}

			{/* Link to invoices */}
			<div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
				<Link
					to="/invoices"
					className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
				>
					<span>Voir les factures</span>
					<ChevronRight className="h-4 w-4" />
				</Link>
			</div>
		</div>
	);
}
