import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { TranslatedSelect } from "@/components/ui/translated-select";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Cabinet } from "@/types";

interface IdentityTabProps {
	form: UseFormReturn<PatientFormValues>;
	selectedCabinetId?: number | null;
}

export const IdentityTab = ({ form, selectedCabinetId }: IdentityTabProps) => {
	const [availableCabinets, setAvailableCabinets] = useState<Cabinet[]>([]);

	useEffect(() => {
		const loadCabinets = async () => {
			try {
				const cabinets = await api.getCabinets();
				setAvailableCabinets(cabinets || []);

				// UX intelligente pour cabinet unique
				if (cabinets && cabinets.length === 1) {
					// Cabinet unique : sélection automatique
					form.setValue("cabinetId", cabinets[0].id);
				} else if (selectedCabinetId && !form.getValues("cabinetId")) {
					// Cabinet présélectionné
					form.setValue("cabinetId", selectedCabinetId);
				}
			} catch (error) {
				console.error("Erreur lors du chargement des cabinets:", error);
			}
		};
		loadCabinets();
	}, [selectedCabinetId, form]);

	return (
		<Card>
			<CardContent className="space-y-4 mt-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="firstName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Prénom
									<span className="text-red-500">*</span>
								</FormLabel>
								<FormControl>
									<Input placeholder="Prénom" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="lastName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Nom
									<span className="text-red-500">*</span>
								</FormLabel>
								<FormControl>
									<Input placeholder="Nom" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* Cabinet selection - UX améliorée */}
				{availableCabinets.length > 1 ? (
					<FormField
						control={form.control}
						name="cabinetId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Cabinet</FormLabel>
								<FormControl>
									<Select
										value={field.value?.toString() || ""}
										onValueChange={(value) =>
											field.onChange(
												value ? parseInt(value) : null,
											)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Sélectionner un cabinet" />
										</SelectTrigger>
										<SelectContent>
											{availableCabinets.map(
												(cabinet) => (
													<SelectItem
														key={cabinet.id}
														value={cabinet.id.toString()}
													>
														{cabinet.name}
														{cabinet.address && (
															<span className="text-sm text-muted-foreground ml-2">
																-{" "}
																{
																	cabinet.address
																}
															</span>
														)}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				) : availableCabinets.length === 1 ? (
					<div className="grid grid-cols-1">
						<div className="space-y-2">
							<FormLabel>Cabinet</FormLabel>
							<div className="flex items-center p-3 border border-input bg-muted/50 rounded-md">
								<div className="flex-1">
									<p className="font-medium">
										{availableCabinets[0].name}
									</p>
									{availableCabinets[0].address && (
										<p className="text-sm text-muted-foreground">
											{availableCabinets[0].address}
										</p>
									)}
								</div>
								<div className="text-sm text-muted-foreground bg-primary/10 px-2 py-1 rounded">
									Cabinet unique
								</div>
							</div>
						</div>
						{/* Hidden field pour la valeur */}
						<FormField
							control={form.control}
							name="cabinetId"
							render={({ field }) => (
								<input
									type="hidden"
									{...field}
									value={availableCabinets[0].id}
								/>
							)}
						/>
					</div>
				) : (
					<div className="text-sm text-muted-foreground p-3 border border-dashed rounded-md">
						Aucun cabinet disponible
					</div>
				)}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="gender"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Genre</FormLabel>
								<FormControl>
									<TranslatedSelect
										value={field.value}
										onValueChange={field.onChange}
										enumType="Gender"
										placeholder="Sélectionner un genre"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="birthDate"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Date de naissance</FormLabel>
								<FormControl>
									<Input
										type="date"
										value={field.value || ""}
										onChange={(e) =>
											field.onChange(
												e.target.value || null,
											)
										}
										placeholder="JJ/MM/AAAA"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="address"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Adresse</FormLabel>
							<FormControl>
								<Input
									placeholder="Adresse complète"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
										value={field.value || ""}
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
										value={field.value || ""}
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
										value={field.value || ""}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="phone"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Téléphone</FormLabel>
								<FormControl>
									<Input
										placeholder="Téléphone"
										{...field}
										pattern="^[0-9+]*$"
										title="Entrez uniquement des chiffres et le signe '+'"
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
										placeholder="Email (optionnel)"
										{...field}
										value={field.value || ""}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</CardContent>
		</Card>
	);
};
