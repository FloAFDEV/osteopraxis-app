import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Quote } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Building,
	Calendar,
	FileDown,
	FileText,
	Loader2,
	MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { getCurrentOsteopathId } from "@/services/supabase-api/utils/getCurrentOsteopath";

interface QuoteSendModalProps {
	quote: Quote | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export function QuoteSendModal({
	quote,
	isOpen,
	onClose,
	onSuccess,
}: QuoteSendModalProps) {
	const [loading, setLoading] = useState(false);
	const [osteopathInfo, setOsteopathInfo] = useState<any>(null);
	const [cabinetInfo, setCabinetInfo] = useState<any>(null);
	const [loadingInfo, setLoadingInfo] = useState(true);

	useEffect(() => {
		const loadLegalInfo = async () => {
			if (!quote) return;

			try {
				setLoadingInfo(true);

				// Récupérer l'ID de l'ostéopathe connecté
				const osteopathId = await getCurrentOsteopathId();

				// Charger les informations de l'ostéopathe
				if (osteopathId) {
					const osteopath = await api.getOsteopathById(osteopathId);
					setOsteopathInfo(osteopath);
				}

				// Charger les informations du cabinet
				if (quote.cabinetId) {
					const cabinet = await api.getCabinetById(
						Number(quote.cabinetId)
					);
					setCabinetInfo(cabinet);
				}
			} catch (error) {
				console.error(
					"Erreur lors du chargement des informations légales:",
					error
				);
			} finally {
				setLoadingInfo(false);
			}
		};

		if (isOpen && quote) {
			loadLegalInfo();
		}
	}, [isOpen, quote]);

	const generatePDF = () => {
		if (!quote) return;

		const printWindow = window.open("", "_blank");
		if (!printWindow) {
			toast.error("Impossible d'ouvrir la fenêtre d'impression");
			return;
		}

		const html = `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<title>Devis ${quote.title}</title>
				<style>
					@page {
						size: A4;
						margin: 15mm;
					}
					
					body {
						font-family: Arial, sans-serif;
						margin: 3rem;
						padding: 2rem;
						line-height: 1.4;
						font-size: 12px;
						color: #333;
						height: 100vh;
						display: flex;
						flex-direction: column;
					}
					
					.header {
						display: flex;
						justify-content: space-between;
						align-items: flex-start;
						margin-bottom: 25px;
						padding-bottom: 15px;
						border-bottom: 2px solid #f59e0b;
					}
					
					.company-info {
						flex: 1;
					}
					
					.company-info h1 {
						color: #b45309;
						margin: 0 0 8px 0;
						font-size: 22px;
						font-weight: bold;
					}
					
					.logo-container {
						margin: 8px 0;
					}
					
					.logo-container img {
						max-height: 40px;
						max-width: 150px;
						object-fit: contain;
					}
					
					.quote-info {
						text-align: right;
						flex-shrink: 0;
					}
					
					.quote-info h2 {
						color: #b45309;
						margin: 0 0 5px 0;
						font-size: 18px;
					}
					
					.patient-info {
						background-color: #fef3c7;
						padding: 12px;
						border-left: 4px solid #f59e0b;
						margin: 15px 0;
					}
					
					.quote-details {
						margin: 15px 0;
					}
					
					.amount-section {
						background-color: #f3f4f6;
						padding: 15px;
						border-radius: 8px;
						margin: 15px 0;
						text-align: center;
					}
					
					.amount {
						font-size: 20px;
						font-weight: bold;
						color: #b45309;
					}
					
					.content-area {
						flex: 1;
						display: flex;
						flex-direction: column;
					}
					
					.footer-area {
						margin-top: auto;
						display: flex;
						justify-content: space-between;
						align-items: flex-end;
						padding-top: 20px;
						padding: 2rem;
						border-top: 1px solid #d1d5db;
					}
					
					.legal-mentions {
						flex: 1;
						font-size: 11px;
						color: #6b7280;
					}
					
					.signature-area {
						text-align: center;
						flex-shrink: 0;
						margin-left: 20px;
					}
					
					.signature-area img {
						max-height: 80px;
						max-width: 150px;
						object-fit: contain;
					}
					
					.description {
						margin: 15px 0;
						padding: 12px;
						border: 1px solid #e5e7eb;
						border-radius: 8px;
						font-size: 11px;
					}
					
					.compact-grid {
						display: grid;
						grid-template-columns: 1fr 1fr;
						gap: 10px;
						font-size: 11px;
					}
					
					@media print {
						body {
							height: auto !important;
						}
						
						.footer-area {
							position: fixed;
							bottom: 0;
							left: 0;
							right: 0;
							background: white;
						}
					}
				</style>
			</head>
			<body>
				<div class="content-area">
					<div class="header">
						<div class="company-info">
							<h1>${cabinetInfo?.name || "PatientHub"}</h1>
							${
								cabinetInfo?.logoUrl
									? `
								<div class="logo-container">
									<img src="${cabinetInfo.logoUrl}" alt="Logo ${cabinetInfo.name}" onerror="this.style.display='none'" />
								</div>
							`
									: ""
							}
							<p><strong>${
								osteopathInfo?.professional_title ||
								"Ostéopathe D.O."
							}</strong></p>
							<p style="margin: 3px 0;">${cabinetInfo?.address || ""}</p>
							${
								cabinetInfo?.phone
									? `<p style="margin: 3px 0;">Tél: ${cabinetInfo.phone}</p>`
									: ""
							}
							${
								cabinetInfo?.email
									? `<p style="margin: 3px 0;">Email: ${cabinetInfo.email}</p>`
									: ""
							}
						</div>
						<div class="quote-info">
							<h2>DEVIS</h2>
							<p><strong>N° ${quote.id.toString().padStart(4, "0")}</strong></p>
							<p>Date: ${format(new Date(), "dd/MM/yyyy")}</p>
							<p>Valide jusqu'au: ${format(new Date(quote.validUntil), "dd/MM/yyyy")}</p>
						</div>
					</div>

					<div class="patient-info">
						<h3 style="margin: 0 0 8px 0;">Client</h3>
						<p style="margin: 0;"><strong>${
							quote.Patient
								? `${quote.Patient.firstName} ${quote.Patient.lastName}`
								: "Non spécifié"
						}</strong></p>
					</div>

					<div class="quote-details">
						<div class="compact-grid">
							<div><strong>Titre:</strong> ${quote.title}</div>
							<div><strong>Montant:</strong> ${quote.amount.toFixed(2)} €</div>
						</div>
						
						${
							quote.description
								? `
						<div class="description">
							<h4 style="margin: 0 0 8px 0;">Description:</h4>
							<p style="margin: 0;">${quote.description}</p>
						</div>
						`
								: ""
						}

						<div class="amount-section">
							<p style="margin: 0 0 8px 0;">Montant total</p>
							<div class="amount">${quote.amount.toFixed(2)} €</div>
						</div>

						${
							quote.notes
								? `
						<div class="description">
							<h4 style="margin: 0 0 8px 0;">Notes:</h4>
							<p style="margin: 0;">${quote.notes}</p>
						</div>
						`
								: ""
						}
					</div>
				</div>

				<div class="footer-area">
					<div class="legal-mentions">
						<h4 style="margin: 0 0 8px 0;">Mentions légales</h4>
						${
							osteopathInfo?.siret
								? `<p style="margin: 2px 0;">SIRET: ${osteopathInfo.siret}</p>`
								: ""
						}
						${
							osteopathInfo?.rpps_number
								? `<p style="margin: 2px 0;">RPPS: ${osteopathInfo.rpps_number}</p>`
								: ""
						}
						<p style="margin: 5px 0;"><strong>TVA non applicable – article 261-4-1° du CGI</strong></p>
						<p style="margin: 2px 0;">Devis valable jusqu'au ${format(
							new Date(quote.validUntil),
							"dd MMMM yyyy",
							{ locale: fr }
						)}</p>
						<p style="margin: 5px 0 0 0;">En votre aimable règlement à réception. Merci de votre confiance.</p>
					</div>
					
					${
						osteopathInfo?.stampUrl
							? `
					<div class="signature-area">
						<p style="margin: 0 0 5px 0; font-size: 10px;">${
							osteopathInfo.professional_title ||
							"Ostéopathe D.O."
						}</p>
						<img src="${
							osteopathInfo.stampUrl
						}" alt="Signature/Tampon professionnel" onerror="this.style.display='none'" />
						<p style="margin: 5px 0 0 0; font-size: 10px; font-weight: bold;">${
							osteopathInfo.name
						}</p>
					</div>
					`
							: ""
					}
				</div>
			</body>
			</html>
		`;

		printWindow.document.write(html);
		printWindow.document.close();
		printWindow.print();
	};

	const handleDownload = async () => {
		try {
			setLoading(true);
			generatePDF();
			toast.success("PDF généré avec succès");
			onSuccess();
			onClose();
		} catch (error) {
			console.error("Error generating PDF:", error);
			toast.error("Erreur lors de la génération du PDF");
		} finally {
			setLoading(false);
		}
	};

	if (!quote) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FileDown className="h-5 w-5 text-blue-500" />
						Télécharger le devis en PDF
					</DialogTitle>
				</DialogHeader>

				{/* Résumé du devis */}
				<div className="bg-gray-50 dark:bg-gray-700 dark:text-gray-200 p-4 rounded-lg mb-4 space-y-4">
					<div className="flex items-center gap-2 mb-2">
						<FileText className="h-4 w-4 text-gray-600 dark:text-gray-300" />
						<span className="font-medium">{quote.title}</span>
					</div>

					<div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
						<div>
							<strong>Patient:</strong>{" "}
							{quote.Patient
								? `${quote.Patient.firstName} ${quote.Patient.lastName}`
								: "Non spécifié"}
						</div>
						<div>
							<strong>Montant:</strong> {quote.amount.toFixed(2)}{" "}
							€
						</div>
						<div className="flex items-center gap-1">
							<Calendar className="h-3 w-3 dark:text-gray-400" />
							<strong>Valide jusqu'au:</strong>{" "}
							{format(new Date(quote.validUntil), "dd/MM/yyyy", {
								locale: fr,
							})}
						</div>
					</div>

					{/* Aperçu des informations légales */}
					<div className="border-t pt-3 mt-3 dark:text-gray-200">
						<div className="flex items-center gap-2 mb-2">
							<Building className="h-4 w-4 text-gray-600 dark:text-gray-300" />
							<span className="font-medium text-sm">
								Informations incluses dans le PDF
							</span>
						</div>

						{loadingInfo ? (
							<div className="animate-pulse space-y-1 dark:text-gray-400">
								<div className="h-3 bg-gray-200 rounded w-3/4"></div>
								<div className="h-3 bg-gray-200 rounded w-1/2"></div>
							</div>
						) : (
							<div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
								{osteopathInfo && (
									<>
										<div className="flex items-center gap-1">
											<span className="font-medium">
												{osteopathInfo.name}
											</span>
											<span>-</span>
											<span>
												{osteopathInfo.professional_title ||
													"Ostéopathe D.O."}
											</span>
										</div>
										{cabinetInfo?.address && (
											<div className="flex items-center gap-1">
												<MapPin className="h-3 w-3" />
												<span>
													{cabinetInfo.address}
												</span>
											</div>
										)}
										{cabinetInfo?.logoUrl && (
											<div className="flex items-center gap-1">
												<span className="text-blue-600 dark:text-blue-400">
													✓ Logo du cabinet inclus
												</span>
											</div>
										)}
										{osteopathInfo?.stampUrl && (
											<div className="flex items-center gap-1">
												<span className="text-blue-600 dark:text-blue-400">
													✓ Tampon/Signature inclus
												</span>
											</div>
										)}
										<div className="flex gap-4">
											{osteopathInfo.rpps_number && (
												<span>
													RPPS:{" "}
													{osteopathInfo.rpps_number}
												</span>
											)}
											{osteopathInfo.siret && (
												<span>
													SIRET: {osteopathInfo.siret}
												</span>
											)}
										</div>
										<p className="text-blue-600 font-medium dark:text-blue-400">
											TVA non applicable – article
											261-4-1° du CGI
										</p>
									</>
								)}
							</div>
						)}
					</div>
				</div>

				<div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 dark:bg-blue-900 dark:text-blue-300">
					<strong>Note:</strong> Le PDF sera optimisé pour tenir sur
					une page A4 avec toutes les mentions légales, le logo du
					cabinet et le tampon professionnel inclus.
				</div>

				<div className="flex justify-end gap-3 pt-4">
					<Button type="button" variant="outline" onClick={onClose}>
						Annuler
					</Button>
					<Button onClick={handleDownload} disabled={loading}>
						{loading && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						<FileDown className="mr-2 h-4 w-4" />
						Télécharger le PDF
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
