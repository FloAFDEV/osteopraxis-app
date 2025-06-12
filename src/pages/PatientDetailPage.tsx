import { AppointmentHistoryTab } from "@/components/patients/detail/AppointmentHistoryTab";
import { InvoicesTab } from "@/components/patients/detail/InvoicesTab";
import { QuotesTab } from "@/components/patients/detail/QuotesTab";
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
import {
	translateContraception,
	translateHandedness,
	translateMaritalStatus,
} from "@/utils/patient-form-helpers";
import { format } from "date-fns";
import {
	Activity,
	AlertCircle,
	Baby,
	Calendar,
	Cigarette,
	ClipboardList,
	Hand,
	Heart,
	History,
	Loader2,
	Stethoscope,
	Users,
	FileText,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { PersonalInfoCard } from "@/components/patients/detail/PersonalInfoCard";
import { PatientFormValues } from "@/components/patient-form/types";
const PatientDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [patient, setPatient] = useState<Patient | null>(null);
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [viewMode, setViewMode] = useState<"cards" | "table">("table");
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

	function formatChildrenAges(ages: number[]): string {
		if (!ages || ages.length === 0) return "Aucun enfant";

		const sortedAges = ages.sort((a, b) => a - b);
		const nb = sortedAges.length;

		const agesText = sortedAges
			.map((age, i) => {
				if (i === nb - 1 && nb > 1) return `et ${age}`;
				return `${age}`;
			})
			.join(nb === 2 ? " " : ", ");

		return `${
			nb === 1 ? "Un enfant de" : `${nb} enfants de`
		} ${agesText} ans`;
	}

	const handleAppointmentCreated = () => {
		// Recharger les rendez-vous après création
		if (id) {
			api.getAppointmentsByPatientId(parseInt(id)).then(setAppointments);
		}
	};

	const handlePatientUpdated = async (updatedData: PatientFormValues) => {
		if (!patient) return;
		
		try {
			setLoading(true);
			
			// Convertir les champs numériques correctement
			if (updatedData.height !== undefined) updatedData.height = updatedData.height ? Number(updatedData.height) : null;
			if (updatedData.weight !== undefined) updatedData.weight = updatedData.weight ? Number(updatedData.weight) : null;
			if (updatedData.bmi !== undefined) updatedData.bmi = updatedData.bmi ? Number(updatedData.bmi) : null;
			if (updatedData.weight_at_birth !== undefined) updatedData.weight_at_birth = updatedData.weight_at_birth ? Number(updatedData.weight_at_birth) : null;
			if (updatedData.height_at_birth !== undefined) updatedData.height_at_birth = updatedData.height_at_birth ? Number(updatedData.height_at_birth) : null;
			if (updatedData.head_circumference !== undefined) updatedData.head_circumference = updatedData.head_circumference ? Number(updatedData.head_circumference) : null;

			const patientUpdate = {
				...patient,
				...updatedData,
				updatedAt: new Date().toISOString(),
			};

			await api.updatePatient(patientUpdate);
			setPatient(patientUpdate);
			toast.success("Patient mis à jour avec succès!");
		} catch (error: any) {
			console.error("Error updating patient:", error);
			toast.error("Impossible de mettre à jour le patient");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Layout>
			<div className="flex flex-col space-y-6 max-w-full mx-auto px-4">
				{/* Header section */}
				<PatientHeader patientId={patient.id} />

				{/* Stats section */}
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

				{/* Main content grid - ordre inversé pour avoir les tabs à gauche */}
				<div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
					{/* Left column - Tabs (principal content) - plus large */}
					<div className="xl:col-span-3 order-2 xl:order-2">
						<Tabs defaultValue="medical-info">
							<TabsList className="grid w-full grid-cols-2 md:grid-cols-5 text-xs md:text-sm">
								<TabsTrigger
									value="medical-info"
									className="px-2 md:px-4"
								>
									<Activity className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-rose-600" />
									<span className="hidden sm:inline">
										Dossier médical
									</span>
									<span className="sm:hidden">Médical</span>
								</TabsTrigger>
								<TabsTrigger
									value="upcoming-appointments"
									className="px-2 md:px-4"
								>
									<Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-emerald-600" />
									<span className="hidden sm:inline">
										Séances à venir
									</span>
									<span className="sm:hidden">À venir</span>
								</TabsTrigger>
								<TabsTrigger
									value="history"
									className="px-2 md:px-4"
								>
									<History className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-blue-600" />
									<span className="hidden sm:inline">
										Historique
									</span>
									<span className="sm:hidden">
										Historique
									</span>
								</TabsTrigger>
								<TabsTrigger
									value="quotes"
									className="px-2 md:px-4"
								>
									<FileText className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-purple-600" />
									<span className="hidden sm:inline">
										Devis
									</span>
									<span className="sm:hidden">Devis</span>
								</TabsTrigger>
								<TabsTrigger
									value="invoices"
									className="px-2 md:px-4"
								>
									<Activity className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-yellow-600" />
									<span className="hidden sm:inline">
										Notes d'honoraires
									</span>
									<span className="sm:hidden">Notes</span>
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
									onAppointmentCreated={handleAppointmentCreated}
									onPatientUpdated={handlePatientUpdated}
									selectedCabinetId={parseInt(localStorage.getItem("selectedCabinetId") || "1")}
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
									invoices={invoices}
								/>
							</TabsContent>

							<TabsContent value="quotes">
								<QuotesTab patient={patient} />
							</TabsContent>

							<TabsContent value="invoices">
								<InvoicesTab
									patient={patient}
									invoices={invoices}
								/>
							</TabsContent>
						</Tabs>
					</div>

					{/* Right column - Patient info and personal info (sticky avec comportement amélioré) */}
					<div className="xl:col-span-1 order-1 xl:order-1 space-y-4 md:space-y-6">
						<PatientInfo patient={patient} />
						<PersonalInfoCard patient={patient} />
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default PatientDetailPage;
