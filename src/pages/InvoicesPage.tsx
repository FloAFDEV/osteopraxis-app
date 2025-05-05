import { InvoiceDetails } from "@/components/invoice-details";
import { InvoicePrintView } from "@/components/invoice-print-view";
import ConfirmDeleteInvoiceModal from "@/components/modals/ConfirmDeleteInvoiceModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/ui/layout";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/services/api";
import { Cabinet, Invoice, Osteopath, Patient } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
	Calendar,
	Download,
	FileText,
	Filter,
	Plus,
	Search,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";

const InvoicesPage = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { isMobile } = useIsMobile();
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

	// Map to store patient data for each invoice
	const [patientDataMap, setPatientDataMap] = useState<Map<number, Patient>>(
		new Map()
	);

	// Référence pour l'impression
	const printRef = useRef<HTMLDivElement>(null);
	const [readyToPrint, setReadyToPrint] = useState(false);
	const [isPreparingPrint, setIsPreparingPrint] = useState(false);

	// Configuration de react-to-print
	const handlePrint = useReactToPrint({
		// Référence directe à la div
		contentRef: printRef,
		documentTitle: printInvoice
			? `Note d'honoraire_${printInvoice.id.toString().padStart(4, "0")}`
			: printAllInvoices
			? `Notes d'honoraires_${selectedYear}`
			: "Note d'honoraire",
		onAfterPrint: () => {
			setPrintInvoice(null);
			setPrintAllInvoices(null);
			setPrintPatient(null);
			setPrintOsteopath(null);
			setPrintCabinet(null);
			setReadyToPrint(false);
		},
	});

	useEffect(() => {
		if (printInvoice || printAllInvoices) {
			setReadyToPrint(true);
		}
	}, [printInvoice, printAllInvoices]);

	useEffect(() => {
		if ((printInvoice || printAllInvoices) && readyToPrint) {
			setTimeout(() => {
				handlePrint();
				setIsPreparingPrint(false);
			}, 200);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [readyToPrint]);

	const {
		data: invoices,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["invoices"],
		queryFn: api.getInvoices,
	});

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

	// Fonction pour charger les données associées à une facture (patient, ostéopathe, cabinet)
	const loadInvoiceRelatedData = async (invoice: Invoice) => {
		try {
			// Charger les données du patient
			let patientData = null;
			let osteopathData = null;
			let cabinetData = null;

			if (invoice.patientId) {
				patientData = await api.getPatientById(invoice.patientId);

				// Déterminer l'ID de l'ostéopathe à partir du patient ou de l'utilisateur connecté
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
				"Erreur lors du chargement des données associées:",
				error
			);
			return { patient: null, osteopath: null, cabinet: null };
		}
	};

	const handleDeleteInvoice = async () => {
		if (!selectedInvoiceId) return;
		try {
			await api.deleteInvoice(selectedInvoiceId);
			toast.success("Facture supprimée avec succès");
			refetch();
		} catch (error) {
			console.error("Erreur lors de la suppression:", error);
			toast.error("Une erreur est survenue lors de la suppression");
		} finally {
			setIsDeleteModalOpen(false);
			setSelectedInvoiceId(null);
		}
	};

	// Obtenir le nom du patient avec gestion des cas
	const getPatientName = (invoice: Invoice) => {
		// First check if we have the patient in our map
		const patient = patientDataMap.get(invoice.patientId);
		if (patient) {
			return `${patient.firstName} ${patient.lastName}`;
		}

		// Then check if Patient is attached by API
		// @ts-ignore (Patient peut être attaché par API)
		if (invoice.Patient) {
			//@ts-ignore
			return `${invoice.Patient.firstName} ${invoice.Patient.lastName}`;
		}

		return `Patient #${invoice.patientId}`;
	};

	// Get patient gender (for styling)
	const getPatientGender = (invoice: Invoice) => {
		const patient = patientDataMap.get(invoice.patientId);
		return patient?.gender || null;
	};

	// Filtrer les factures selon les critères de recherche et de statut
	const filteredInvoices = invoices
		? invoices.filter((invoice) => {
				// Get the patient name
				const patientName = getPatientName(invoice);

				const matchesQuery =
					patientName
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					invoice.id.toString().includes(searchQuery);

				const matchesStatus =
					statusFilter === "ALL" ||
					invoice.paymentStatus === statusFilter;
				return matchesQuery && matchesStatus;
		  })
		: [];

	// Filtrer les factures par année
	const getInvoicesByYear = (year: string): Invoice[] => {
		if (!invoices) return [];

		return invoices.filter((invoice) => {
			const invoiceDate = new Date(invoice.date);
			return invoiceDate.getFullYear().toString() === year;
		});
	};

	// Générer les options des années pour le sélecteur
	const generateYearOptions = (): number[] => {
		const currentYear = new Date().getFullYear();
		const years: number[] = [];

		// Générer les 5 dernières années
		for (let i = 0; i < 5; i++) {
			years.push(currentYear - i);
		}

		return years;
	};

	// Impression et téléchargement d'une facture individuelle
	const handlePrintInvoice = async (invoice: Invoice) => {
		setPrintInvoice(invoice);
		setPrintAllInvoices(null);

		// Charger les données associées
		const relatedData = await loadInvoiceRelatedData(invoice);
		setPrintPatient(relatedData.patient);
		setPrintOsteopath(relatedData.osteopath);
		setPrintCabinet(relatedData.cabinet);

		console.log("Données pour impression:", {
			invoice,
			patient: relatedData.patient,
			osteopath: relatedData.osteopath,
			cabinet: relatedData.cabinet,
		});
	};

	// Export immédiat en PDF sans toast intermédiaire
	const handleDownloadInvoice = async (invoice: Invoice) => {
		// Charger les données associées avant l'impression
		const relatedData = await loadInvoiceRelatedData(invoice);

		setIsPreparingPrint(true);
		setPrintInvoice(invoice);
		setPrintPatient(relatedData.patient);
		setPrintOsteopath(relatedData.osteopath);
		setPrintCabinet(relatedData.cabinet);
		setPrintAllInvoices(null);

		// Lancer directement impression PDF après un petit délai de montage DOM
		setTimeout(() => {
			handlePrint();
		}, 200);
	};

	// Impression et téléchargement de toutes les factures d'une année
	const handleDownloadAllInvoices = async () => {
		const yearInvoices = getInvoicesByYear(selectedYear);

		if (yearInvoices.length === 0) {
			toast.error(`Aucune facture trouvée pour l'année ${selectedYear}`);
			return;
		}

		// Pour l'impression multiple, nous utilisons les données du premier ostéopathe/cabinet
		// car c'est généralement le même pour toutes les factures d'un utilisateur
		if (yearInvoices.length > 0) {
			const relatedData = await loadInvoiceRelatedData(yearInvoices[0]);
			setPrintPatient(null); // Pas de patient spécifique pour l'impression multiple
			setPrintOsteopath(relatedData.osteopath);
			setPrintCabinet(relatedData.cabinet);
		}

		setPrintAllInvoices(yearInvoices);
		setPrintInvoice(null);
		toast.info(
			`Préparation du téléchargement des ${yearInvoices.length} factures de ${selectedYear}...`
		);
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
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
						<h1 className="text-3xl font-bold flex items-center gap-3">
							<FileText className="h-8 w-8 text-blue-600 dark:text-blue-500" />
							<span className="text-black dark:text-gray-100 font-semibold">
								Factures
							</span>
						</h1>
						<Button
							onClick={() => navigate("/invoices/new")}
							className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600"
						>
							<Plus className="h-5 w-5" />
							Nouvelle facture
						</Button>
					</div>

					<Card className="mb-8">
						<CardContent className="p-4">
							<div className="flex flex-col sm:flex-row gap-4">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										placeholder="Rechercher une facture..."
										className="pl-9"
										value={searchQuery}
										onChange={(e) =>
											setSearchQuery(e.target.value)
										}
									/>
								</div>
								<div className="flex items-center gap-2 min-w-[200px]">
									<Filter className="h-4 w-4 text-gray-400" />
									<Select
										value={statusFilter}
										onValueChange={setStatusFilter}
									>
										<SelectTrigger>
											<SelectValue placeholder="Tous les statuts" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="ALL">
												Tous les statuts
											</SelectItem>
											<SelectItem value="PAID">
												Payée
											</SelectItem>
											<SelectItem value="PENDING">
												En attente
											</SelectItem>
											<SelectItem value="CANCELED">
												Annulée
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Nouvelle section pour le téléchargement par année - Améliorée pour la responsivité */}
							<div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
								<div className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
									<Calendar className="h-5 w-5 mr-2 text-amber-500" />
									Export annuel:
								</div>
								<div className="flex flex-wrap w-full sm:w-auto gap-3 items-center mt-2 sm:mt-0">
									<Select
										value={selectedYear}
										onValueChange={setSelectedYear}
									>
										<SelectTrigger className="w-28">
											<SelectValue placeholder="Année" />
										</SelectTrigger>
										<SelectContent>
											{generateYearOptions().map(
												(year) => (
													<SelectItem
														key={year}
														value={year.toString()}
													>
														{year}
													</SelectItem>
												)
											)}
										</SelectContent>
									</Select>
									<Button
										onClick={handleDownloadAllInvoices}
										variant="outline"
										size={isMobile ? "sm" : "default"}
										className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50"
									>
										<Download className="h-4 w-4" />
										<span>Télécharger le PDF annuel</span>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					{isLoading ? (
						<div className="flex justify-center items-center py-20">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
						</div>
					) : filteredInvoices && filteredInvoices.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
							{filteredInvoices.map((invoice) => (
								<div key={invoice.id} className="h-full">
									<div className="h-full min-h-[400px] flex flex-col">
										<InvoiceDetails
											invoice={invoice}
											patient={patientDataMap.get(
												invoice.patientId
											)}
											onEdit={() =>
												navigate(
													`/invoices/${invoice.id}`
												)
											}
											onDelete={() => {
												setSelectedInvoiceId(
													invoice.id
												);
												setIsDeleteModalOpen(true);
											}}
											onPrint={() =>
												handlePrintInvoice(invoice)
											}
											onDownload={() =>
												handleDownloadInvoice(invoice)
											}
										/>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-20">
							<FileText className="h-16 w-16 mx-auto text-amber-300 dark:text-amber-600" />
							<h3 className="mt-4 text-xl font-medium">
								Aucune facture trouvée
							</h3>
							<p className="mt-2 text-gray-500 dark:text-gray-400">
								{searchQuery || statusFilter !== "ALL"
									? "Essayez de modifier vos critères de recherche."
									: "Commencez par créer votre première facture."}
							</p>
							<Button
								onClick={() => navigate("/invoices/new")}
								className="mt-6 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600"
							>
								<Plus className="h-4 w-4 mr-2" />
								Créer une facture
							</Button>
						</div>
					)}
				</div>

				{/* Print components hidden section */}
				{printInvoice && (
					<div className="hidden">
						<div ref={printRef}>
							<InvoicePrintView
								invoice={printInvoice}
								patient={printPatient}
								osteopath={printOsteopath}
								cabinet={printCabinet}
							/>
						</div>
					</div>
				)}

				{printAllInvoices && (
					<div className="hidden">
						<div ref={printRef}>
							<div className="p-8">
								<h1 className="text-3xl font-bold text-center mb-8">
									Factures de l'année {selectedYear}
								</h1>
								<div className="space-y-8">
									{printAllInvoices.map((invoice) => {
										const patient = patientDataMap.get(
											invoice.patientId
										); // 👈 récupérer le patient associé
										return (
											<div
												key={invoice.id}
												className="page-break-after mb-4"
											>
												<InvoicePrintView
													invoice={invoice}
													patient={patient} // 👈 et l'envoyer à InvoicePrintView
													osteopath={printOsteopath}
													cabinet={printCabinet}
												/>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				)}

				{isDeleteModalOpen && selectedInvoiceId && (
					<ConfirmDeleteInvoiceModal
						isOpen={isDeleteModalOpen}
						invoiceNumber={selectedInvoiceId
							.toString()
							.padStart(4, "0")}
						onCancel={() => setIsDeleteModalOpen(false)}
						onDelete={handleDeleteInvoice}
					/>
				)}
			</Layout>
		</>
	);
};

export default InvoicesPage;
