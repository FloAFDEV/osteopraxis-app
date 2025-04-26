
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Patient, PaymentStatus, Appointment } from "@/types";
import { api } from "@/services/api";
import { toast } from "sonner";
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
	appointmentId: z.number().optional(), // Changed from consultationId to appointmentId
	amount: z.number().min(0, "Le montant doit être positif"),
	date: z.string(),
	paymentStatus: z.enum(["PAID", "PENDING", "CANCELED"]),
	paymentMethod: z.string().optional(),
	tvaExoneration: z.boolean().optional(),
	tvaMotif: z.string().optional(),
	notes: z.string().optional(),
	noConsultation: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface InvoiceFormProps {
	initialPatient?: Patient;
	initialAppointment?: Appointment;
	onCreate: () => void;
}

export const InvoiceForm = ({
	initialPatient,
	initialAppointment,
	onCreate,
}: InvoiceFormProps) => {
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
		initialPatient || null
	);
	const [appointment, setAppointment] = useState<Appointment | null>(
		initialAppointment || null
	);
	const [noConsultation, setNoConsultation] = useState<boolean>(false);
	const [searchParams] = useSearchParams();

	const appointmentIdParam = searchParams.get("appointmentId");

	// Fetch appointment by ID from URL if needed
	useEffect(() => {
		if (!initialAppointment && appointmentIdParam) {
			const fetchAppointment = async () => {
				try {
					const fetched = await api.getAppointmentById(
						Number(appointmentIdParam)
					);
					if (fetched) {
						setAppointment(fetched);
						form.setValue("appointmentId", fetched.id); // Changed from consultationId to appointmentId
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
	}, [appointmentIdParam, initialAppointment]);

	// Patient list si non fourni
	const { data: patients } = useQuery({
		queryKey: ["patients"],
		queryFn: api.getPatients,
		enabled: !initialPatient,
	});

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			patientId: initialPatient?.id || 0,
			appointmentId: initialAppointment?.id || undefined, // Changed from consultationId to appointmentId
			amount: 60,
			date:
				initialAppointment?.date?.split("T")[0] ||
				format(new Date(), "yyyy-MM-dd"),
			paymentStatus: "PAID",
			paymentMethod: "CB",
			tvaExoneration: true,
			tvaMotif: "TVA non applicable - Article 261-4-1° du CGI",
			notes: "",
			noConsultation: false,
		},
	});

	const onSubmit = async (data: FormValues) => {
		try {
			const invoiceData: any = {
				patientId: selectedPatient?.id || data.patientId,
				amount: data.amount,
				date: data.date,
				paymentStatus: data.paymentStatus as PaymentStatus,
				paymentMethod:
					data.paymentMethod && data.paymentMethod.trim() !== ""
						? data.paymentMethod
						: undefined,
				tvaExoneration: data.tvaExoneration,
				tvaMotif: data.tvaMotif,
				notes: data.notes,
			};

			if (!data.noConsultation && data.appointmentId) { // Changed from consultationId to appointmentId
				invoiceData.appointmentId = data.appointmentId; // Changed from consultationId to appointmentId
			}

			await api.createInvoice(invoiceData);

			toast.success("Facture créée avec succès");
			onCreate();
		} catch (error) {
			console.error("Error creating invoice:", error);
			toast.error("Erreur lors de la création de la facture");
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
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-4">
						{!initialPatient && (
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
									<SelectItem value="CANCELED">
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
						Annuler
					</Button>
					<Button type="submit">Créer la facture</Button>
				</div>
			</form>
		</Form>
	);
};
