
import { InvoiceDetails } from "@/components/invoice-details";
import { Button } from "@/components/ui/button";
import { Invoice, Patient } from "@/types";
import { Plus, Receipt } from "lucide-react";
import { Link } from "react-router-dom";

interface InvoicesTabProps {
	patient: Patient;
	invoices: Invoice[];
}

export function InvoicesTab({ patient, invoices }: InvoicesTabProps) {
	const sortedInvoices = [...invoices].sort((a, b) => {
		return new Date(b.date).getTime() - new Date(a.date).getTime();
	});

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
					<h3 className="text-xl font-medium">Aucune Note d'honoraire</h3>
					<p className="text-muted-foreground mt-2">
						Ce patient n'a pas encore de notes d'honoraires.
					</p>
				</div>
			) : (
				<div className="grid gap-4">
					{sortedInvoices.map((invoice) => (
						<InvoiceDetails
							key={invoice.id}
							invoice={invoice}
							patientName={`${patient.firstName} ${patient.lastName}`}
							onEdit={() => {
								// Navigate to invoice edit page
								window.location.href = `/invoices/${invoice.id}/edit`;
							}}
						/>
					))}
				</div>
			)}
		</div>
	);
}
