import React, { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/ui/layout";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/services/api";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FancyLoader } from "@/components/ui/fancy-loader";
import { InvoicePrintView } from "@/components/invoice-print-view";
import { toast } from "sonner";
import { Invoice, Patient, Osteopath, Cabinet } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, ArrowLeft, Printer, Download } from "lucide-react";

const InvoiceDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const { user } = useAuth();
	const [invoice, setInvoice] = useState<Invoice | null>(null);
	const [patient, setPatient] = useState<Patient | null>(null);
	const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
	const [cabinet, setCabinet] = useState<Cabinet | null>(null);
	const [loading, setLoading] = useState(true);
	const printRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	// Configuration pour l'impression
	const handlePrint = useReactToPrint({
		documentTitle: `Facture_${id}`,
		contentRef: printRef,
	});

	// Wrapper function to handle the print event
	const onPrintClick = () => {
		handlePrint();
	};

	// Wrapper function to handle the download event
	const onDownloadClick = () => {
		handlePrint();
	};

	// Charger les données de la facture
	useEffect(() => {
		const loadInvoiceData = async () => {
			if (!id) return;

			try {
				setLoading(true);

				// Vérification que api.getInvoiceById existe avant de l'appeler
				if (typeof api.getInvoiceById === "function") {
					const invoiceData = await api.getInvoiceById(parseInt(id));

					if (invoiceData) {
						setInvoice(invoiceData);

						// Charger les données du patient associé
						if (invoiceData.patientId) {
							try {
								const patientData = await api.getPatientById(
									invoiceData.patientId
								);

								setPatient(patientData || null);

								// Si le patient a un osteopathId, utiliser celui-ci pour charger l'ostéopathe
								let osteopathId =
									patientData?.osteopathId ||
									user?.osteopathId;

								if (osteopathId) {
									try {
										const osteopathData =
											await api.getOsteopathById(
												osteopathId
											);
										setOsteopath(osteopathData || null);
										// Charger les données du cabinet associé à l'ostéopathe
										if (osteopathData?.id) {
											try {
												const cabinets =
													await api.getCabinetsByOsteopathId(
														osteopathData.id
													);

												if (
													cabinets &&
													cabinets.length > 0
												) {
													setCabinet(cabinets[0]);
												}
											} catch (cabinetError) {
												console.error(
													"Erreur lors du chargement du cabinet:",
													cabinetError
												);
											}
										}
									} catch (osteopathError) {
										console.error(
											"Erreur lors du chargement de l'ostéopathe:",
											osteopathError
										);
									}
								}
							} catch (patientError) {
								console.error(
									"Erreur lors du chargement du patient:",
									patientError
								);
							}
						}
					} else {
						toast.error("Facture non trouvée");
						navigate("/invoices");
					}
				} else {
					console.error(
						"La fonction api.getInvoiceById n'existe pas"
					);
					toast.error(
						"Impossible de charger la facture: API non disponible"
					);
					navigate("/invoices");
				}
			} catch (error) {
				console.error(
					"Erreur lors du chargement de la facture:",
					error
				);
				toast.error("Erreur lors du chargement de la facture");
			} finally {
				setLoading(false);
			}
		};

		loadInvoiceData();
	}, [id, user, navigate]);

	const handleDelete = async () => {
		if (!invoice) return;

		try {
			// Vérification que api.deleteInvoice existe avant de l'appeler
			if (typeof api.deleteInvoice === "function") {
				await api.deleteInvoice(invoice.id);
				toast.success("Facture supprimée avec succès");
				navigate("/invoices");
			} else {
				console.error("La fonction api.deleteInvoice n'existe pas");
				toast.error(
					"Impossible de supprimer la facture: API non disponible"
				);
			}
		} catch (error) {
			console.error(
				"Erreur lors de la suppression de la facture:",
				error
			);
			toast.error("Erreur lors de la suppression de la facture");
		}
	};

	const getPatientName = () => {
		if (patient) {
			return `${patient.firstName} ${patient.lastName}`;
		}
		if (invoice?.Patient) {
			return `${invoice.Patient.firstName} ${invoice.Patient.lastName}`;
		}
		return `Patient #${invoice?.patientId || ""}`;
	};

	if (loading) {
		return (
			<Layout>
				<div className="max-w-4xl mx-auto py-6">
					<FancyLoader message="Chargement de la facture..." />
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="max-w-4xl mx-auto py-6">
				<Button
					variant="outline"
					onClick={() => navigate("/invoices")}
					className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50 mb-4"
				>
					<ArrowLeft className="h-4 w-4" />
					Retour aux factures
				</Button>

				<div className="flex justify-between items-center mb-6">
					<h1 className="text-3xl font-bold flex items-center gap-3">
						<Activity className="h-8 w-8 text-blue-600 dark:text-blue-500" />
						<span className="text-black">
							Facture n° #
							{invoice?.id.toString().padStart(4, "0")}
						</span>
					</h1>

					<div className="space-x-2">
						<Button onClick={onPrintClick} variant="outline">
							<Printer className="h-4 w-4" /> {/* icône */}
							Imprimer
						</Button>
						<Button onClick={onDownloadClick} variant="default">
							<Download className="h-4 w-4" /> {/* icône */}
							Télécharger
						</Button>
					</div>
				</div>

				<Separator className="mb-6" />

				{invoice && (
					<>
						<div className="mb-6">
							<InvoicePrintView
								invoice={invoice}
								patient={patient || undefined}
								osteopath={osteopath || undefined}
								cabinet={cabinet || undefined}
							/>
						</div>

						<div className="hidden">
							<div ref={printRef}>
								<InvoicePrintView
									invoice={invoice}
									patient={patient}
									osteopath={osteopath}
									cabinet={cabinet}
								/>
							</div>
						</div>
					</>
				)}
			</div>
		</Layout>
	);
};

export default InvoiceDetailPage;
