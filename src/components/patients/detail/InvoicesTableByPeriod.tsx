import { Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { CreditCard } from "lucide-react";
import { formatAppointmentDate } from "@/utils/date-utils";
import { BlurredAmount } from "@/components/ui/blurred-amount";

interface InvoicesTableByPeriodProps {
	invoices: Invoice[];
	onDetail: (invoiceId: number) => void;
}

export function InvoicesTableByPeriod({
	invoices,
	onDetail,
}: InvoicesTableByPeriodProps) {
	const formatAmount = (amount: number) => {
		return (
			new Intl.NumberFormat("fr-FR", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}).format(amount) + " €"
		);
	};

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Date</TableHead>
					<TableHead>Montant</TableHead>
					<TableHead>Paiement</TableHead>
					<TableHead>Statut</TableHead>
					<TableHead className="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{invoices.map((invoice) => (
					<TableRow key={invoice.id}>
						<TableCell>
							{formatAppointmentDate(
								invoice.date,
								"dd MMMM yyyy",
							)}
						</TableCell>
						<TableCell>{invoice.amount}€</TableCell>
						<TableCell className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
							<CreditCard className="h-4 w-4 text-gray-400" />
							{invoice.paymentMethod || "—"}
						</TableCell>
						<TableCell>
							<div
								className={`inline-block px-2 py-1 rounded-full text-sm font-medium 
									${
										invoice.paymentStatus === "PAID"
											? "bg-green-100 text-green-800"
											: invoice.paymentStatus ===
												  "PENDING"
												? "bg-amber-100 text-amber-800"
												: "bg-red-100 text-red-800"
									}`}
							>
								{invoice.paymentStatus === "PAID"
									? "Payée"
									: invoice.paymentStatus === "PENDING"
										? "En attente"
										: "Annulée"}
							</div>
						</TableCell>
						<TableCell className="text-right">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onDetail(invoice.id)}
							>
								Détails
							</Button>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
