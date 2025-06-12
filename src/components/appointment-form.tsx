
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

	const onSubmit = async (data: AppointmentFormValues) => {
		try {
			setIsSubmitting(true);

			// Combine date and time
			const dateTime = new Date(data.date);
			const timeToUse = useCustomTime ? customTime : data.time;
			const [hours, minutes] = timeToUse.split(":").map(Number);

			// Vérifier que l'heure est entre 8h et 20h
			if (hours < 8 || hours >= 20) {
				toast.error("Les séances doivent être prises entre 8h et 20h");
				setIsSubmitting(false);
				return;
			}
			dateTime.setHours(hours, minutes);

			const endDateTime = new Date(dateTime.getTime() + 30 * 60000);

			// Check if the selected date is in the past
			const now = new Date();
			if (dateTime < now) {
				toast.error("Vous ne pouvez pas sélectionner une date passée.");
				setIsSubmitting(false);
				return;
			}

			// Check for appointment conflicts (example)
			// This would require fetching existing appointments and comparing dates/times
			// For simplicity, we'll just show a warning
			if (dateTime.getDay() === 6 || dateTime.getDay() === 0) {
				toast.warning("Attention : Vous avez sélectionné un week-end.");
			}

			const appointmentData = {
				patientId: data.patientId,
				date: dateTime.toISOString(),
				start: dateTime.toISOString(),
				end: endDateTime.toISOString(),
				reason: data.reason,
				notes: data.notes || null,
				status: data.status as AppointmentStatus,
				notificationSent: false,
				cabinetId: 1, // Valeur par défaut
				osteopathId: 1, // Valeur par défaut
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			if (appointmentId) {
				// Update existing appointment
				await api.updateAppointment(
					appointmentId,
					appointmentData as any
				);
				toast.success("✅ Séance mise à jour avec succès");
			} else {
				// Create new appointment
				await api.createAppointment(appointmentData as any);
				toast.success("✅ Séance créée avec succès");
			}

			// Si on a un callback de succès, l'utiliser au lieu de naviguer
			if (onSuccess) {
				onSuccess();
			} else {
				setTimeout(() => {
					navigate("/appointments");
				}, 500);
			}
		} catch (error) {
			console.error("Error submitting appointment form:", error);
			toast.error("⛔ Une erreur est survenue. Veuillez réessayer.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Fonction simple pour formater la date en français
	const formatDate = (date: Date) => {
		return format(date, "PPP", { locale: fr });
	};

	return (
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

								{/* ✅ SelectContent doit être ici, à l'intérieur de Select */}
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
								</Popover>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="time"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Heure de la séance</FormLabel>
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
							? "Enregistrement..."
							: "Enregistrer la séance"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
