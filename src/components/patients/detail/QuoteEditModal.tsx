
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { quoteService } from "@/services/quote-service";
import { Quote, QuoteStatus } from "@/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface QuoteEditModalProps {
	quote: Quote | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export function QuoteEditModal({
	quote,
	isOpen,
	onClose,
	onSuccess,
}: QuoteEditModalProps) {
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		amount: "",
		validUntil: "",
		status: "DRAFT" as QuoteStatus,
		notes: "",
	});

	useEffect(() => {
		if (quote) {
			setFormData({
				title: quote.title || "",
				description: quote.description || "",
				amount: quote.amount.toString(),
				validUntil: quote.validUntil
					? quote.validUntil.split("T")[0]
					: "",
				status: quote.status,
				notes: quote.notes || "",
			});
		}
	}, [quote]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!quote) return;

		try {
			setLoading(true);

			const updateData = {
				title: formData.title,
				description: formData.description || null,
				amount: parseFloat(formData.amount),
				validUntil: formData.validUntil,
				status: formData.status,
				notes: formData.notes || null,
			};

			await quoteService.updateQuote(quote.id, updateData);
			toast.success("Devis modifié avec succès");
			onSuccess();
			onClose();
		} catch (error) {
			console.error("Error updating quote:", error);
			toast.error("Erreur lors de la modification du devis");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	if (!quote) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800">
				<DialogHeader>
					<DialogTitle>Modifier le devis</DialogTitle>
					<DialogDescription>
						Modifiez les informations du devis. Les modifications seront sauvegardées automatiquement.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="title">Titre *</Label>
							<Input
								id="title"
								value={formData.title}
								onChange={(e) =>
									handleChange("title", e.target.value)
								}
								placeholder="Titre du devis"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="amount">Montant (€) *</Label>
							<Input
								id="amount"
								type="number"
								step="0.01"
								min="0"
								value={formData.amount}
								onChange={(e) =>
									handleChange("amount", e.target.value)
								}
								placeholder="0.00"
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="validUntil">
								Valide jusqu'au *
							</Label>
							<Input
								id="validUntil"
								type="date"
								value={formData.validUntil}
								onChange={(e) =>
									handleChange("validUntil", e.target.value)
								}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="status">Statut</Label>
							<Select
								value={formData.status}
								onValueChange={(value) =>
									handleChange("status", value)
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="DRAFT">
										Brouillon
									</SelectItem>
									<SelectItem value="SENT">Envoyé</SelectItem>
									<SelectItem value="ACCEPTED">
										Accepté
									</SelectItem>
									<SelectItem value="REJECTED">
										Refusé
									</SelectItem>
									<SelectItem value="EXPIRED">
										Expiré
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) =>
								handleChange("description", e.target.value)
							}
							placeholder="Description détaillée du devis"
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="notes">Notes</Label>
						<Textarea
							id="notes"
							value={formData.notes}
							onChange={(e) =>
								handleChange("notes", e.target.value)
							}
							placeholder="Notes internes"
							rows={2}
						/>
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
							Enregistrer
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
