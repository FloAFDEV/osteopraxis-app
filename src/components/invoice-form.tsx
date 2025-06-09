
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Patient, PaymentStatus, Appointment, Invoice } from "@/types";
import { api } from "@/services/api";
import { toast } from "sonner";
import { CabinetSelector } from "@/components/cabinet/cabinet-selector";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

const formSchema = z.object({
	patientId: z.number(),
	appointmentId: z.number().optional(),
	amount: z.number().min(0, "Le montant doit être positif"),
	date: z.string(),
	paymentStatus: z.enum(["PAID", "PENDING", "OVERDUE", "CANCELLED"]), // Updated to include all PaymentStatus values
	paymentMethod: z.string().optional(),
	tvaExoneration: z.boolean().optional(),
	tvaMotif: z.string().optional(),
	notes: z.string().optional(),
	noConsultation: z.boolean().optional(),
	// Ajout du champ honeypot
	website: z.string().optional()
}).superRefine((data, ctx) => {
	// Vérification du honeypot - si rempli, c'est probablement un bot
	if (data.website && data.website.length > 0) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Validation error",
			path: ["website"]
		});
	}
});

type FormValues = z.infer<typeof formSchema>;

interface InvoiceFormProps {
	initialPatient?: Patient;
	initialAppointment?: Appointment;
	initialInvoice?: Invoice;
	patient?: Patient | null;
	appointment?: Appointment | null;
	onCreate?: () => void;
	onSubmit?: (data: Invoice) => Promise<void>;
}

export const InvoiceForm = ({
	initialPatient,
	initialAppointment,
	initialInvoice,
	patient,
	appointment,
	onCreate,
	onSubmit,
}: InvoiceFormProps) => {
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
		initialPatient || patient || null
	);
	const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(
		initialAppointment || appointment || null
	);
	const [selectedCabinetId, setSelectedCabinetId] = useState<number | undefined>(
		initialInvoice?.cabinetId || appointment?.cabinetId || patient?.cabinetId || undefined
	);
	const [searchParams] = useSearchParams();

	const appointmentIdParam = searchParams.get("appointmentId");

	// Fetch appointment by ID from URL if needed
	useEffect(() => {
		if (!initialAppointment && !appointment && appointmentIdParam) {
			const fetchAppointment = async () => {
				try {
					const fetched = await api.getAppointmentById(
						Number(appointmentIdParam)
					);
					if (fetched) {
						setSelectedAppointment(fetched);
						form.setValue("appointmentId", fetched.id);
						form.setValue("date", fetched.date.split("T")[0]); // ISO → yyyy-MM-dd
						if (!selectedPatient) {
							const patient = await api.getPatientById(
								fetched.patientId
							);
							setSelectedPatient(patient);
							form.setValue("patientId", patient.id);
						}
					}
				} catch (err) {
					console.error("Erreur chargement RDV", err);
				}
			};
			fetchAppointment();
		}
	}, [appointmentIdParam, initialAppointment, appointment]);

	// Patient list si non fourni
	const { data: patients } = useQuery({
		queryKey: ["patients"],
		queryFn: api.getPatients,
		enabled: !initialPatient && !patient,
	});

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			patientId: initialPatient?.id || patient?.id || initialInvoice?.patientId || 0,
			appointmentId: initialAppointment?.id || appointment?.id || initialInvoice?.appointmentId,
			amount: initialInvoice?.amount || 60,
			date: initialInvoice?.date?.split("T")[0] || 
			      initialAppointment?.date?.split("T")[0] ||
				  appointment?.date?.split("T")[0] ||
			      format(new Date(), "yyyy-MM-dd"),
			paymentStatus: initialInvoice?.paymentStatus || "PAID",
			paymentMethod: initialInvoice?.paymentMethod || "CB",
			tvaExoneration: initialInvoice?.tvaExoneration ?? true,
			tvaMotif: initialInvoice?.tvaMotif || "TVA non applicable - Article 261-4-1° du CGI",
			notes: initialInvoice?.notes || "",
			noConsultation: !initialInvoice?.appointmentId && !appointment?.id,
			// Initialize honeypot field with empty string
			website: ""
		},
	});

	const handleFormSubmit = async (data: FormValues) => {
		try {
			const patientId = selectedPatient?.id || data.patientId;

			const invoiceData: any = {
				patientId,
				amount: data.amount,
				date: data.date,
				paymentStatus: data.paymentStatus as PaymentStatus,
				paymentMethod: data.paymentMethod?.trim() || undefined,
				tvaExoneration: data.tvaExoneration,
				tvaMotif: data.tvaMotif,
				notes: data.notes,
				cabinetId: selectedCabinetId, // Ajouter le cabinet sélectionné
			};

			if (!data.noConsultation && (selectedAppointment?.id || appointment?.id)) {
				console.log(
					"[DEBUG] Vérification appointmentId =",
					selectedAppointment?.id || appointment?.id
				);

				// Si ce n'est pas une mise à jour
				if (!initialInvoice) {
					// ✅ Vérifier s'il existe déjà une facture pour ce rendez-vous
					const existingInvoices = await api.getInvoicesByAppointmentId(
						selectedAppointment?.id || appointment?.id
					);

					if (existingInvoices && existingInvoices.length > 0) {
						const existingInvoice = existingInvoices[0];
						toast.warning(
							`❗ Une facture existe déjà pour ce rendez-vous (Facture n° ${existingInvoice.id
								.toString()
								.padStart(4, "0")}).`
						);
						return; // ⛔ Stoppe ici !
					}
				}

				invoiceData.appointmentId = selectedAppointment?.id || appointment?.id;
				console.log("[DEBUG] appointmentId trouvé:", selectedAppointment?.id || appointment?.id);
			}

			console.log(
				"[DEBUG] Données envoyées:",
				invoiceData
			);

			if (initialInvoice) {
				// Mode mise à jour
				if (onSubmit) {
					await onSubmit({
						...initialInvoice,
						...invoiceData
					});
				}
			} else {
				// Mode création
				await api.createInvoice(invoiceData);
				if (onCreate) onCreate();
			}
		} catch (error) {
			console.error("❌ Error processing invoice:", error);
			toast.error("Erreur lors du traitement de la facture");
		}
	};

	const handlePatientSelect = (patientId: string) => {
		const patient = patients?.find((p) => p.id === parseInt(patientId));
		setSelectedPatient(patient || null);
		if (patient) {
			form.setValue("patientId", patient.id);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
				{/* Honeypot field - hidden from users but might be filled by bots */}
				<FormField
					control={form.control}
					name="website"
					render={({ field }) => (
						<FormItem 
							style={{ 
								position: "absolute", 
								left: "-5000px", 
								opacity: 0,
								width: "1px",
								height: "1px",
								overflow: "hidden"
							}}
							aria-hidden="true"
						>
							<FormLabel>Site web</FormLabel>
							<FormControl>
								<Input 
									autoComplete="off"
									tabIndex={-1} 
									{...field} 
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				{/* Sélecteur de cabinet */}
				<div className="mb-6">
					<FormLabel>Cabinet <span className="text-red-500">*</span></FormLabel>
					<CabinetSelector
						selectedCabinetId={selectedCabinetId}
						onCabinetChange={setSelectedCabinetId}
						className="w-full mt-2"
					/>
					{!selectedCabinetId && (
						<p className="text-sm text-red-500 mt-1">
							Veuillez sélectionner un cabinet
						</p>
					)}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-4">
						{!initialPatient && !patient && !initialInvoice && (
							<FormField
								control={form.control}
								name="patientId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Patient</FormLabel>
										<Select
											onValueChange={handlePatientSelect}
											defaultValue={field.value?.toString()}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Sélectionner un patient" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{patients?.map((p) => (
													<SelectItem
														key={p.id}
														value={p.id.toString()}
													>
														{p.firstName}{" "}
														{p.lastName}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{selectedPatient && (
							<Card className="p-4 bg-muted/20">
								<p>
									<strong>Nom :</strong>{" "}
									{selectedPatient.lastName}
								</p>
								<p>
									<strong>Prénom :</strong>{" "}
									{selectedPatient.firstName}
								</p>
								{selectedPatient.email && (
									<p>
										<strong>Email :</strong>{" "}
										{selectedPatient.email}
									</p>
								)}
							</Card>
						)}
					</div>

					<div className="space-y-4">
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Montant (€)</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="0.01"
											min="0"
											{...field}
											onChange={(e) =>
												field.onChange(
													parseFloat(e.target.value)
												)
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Date</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="noConsultation"
							render={({ field }) => (
								<FormItem className="flex items-center gap-3 border p-3 rounded-md">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={(checked) =>
												field.onChange(checked)
											}
										/>
									</FormControl>
									<FormLabel>
										Facture sans consultation associée
									</FormLabel>
								</FormItem>
							)}
						/>
					</div>
				</div>

				<FormField
					control={form.control}
					name="paymentStatus"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Statut de paiement</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Sélectionner un statut" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="PAID">Payée</SelectItem>
									<SelectItem value="PENDING">
										En attente
									</SelectItem>
									<SelectItem value="OVERDUE">
										En retard
									</SelectItem>
									<SelectItem value="CANCELLED">
										Annulée
									</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="paymentMethod"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Mode de paiement</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Sélectionner un mode de paiement" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="CB">
										Carte bancaire
									</SelectItem>
									<SelectItem value="ESPECES">
										Espèces
									</SelectItem>
									<SelectItem value="CHEQUE">
										Chèque
									</SelectItem>
									<SelectItem value="VIREMENT">
										Virement
									</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="tvaMotif"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Motif d'exonération TVA</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="notes"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Notes complémentaires</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end gap-3 pt-4">
					<Button variant="outline" type="button" onClick={onCreate}>
						{initialInvoice ? "Annuler" : "Retour"}
					</Button>
					<Button type="submit" disabled={!selectedCabinetId}>
						{initialInvoice ? "Mettre à jour" : "Créer la facture"}
					</Button>
				</div>
			</form>
		</Form>
	);
};
