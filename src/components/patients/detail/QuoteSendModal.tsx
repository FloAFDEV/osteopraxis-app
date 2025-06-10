import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";
import { quoteService } from "@/services/quote-service";
import { getCurrentOsteopathId } from "@/services/supabase-api/utils/getCurrentOsteopath";
import { Quote } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Building,
	Calendar,
	FileText,
	Loader2,
	Mail,
	MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
	const [emailData, setEmailData] = useState({
		recipientEmail: "",
		subject: "",
		message: "",
	});

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

	const handleSend = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!quote) return;

		try {
			setLoading(true);

			// D'abord, marquer le devis comme envoyé
			await quoteService.updateQuoteStatus(quote.id, "SENT");

			// TODO: Implémenter l'envoi d'email via une edge function
			// Pour l'instant, on simule l'envoi
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast.success("Devis envoyé avec succès");
			onSuccess();
			onClose();
		} catch (error) {
			console.error("Error sending quote:", error);
			toast.error("Erreur lors de l'envoi du devis");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (field: string, value: string) => {
		setEmailData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	if (!quote) return null;

	// Préparer les données par défaut
	const defaultSubject = `Devis ${quote.title} - ${
		quote.Patient
			? `${quote.Patient.firstName} ${quote.Patient.lastName}`
			: ""
	}`;

	const defaultMessage = `Bonjour,

Veuillez trouver ci-joint votre devis pour les soins d'ostéopathie.

Détails du devis :
- Titre : ${quote.title}
- Montant : ${quote.amount.toFixed(2)} €
- Valide jusqu'au : ${format(new Date(quote.validUntil), "dd MMMM yyyy", {
		locale: fr,
	})}

${quote.description ? `Description : ${quote.description}` : ""}

${
	osteopathInfo
		? `
${osteopathInfo.name}
${osteopathInfo.professional_title || "Ostéopathe D.O."}
${cabinetInfo?.address || ""}
${cabinetInfo?.phone ? `Tél: ${cabinetInfo.phone}` : ""}
${cabinetInfo?.email ? `Email: ${cabinetInfo.email}` : ""}

${osteopathInfo.rpps_number ? `RPPS: ${osteopathInfo.rpps_number}` : ""}
${osteopathInfo.siret ? `SIRET: ${osteopathInfo.siret}` : ""}

TVA non applicable – article 261-4-1° du CGI
`
		: ""
}

N'hésitez pas à me contacter si vous avez des questions.

Cordialement.`;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-800">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5 text-blue-500" />
						Envoyer le devis par email
					</DialogTitle>
				</DialogHeader>

				{/* Résumé du devis avec aperçu légal */}
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
								Informations légales incluses
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

				<form onSubmit={handleSend} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="recipientEmail">
							Email du destinataire *
						</Label>
						<Input
							id="recipientEmail"
							type="email"
							value={emailData.recipientEmail}
							onChange={(e) =>
								handleChange("recipientEmail", e.target.value)
							}
							placeholder="patient@example.com"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="subject">Objet de l'email *</Label>
						<Input
							id="subject"
							value={emailData.subject || defaultSubject}
							onChange={(e) =>
								handleChange("subject", e.target.value)
							}
							placeholder="Objet de l'email"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="message">Message</Label>
						<Textarea
							id="message"
							value={emailData.message || defaultMessage}
							onChange={(e) =>
								handleChange("message", e.target.value)
							}
							placeholder="Message personnalisé"
							rows={12}
							className="font-mono text-sm"
						/>
					</div>

					<div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
						<strong>Note:</strong> Le devis sera automatiquement
						joint au format PDF à cet email avec toutes les mentions
						légales obligatoires.
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={loading}>
							{loading && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							<Mail className="mr-2 h-4 w-4" />
							Envoyer le devis
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
