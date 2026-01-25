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
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { getCurrentOsteopathId } from "@/services/supabase-api/utils/getCurrentOsteopath";
import { QuotePrintView } from "@/components/quote-print-view";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { exportSecurity } from "@/utils/export-utils";
import { useDemo } from "@/contexts/DemoContext";

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
	const { isDemoMode } = useDemo();
	const printRef = useRef<HTMLDivElement>(null);

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
						Number(quote.cabinetId),
					);
					setCabinetInfo(cabinet);
				}
			} catch (error) {
				console.error(
					"Erreur lors du chargement des informations légales:",
					error,
				);
			} finally {
				setLoadingInfo(false);
			}
		};

		if (isOpen && quote) {
			loadLegalInfo();
		}
	}, [isOpen, quote]);

	const generatePDF = async () => {
		if (!quote || !printRef.current) return;

		try {
			// Générer le canvas depuis le HTML
			const canvas = await html2canvas(printRef.current, {
				scale: 2,
				useCORS: true,
				logging: false,
			});

			// Créer le PDF avec jsPDF
			const imgWidth = 210; // A4 width in mm
			const imgHeight = (canvas.height * imgWidth) / canvas.width;

			const pdf = new jsPDF("p", "mm", "a4");
			const imgData = canvas.toDataURL("image/png");
			pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

			// Sécuriser le PDF avec exportSecurity
			const pdfBytes = pdf.output("arraybuffer");
			const osteopathName = osteopathInfo?.name;
			const securedPdfBytes = await exportSecurity.securePDF(
				new Uint8Array(pdfBytes),
				osteopathName,
			);

			// Télécharger le fichier sécurisé
			const blob = new Blob([new Uint8Array(securedPdfBytes)], {
				type: "application/pdf",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `Devis_${quote.id}_${format(new Date(), "yyyyMMdd")}.pdf`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error generating PDF:", error);
			throw error;
		}
	};

	const handleDownload = async () => {
		try {
			setLoading(true);

			// Toast d'avertissement en mode démo
			if (isDemoMode) {
				toast.warning(
					"Mode démo : le PDF contiendra un filigrane de démonstration",
				);
			}

			await generatePDF();
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
		<>
			{/* Composant caché pour générer le PDF */}
			<div className="hidden">
				<QuotePrintView
					ref={printRef}
					quote={quote}
					patient={(quote.Patient as any) || null}
					osteopath={osteopathInfo}
					cabinet={cabinetInfo}
					items={[]}
				/>
			</div>

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
								<strong>Montant:</strong>{" "}
								{quote.amount.toFixed(2)} €
							</div>
							<div className="flex items-center gap-1">
								<Calendar className="h-3 w-3 dark:text-gray-400" />
								<strong>Valide jusqu'au:</strong>{" "}
								{format(
									new Date(quote.validUntil),
									"dd/MM/yyyy",
									{
										locale: fr,
									},
								)}
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
								<div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
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
														✓ Tampon/Signature
														inclus
													</span>
												</div>
											)}
											<div className="flex gap-4">
												{osteopathInfo.rpps_number && (
													<span>
														RPPS:{" "}
														{
															osteopathInfo.rpps_number
														}
													</span>
												)}
												{osteopathInfo.siret && (
													<span>
														SIRET:{" "}
														{osteopathInfo.siret}
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
						<strong>Note:</strong> Le PDF sera optimisé pour tenir
						sur une page A4 avec toutes les mentions légales, le
						logo du cabinet et le tampon professionnel inclus.
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
							<FileDown className="mr-2 h-4 w-4" />
							Télécharger le PDF
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
