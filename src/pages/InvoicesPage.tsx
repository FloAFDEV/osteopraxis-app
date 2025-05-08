
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Layout } from "@/components/ui/layout";
import { Accordion } from "@/components/ui/accordion";
import ConfirmDeleteInvoiceModal from "@/components/modals/ConfirmDeleteInvoiceModal";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Cabinet, Invoice, Osteopath, Patient } from "@/types";

// Import our new components
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { InvoiceEmptyState } from "@/components/invoices/InvoiceEmptyState";
import { InvoiceYearGroup } from "@/components/invoices/InvoiceYearGroup";
import { InvoicePrintWrapper } from "@/components/invoices/InvoicePrintWrapper";
import { useInvoiceFiltering } from "@/hooks/useInvoiceFiltering";

const InvoicesPage = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("ALL");
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
		null
	);
	const [selectedYear, setSelectedYear] = useState<string>(
		new Date().getFullYear().toString()
	);

	const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
	const [printAllInvoices, setPrintAllInvoices] = useState<Invoice[] | null>(
		null
	);
	const [printPatient, setPrintPatient] = useState<Patient | null>(null);
	const [printOsteopath, setPrintOsteopath] = useState<Osteopath | null>(
		null
	);
	const [printCabinet, setPrintCabinet] = useState<Cabinet | null>(null);

	// State for print handling
	const [readyToPrint, setReadyToPrint] = useState(false);
	const [isPreparingPrint, setIsPreparingPrint] = useState(false);
	const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
	const [patientDataMap, setPatientDataMap] = useState<Map<number, Patient>>(
		new Map()
	);

	const {
		data: invoices,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["invoices"],
		queryFn: api.getInvoices,
	});

	// Use our custom hook for filtering invoices
	const {
		filteredInvoices,
		groupInvoicesByYearAndMonth: groupedInvoices,
		generateYearOptions,
		generateMonthOptions
	} = useInvoiceFiltering(invoices, searchQuery, statusFilter, patientDataMap);

	// Available month options for the selected year
	const monthOptions = generateMonthOptions(selectedYear, filteredInvoices);
	const yearOptions = generateYearOptions();

	// Fetch patient data for all invoices
	useEffect(() => {
		const fetchPatientData = async () => {
			if (!invoices || invoices.length === 0) return;

			const patientIds = [
				...new Set(invoices.map((invoice) => invoice.patientId)),
			];
			const patientMap = new Map<number, Patient>();

			for (const patientId of patientIds) {
				try {
					const patient = await api.getPatientById(patientId);
					if (patient) {
						patientMap.set(patientId, patient);
					}
				} catch (error) {
					console.error(
						`Error fetching patient ${patientId}:`,
						error
					);
				}
			}

			setPatientDataMap(patientMap);
		};

		fetchPatientData();
	}, [invoices]);

	// Function to load invoice-related data (patient, osteopath, cabinet)
	const loadInvoiceRelatedData = async (invoice: Invoice) => {
		try {
			// Load patient data
			let patientData = null;
			let osteopathData = null;
			let cabinetData = null;

			if (invoice.patientId) {
				patientData = await api.getPatientById(invoice.patientId);

				// Get osteopath ID from patient or logged-in user
				const osteopathId =
					patientData?.osteopathId || user?.osteopathId;

				if (osteopathId) {
					osteopathData = await api.getOsteopathById(osteopathId);

					if (osteopathData?.id) {
						const cabinets = await api.getCabinetsByOsteopathId(
							osteopathData.id
						);
						if (cabinets && cabinets.length > 0) {
							cabinetData = cabinets[0];
						}
					}
				}
			}

			return {
				patient: patientData,
				osteopath: osteopathData,
				cabinet: cabinetData,
			};
		} catch (error) {
			console.error(
				"Error loading related data:",
				error
			);
			return { patient: null, osteopath: null, cabinet: null };
		}
	};

	// Delete invoice handler
	const handleDeleteInvoice = async () => {
		if (!selectedInvoiceId) return;
		try {
			await api.deleteInvoice(selectedInvoiceId);
			toast.success("Facture supprimée avec succès");
			refetch();
		} catch (error) {
			console.error("Error deleting invoice:", error);
			toast.error("Une erreur est survenue lors de la suppression");
		} finally {
			setIsDeleteModalOpen(false);
			setSelectedInvoiceId(null);
		}
	};

	// Print and download handlers
	const handlePrintInvoice = async (invoice: Invoice) => {
		setPrintInvoice(invoice);
		setPrintAllInvoices(null);

		// Load related data
		const relatedData = await loadInvoiceRelatedData(invoice);
		setPrintPatient(relatedData.patient);
		setPrintOsteopath(relatedData.osteopath);
		setPrintCabinet(relatedData.cabinet);
	};

	const handleDownloadInvoice = async (invoice: Invoice) => {
		// Load related data before printing
		const relatedData = await loadInvoiceRelatedData(invoice);

		setIsPreparingPrint(true);
		setPrintInvoice(invoice);
		setPrintPatient(relatedData.patient);
		setPrintOsteopath(relatedData.osteopath);
		setPrintCabinet(relatedData.cabinet);
		setPrintAllInvoices(null);
	};

	const handleDownloadAllInvoices = async () => {
		const yearInvoices = filteredInvoices.filter(invoice => {
			const date = new Date(invoice.date);
			return date.getFullYear().toString() === selectedYear;
		});

		if (yearInvoices.length === 0) {
			toast.error(`Aucune facture trouvée pour l'année ${selectedYear}`);
			return;
		}

		// For multiple invoices, use the first one's data
		if (yearInvoices.length > 0) {
			const relatedData = await loadInvoiceRelatedData(yearInvoices[0]);
			setPrintPatient(null);
			setPrintOsteopath(relatedData.osteopath);
			setPrintCabinet(relatedData.cabinet);
		}

		setPrintAllInvoices(yearInvoices);
		setPrintInvoice(null);
		toast.info(
			`Préparation du téléchargement des ${yearInvoices.length} factures de ${selectedYear}...`
		);
	};

	const handleDownloadMonthInvoices = async (year: string, monthKey: string) => {
		if (!invoices) return;

		const monthInvoices = filteredInvoices.filter(invoice => {
			const date = new Date(invoice.date);
			const invoiceMonthKey = format(date, 'yyyy-MM');
			return invoiceMonthKey === monthKey;
		});

		if (monthInvoices.length === 0) {
			const monthLabel = format(parseISO(`${monthKey}-01`), 'MMMM yyyy', { locale: fr });
			toast.error(`Aucune facture trouvée pour ${monthLabel}`);
			return;
		}

		// For multiple invoices, use the first one's data
		if (monthInvoices.length > 0) {
			const relatedData = await loadInvoiceRelatedData(monthInvoices[0]);
			setPrintPatient(null);
			setPrintOsteopath(relatedData.osteopath);
			setPrintCabinet(relatedData.cabinet);
		}

		setPrintAllInvoices(monthInvoices);
		setPrintInvoice(null);
		
		const monthLabel = format(parseISO(`${monthKey}-01`), 'MMMM yyyy', { locale: fr });
		toast.info(
			`Préparation du téléchargement des ${monthInvoices.length} factures de ${monthLabel}...`
		);
	};

	// Handler for print completion
	const handlePrintComplete = () => {
		setPrintInvoice(null);
		setPrintAllInvoices(null);
		setPrintPatient(null);
		setPrintOsteopath(null);
		setPrintCabinet(null);
		setReadyToPrint(false);
		setIsPreparingPrint(false);
	};

	return (
		<>
			{isPreparingPrint && (
				<div className="fixed inset-0 bg-white/80 dark:bg-black/80 flex flex-col items-center justify-center z-50">
					<div className="flex gap-2">
						<div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
						<div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
						<div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
					</div>
					<p className="mt-6 text-lg font-semibold text-gray-800 dark:text-gray-200">
						Préparation du PDF en cours...
					</p>
				</div>
			)}
			<Layout>
				<div className="mb-6">
					{/* Header */}
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
						<h1 className="text-3xl font-bold flex items-center gap-3">
							<FileText className="h-8 w-8 text-blue-600 dark:text-blue-500" />
							<span className="text-black dark:text-gray-100 font-semibold">
								Notes d'honoraires
							</span>
						</h1>
						<Button
							onClick={() => navigate("/invoices/new")}
							className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:text-white"
						>
							<Plus className="h-5 w-5" />
							Nouvelle note d'honoraire
						</Button>
					</div>

					{/* Filters */}
					<InvoiceFilters 
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						statusFilter={statusFilter}
						setStatusFilter={setStatusFilter}
						selectedYear={selectedYear}
						setSelectedYear={setSelectedYear}
						selectedMonth={selectedMonth}
						setSelectedMonth={setSelectedMonth}
						onDownloadAll={handleDownloadAllInvoices}
						invoiceYears={yearOptions}
						monthOptions={monthOptions}
					/>

					{/* Content */}
					{isLoading ? (
						<div className="flex justify-center items-center py-20">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
						</div>
					) : filteredInvoices && filteredInvoices.length > 0 ? (
						<div className="space-y-6">
							{/* Invoices by year/month */}
							{Object.entries(groupedInvoices)
								.sort((a, b) => b[0].localeCompare(a[0]))
								.map(([year, months]) => {
									// Filter by selected year
									if (year !== selectedYear) return null;
									
									return (
										<Accordion type="multiple" className="space-y-4" key={year}>
											<InvoiceYearGroup
												year={year}
												months={months}
												selectedMonth={selectedMonth}
												patientDataMap={patientDataMap}
												onEditInvoice={(id) => navigate(`/invoices/${id}`)}
												onDeleteInvoice={(id) => {
													setSelectedInvoiceId(id);
													setIsDeleteModalOpen(true);
												}}
												onPrintInvoice={handlePrintInvoice}
												onDownloadInvoice={handleDownloadInvoice}
												onDownloadMonthInvoices={handleDownloadMonthInvoices}
											/>
										</Accordion>
									);
								})}
						</div>
					) : (
						<InvoiceEmptyState 
							hasFilters={searchQuery !== "" || statusFilter !== "ALL" || selectedMonth !== null}
						/>
					)}
				</div>

				{/* Print component */}
				<InvoicePrintWrapper
					printInvoice={printInvoice}
					printAllInvoices={printAllInvoices}
					printPatient={printPatient}
					printOsteopath={printOsteopath}
					printCabinet={printCabinet}
					patientDataMap={patientDataMap}
					selectedYear={selectedYear}
					selectedMonth={selectedMonth}
					onPrintComplete={handlePrintComplete}
					isPreparingPrint={isPreparingPrint}
					setReadyToPrint={setReadyToPrint}
					readyToPrint={readyToPrint}
				/>

				{/* Delete confirmation modal */}
				{isDeleteModalOpen && selectedInvoiceId && (
					<ConfirmDeleteInvoiceModal
						isOpen={isDeleteModalOpen}
						invoiceNumber={selectedInvoiceId.toString().padStart(4, "0")}
						onCancel={() => setIsDeleteModalOpen(false)}
						onDelete={handleDeleteInvoice}
					/>
				)}
			</Layout>
		</>
	);
};

export default InvoicesPage;

