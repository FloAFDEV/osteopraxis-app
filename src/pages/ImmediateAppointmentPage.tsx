import { AppointmentStatusDropdown } from "@/components/patients/detail/AppointmentStatusDropdown";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Layout } from "@/components/ui/layout";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useAutoSave } from "@/hooks/use-auto-save";
import { api } from "@/services/api";
import { AppointmentStatus, Patient } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, FileText, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

const ImmediateAppointmentPage = () => {
	const [patient, setPatient] = useState<Patient | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [appointmentId, setAppointmentId] = useState<number | null>(null);
	const [appointmentStatus, setAppointmentStatus] =
		useState<AppointmentStatus>("SCHEDULED");

	const location = useLocation();
	const navigate = useNavigate();
	const queryParams = new URLSearchParams(location.search);
	const patientId = queryParams.get("patientId")
		? parseInt(queryParams.get("patientId")!)
		: undefined;

	const formSchema = z.object({
		reason: z.string().min(3, {
			message: "Le motif doit contenir au moins 3 caractères",
		}),
		notes: z.string().optional(),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			reason: "",
			notes: "",
		},
	});

	// Set up auto-save functionality
	const autoSave = useAutoSave({
		onSave: async () => {
			if (!appointmentId) return;

			const formData = form.getValues();
			await api.updateAppointment(appointmentId, {
				reason: formData.reason,
				notes: formData.notes,
			});
		},
		interval: 30000, // Auto-save every 30 seconds
		debounce: 2000, // Wait 2 seconds after changes before saving
		enabled: !!appointmentId && form.formState.isDirty,
	});

	// Watch for form changes to trigger auto-save
	useEffect(() => {
		const subscription = form.watch(() => {
			if (appointmentId) {
				autoSave.setDirty();
			}
		});

		return () => subscription.unsubscribe();
	}, [form, appointmentId]);

	// Ajout d'une confirmation avant de quitter la page si modifications non enregistrées
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (form.formState.isDirty) {
				const message =
					"Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter cette page ?";
				e.returnValue = message;
				return message;
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () =>
			window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [form.formState.isDirty]);

	// Load patient data and check for existing appointment today
	useEffect(() => {
		const fetchPatient = async () => {
			if (!patientId) {
				toast.error("ID du patient manquant");
				navigate("/patients");
				return;
			}

			setLoading(true);
			try {
				const patientData = await api.getPatientById(patientId);
				if (!patientData) {
					toast.error("Patient non trouvé");
					navigate("/patients");
					return;
				}

				setPatient(patientData);

				// Check if there's already an appointment today for this patient
				const existingAppointment =
					await api.getTodayAppointmentForPatient(patientId);

				if (existingAppointment) {
					console.log(
						"Rendez-vous existant aujourd'hui trouvé:",
						existingAppointment
					);
					setAppointmentId(existingAppointment.id);
					setAppointmentStatus(existingAppointment.status);
					form.reset({
						reason:
							existingAppointment.reason || "Séance immédiate",
						notes: existingAppointment.notes || "",
					});
					toast.info("Une séance existe déjà pour aujourd'hui");
				} else {
					// Create a new immediate appointment
					createInitialAppointment(patientId);
				}
			} catch (error) {
				console.error(
					"Erreur lors du chargement des données du patient:",
					error
				);
				toast.error("Impossible de charger les données du patient");
				navigate("/patients");
			} finally {
				setLoading(false);
			}
		};

		fetchPatient();
	}, [patientId, navigate]);

	// Create initial appointment
	const createInitialAppointment = async (patientId: number) => {
		try {
			const now = new Date();
			const appointmentData = {
				patientId,
				date: now.toISOString(),
				reason: "Séance immédiate",
				status: "SCHEDULED" as AppointmentStatus,
				notificationSent: false,
			};

			const createdAppointment = await api.createAppointment(
				appointmentData
			);
			setAppointmentId(createdAppointment.id);
			form.reset({ reason: "Séance immédiate", notes: "" });
			toast.success("Séance immédiate créée");
		} catch (error) {
			console.error(
				"Erreur lors de la création de la séance immédiate:",
				error
			);
			toast.error("Impossible de créer la séance immédiate");
		}
	};

	// Handle form submission
	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		if (!appointmentId || !patient) return;

		// Validation supplémentaire pour les séances complétées
		if (appointmentStatus === "COMPLETED" && !data.notes?.trim()) {
			toast.error("Veuillez ajouter des notes pour terminer la séance");
			return;
		}

		setSaving(true);
		try {
			await api.updateAppointment(appointmentId, {
				reason: data.reason,
				notes: data.notes,
				status: appointmentStatus,
			});

			// Update patient's HDLM with the session notes if completed
			if (appointmentStatus === "COMPLETED" && data.notes) {
				const currentDate = new Date().toLocaleDateString("fr-FR");
				const formattedNotes = `${currentDate} - ${data.reason}: ${data.notes}`;

				const updatedHdlm = patient.hdlm
					? `${patient.hdlm}\n\n${formattedNotes}`
					: formattedNotes;

				await api.updatePatient({
					...patient,
					hdlm: updatedHdlm,
				});
			}

			toast.success("Séance enregistrée avec succès");
			navigate(`/patients/${patientId}`);
		} catch (error) {
			console.error(
				"Erreur lors de l'enregistrement de la séance:",
				error
			);
			toast.error("Impossible d'enregistrer la séance");
		} finally {
			setSaving(false);
		}
	};

	// Handle manual save
	const handleManualSave = async () => {
		await autoSave.forceSave();
		toast.success("Modifications enregistrées");
		form.formState.dirtyFields = {};
	};

	// Handle status change
	const handleStatusChange = async (status: AppointmentStatus) => {
		if (!appointmentId) return;

		setAppointmentStatus(status);
		try {
			await api.updateAppointmentStatus(appointmentId, status);
			toast.success(`Statut modifié en: ${getStatusLabel(status)}`);
		} catch (error) {
			console.error("Erreur lors du changement de statut:", error);
			toast.error("Impossible de changer le statut");
		}
	};

	const getStatusLabel = (status: AppointmentStatus): string => {
		switch (status) {
			case "SCHEDULED":
				return "Planifiée";
			case "COMPLETED":
				return "Terminée";
			case "CANCELED":
				return "Annulée";
			case "RESCHEDULED":
				return "Reportée";
			case "NO_SHOW":
				return "Absence";
			default:
				return status;
		}
	};

	if (loading) {
		return (
			<Layout>
				<div className="flex justify-center items-center h-full">
					<div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => navigate(-1)}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Retour
				</Button>
			</div>
			<div className="max-w-4xl mx-auto px-4 py-8 mt-20">
				<header className="mb-6">
					<div className="flex justify-between items-center">
						<h1 className="text-3xl font-bold flex items-center gap-2">
							<FileText className="h-7 w-7 text-purple-500" />
							Séance immédiate
						</h1>
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">
									Statut:
								</span>
								<AppointmentStatusDropdown
									status={appointmentStatus}
									onStatusChange={handleStatusChange}
								/>
							</div>
							<AutoSaveIndicator status={autoSave.status} />
						</div>
					</div>
					{patient && (
						<p className="text-muted-foreground mt-2">
							Patient:{" "}
							<span className="font-medium text-foreground">
								{patient.firstName} {patient.lastName}
							</span>
						</p>
					)}
				</header>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
					>
						<Card>
							<CardHeader>
								<CardTitle>Motif de la séance</CardTitle>
							</CardHeader>
							<CardContent>
								<FormField
									control={form.control}
									name="reason"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Motif de consultation
											</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Saisir le motif de la consultation..."
													className="min-h-[100px]"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Compte-rendu de séance</CardTitle>
							</CardHeader>
							<CardContent>
								<FormField
									control={form.control}
									name="notes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Observations et soins effectués
											</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Saisir le compte-rendu de la séance..."
													className="min-h-[200px]"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{patient?.hdlm && (
									<div className="mt-4 p-3 rounded-md bg-muted/30 border">
										<p className="text-sm font-medium mb-1">
											Historique du patient:
										</p>
										<div className="max-h-40 overflow-y-auto text-sm whitespace-pre-line">
											{patient.hdlm}
										</div>
									</div>
								)}

								{appointmentStatus === "COMPLETED" && (
									<Alert className="mt-4">
										<AlertCircle className="h-4 w-4" />
										<AlertDescription>
											Pour terminer la séance, veuillez
											remplir le compte-rendu ci-dessus.
										</AlertDescription>
									</Alert>
								)}
							</CardContent>

							<CardFooter className="flex justify-between pt-6">
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										navigate(`/patients/${patientId}`)
									}
								>
									Annuler
								</Button>
								<div className="flex gap-3">
									<Button
										type="button"
										variant="outline"
										onClick={handleManualSave}
										disabled={
											saving || !form.formState.isDirty
										}
									>
										<Save className="mr-2 h-4 w-4" />
										Enregistrer
									</Button>
									<Button
										type="submit"
										disabled={
											saving ||
											!form.formState.isValid ||
											(appointmentStatus ===
												"COMPLETED" &&
												!form.getValues().notes?.trim())
										}
									>
										Terminer la séance
									</Button>
								</div>
							</CardFooter>
						</Card>
					</form>
				</Form>
			</div>
		</Layout>
	);
};

export default ImmediateAppointmentPage;
