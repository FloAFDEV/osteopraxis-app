
import { api } from "@/services/api";
import { AppointmentStatus, Patient } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInYears, parseISO } from "date-fns";
import { Baby, CalendarIcon, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

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
import { Textarea } from "@/components/ui/textarea";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AppointmentConflictDialog } from "@/components/appointment-conflict-dialog";

const appointmentFormSchema = z.object({
	patientId: z.number().min(1, {
		message: "L'ID du patient est requis",
	}),
	date: z.date({
		required_error: "Une date est requise.",
	}),
	time: z.string().min(5, {
		message: "L'heure est requise",
	}),
	reason: z.string().min(2, {
		message: "La raison doit contenir au moins 2 caractères",
	}),
	notes: z.string().optional(),
	status: z
		.enum(["SCHEDULED", "COMPLETED", "CANCELED", "RESCHEDULED", "NO_SHOW"])
		.default("SCHEDULED"),
	website: z.string().optional(), // Ajouté pour le honeypot
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
	defaultValues?: Partial<AppointmentFormValues>;
	appointmentId?: number;
	patients?: Patient[]; // Ajouté pour NewAppointmentPage
	isEditing?: boolean;
	onSuccess?: () => void; // Nouveau prop pour callback de succès
}

export function AppointmentForm({
	defaultValues,
	appointmentId,
	patients: propPatients,
	isEditing,
	onSuccess,
}: AppointmentFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [patients, setPatients] = useState<Patient[]>(propPatients || []);
	const [customTime, setCustomTime] = useState<string | null>(null);
	const [useCustomTime, setUseCustomTime] = useState(false);
	const [conflictDialog, setConflictDialog] = useState<{
		open: boolean;
		conflictInfo: any;
		formData: any;
	}>({
		open: false,
		conflictInfo: null,
		formData: null
	});
	const navigate = useNavigate();
	const { patientId: patientIdParam } = useParams<{ patientId: string }>();

	useEffect(() => {
		if (propPatients) {
			setPatients(propPatients);
			return;
		}

		const fetchPatients = async () => {
			try {
				const patientsData = await api.getPatients();
				setPatients(patientsData);
			} catch (error) {
				console.error("Error fetching patients:", error);
				toast.error("Failed to load patients.");
			}
		};

		fetchPatients();
	}, [propPatients]);

	const form = useForm<AppointmentFormValues>({
		resolver: zodResolver(appointmentFormSchema),
		defaultValues: {
			patientId: defaultValues?.patientId || Number(patientIdParam) || 1,
			date: defaultValues?.date
				? new Date(defaultValues.date)
				: new Date(),
			time: defaultValues?.time || "09:00",
			reason: defaultValues?.reason || "",
			notes: defaultValues?.notes || "",
			status: defaultValues?.status || "SCHEDULED",
			website: defaultValues?.website || "", // Honeypot field
		},
	});

	const handleConflictForceUpdate = async () => {
		if (!conflictDialog.formData) return;
		
		try {
			setIsSubmitting(true);
			
			// Force update by calling the API directly with a flag
			// For now, we'll just retry the same operation
			// In a real implementation, you might want to add a force flag
			await performUpdate(conflictDialog.formData, true);
			
			setConflictDialog({ open: false, conflictInfo: null, formData: null });
			
			if (onSuccess) {
				onSuccess();
			} else {
				setTimeout(() => {
					navigate("/appointments");
				}, 500);
			}
		} catch (error) {
			console.error("Error forcing update:", error);
			toast.error("⛔ Une erreur est survenue lors de la mise à jour forcée.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const performUpdate = async (appointmentData: any, force = false) => {
		if (appointmentId) {
			// For force updates, we might need to temporarily disable the trigger
			// This is a simplified approach - in production you might want more sophisticated handling
			await api.updateAppointment(appointmentId, appointmentData as any);
			toast.success("✅ Séance mise à jour avec succès");
		} else {
			await api.createAppointment(appointmentData as any);
			toast.success("✅ Séance créée avec succès");
		}
	};

	const onSubmit = async (data: AppointmentFormValues) => {
		try {
			setIsSubmitting(true);

			// Combine date and start time
			const dateTime = new Date(data.date);
			const timeToUse = useCustomTime ? customTime : data.time;
			const [hours, minutes] = timeToUse.split(":").map(Number);

			// Vérifier que l'heure est entre 8h et 20h
			if (hours < 8 || hours >= 20) {
				toast.error("⚠️ Les séances doivent être prises entre 8h et 20h");
				setIsSubmitting(false);
				return;
			}
			dateTime.setHours(hours, minutes);

			// L'heure de fin de séance est l'heure du submit SEULEMENT SI statut = COMPLETED
			let endDateTime: Date | undefined;
			if (data.status === "COMPLETED") {
				endDateTime = new Date(); // On prend l'heure du submit
			}

			const appointmentData = {
				patientId: data.patientId,
				date: dateTime.toISOString(),
				start: dateTime.toISOString(),
				end: endDateTime ? endDateTime.toISOString() : undefined,
				reason: data.reason,
				notes: data.notes || null,
				status: data.status as AppointmentStatus,
				notificationSent: false,
				cabinetId: 1, // Valeur par défaut
				osteopathId: 1, // Valeur par défaut
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			await performUpdate(appointmentData);

			if (onSuccess) {
				onSuccess();
			} else {
				setTimeout(() => {
					navigate("/appointments");
				}, 500);
			}
		} catch (error: any) {
			console.error("Error submitting appointment form:", error);
			
			// Check if it's a conflict error
			if (error.isConflict && error.conflictInfo) {
				const selectedPatient = patients.find(p => p.id === data.patientId);
				const patientName = selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : 'le patient sélectionné';
				
				setConflictDialog({
					open: true,
					conflictInfo: error.conflictInfo,
					formData: {
						patientId: data.patientId,
						date: new Date(data.date).toISOString(),
						start: new Date(data.date).toISOString(),
						reason: data.reason,
						notes: data.notes || null,
						status: data.status as AppointmentStatus,
						notificationSent: false,
						cabinetId: 1,
						osteopathId: 1,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					}
				});
				
				toast.warning(`⚠️ Conflit détecté pour ${patientName} le ${format(new Date(data.date), "PPP 'à' HH:mm", { locale: fr })}. Un autre rendez-vous existe déjà sur ce créneau.`, {
					duration: 6000,
				});
			} else if (error.message?.includes("créneau horaire")) {
				// Cas d'erreur de conflit sans détails
				const selectedPatient = patients.find(p => p.id === data.patientId);
				const patientName = selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : 'ce patient';
				
				toast.error(`⛔ Impossible de programmer le rendez-vous pour ${patientName}. Ce créneau horaire est déjà occupé par un autre rendez-vous.`, {
					duration: 8000,
				});
			} else if (error.message?.includes("Patient introuvable")) {
				toast.error("⛔ Patient introuvable. Veuillez actualiser la page et réessayer.");
			} else if (error.message?.includes("non autorisé")) {
				toast.error("⛔ Vous n'êtes pas autorisé à créer un rendez-vous pour ce patient.");
			} else {
				// Erreur générique avec plus de contexte
				const selectedPatient = patients.find(p => p.id === data.patientId);
				const patientName = selectedPatient ? ` pour ${selectedPatient.firstName} ${selectedPatient.lastName}` : '';
				
				toast.error(`⛔ Impossible de ${appointmentId ? 'modifier' : 'créer'} le rendez-vous${patientName}. ${error.message || 'Veuillez réessayer dans quelques instants.'}`, {
					duration: 8000,
				});
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	// Fonction simple pour formater la date en français
	const formatDate = (date: Date) => {
		return format(date, "PPP", { locale: fr });
	};

	const selectedPatient =
		patients.find((p) => p.id === form.getValues("patientId")) || null;

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* Honeypot field - hidden from users */}
					<FormField
						control={form.control}
						name="website"
						render={({ field }) => (
							<FormItem
								style={{
									position: "absolute",
									left: "-5000px",
									opacity: 0,
									height: "1px",
									width: "1px",
									overflow: "hidden",
								}}
								aria-hidden="true"
							>
								<FormControl>
									<Input
										{...field}
										tabIndex={-1}
										autoComplete="off"
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					{/** Champ Patient : si patientId fixé, affichage non éditable, sinon Select */}
					{defaultValues?.patientId && selectedPatient ? (
						<div>
							<label className="block text-sm font-medium mb-1">
								Patient
							</label>
							<div className="flex items-center gap-2 bg-muted/40 px-3 py-2 rounded border text-gray-800 dark:text-gray-200">
								{(() => {
									const age = selectedPatient.birthDate
										? differenceInYears(
												new Date(),
												parseISO(selectedPatient.birthDate)
										  )
										: null;
									const isChild = age !== null && age < 12;
									const iconColor = isChild
										? "text-amber-500"
										: selectedPatient.gender === "Homme"
										? "text-blue-500"
										: selectedPatient.gender === "Femme"
										? "text-pink-500"
										: "text-gray-500";
									const Icon = isChild ? Baby : User;
									return (
										<>
											<Icon className={`w-4 h-4 ${iconColor}`} />
											<span>
												{selectedPatient.lastName} {selectedPatient.firstName}
											</span>
											{age !== null && (
												<span className="text-xs text-muted-foreground ml-2">
													({age} ans)
												</span>
											)}
										</>
									);
								})()}
							</div>
						</div>
					) : (
						<FormField
							control={form.control}
							name="patientId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Patient</FormLabel>
									<Select
										onValueChange={(value) =>
											field.onChange(Number(value))
										}
										defaultValue={String(field.value)}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Sélectionner un patient" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{[...patients]
												.sort((a, b) =>
													a.lastName.localeCompare(b.lastName)
												)
												.map((patient) => {
													const age = patient.birthDate
														? differenceInYears(
																new Date(),
																parseISO(
																	patient.birthDate
																)
														  )
														: null;
													const isChild =
														age !== null && age < 12;
													const iconColor = isChild
														? "text-amber-500"
														: patient.gender === "Homme"
														? "text-blue-500"
														: patient.gender === "Femme"
														? "text-pink-500"
														: "text-gray-500";
													const Icon = isChild ? Baby : User;
													return (
														<SelectItem
															key={patient.id}
															value={String(patient.id)}
														>
															<span className="flex items-center gap-2">
																<Icon
																	className={`w-4 h-4 ${iconColor}`}
																/>
																{patient.lastName}{" "}
																{patient.firstName}
															</span>
														</SelectItem>
													);
												})}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Date de la séance</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant={"outline"}
													className={cn(
														"w-full pl-3 text-left font-normal",
														!field.value &&
															"text-muted-foreground"
													)}
												>
													{field.value ? (
														formatDate(field.value)
													) : (
														<span>
															Choisir une date
														</span>
													)}
													<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent
											className="w-auto p-0"
											align="start"
										>
											{/* Ici nous corrigeons l'erreur en utilisant le composant ui/calendar */}
											<div className="calendar-container p-3">
												{field.value && (
													<div className="text-sm mb-2">
														Sélection:{" "}
														{formatDate(field.value)}
													</div>
												)}
												<div className="grid grid-cols-7 gap-2">
													{Array.from(
														{ length: 31 },
														(_, i) => {
															const day = new Date();
															day.setDate(
																day.getDate() +
																	i -
																	5
															);
															return (
																<Button
																	key={i}
																	type="button"
																	variant={
																		field.value &&
																		day.toDateString() ===
																			field.value.toDateString()
																			? "default"
																			: "outline"
																	}
																	className={cn(
																		"h-9 w-9",
																		day.getMonth() !==
																			new Date().getMonth() &&
																			"opacity-50"
																	)}
																	onClick={() =>
																		field.onChange(
																			day
																		)
																	}
																>
																	{day.getDate()}
																</Button>
															);
														}
													)}
												</div>
											</div>
										</PopoverContent>
									</Pop

over>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="time"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Heure de début de séance</FormLabel>
									<FormControl>
										<Input
											type="time"
											placeholder="HH:MM"
											value={
												useCustomTime
													? customTime
													: field.value
											}
											onChange={(e) => {
												field.onChange(e.target.value);
												setCustomTime(e.target.value);
												setUseCustomTime(true);
											}}
											disabled={isSubmitting}
										/>
									</FormControl>
									<p className="text-xs text-muted-foreground mt-1">
										ℹ️ Lors de la clôture de la séance (bouton « Clôturer la séance »), l'heure réelle de fin sera automatiquement enregistrée selon l'heure à laquelle vous validez le formulaire.
									</p>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="reason"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Raison de la séance</FormLabel>
								<FormControl>
									<Input
										placeholder="Raison de la séance"
										disabled={isSubmitting}
										{...field}
									/>
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
								<FormLabel>Notes (facultatif)</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Notes additionnelles"
										disabled={isSubmitting}
										{...field}
										style={{
											height: "150px",
											resize: "vertical",
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Statut</FormLabel>
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
										<SelectItem value="SCHEDULED">
											Planifiée
										</SelectItem>
										<SelectItem value="COMPLETED">
											Terminée
										</SelectItem>
										<SelectItem value="CANCELED">
											Annulée
										</SelectItem>
										<SelectItem value="RESCHEDULED">
											Reportée
										</SelectItem>
										<SelectItem value="NO_SHOW">
											Absence
										</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onSuccess ? onSuccess() : navigate("/appointments")}
							disabled={isSubmitting}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting
								? (form.getValues("status") === "COMPLETED"
									? "Clôture en cours..."
									: "Enregistrement...")
								: (form.getValues("status") === "COMPLETED"
									? "Clôturer la séance"
									: "Enregistrer la séance")}
						</Button>
					</div>
				</form>
			</Form>

			<AppointmentConflictDialog
				open={conflictDialog.open}
				onOpenChange={(open) => setConflictDialog(prev => ({ ...prev, open }))}
				conflictInfo={conflictDialog.conflictInfo}
				onForceUpdate={handleConflictForceUpdate}
				onCancel={() => setConflictDialog({ open: false, conflictInfo: null, formData: null })}
			/>
		</>
	);
}
