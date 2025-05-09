import { AppointmentHistoryTab } from "@/components/patients/detail/AppointmentHistoryTab";
import { InvoicesTab } from "@/components/patients/detail/InvoicesTab";
import { MedicalInfoTab } from "@/components/patients/detail/MedicalInfoTab";
import { PatientHeader } from "@/components/patients/detail/PatientHeader";
import { PatientInfo } from "@/components/patients/detail/PatientInfo";
import { UpcomingAppointmentsTab } from "@/components/patients/detail/UpcomingAppointmentsTab";
import { MedicalInfoCard } from "@/components/patients/medical-info-card";
import { Layout } from "@/components/ui/layout";
import { PatientStat } from "@/components/ui/patient-stat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/services/api";
import { invoiceService } from "@/services/api/invoice-service";
import { Appointment, AppointmentStatus, Invoice, Patient } from "@/types";
import { format } from "date-fns";
import {
	Activity,
	AlertCircle,
	Calendar,
	ClipboardList,
	History,
	Loader2,
	Stethoscope,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const PatientDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [patient, setPatient] = useState<Patient | null>(null);
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
	const historyTabRef = useRef<HTMLElement | null>(null);
	const getSmokerInfo = () => {
		if (patient.isSmoker) {
			return `Fumeur${
				patient.smokingAmount ? ` (${patient.smokingAmount})` : ""
			}${patient.smokingSince ? ` depuis ${patient.smokingSince}` : ""}`;
		} else if (patient.isExSmoker) {
			return `Ex-fumeur${
				patient.smokingAmount ? ` (${patient.smokingAmount})` : ""
			}${
				patient.quitSmokingDate
					? `, arrêt depuis ${patient.quitSmokingDate}`
					: ""
			}`;
		} else {
			return "Non-fumeur";
		}
	};
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

	useEffect(() => {
		// Find and set the history tab element ref after the component mounts
		const historyTabTrigger = document.querySelector('[value="history"]');
		if (historyTabTrigger) {
			historyTabRef.current = historyTabTrigger as HTMLElement;
		}
	}, []);

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

	const handleUpdateAppointmentStatus = async (
		appointmentId: number,
		status: AppointmentStatus
	) => {
		try {
			setLoading(true);
			await api.updateAppointment(appointmentId, { status });
			// Refresh appointments list
			const updatedAppointments = await api.getAppointmentsByPatientId(
				parseInt(id!)
			);
			setAppointments(updatedAppointments);
			toast.success(
				`Le statut de la séance a été modifié en "${getStatusLabel(
					status
				)}"`
			);
		} catch (error) {
			console.error("Error updating appointment status:", error);
			toast.error("Impossible de modifier le statut de la séance");
		} finally {
			setLoading(false);
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

	const navigateToHistoryTab = () => {
		if (historyTabRef.current) {
			historyTabRef.current.click();
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
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="flex flex-col space-y-6 max-w-6xl mx-auto px-4">
				{/* Header section */}
				<PatientHeader patientId={patient.id} />

				<div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
						<PatientStat
							title="Total séances"
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
						<PatientInfo patient={patient} />

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
									label: "Tabagisme",
									value: getSmokerInfo(),
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
									<Activity className="h-4 w-4 mr-2" />
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
									<Activity className="h-4 w-4 mr-2" />
									Notes d'honoraires
								</TabsTrigger>
							</TabsList>

							<TabsContent value="medical-info">
								<MedicalInfoTab
									patient={patient}
									pastAppointments={pastAppointments}
									onUpdateAppointmentStatus={
										handleUpdateAppointmentStatus
									}
									onNavigateToHistory={navigateToHistoryTab}
								/>
							</TabsContent>

							<TabsContent value="upcoming-appointments">
								<UpcomingAppointmentsTab
									patient={patient}
									appointments={upcomingAppointments}
									onCancelAppointment={
										handleCancelAppointment
									}
									onStatusChange={
										handleUpdateAppointmentStatus
									}
								/>
							</TabsContent>

							<TabsContent value="history">
								<AppointmentHistoryTab
									appointments={pastAppointments}
									onStatusChange={
										handleUpdateAppointmentStatus
									}
									viewMode={viewMode}
									setViewMode={setViewMode}
								/>
							</TabsContent>

							<TabsContent value="invoices">
								<InvoicesTab
									patient={patient}
									invoices={invoices}
								/>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default PatientDetailPage;
