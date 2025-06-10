import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/services/api";
import { getCurrentOsteopathId } from "@/services/supabase-api/utils/getCurrentOsteopath";
import { Quote } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Building,
	Calendar,
	Euro,
	FileText,
	Mail,
	MapPin,
	Phone,
	ScrollText,
	StickyNote,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
interface QuoteViewModalProps {
	quote: Quote | null;
	isOpen: boolean;
	onClose: () => void;
}
export function QuoteViewModal({
	quote,
	isOpen,
	onClose,
}: QuoteViewModalProps) {
	const [osteopathInfo, setOsteopathInfo] = useState<any>(null);
	const [cabinetInfo, setCabinetInfo] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const loadLegalInfo = async () => {
			if (!quote) return;
			try {
				setLoading(true);

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
				setLoading(false);
			}
		};
		if (isOpen && quote) {
			loadLegalInfo();
		}
	}, [isOpen, quote]);
	if (!quote) return null;
	const getStatusLabel = (status: string) => {
		switch (status) {
			case "DRAFT":
				return "Brouillon";
			case "SENT":
				return "Envoyé";
			case "ACCEPTED":
				return "Accepté";
			case "REJECTED":
				return "Refusé";
			case "EXPIRED":
				return "Expiré";
			default:
				return status;
		}
	};
	const getStatusVariant = (status: string) => {
		switch (status) {
			case "DRAFT":
				return "secondary";
			case "SENT":
				return "default";
			case "ACCEPTED":
				return "default";
			case "REJECTED":
				return "destructive";
			case "EXPIRED":
				return "destructive";
			default:
				return "secondary";
		}
	};
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-6">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FileText className="h-6 w-6 text-blue-500" />
						Détails du devis
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* En-tête du devis */}
					<div className="flex justify-between items-start">
						<div>
							<h2 className="text-xl font-semibold">
								{quote.title}
							</h2>
							<p className="text-sm text-muted-foreground">
								Devis #{quote.id}
							</p>
						</div>
						<Badge variant={getStatusVariant(quote.status) as any}>
							{getStatusLabel(quote.status)}
						</Badge>
					</div>

					{/* Informations principales */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<User className="h-5 w-5 text-gray-500" />
								<span className="text-sm font-medium">
									Patient:
								</span>
								<span className="text-sm">
									{quote.Patient
										? `${quote.Patient.firstName} ${quote.Patient.lastName}`
										: "Non spécifié"}
								</span>
							</div>

							<div className="flex items-center gap-2">
								<Euro className="h-5 w-5 text-gray-500" />
								<span className="text-sm font-medium">
									Montant:
								</span>
								<span className="text-lg font-semibold text-green-600">
									{quote.amount.toFixed(2)} €
								</span>
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<Calendar className="h-5 w-5 text-gray-500" />
								<span className="text-sm font-medium">
									Créé le:
								</span>
								<span className="text-sm">
									{format(
										new Date(quote.createdAt),
										"dd MMMM yyyy",
										{
											locale: fr,
										}
									)}
								</span>
							</div>

							<div className="flex items-center gap-2">
								<Calendar className="h-5 w-5 text-gray-500" />
								<span className="text-sm font-medium">
									Valide jusqu'au:
								</span>
								<span className="text-sm">
									{format(
										new Date(quote.validUntil),
										"dd MMMM yyyy",
										{
											locale: fr,
										}
									)}
								</span>
							</div>
						</div>
					</div>

					{/* Description */}
					{quote.description && (
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<ScrollText className="h-5 w-5 text-gray-500" />
								<span className="text-sm font-medium">
									Description:
								</span>
							</div>
							<p className="text-sm bg-gray-50 dark:bg-gray-800 dark:text-gray-100 p-3 rounded-md">
								{quote.description}
							</p>
						</div>
					)}

					{/* Notes */}
					{quote.notes && (
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<StickyNote className="h-5 w-5 text-gray-500" />
								<span className="text-sm font-medium">
									Notes:
								</span>
							</div>
							<p className="text-sm bg-yellow-50 dark:bg-yellow-800 dark:text-yellow-100 p-3 rounded-md italic">
								{quote.notes}
							</p>
						</div>
					)}

					{/* Items du devis (si disponibles) */}
					{quote.items && quote.items.length > 0 && (
						<div className="space-y-2">
							<h3 className="text-sm font-medium">
								Détail des prestations:
							</h3>
							<div className="border rounded-md overflow-hidden">
								<table className="w-full text-sm">
									<thead className="bg-gray-50">
										<tr>
											<th className="text-left p-3">
												Description
											</th>
											<th className="text-center p-3">
												Qté
											</th>
											<th className="text-right p-3">
												Prix unitaire
											</th>
											<th className="text-right p-3">
												Total
											</th>
										</tr>
									</thead>
									<tbody>
										{quote.items.map((item, index) => (
											<tr
												key={item.id || index}
												className="border-t"
											>
												<td className="p-3">
													{item.description}
												</td>
												<td className="text-center p-3">
													{item.quantity}
												</td>
												<td className="text-right p-3">
													{item.unitPrice.toFixed(2)}{" "}
													€
												</td>
												<td className="text-right p-3 font-medium">
													{item.total.toFixed(2)} €
												</td>
											</tr>
										))}
									</tbody>
									<tfoot className="bg-gray-50 border-t">
										<tr>
											<td
												colSpan={3}
												className="p-3 text-right font-medium"
											>
												Total:
											</td>
											<td className="p-3 text-right font-bold text-green-600">
												{quote.amount.toFixed(2)} €
											</td>
										</tr>
									</tfoot>
								</table>
							</div>
						</div>
					)}

					{/* Informations légales obligatoires */}
					<div className="border-t pt-6 space-y-4">
						<h3 className="font-semibold text-lg flex items-center gap-2">
							<Building className="h-5 w-5 text-blue-500" />
							Informations légales
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Informations ostéopathe/cabinet */}
							<div className="space-y-3">
								<h4 className="font-medium text-gray-500">
									Praticien
								</h4>
								{loading ? (
									<div className="animate-pulse space-y-2">
										<div className="h-4 bg-gray-200 rounded w-3/4"></div>
										<div className="h-4 bg-gray-200 rounded w-1/2"></div>
									</div>
								) : (
									<div className="text-sm space-y-2">
										{osteopathInfo && (
											<>
												<p className="font-medium">
													{osteopathInfo.name}
												</p>
												<p>
													{osteopathInfo.professional_title ||
														"Ostéopathe D.O."}
												</p>
											</>
										)}
										{cabinetInfo && (
											<>
												<div className="flex items-start gap-2">
													<MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
													<span>
														{cabinetInfo.address}
													</span>
												</div>
												{cabinetInfo.phone && (
													<div className="flex items-center gap-2">
														<Phone className="h-4 w-4 text-gray-500" />
														<span>
															{cabinetInfo.phone}
														</span>
													</div>
												)}
												{cabinetInfo.email && (
													<div className="flex items-center gap-2">
														<Mail className="h-4 w-4 text-gray-500" />
														<span>
															{cabinetInfo.email}
														</span>
													</div>
												)}
											</>
										)}
									</div>
								)}
							</div>

							{/* Numéros légaux */}
							<div className="space-y-3">
								<h4 className="font-medium text-gray-500">
									Numéros légaux
								</h4>
								{loading ? (
									<div className="animate-pulse space-y-2">
										<div className="h-4 bg-gray-200 rounded w-3/4"></div>
										<div className="h-4 bg-gray-200 rounded w-1/2"></div>
									</div>
								) : (
									<div className="text-sm space-y-2">
										{osteopathInfo?.rpps_number && (
											<p>
												<strong>RPPS:</strong>{" "}
												{osteopathInfo.rpps_number}
											</p>
										)}
										{osteopathInfo?.siret && (
											<p>
												<strong>SIRET:</strong>{" "}
												{osteopathInfo.siret}
											</p>
										)}
										{osteopathInfo?.ape_code && (
											<p>
												<strong>Code APE:</strong>{" "}
												{osteopathInfo.ape_code}
											</p>
										)}
										{!osteopathInfo?.rpps_number &&
											!osteopathInfo?.siret && (
												<p className="text-gray-500 italic">
													Numéros en cours
													d'attribution
												</p>
											)}
									</div>
								)}
							</div>
						</div>

						{/* Mentions TVA */}
						<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
							<h4 className="font-medium text-blue-900 mb-2">
								Mentions obligatoires
							</h4>
							<p className="text-blue-800 text-sm font-medium">
								TVA non applicable – article 261-4-1° du CGI
							</p>
							<p className="text-blue-700 text-sm mt-1">
								En votre aimable règlement à réception. Merci de
								votre confiance.
							</p>
						</div>

						{/* Signature/Tampon */}
						{osteopathInfo?.stampUrl && (
							<div className="flex justify-end">
								<div className="text-center space-y-2">
									<p className="text-sm font-medium text-gray-500">
										{osteopathInfo.professional_title ||
											"Ostéopathe D.O."}
									</p>
									<div className="flex justify-center">
										<img
											src={osteopathInfo.stampUrl}
											alt="Signature/Tampon professionnel"
											className="max-h-[100px] w-auto object-contain"
											onError={(e) => {
												const target =
													e.target as HTMLImageElement;
												target.style.display = "none";
											}}
										/>
									</div>
									<p className="text-sm font-medium text-gray-500">
										{osteopathInfo.name}
									</p>
								</div>
							</div>
						)}
					</div>

					{/* Dernière modification */}
					<div className="text-xs text-muted-foreground border-t pt-4">
						Dernière modification:{" "}
						{format(
							new Date(quote.updatedAt),
							"dd/MM/yyyy à HH:mm",
							{
								locale: fr,
							}
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
