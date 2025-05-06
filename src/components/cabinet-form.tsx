
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Cabinet } from "@/types";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const cabinetFormSchema = z.object({
	name: z.string().min(2, {
		message: "Le nom du cabinet doit comporter au moins 2 caractères",
	}),
	address: z.string().min(5, {
		message: "L'adresse doit comporter au moins 5 caractères",
	}),
	city: z.string().optional(),
	province: z.string().optional(),
	postalCode: z.string().optional(),
	country: z.string().default("France"),
	phone: z.string().min(8, {
		message: "Le numéro de téléphone doit comporter au moins 8 caractères",
	}),
	email: z.string().email().optional().or(z.literal("")),
	website: z.string().url().optional().or(z.literal("")),
	notes: z.string().optional(),
	imageUrl: z.string().optional(),
	logoUrl: z.string().optional(),
});

type CabinetFormValues = z.infer<typeof cabinetFormSchema>;

interface CabinetFormProps {
	cabinet?: Cabinet;
	onSave: (cabinet: Partial<Cabinet>) => Promise<void>;
	isLoading?: boolean;
	osteopathId?: number;
}

export function CabinetForm({
	cabinet,
	onSave,
	isLoading = false,
	osteopathId = 1,
}: CabinetFormProps) {
	const [logoPreview, setLogoPreview] = useState<string | null>(
		cabinet?.logoUrl || null
	);
	const [imagePreview, setImagePreview] = useState<string | null>(
		cabinet?.imageUrl || null
	);

	const form = useForm<CabinetFormValues>({
		resolver: zodResolver(cabinetFormSchema),
		defaultValues: {
			name: cabinet?.name || "",
			address: cabinet?.address || "",
			city: cabinet?.city || "",
			province: cabinet?.province || "",
			postalCode: cabinet?.postalCode || "",
			country: cabinet?.country || "France",
			phone: cabinet?.phone || "",
			email: cabinet?.email || "",
			website: cabinet?.website || "",
			notes: cabinet?.notes || "",
			imageUrl: cabinet?.imageUrl || "",
			logoUrl: cabinet?.logoUrl || "",
		},
	});

	const onSubmit = async (data: CabinetFormValues) => {
		try {
			const cabinetData = {
				...data,
				osteopathId: osteopathId,
			};

			await onSave(cabinetData);

			toast.success(
				cabinet
					? "Cabinet mis à jour avec succès"
					: "Cabinet créé avec succès"
			);
		} catch (error) {
			console.error("Erreur lors de la sauvegarde du cabinet:", error);
			toast.error(
				"Une erreur est survenue lors de la sauvegarde du cabinet"
			);
		}
	};

	const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (loadEvent) => {
				const result = loadEvent.target?.result as string;
				setLogoPreview(result);
				form.setValue("logoUrl", result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (loadEvent) => {
				const result = loadEvent.target?.result as string;
				setImagePreview(result);
				form.setValue("imageUrl", result);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-6 w-full"
			>
				<Card>
					<CardContent className="pt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Nom du cabinet{" "}
											<span className="text-red-500">
												*
											</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Nom du cabinet"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Téléphone{" "}
											<span className="text-red-500">
												*
											</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Numéro de téléphone"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												placeholder="Email"
												type="email"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="website"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Site web</FormLabel>
										<FormControl>
											<Input
												placeholder="https://www.example.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem className="md:col-span-2">
										<FormLabel>
											Adresse{" "}
											<span className="text-red-500">
												*
											</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Adresse"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="city"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Ville</FormLabel>
										<FormControl>
											<Input
												placeholder="Ville"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="postalCode"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Code postal</FormLabel>
										<FormControl>
											<Input
												placeholder="Code postal"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="province"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Province/Région</FormLabel>
										<FormControl>
											<Input
												placeholder="Province ou région"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="country"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pays</FormLabel>
										<FormControl>
											<Input
												placeholder="Pays"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="mt-6">
							<FormField
								control={form.control}
								name="notes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Notes</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Informations supplémentaires sur le cabinet"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Upload Logo */}
						<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<FormField
									control={form.control}
									name="logoUrl"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Logo du cabinet</FormLabel>
											<FormControl>
												<div className="flex flex-col items-center">
													<Input
														id="logo-upload"
														type="file"
														accept="image/*"
														onChange={
															handleLogoUpload
														}
														className="hidden"
													/>
													<Button
														type="button"
														variant="outline"
														onClick={() =>
															document
																.getElementById(
																	"logo-upload"
																)
																?.click()
														}
														className="mb-2"
													>
														Choisir un logo
													</Button>
													{logoPreview && (
														<div className="mt-2 border rounded p-2">
															<img
																src={
																	logoPreview
																}
																alt="Logo preview"
																className="max-h-20 object-contain"
															/>
														</div>
													)}
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Upload Cabinet Image */}
							<div>
								<FormField
									control={form.control}
									name="imageUrl"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Image du cabinet
											</FormLabel>
											<FormControl>
												<div className="flex flex-col items-center">
													<Input
														id="image-upload"
														type="file"
														accept="image/*"
														onChange={
															handleImageUpload
														}
														className="hidden"
													/>
													<Button
														type="button"
														variant="outline"
														onClick={() =>
															document
																.getElementById(
																	"image-upload"
																)
																?.click()
														}
														className="mb-2"
													>
														Choisir une image
													</Button>
													{imagePreview && (
														<div className="mt-2 border rounded p-2">
															<img
																src={
																	imagePreview
																}
																alt="Cabinet image preview"
																className="max-h-40 object-contain"
															/>
														</div>
													)}
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button
							variant="outline"
							type="button"
							onClick={() => window.history.back()}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? (
								<>
									<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
									{cabinet ? "Mise à jour..." : "Création..."}
								</>
							) : cabinet ? (
								"Mettre à jour"
							) : (
								"Créer"
							)}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}
