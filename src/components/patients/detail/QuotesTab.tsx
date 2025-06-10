import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quoteService } from "@/services/quote-service";
import { Patient, Quote } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	AlertTriangle,
	CheckCircle,
	Clock,
	Edit,
	FileText,
	Plus,
	Send,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { QuoteCreateForm } from "./QuoteCreateForm";
import { QuoteEditModal } from "./QuoteEditModal";
import { QuoteSendModal } from "./QuoteSendModal";
import { QuoteViewModal } from "./QuoteViewModal";
interface QuotesTabProps {
	patient: Patient;
}
export function QuotesTab({ patient }: QuotesTabProps) {
	const [quotes, setQuotes] = useState<Quote[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [viewQuote, setViewQuote] = useState<Quote | null>(null);
	const [editQuote, setEditQuote] = useState<Quote | null>(null);
	const [sendQuote, setSendQuote] = useState<Quote | null>(null);
	useEffect(() => {
		loadQuotes();
	}, [patient.id]);
	const loadQuotes = async () => {
		try {
			setLoading(true);
			const data = await quoteService.getQuotesByPatientId(patient.id);
			setQuotes(data);
		} catch (error) {
			console.error("Error loading quotes:", error);
			toast.error("Erreur lors du chargement des devis");
		} finally {
			setLoading(false);
		}
	};
	const handleCreateSuccess = () => {
		setShowCreateForm(false);
		loadQuotes();
	};
	const handleViewQuote = (quote: Quote) => {
		setViewQuote(quote);
	};
	const handleEditQuote = (quote: Quote) => {
		setEditQuote(quote);
	};
	const handleSendQuote = (quote: Quote) => {
		setSendQuote(quote);
	};
	const handleModalSuccess = () => {
		loadQuotes();
	};
	const getStatusIcon = (status: string) => {
		switch (status) {
			case "DRAFT":
				return <Edit className="h-4 w-4" />;
			case "SENT":
				return <Send className="h-4 w-4" />;
			case "ACCEPTED":
				return <CheckCircle className="h-4 w-4" />;
			case "REJECTED":
				return <XCircle className="h-4 w-4" />;
			case "EXPIRED":
				return <AlertTriangle className="h-4 w-4" />;
			default:
				return <FileText className="h-4 w-4" />;
		}
	};
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
	if (loading) {
		return (
			<div className="flex justify-center items-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}
	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center px-4 p-2">
				<h3 className="text-lg font-semibold">
					Devis pour {patient.firstName} {patient.lastName}
				</h3>
				<Button
					className="flex items-center gap-2"
					onClick={() => setShowCreateForm(true)}
				>
					<Plus className="h-4 w-4" />
					Nouveau devis
				</Button>
			</div>

			{showCreateForm && (
				<QuoteCreateForm
					patient={patient}
					onSuccess={handleCreateSuccess}
					onCancel={() => setShowCreateForm(false)}
				/>
			)}

			{quotes.length === 0 ? (
				<Card>
					<CardContent className="py-8 text-center">
						<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-medium mb-2">
							Aucun devis
						</h3>
						<p className="text-muted-foreground mb-4">
							Aucun devis n'a encore été créé pour ce patient.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{quotes.map((quote) => (
						<Card
							key={quote.id}
							className="hover:shadow-md transition-shadow"
						>
							<CardHeader className="pb-3">
								<div className="flex justify-between items-start">
									<div>
										<CardTitle className="text-base flex items-center gap-2">
											<FileText className="h-5 w-5 text-blue-500" />
											{quote.title}
										</CardTitle>
										<p className="text-sm text-muted-foreground mt-1">
											Créé le{" "}
											{format(
												new Date(quote.createdAt),
												"dd MMMM yyyy",
												{
													locale: fr,
												}
											)}
										</p>
									</div>
									<Badge
										variant={
											getStatusVariant(
												quote.status
											) as any
										}
										className="flex items-center gap-1"
									>
										{getStatusIcon(quote.status)}
										{getStatusLabel(quote.status)}
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
									<div>
										<span className="text-sm font-medium text-muted-foreground">
											Montant
										</span>
										<p className="text-lg font-semibold">
											{quote.amount.toFixed(2)} €
										</p>
									</div>
									<div>
										<span className="text-sm font-medium text-muted-foreground">
											Valide jusqu'au
										</span>
										<p className="text-sm flex items-center gap-1">
											<Clock className="h-3 w-3" />
											{format(
												new Date(quote.validUntil),
												"dd/MM/yyyy",
												{
													locale: fr,
												}
											)}
										</p>
									</div>
									<div>
										<span className="text-sm font-medium text-muted-foreground">
											Dernière modification
										</span>
										<p className="text-sm">
											{format(
												new Date(quote.updatedAt),
												"dd/MM/yyyy",
												{
													locale: fr,
												}
											)}
										</p>
									</div>
								</div>

								{quote.description && (
									<div className="mb-4">
										<span className="text-sm font-medium text-muted-foreground">
											Description
										</span>
										<p className="text-sm mt-1">
											{quote.description}
										</p>
									</div>
								)}

								{quote.notes && (
									<div className="mb-4">
										<span className="text-sm font-medium text-muted-foreground">
											Notes
										</span>
										<p className="text-sm mt-1 italic">
											{quote.notes}
										</p>
									</div>
								)}

								<div className="flex justify-end gap-2">
									<Button
										variant="outline"
										size="sm"
										className="flex items-center gap-1"
										onClick={() => handleViewQuote(quote)}
									>
										<FileText className="h-3 w-3" />
										Voir
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="flex items-center gap-1"
										onClick={() => handleEditQuote(quote)}
									>
										<Edit className="h-3 w-3" />
										Modifier
									</Button>
									{(quote.status === "DRAFT" ||
										quote.status === "SENT") && (
										<Button
											size="sm"
											className="flex items-center gap-1"
											onClick={() =>
												handleSendQuote(quote)
											}
										>
											<Send className="h-3 w-3" />
											{quote.status === "DRAFT"
												? "Générer"
												: "Regénérer"}
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Modales */}
			<QuoteViewModal
				quote={viewQuote}
				isOpen={!!viewQuote}
				onClose={() => setViewQuote(null)}
			/>

			<QuoteEditModal
				quote={editQuote}
				isOpen={!!editQuote}
				onClose={() => setEditQuote(null)}
				onSuccess={handleModalSuccess}
			/>

			<QuoteSendModal
				quote={sendQuote}
				isOpen={!!sendQuote}
				onClose={() => setSendQuote(null)}
				onSuccess={handleModalSuccess}
			/>
		</div>
	);
}
