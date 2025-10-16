import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Invoice, Patient } from "@/types";
import clsx from "clsx";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Download, FileText, Printer, StickyNote, Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmDeleteInvoiceModal from "./modals/ConfirmDeleteInvoiceModal";
import { StatusBadge } from "./invoice-details/StatusBadge";
import { StyledPatientName } from "./invoice-details/StyledPatientName";
import { AmountBlock } from "./invoice-details/AmountBlock";
import { NotesBlock } from "./invoice-details/NotesBlock";
import { InvoiceActions } from "./invoice-details/InvoiceActions";

interface InvoiceDetailsProps {
	invoice: Invoice;
	patient?: Patient;
	patientName?: string;
	osteopath?: { id: number; name: string };
	onDelete?: () => void;
	onDownload?: () => void;
	onPrint?: () => void;
	onEdit?: () => void;
}

export const InvoiceDetails = ({
	invoice,
	patient,
	patientName,
	osteopath,
	onDelete,
	onDownload,
	onPrint,
	onEdit,
}: InvoiceDetailsProps) => {
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const { isMobile } = useIsMobile();

	const formatDate = (date: string) => {
		return format(new Date(date), "dd MMMM yyyy", { locale: fr });
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

	return (
		<>
			<Card className="min-h-[260px] flex flex-col justify-between border shadow px-4 py-4 transition-all duration-300 bg-white dark:bg-gray-800 relative">
				<CardContent className="p-0 flex flex-col h-full">
				{/* 🔷 Icônes Print / Download - top right */}
					<div className="absolute top-4 right-4 flex gap-2 z-10">
						{onPrint && (
							<Button
								size="icon"
								variant="outline"
								onClick={onPrint}
								title="Imprimer"
								aria-label="Imprimer la note d'honoraire"
								className="h-9 w-9 rounded-md flex items-center justify-center bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
							>
								<Printer className="h-5 w-5" />
							</Button>
						)}
						{onDownload && (
							<Button
								size="icon"
								variant="outline"
								onClick={onDownload}
								title="Télécharger"
								aria-label="Télécharger la note d'honoraire"
								className="h-9 w-9 rounded-md flex items-center justify-center bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
							>
								<Download className="h-5 w-5" />
							</Button>
						)}
					</div>

					{/* 🔷 Header : ID + patient */}
					<div className="mb-4 pr-20">
						<div className="flex items-center gap-2">
							<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							<span className="font-bold text-lg">
								Note d'honoraire n°{" "}
								{invoice.id.toString().padStart(4, "0")}
							</span>
						</div>
						<StyledPatientName patient={patient} patientName={patientName} />
						{osteopath && (
							<div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
								Praticien : {osteopath.name}
							</div>
						)}
						<StatusBadge status={invoice.paymentStatus} />
					</div>
					{/* 🔷 Montant & Date */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-gray-100 dark:border-gray-700 py-4">
						<AmountBlock amount={invoice.amount} tvaMotif={invoice.tvaMotif} />
						<div className="sm:text-right">
							<div className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">
								Date de consultation
							</div>
							<div className="font-medium text-gray-800 dark:text-white">
								{formatDate(invoice.date)}
							</div>
							{invoice.paymentMethod && (
								<div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
									Réglée par{" "}
									{getPaymentMethod(invoice.paymentMethod)}
								</div>
							)}
						</div>
					</div>
					<NotesBlock notes={invoice.notes} />
				</CardContent>
				<InvoiceActions
					onDelete={onDelete}
					onPrint={onPrint}
					onDownload={onDownload}
					onEdit={onEdit}
					isDeleteModalOpen={isDeleteModalOpen}
					setIsDeleteModalOpen={setIsDeleteModalOpen}
					isMobile={isMobile}
				/>
				{/* 🔷 Modal suppression */}
				<ConfirmDeleteInvoiceModal
					isOpen={isDeleteModalOpen}
					invoiceNumber={invoice.id.toString().padStart(4, "0")}
					onCancel={() => setIsDeleteModalOpen(false)}
					onDelete={() => {
						if (onDelete) onDelete();
						setIsDeleteModalOpen(false);
					}}
				/>
			</Card>
		</>
	);
};
