import { AppointmentCard } from "@/components/appointment-card";
import { InvoiceDetails } from "@/components/invoice-details";
import { MedicalInfoCard } from "@/components/patients/medical-info-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";
import { Layout } from "@/components/ui/layout";
import { PatientStat } from "@/components/ui/patient-stat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/services/api";
import { invoiceService } from "@/services/api/invoice-service";
import { Appointment, Invoice, Patient } from "@/types";
import { differenceInYears, format, parseISO } from "date-fns";
import {
	Activity,
	AlertCircle,
	ArrowLeft,
	Calendar,
	ClipboardList,
	Edit,
	FileText,
	History,
	List,
	Loader2,
	Mail,
	MapPin,
	Phone,
	Plus,
	Receipt,
	Stethoscope,
	User,
	X,
	MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatAppointmentTime } from "@/utils/date-utils";
import { Badge } from "@/components/ui/badge";

interface PatientDetailPageProps {}

const PatientDetailPage: React.FC<PatientDetailPageProps> = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [patient, setPatient] = useState<Patient | null>(null);
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

	useEffect(() => {
		const fetchPatientData = async () => {
			setLoading(true);
			setError(null);
			try {
				if (!id) {
					setError("Patient ID is missing.");
					return;
				}
				const patientId = parseInt(id, 10);
				const [patientData, appointmentsData, invoicesData] =
					await Promise.all([
						api.getPatientById(patientId),
						api.getAppointmentsByPatientId(patientId),
						invoiceService.getInvoicesByPatientId(patientId),
					]);

				setPatient(patientData);
				setAppointments(appointmentsData);
				setInvoices(invoicesData);
			} catch (e: any) {
				setError(e.message || "Failed to load patient data.");
				toast.error(
					"Impossible de charger les informations du patient. Veuillez réessayer."
				);
			} finally {
				setLoading(false);
			}
		};
		fetchPatientData();
	}, [id]);

	const getInitials = (firstName: string, lastName: string) => {
		return `${firstName.charAt(0)}${lastName.charAt(0)}`;
	};

	const genderColors = {
		lightBg:
			patient?.gender === "Homme"
				? "bg-blue-50"
				: patient?.gender === "Femme"
				? "bg-pink-50"
				: "bg-gray-50",
		darkBg:
			patient?.gender === "Homme"
				? "dark:bg-blue-900"
				: patient?.gender === "Femme"
				? "dark:bg-pink-900"
				: "dark:bg-gray-800",
		textColor:
			patient?.gender === "Homme"
				? "text-blue-500"
				: patient?.gender === "Femme"
				? "text-pink-500"
				: "text-gray-500",
		avatarBg:
			patient?.gender === "Homme"
				? "bg-blue-200"
				: patient?.gender === "Femme"
				? "bg-pink-200"
				: "bg-gray-200",
	};

	const upcomingAppointments = appointments
		.filter((appointment) => new Date(appointment.date) >= new Date())
		.sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		);
	const pastAppointments = appointments
		.filter((appointment) => new Date(appointment.date) < new Date())
		.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		);

	// Add processed invoices
	const sortedInvoices = [...invoices].sort((a, b) => {
		return new Date(b.date).getTime() - new Date(a.date).getTime();
	});

	const handleCancelAppointment = async (appointmentId: number) => {
		try {
			await api.cancelAppointment(appointmentId);
			// Refresh appointments list
			const updatedAppointments = await api.getAppointmentsByPatientId(
				parseInt(id!)
			);
			setAppointments(updatedAppointments);
			toast.success("La séance a été annulée avec succès");
		} catch (error) {
			console.error("Error canceling appointment:", error);
			toast.error("Impossible d'annuler la séance");
		}
	};

	if (loading) {
		return (
			<Layout>
				<div className="flex justify-center items-center h-full">
					<Loader2 className="h-6 w-6 animate-spin" />
				</div>
			</Layout>
		);
	}

	if (error || !patient) {
		return (
			<Layout>
				<div className="flex flex-col justify-center items-center h-full">
					<AlertCircle className="h-10 w-10 text-red-500 mb-4" />
					<p className="text-xl font-semibold text-center">
						{error || "Patient non trouvé"}
					</p>
					<Button variant="outline" asChild>
						<Link to="/patients">
							Retour à la liste des patients
						</Link>
					</Button>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="flex flex-col space-y-6 max-w-6xl mx-auto px-4">
				{/* Header section */}
				<div className="flex justify-between items-start">
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" asChild>
							<Link to="/patients">
								{" "}
								<ArrowLeft className="mr-2 h-4 w-4" />
								Retour
							</Link>
						</Button>
					</div>

					<div className="flex gap-2">
						<Button variant="outline" asChild>
							<Link to={`/patients/${patient.id}/edit`}>
								<Edit className="mr-2 h-4 w-4" />
								Modifier
							</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link to={`/appointments?patientId=${patient.id}`}>
								<Calendar className="mr-2 h-4 w-4" />
								Voir les séances
							</Link>
						</Button>
						<Button asChild>
							<Link
								to={`/appointments/new?patientId=${patient.id}`}
							>
								<Plus className="mr-2 h-4 w-4" />
								Nouvelle séance
							</Link>
						</Button>
					</div>
				</div>

				<div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
						<PatientStat
							title="Total Séances"
							value={appointments.length}
							icon={<Calendar className="h-5 w-5" />}
							colorClass="text-blue-500"
						/>
						<PatientStat
							title="Séances à venir"
							value={upcomingAppointments.length}
							icon={<ClipboardList className="h-5 w-5" />}
							colorClass="text-purple-500"
						/>
						<PatientStat
							title="En cours de traitement"
							value={patient.currentTreatment ? "Oui" : "Non"}
							icon={<Stethoscope className="h-5 w-5" />}
							colorClass="text-emerald-500"
						/>
						<PatientStat
							title="Dernière Séance"
							value={
								pastAppointments[0]
									? format(
											new Date(pastAppointments[0].date),
											"dd/MM/yyyy"
									  )
									: "Aucune"
							}
							icon={<History className="h-5 w-5" />}
							colorClass="text-amber-500"
						/>
					</div>
				</div>

				{/* Main content grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left column - Patient info */}
					<div className="space-y-6">
						<Card>
							<CardContent
								className={`p-6 ${genderColors.lightBg}`}
							>
								<div className="flex items-center space-x-4">
									<Avatar
										className={`h-16 w-16 ${genderColors.darkBg} ${genderColors.textColor}`}
									>
										<AvatarFallback
											className={genderColors.avatarBg}
										>
											{getInitials(
												patient.firstName,
												patient.lastName
											)}
										</AvatarFallback>
									</Avatar>
									<div>
										<CardTitle
											className={`text-2xl font-bold ${genderColors.textColor}`}
										>
											<User className="mr-2 h-6 w-6" />
											{patient.firstName}{" "}
											{patient.lastName}
										</CardTitle>
										<CardDescription>
											{patient.gender === "Homme"
												? "Homme"
												: patient.gender === "Femme"
												? "Femme"
												: "Non spécifié"}
											,{" "}
											{differenceInYears(
												new Date(),
												parseISO(patient.birthDate)
											)}{" "}
											ans
										</CardDescription>
									</div>
								</div>

								{/* Contact Information */}
								<div className="mt-6 space-y-4 dark:text-slate-800">
									<div className="flex items-center space-x-2">
										<MapPin className="h-4 w-4 text-muted-foreground" />
										<span>{patient.address}</span>
									</div>
									<div className="flex items-center space-x-2">
										<Mail className="h-4 w-4 text-muted-foreground" />
										<a
											href={`mailto:${patient.email}`}
											className="hover:underline"
										>
											{patient.email}
										</a>
									</div>
									<div className="flex items-center space-x-2">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<span>{patient.phone}</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<MedicalInfoCard
							title="Informations personnelles"
							items={[
								{
									label: "Statut marital",
									value:
										patient.maritalStatus === "SINGLE"
											? "Célibataire"
											: patient.maritalStatus ===
											  "MARRIED"
											? "Marié(e)"
											: patient.maritalStatus ===
											  "DIVORCED"
											? "Divorcé(e)"
											: patient.maritalStatus ===
											  "WIDOWED"
											? "Veuf/Veuve"
											: patient.maritalStatus ===
											  "PARTNERED"
											? "En couple"
											: patient.maritalStatus ===
											  "ENGAGED"
											? "Fiancé(e)"
											: "Non spécifié",
								},
								{
									label: "Enfants",
									value:
										patient.childrenAges &&
										patient.childrenAges.length > 0
											? `${
													patient.childrenAges.length
											  } enfant(s) (${patient.childrenAges
													.sort((a, b) => a - b)
													.join(", ")} ans)`
											: "Pas d'enfants",
								},
								{
									label: "Latéralité",
									value:
										patient.handedness === "RIGHT"
											? "Droitier(ère)"
											: patient.handedness === "LEFT"
											? "Gaucher(ère)"
											: patient.handedness ===
											  "AMBIDEXTROUS"
											? "Ambidextre"
											: "Non spécifié",
								},
								{
									label: "Fumeur",
									value: patient.isSmoker ? "Oui" : "Non",
								},
								{
									label: "Contraception",
									value:
										patient.contraception === "NONE"
											? "Aucune"
											: patient.contraception === "PILLS"
											? "Pilule"
											: patient.contraception === "PATCH"
											? "Patch"
											: patient.contraception === "RING"
											? "Anneau vaginal"
											: patient.contraception === "IUD"
											? "Stérilet"
											: patient.contraception ===
											  "IMPLANTS"
											? "Implant"
											: patient.contraception === "CONDOM"
											? "Préservatif"
											: patient.contraception ===
											  "DIAPHRAGM"
											? "Diaphragme"
											: "Non spécifié",
								},
							]}
						/>
					</div>

					<div className="lg:col-span-2">
						<Tabs defaultValue="medical-info">
							<TabsList className="grid w-full grid-cols-4">
								<TabsTrigger value="medical-info">
									<FileText className="h-4 w-4 mr-2" />
									Dossier médical
								</TabsTrigger>
								<TabsTrigger value="upcoming-appointments">
									<Calendar className="h-4 w-4 mr-2" />
									Séances à venir
								</TabsTrigger>
								<TabsTrigger value="history">
									<History className="h-4 w-4 mr-2" />
									Historique
								</TabsTrigger>
								<TabsTrigger value="invoices">
									<Receipt className="h-4 w-4 mr-2" />
									Notes d'honoraires
								</TabsTrigger>
							</TabsList>

							<TabsContent
								value="medical-info"
								className="space-y-6 mt-6"
							>
								<MedicalInfoCard
									title="Médecins et spécialistes"
									items={[
										{
											label: "Médecin traitant",
											value: patient.generalPractitioner,
										},
										{
											label: "Ophtalmologiste",
											value: patient.ophtalmologistName,
										},
										{
											label: "ORL",
											value: patient.entDoctorName,
										},
										{
											label: "Gastro-entérologue",
											value: patient.digestiveDoctorName,
										},
									]}
								/>

								<MedicalInfoCard
									title="Antécédents médicaux"
									items={[
										{
											label: "Traitement actuel",
											value: patient.currentTreatment,
											showSeparatorAfter: true,
										},
										{
											label: "Antécédents chirurgicaux",
											value: patient.surgicalHistory,
										},
										{
											label: "Antécédents traumatiques",
											value: patient.traumaHistory,
										},
										{
											label: "Antécédents rhumatologiques",
											value: patient.rheumatologicalHistory,
											showSeparatorAfter: true,
										},
										{
											label: "Problèmes digestifs",
											value: patient.digestiveProblems,
										},
										{
											label: "Problèmes ORL",
											value: patient.entProblems,
										},
										{
											label: "Correction visuelle",
											value: patient.hasVisionCorrection
												? "Oui"
												: "Non",
										},
									]}
								/>

								{/* Aperçu des dernières séances */}
								<Card className="mt-6">
									<CardContent className="p-6">
										<div className="flex justify-between items-center mb-4">
											<h3 className="font-semibold text-lg flex items-center gap-2">
												<MessageSquare className="h-5 w-5 text-purple-500" />
												Dernières séances et comptes
												rendus
											</h3>
											<Button
												variant="ghost"
												size="sm"
												asChild
											>
												<Link
													to="#history"
													onClick={() => {
														const historyTab =
															document.querySelector(
																'[data-state="inactive"][value="history"]'
															) as HTMLElement | null;
														historyTab?.click();
													}}
												>
													Voir tout l'historique
												</Link>
											</Button>
										</div>

										{pastAppointments.length === 0 ? (
											<p className="text-center text-muted-foreground py-4">
												Aucune séance passée
											</p>
										) : (
											<div className="space-y-4 max-h-80 overflow-y-auto pr-2">
												{pastAppointments
													.slice(0, 3)
													.map((appointment) => (
														<div
															key={appointment.id}
															className="border-b pb-3 last:border-0"
														>
															<div className="flex justify-between items-center">
																<div className="font-medium">
																	{format(
																		new Date(
																			appointment.date
																		),
																		"dd/MM/yyyy"
																	)}{" "}
																	-{" "}
																	{formatAppointmentTime(
																		appointment.date
																	)}
																</div>
																<Badge
																	className={
																		appointment.status ===
																		"COMPLETED"
																			? "bg-green-500"
																			: "bg-red-500"
																	}
																>
																	{appointment.status ===
																	"COMPLETED"
																		? "Terminée"
																		: "Annulée"}
																</Badge>
															</div>
															<div className="text-sm text-muted-foreground mt-1">
																Motif :{" "}
																{
																	appointment.reason
																}
															</div>
															{appointment.notes && (
																<div className="mt-2 pl-3 border-l-2 border-purple-200">
																	<p className="text-sm text-muted-foreground italic whitespace-pre-line">
																		{
																			appointment.notes
																		}
																	</p>
																</div>
															)}
														</div>
													))}
											</div>
										)}
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent
								value="upcoming-appointments"
								className="space-y-4 mt-6"
							>
								{upcomingAppointments.length === 0 ? (
									<div className="text-center py-8">
										<Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
										<h3 className="text-xl font-medium">
											Aucune séance à venir
										</h3>
										<p className="text-muted-foreground m-2">
											Ce patient n'a pas de séance
											planifiée.
										</p>
										<Button asChild variant="outline">
											<Link
												to={`/appointments/new?patientId=${patient.id}`}
											>
												<Plus className="mr-2 h-4 w-4" />
												Planifier une séance
											</Link>
										</Button>
									</div>
								) : (
									<div className="grid gap-4">
										{upcomingAppointments.map(
											(appointment) => (
												<AppointmentCard
													key={appointment.id}
													appointment={appointment}
													patient={patient}
													onCancel={() =>
														handleCancelAppointment(
															appointment.id
														)
													}
												/>
											)
										)}
									</div>
								)}
							</TabsContent>

							<TabsContent
								value="history"
								className="space-y-4 mt-6"
							>
								<div className="flex justify-between items-center mb-4">
									<h3 className="text-lg font-semibold">
										Historique des séances
									</h3>
									<div className="flex space-x-2">
										<Button
											variant={
												viewMode === "cards"
													? "default"
													: "outline"
											}
											size="sm"
											onClick={() => setViewMode("cards")}
										>
											Vue cards
										</Button>
										<Button
											variant={
												viewMode === "table"
													? "default"
													: "outline"
											}
											size="sm"
											onClick={() => setViewMode("table")}
										>
											Vue tableau
										</Button>
									</div>
								</div>

								{pastAppointments.length === 0 ? (
									<div className="text-center py-8">
										<Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
										<h3 className="text-xl font-medium">
											Aucun historique
										</h3>
										<p className="text-muted-foreground mt-2">
											Ce patient n'a pas d'historique de
											séance.
										</p>
									</div>
								) : viewMode === "cards" ? (
									<div className="grid gap-4">
										{pastAppointments.map((appointment) => (
											<AppointmentCard
												key={appointment.id}
												appointment={appointment}
												patient={patient}
											/>
										))}
									</div>
								) : (
									<div className="rounded-md border">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Date</TableHead>
													<TableHead>Heure</TableHead>
													<TableHead>Motif</TableHead>
													<TableHead>
														Statut
													</TableHead>
													<TableHead>Notes</TableHead>
													<TableHead className="text-right">
														Actions
													</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{pastAppointments.map(
													(appointment) => (
														<TableRow
															key={appointment.id}
														>
															<TableCell className="font-medium">
																{format(
																	new Date(
																		appointment.date
																	),
																	"dd/MM/yyyy"
																)}
															</TableCell>
															<TableCell>
																{formatAppointmentTime(
																	appointment.date
																)}
															</TableCell>
															<TableCell>
																{
																	appointment.reason
																}
															</TableCell>
															<TableCell>
																<Badge
																	className={
																		appointment.status ===
																		"COMPLETED"
																			? "bg-green-500"
																			: appointment.status ===
																			  "CANCELED"
																			? "bg-red-500"
																			: "bg-amber-500"
																	}
																>
																	{appointment.status ===
																	"COMPLETED"
																		? "Terminée"
																		: appointment.status ===
																		  "CANCELED"
																		? "Annulée"
																		: "Reportée"}
																</Badge>
															</TableCell>
															<TableCell>
																{appointment.notes ? (
																	<Button
																		variant="ghost"
																		size="sm"
																		className="h-8 flex items-center gap-1"
																		onClick={() => {
																			toast.info(
																				<div>
																					<h3 className="font-medium mb-1">
																						Notes
																						de
																						séance
																					</h3>
																					<p className="whitespace-pre-line text-sm">
																						{
																							appointment.notes
																						}
																					</p>
																				</div>,
																				{
																					duration: 10000,
																				}
																			);
																		}}
																	>
																		<MessageSquare className="h-3 w-3" />
																		Voir
																	</Button>
																) : (
																	<span className="text-muted-foreground text-sm">
																		Aucune
																	</span>
																)}
															</TableCell>
															<TableCell className="text-right">
																<Button
																	variant="outline"
																	size="sm"
																	asChild
																	className="h-8"
																>
																	<Link
																		to={`/appointments/${appointment.id}/edit`}
																	>
																		Détails
																	</Link>
																</Button>
															</TableCell>
														</TableRow>
													)
												)}
											</TableBody>
										</Table>
									</div>
								)}
							</TabsContent>

							<TabsContent
								value="invoices"
								className="space-y-4 mt-6"
							>
								<div className="flex justify-between items-center mb-4">
									<h3 className="text-lg font-semibold">
										Notes d'honoraires du patient
									</h3>
									<Button asChild>
										<Link
											to={`/invoices/new?patientId=${patient.id}`}
										>
											<Plus className="mr-2 h-4 w-4" />
											Nouvelle Note d'honoraire
										</Link>
									</Button>
								</div>

								{sortedInvoices.length === 0 ? (
									<div className="text-center py-8">
										<Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
										<h3 className="text-xl font-medium">
											Aucune Note d'honoraire
										</h3>
										<p className="text-muted-foreground mt-2">
											Ce patient n'a pas encore de notes
											d'honoraires.
										</p>
									</div>
								) : (
									<div className="grid gap-4">
										{sortedInvoices.map((invoice) => (
											<InvoiceDetails
												key={invoice.id}
												invoice={invoice}
												patientName={`${patient.firstName} ${patient.lastName}`}
												onEdit={() => {
													// Navigate to invoice edit page
													window.location.href = `/invoices/${invoice.id}/edit`;
												}}
											/>
										))}
									</div>
								)}
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default PatientDetailPage;
