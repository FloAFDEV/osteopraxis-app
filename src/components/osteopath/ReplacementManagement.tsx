import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, UserCheck, AlertCircle } from "lucide-react";
import { useOsteopathReplacements } from "@/hooks/useOsteopathReplacements";
import { useAuthorizedOsteopaths } from "@/hooks/useAuthorizedOsteopaths";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function ReplacementManagement() {
	const {
		replacements,
		loading,
		createReplacement,
		updateReplacement,
		deleteReplacement,
		toggleReplacement,
	} = useOsteopathReplacements();
	const { osteopaths } = useAuthorizedOsteopaths();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingReplacement, setEditingReplacement] = useState<any>(null);
	const [formData, setFormData] = useState({
		replacement_osteopath_id: "",
		start_date: "",
		end_date: "",
		notes: "",
		is_active: true,
	});

	// Filtrer pour ne garder que les ostéopathes qui ne sont pas "self"
	const availableReplacements = osteopaths.filter(
		(o) => o.access_type !== "self",
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.replacement_osteopath_id) {
			toast.error("Veuillez sélectionner un ostéopathe remplaçant");
			return;
		}

		try {
			const currentOsteopath = osteopaths.find(
				(o) => o.access_type === "self",
			);
			if (!currentOsteopath) {
				toast.error("Impossible de trouver votre profil d'ostéopathe");
				return;
			}

			const replacementData = {
				osteopath_id: currentOsteopath.id,
				replacement_osteopath_id: Number(
					formData.replacement_osteopath_id,
				),
				start_date: formData.start_date || undefined,
				end_date: formData.end_date || undefined,
				notes: formData.notes || undefined,
				is_active: formData.is_active,
			};

			if (editingReplacement) {
				await updateReplacement(editingReplacement.id, replacementData);
				toast.success("Remplacement mis à jour");
			} else {
				await createReplacement(replacementData);
				toast.success("Remplacement créé");
			}

			setIsDialogOpen(false);
			resetForm();
		} catch (error: any) {
			toast.error(error.message || "Erreur lors de l'enregistrement");
		}
	};

	const resetForm = () => {
		setFormData({
			replacement_osteopath_id: "",
			start_date: "",
			end_date: "",
			notes: "",
			is_active: true,
		});
		setEditingReplacement(null);
	};

	const handleEdit = (replacement: any) => {
		setEditingReplacement(replacement);
		setFormData({
			replacement_osteopath_id: String(
				replacement.replacement_osteopath_id,
			),
			start_date: replacement.start_date || "",
			end_date: replacement.end_date || "",
			notes: replacement.notes || "",
			is_active: replacement.is_active,
		});
		setIsDialogOpen(true);
	};

	const handleDelete = async (id: number) => {
		if (confirm("Êtes-vous sûr de vouloir supprimer ce remplacement ?")) {
			try {
				await deleteReplacement(id);
				toast.success("Remplacement supprimé");
			} catch (error: any) {
				toast.error(error.message || "Erreur lors de la suppression");
			}
		}
	};

	const handleToggleActive = async (id: number, currentStatus: boolean) => {
		try {
			await toggleReplacement(id, !currentStatus);
			toast.success(
				currentStatus
					? "Remplacement désactivé"
					: "Remplacement activé",
			);
		} catch (error: any) {
			toast.error(error.message || "Erreur lors de la modification");
		}
	};

	const getOsteopathName = (osteopathId: number) => {
		const osteopath = osteopaths.find((o) => o.id === osteopathId);
		return osteopath?.name || `Ostéopathe #${osteopathId}`;
	};

	if (loading) {
		return <div>Chargement...</div>;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<UserCheck className="h-5 w-5" />
					Gestion des Remplacements
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<p className="text-sm text-muted-foreground">
							Gérez qui peut vous remplacer et créer des factures
							en votre nom
						</p>
						<Dialog
							open={isDialogOpen}
							onOpenChange={(open) => {
								setIsDialogOpen(open);
								if (!open) resetForm();
							}}
						>
							<DialogTrigger asChild>
								<Button>
									<Plus className="h-4 w-4 mr-2" />
									Ajouter un remplaçant
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>
										{editingReplacement
											? "Modifier le remplacement"
											: "Ajouter un remplaçant"}
									</DialogTitle>
								</DialogHeader>
								<form
									onSubmit={handleSubmit}
									className="space-y-4"
								>
									<div>
										<Label htmlFor="replacement_osteopath">
											Ostéopathe remplaçant
										</Label>
										<Select
											value={
												formData.replacement_osteopath_id
											}
											onValueChange={(value) =>
												setFormData((prev) => ({
													...prev,
													replacement_osteopath_id:
														value,
												}))
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Sélectionner un ostéopathe" />
											</SelectTrigger>
											<SelectContent>
												{availableReplacements.map(
													(osteopath) => (
														<SelectItem
															key={osteopath.id}
															value={String(
																osteopath.id,
															)}
														>
															<div className="flex items-center gap-2">
																{osteopath.name}
																<Badge
																	variant="outline"
																	className="text-sm"
																>
																	{osteopath.access_type ===
																	"cabinet_colleague"
																		? "Collègue"
																		: "Remplaçant"}
																</Badge>
															</div>
														</SelectItem>
													),
												)}
											</SelectContent>
										</Select>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor="start_date">
												Date de début (optionnel)
											</Label>
											<Input
												id="start_date"
												type="date"
												value={formData.start_date}
												onChange={(e) =>
													setFormData((prev) => ({
														...prev,
														start_date:
															e.target.value,
													}))
												}
											/>
										</div>
										<div>
											<Label htmlFor="end_date">
												Date de fin (optionnel)
											</Label>
											<Input
												id="end_date"
												type="date"
												value={formData.end_date}
												onChange={(e) =>
													setFormData((prev) => ({
														...prev,
														end_date:
															e.target.value,
													}))
												}
											/>
										</div>
									</div>

									<div>
										<Label htmlFor="notes">
											Notes (optionnel)
										</Label>
										<Textarea
											id="notes"
											value={formData.notes}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													notes: e.target.value,
												}))
											}
											placeholder="Raison du remplacement, conditions particulières..."
										/>
									</div>

									<div className="flex items-center space-x-2">
										<Switch
											id="is_active"
											checked={formData.is_active}
											onCheckedChange={(checked) =>
												setFormData((prev) => ({
													...prev,
													is_active: checked,
												}))
											}
										/>
										<Label htmlFor="is_active">Actif</Label>
									</div>

									<div className="flex justify-end gap-2">
										<Button
											type="button"
											variant="outline"
											onClick={() =>
												setIsDialogOpen(false)
											}
										>
											Annuler
										</Button>
										<Button type="submit">
											{editingReplacement
												? "Mettre à jour"
												: "Créer"}
										</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>
					</div>

					{availableReplacements.length === 0 && (
						<div className="text-center py-8 bg-muted/50 rounded-lg">
							<AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
							<p className="text-muted-foreground">
								Aucun ostéopathe disponible pour les
								remplacements.
							</p>
							<p className="text-sm text-muted-foreground mt-1">
								Vous devez d'abord être associé à un cabinet ou
								avoir des collègues.
							</p>
						</div>
					)}

					{replacements.length === 0 ? (
						<div className="text-center py-8">
							<UserCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
							<p className="text-muted-foreground">
								Aucun remplacement configuré
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{replacements.map((replacement) => (
								<div
									key={replacement.id}
									className="flex items-center justify-between p-3 border rounded-lg"
								>
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<span className="font-medium">
												{getOsteopathName(
													replacement.replacement_osteopath_id,
												)}
											</span>
											<Badge
												variant={
													replacement.is_active
														? "default"
														: "secondary"
												}
											>
												{replacement.is_active
													? "Actif"
													: "Inactif"}
											</Badge>
										</div>
										{(replacement.start_date ||
											replacement.end_date) && (
											<p className="text-sm text-muted-foreground">
												{replacement.start_date &&
													format(
														new Date(
															replacement.start_date,
														),
														"dd/MM/yyyy",
														{ locale: fr },
													)}
												{replacement.start_date &&
													replacement.end_date &&
													" - "}
												{replacement.end_date &&
													format(
														new Date(
															replacement.end_date,
														),
														"dd/MM/yyyy",
														{ locale: fr },
													)}
											</p>
										)}
										{replacement.notes && (
											<p className="text-sm text-muted-foreground italic">
												{replacement.notes}
											</p>
										)}
									</div>
									<div className="flex items-center gap-2">
										<Switch
											checked={replacement.is_active}
											onCheckedChange={() =>
												handleToggleActive(
													replacement.id,
													replacement.is_active,
												)
											}
										/>
										<Button
											size="sm"
											variant="outline"
											onClick={() =>
												handleEdit(replacement)
											}
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() =>
												handleDelete(replacement.id)
											}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
