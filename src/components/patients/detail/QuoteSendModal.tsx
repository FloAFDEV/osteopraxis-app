
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
	Download,
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
					body {
						font-family: Arial, sans-serif;
						margin: 20px;
						line-height: 1.6;
					}
					.header {
						display: flex;
						justify-content: space-between;
						margin-bottom: 40px;
						padding-bottom: 20px;
						border-bottom: 2px solid #f59e0b;
					}
					.company-info h1 {
						color: #b45309;
						margin-bottom: 10px;
					}
					.quote-info {
						text-align: right;
					}
					.quote-info h2 {
						color: #b45309;
						margin-bottom: 5px;
					}
					.patient-info {
						background-color: #fef3c7;
						padding: 15px;
						border-left: 4px solid #f59e0b;
						margin: 20px 0;
					}
					.amount-section {
						background-color: #f3f4f6;
						padding: 20px;
						border-radius: 8px;
						margin: 20px 0;
						text-align: center;
					}
					.amount {
						font-size: 24px;
						font-weight: bold;
						color: #b45309;
					}
					.legal-mentions {
						margin-top: 30px;
						padding-top: 20px;
						border-top: 1px solid #d1d5db;
						font-size: 12px;
						color: #6b7280;
					}
					.description {
						margin: 20px 0;
						padding: 15px;
						border: 1px solid #e5e7eb;
						border-radius: 8px;
					}
				</style>
			</head>
			<body>
				<div class="header">
					<div class="company-info">
						<h1>${cabinetInfo?.name || "PatientHub"}</h1>
						<p><strong>${osteopathInfo?.professional_title || "Ostéopathe D.O."}</strong></p>
						<p>${cabinetInfo?.address || ""}</p>
						${cabinetInfo?.phone ? `<p>Tél: ${cabinetInfo.phone}</p>` : ""}
						${cabinetInfo?.email ? `<p>Email: ${cabinetInfo.email}</p>` : ""}
					</div>
					<div class="quote-info">
						<h2>DEVIS</h2>
						<p><strong>N° ${quote.id.toString().padStart(4, "0")}</strong></p>
						<p>Date: ${format(new Date(), "dd/MM/yyyy")}</p>
						<p>Valide jusqu'au: ${format(new Date(quote.validUntil), "dd/MM/yyyy")}</p>
					</div>
				</div>

				<div class="patient-info">
					<h3>Client</h3>
					<p><strong>${quote.Patient ? `${quote.Patient.firstName} ${quote.Patient.lastName}` : "Non spécifié"}</strong></p>
				</div>

				<h3>Détails du devis</h3>
				<p><strong>Titre:</strong> ${quote.title}</p>
				
				${quote.description ? `
				<div class="description">
					<h4>Description:</h4>
					<p>${quote.description}</p>
				</div>
				` : ""}

				<div class="amount-section">
					<p>Montant total</p>
					<div class="amount">${quote.amount.toFixed(2)} €</div>
				</div>

				${quote.notes ? `
				<div class="description">
					<h4>Notes:</h4>
					<p>${quote.notes}</p>
				</div>
				` : ""}

				<div class="legal-mentions">
					<h4>Mentions légales</h4>
					${osteopathInfo?.siret ? `<p>SIRET: ${osteopathInfo.siret}</p>` : ""}
					${osteopathInfo?.rpps_number ? `<p>RPPS: ${osteopathInfo.rpps_number}</p>` : ""}
					<p><strong>TVA non applicable – article 261-4-1° du CGI</strong></p>
					<p>Devis valable jusqu'au ${format(new Date(quote.validUntil), "dd MMMM yyyy", { locale: fr })}</p>
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
						<Download className="h-5 w-5 text-blue-500" />
						Télécharger le devis en PDF
					</DialogTitle>
				</DialogHeader>

				{/* Résumé du devis */}
				<div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
					<div className="flex items-center gap-2 mb-2">
						<FileText className="h-4 w-4 text-gray-600" />
						<span className="font-medium">{quote.title}</span>
					</div>

					<div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
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
							<Calendar className="h-3 w-3" />
							<strong>Valide jusqu'au:</strong>{" "}
							{format(new Date(quote.validUntil), "dd/MM/yyyy", {
								locale: fr,
							})}
						</div>
					</div>

					{/* Aperçu des informations légales */}
					<div className="border-t pt-3 mt-3">
						<div className="flex items-center gap-2 mb-2">
							<Building className="h-4 w-4 text-gray-600" />
							<span className="font-medium text-sm">
								Informations incluses dans le PDF
							</span>
						</div>

						{loadingInfo ? (
							<div className="animate-pulse space-y-1">
								<div className="h-3 bg-gray-200 rounded w-3/4"></div>
								<div className="h-3 bg-gray-200 rounded w-1/2"></div>
							</div>
						) : (
							<div className="text-xs text-gray-600 space-y-1">
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
										<p className="text-blue-600 font-medium">
											TVA non applicable – article
											261-4-1° du CGI
										</p>
									</>
								)}
							</div>
						)}
					</div>
				</div>

				<div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
					<strong>Note:</strong> Le PDF sera généré avec toutes les mentions
					légales obligatoires et ouvrira dans une nouvelle fenêtre pour impression ou sauvegarde.
				</div>

				<div className="flex justify-end gap-3 pt-4">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
					>
						Annuler
					</Button>
					<Button onClick={handleDownload} disabled={loading}>
						{loading && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						<Download className="mr-2 h-4 w-4" />
						Télécharger le PDF
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
