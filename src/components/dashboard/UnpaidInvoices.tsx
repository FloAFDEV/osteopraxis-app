import { Invoice, Patient } from "@/types";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Receipt, ChevronRight, AlertCircle } from "lucide-react";
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
		<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
			{/* Header */}
			<div className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 ${
				count > 0
					? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
					: "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30"
			}`}>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className={`p-1.5 rounded-lg ${
							count > 0
								? "bg-amber-100 dark:bg-amber-900/50"
								: "bg-emerald-100 dark:bg-emerald-900/50"
						}`}>
							{count > 0 ? (
								<AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
							) : (
								<Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
							)}
						</div>
						<h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
							Impayés
						</h2>
					</div>
					{count > 0 && (
						<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
							{count}
						</span>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="divide-y divide-gray-100 dark:divide-gray-800">
				{count === 0 ? (
					<div className="px-4 py-8 text-center">
						<Receipt className="h-10 w-10 mx-auto mb-3 text-emerald-400 dark:text-emerald-500" />
						<p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
							Aucun impayé
						</p>
						<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
							Toutes vos factures sont réglées
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
								className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
							>
								<span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
									{patient
										? `${patient.lastName} ${patient.firstName}`
										: `Patient #${inv.patientId}`}
								</span>
								<span className="text-xs text-gray-400 dark:text-gray-500 mr-4">
									{dateLabel}
								</span>
								<span className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">
									{inv.amount.toLocaleString("fr-FR")} €
								</span>
							</Link>
						);
					})
				)}
			</div>

			{/* Total */}
			{count > 0 && (
				<div className="px-4 py-3 border-t-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
					<div className="flex items-center justify-between">
						<span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
							Total à encaisser
						</span>
						<span className="text-lg font-bold text-amber-700 dark:text-amber-300 tabular-nums">
							{total.toLocaleString("fr-FR")} €
						</span>
					</div>
				</div>
			)}

			{/* Footer */}
			<div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
				<Link
					to="/invoices"
					className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
				>
					<span>Voir toutes les factures</span>
					<ChevronRight className="h-4 w-4" />
				</Link>
			</div>
		</div>
	);
}
