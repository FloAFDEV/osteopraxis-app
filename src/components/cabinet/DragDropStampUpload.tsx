import React, { useState, useRef, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { CabinetFormValues } from "./types";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DragDropStampUploadProps {
	form: UseFormReturn<CabinetFormValues>;
	isSubmitting: boolean;
	currentStampUrl?: string;
	onStampUrlChange: (url: string | null) => void;
}

export function DragDropStampUpload({
	form,
	isSubmitting,
	currentStampUrl,
	onStampUrlChange,
}: DragDropStampUploadProps) {
	const [uploading, setUploading] = useState(false);
	const [dragActive, setDragActive] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(
		currentStampUrl || null,
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const uploadStamp = async (file: File) => {
		try {
			setUploading(true);

			// Vérifier le format du fichier
			if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
				toast.error(
					"Format non supporté. Utilisez PNG ou JPG uniquement.",
				);
				return;
			}

			// Vérifier la taille du fichier (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Le fichier est trop volumineux (max 5MB).");
				return;
			}

			// Obtenir l'utilisateur connecté
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				toast.error(
					"Vous devez être connecté pour uploader un fichier.",
				);
				return;
			}

			// Créer un nom de fichier unique
			const fileExt = file.name.split(".").pop();
			const fileName = `${user.id}/stamp-${Date.now()}.${fileExt}`;

			// Supprimer l'ancien fichier s'il existe
			if (currentStampUrl) {
				const oldPath = currentStampUrl.split("/").pop();
				if (oldPath) {
					await supabase.storage
						.from("stamps")
						.remove([`${user.id}/${oldPath}`]);
				}
			}

			// Upload du nouveau fichier
			const { data, error } = await supabase.storage
				.from("stamps")
				.upload(fileName, file, {
					cacheControl: "3600",
					upsert: false,
				});

			if (error) {
				throw error;
			}

			// Obtenir l'URL publique
			const {
				data: { publicUrl },
			} = supabase.storage.from("stamps").getPublicUrl(fileName);

			setPreviewUrl(publicUrl);
			onStampUrlChange(publicUrl);
			toast.success("Tampon/signature uploadé avec succès !");
		} catch (error) {
			console.error("Erreur upload:", error);
			toast.error("Erreur lors de l'upload du fichier.");
		} finally {
			setUploading(false);
		}
	};

	const handleDrag = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			const file = e.dataTransfer.files[0];
			uploadStamp(file);
		}
	}, []);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			uploadStamp(file);
		}
	};

	const removeStamp = async () => {
		try {
			if (currentStampUrl) {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (user) {
					const fileName = currentStampUrl.split("/").pop();
					if (fileName) {
						await supabase.storage
							.from("stamps")
							.remove([`${user.id}/${fileName}`]);
					}
				}
			}

			setPreviewUrl(null);
			onStampUrlChange(null);
			toast.success("Tampon/signature supprimé.");
		} catch (error) {
			console.error("Erreur suppression:", error);
			toast.error("Erreur lors de la suppression.");
		}
	};

	return (
		<FormField
			control={form.control}
			name="stampUrl"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Tampon ou signature</FormLabel>
					<FormControl>
						<div className="space-y-4">
							{/* Zone de drag & drop */}
							<div
								className={cn(
									"relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
									dragActive
										? "border-primary bg-primary/5"
										: "border-muted-foreground/25 hover:border-muted-foreground/50",
									isSubmitting || uploading
										? "opacity-50 cursor-not-allowed"
										: "",
								)}
								onDragEnter={handleDrag}
								onDragLeave={handleDrag}
								onDragOver={handleDrag}
								onDrop={handleDrop}
								onClick={() =>
									!isSubmitting &&
									!uploading &&
									fileInputRef.current?.click()
								}
							>
								<div className="flex flex-col items-center justify-center text-center space-y-3">
									<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
										<Upload className="h-6 w-6 text-muted-foreground" />
									</div>
									<div className="space-y-1">
										<p className="text-sm font-medium">
											{uploading
												? "Upload en cours..."
												: "Glissez votre image ici"}
										</p>
										<p className="text-sm text-muted-foreground">
											ou cliquez pour sélectionner un
											fichier
										</p>
										<p className="text-sm text-muted-foreground">
											PNG, JPG jusqu'à 5MB
										</p>
									</div>
								</div>

								<input
									ref={fileInputRef}
									type="file"
									accept=".png,.jpg,.jpeg"
									onChange={handleFileSelect}
									disabled={isSubmitting || uploading}
									className="hidden"
								/>
							</div>

							{/* Aperçu de l'image */}
							{previewUrl && (
								<Card>
									<CardContent className="p-4">
										<div className="flex items-center justify-between mb-3">
											<div className="flex items-center gap-2">
												<Image className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm font-medium">
													Aperçu du tampon/signature
												</span>
											</div>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={removeStamp}
												disabled={
													isSubmitting || uploading
												}
												className="text-destructive hover:text-destructive"
											>
												<X className="h-4 w-4" />
											</Button>
										</div>

										<div className="flex items-center justify-center bg-muted/30 rounded-sm p-4">
											<div className="max-h-[150px] max-w-[300px] overflow-hidden">
												<img
													src={previewUrl}
													alt="Aperçu du tampon/signature"
													className="max-h-[150px] w-auto object-contain"
													onError={() => {
														setPreviewUrl(null);
														onStampUrlChange(null);
													}}
												/>
											</div>
										</div>
										<p className="text-sm text-center mt-2 text-muted-foreground">
											Cette image sera affichée en bas de
											chaque note d'honoraires
										</p>
									</CardContent>
								</Card>
							)}
						</div>
					</FormControl>
					<FormDescription>
						Uploadez votre tampon ou signature par glisser-déposer
						ou en cliquant. Format PNG/JPG, max 5MB, hauteur
						recommandée: 150px. Cette image sera utilisée sur vos
						notes d'honoraires.
					</FormDescription>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
