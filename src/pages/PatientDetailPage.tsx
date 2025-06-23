

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
import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { PersonalInfoCard } from "@/components/patients/detail/PersonalInfoCard";
import { PatientFormValues } from "@/components/patient-form/types";

const PatientDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	// Guard: Vérifier si l'ID est "new" ou invalide
	if (!id || id === "new") {
		console.warn("PatientDetailPage: ID de patient invalide ou route 'new':", id);
		return (
			<Layout>
				<div className="flex flex-col justify-center items-center h-full">
					<AlertCircle className="h-10 w-10 text-red-500 mb-4" />
					<p className="text-xl font-semibold text-center">
						Accès non autorisé
					</p>
					<p className="text-muted-foreground mt-2">
						Cette page est réservée aux détails des patients existants
					</p>
				</div>
			</Layout>
		);
	}

	const patientId = parseInt(id, 10);

	if (isNaN(patientId) || patientId <= 0) {
		console.warn("PatientDetailPage: ID de patient non numérique ou invalide:", id);
		return (
			<Layout>
				<div className="flex flex-col justify-center items-center h-full">
					<AlertCircle className="h-10 w-10 text-red-500 mb-4" />
					<p className="text-xl font-semibold text-center">
						ID de patient invalide
					</p>
					<p className="text-muted-foreground mt-2">
						L'identifiant du patient doit être un nombre valide
					</p>
				</div>
			</Layout>
		);
	}

	// ----- ALL HOOKS MUST BE AFTER GUARDS -----
	const [patient, setPatient] = useState<Patient | null>(null);
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [viewMode, setViewMode] = useState<"cards" | "table">("table");
	const historyTabRef = useRef<HTMLElement | null>(null);

	// Sticky swap for cards (must also be before return)
	const patientInfoRef = useRef<HTMLDivElement>(null);
	const [showStickyAntecedents, setShowStickyAntecedents] = useState(false);

	// Helper function to convert values to nullable numbers
	const toNullableNumber = (val: any) => {
		if (val === undefined || val === "" || val === null) return null;
		const num = Number(val);
		return isNaN(num) ? null : num;
	};

	// Helper function for error handling
	const handleError = (message = "Une erreur est survenue") => {
		toast.error(message);
		setError(message);
		setLoading(false);
	};

	// ----------------
	
	const getSmokerInfo = () => {
		if (!patient) return "";

		if (patient.isSmoker) {
			return `Fumeur${patient.smokingAmount ? ` (${patient.smokingAmount})` : ""}${patient.smokingSince ? ` depuis ${patient.smokingSince}` : ""}`;
		}

		if (patient.isExSmoker) {
			return `Ex-fumeur${patient.smokingAmount ? ` (${patient.smokingAmount})` : ""}${patient.quitSmokingDate ? `, arrêt depuis ${patient.quitSmokingDate}` : ""}`;
		}

		return "Non-fumeur";
	};

	// Memoized appointment filtering and sorting
	const upcomingAppointments = useMemo(() => 
		appointments
			.filter((appointment) => new Date(appointment.date) >= new Date())
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
		[appointments]
	);

	const pastAppointments = useMemo(() => 
		appointments
			.filter((appointment) => new Date(appointment.date) < new Date())
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
		[appointments]
	);

	// Fetch data
	useEffect(() => {
		const fetchPatientData = async () => {
			setLoading(true);
			setError(null);
			
			try {
				console.log("Chargement des données pour le patient ID:", patientId);
				
				const [patientData, appointmentsData, invoicesData] = await Promise.all([
					api.getPatientById(patientId),
					api.getAppointmentsByPatientId(patientId),
					invoiceService.getInvoicesByPatientId(patientId),
				]);

				if (!patientData) {
					setError("Patient non trouvé");
					return;
				}

				setPatient(patientData);
				setAppointments(appointmentsData || []);
				setInvoices(invoicesData || []);
			} catch (e: any) {
				console.error("Erreur lors du chargement des données du patient:", e);
				handleError("Impossible de charger les informations du patient. Veuillez réessayer.");
			} finally {
				setLoading(false);
			}
		};

		fetchPatientData();
	}, [patientId]);

	useEffect(() => {
		// Find and set the history tab element ref after the component mounts
		const historyTabTrigger = document.querySelector('[value="history"]');
		if (historyTabTrigger) {
			historyTabRef.current = historyTabTrigger as HTMLElement;
		}
	}, []);

	// Sticky swap observer
	useEffect(() => {
		// Crée un observer pour suivre si PatientInfo sort de la vue (top)
		const handleIntersection = (entries: IntersectionObserverEntry[]) => {
			entries.forEach((entry) => {
				if (entry.boundingClientRect.top <= 20 && !entry.isIntersecting) {
					// la carte n'est plus visible dans le conteneur principal, show sticky PersoInfoCard
					setShowStickyAntecedents(true);
				} else if (entry.isIntersecting) {
					setShowStickyAntecedents(false);
				}
			});
		};

		let observer: IntersectionObserver | null = null;
		const refEl = patientInfoRef.current;
		if (refEl) {
			observer = new window.IntersectionObserver(handleIntersection, {
				root: null,
				threshold: 0.1,
				rootMargin: "-20px 0px 0px 0px",
			});
			observer.observe(refEl);
		}
		return () => {
			if (observer && refEl) observer.unobserve(refEl);
		};
	}, [patient]);

	const handleCancelAppointment = async (appointmentId: number) => {
		try {
			await api.cancelAppointment(appointmentId);
			// Refresh appointments list
			const updatedAppointments = await api.getAppointmentsByPatientId(patientId);
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
			const updatedAppointments = await api.getAppointmentsByPatientId(patientId);
			setAppointments(updatedAppointments);
			toast.success(
				`Le statut de la séance a été modifié en "${getStatusLabel(status)}"`
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

		return `${nb === 1 ? "Un enfant de" : `${nb} enfants de`} ${agesText} ans`;
	}

	const handleAppointmentCreated = () => {
		// Recharger les rendez-vous après création
		api.getAppointmentsByPatientId(patientId).then(setAppointments);
	};

	const handlePatientUpdated = async (updatedData: PatientFormValues) => {
		if (!patient) return;
		
		try {
			setLoading(true);
			
			// Convertir les champs numériques correctement avec le helper
			const processedData = {
				...updatedData,
				height: toNullableNumber(updatedData.height),
				weight: toNullableNumber(updatedData.weight),
				bmi: toNullableNumber(updatedData.bmi),
				weight_at_birth: toNullableNumber(updatedData.weight_at_birth),
				height_at_birth: toNullableNumber(updatedData.height_at_birth),
				head_circumference: toNullableNumber(updatedData.head_circumference),
			};

			const patientUpdate = {
				...patient,
				...processedData,
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
			<div className="flex flex-col space-y-6 max-w-full mx-auto px-4">
				{/* Header section */}
				<PatientHeader patientId={patient.id} />

				{/* Stats section */}
				<section className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
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
				</section>

				{/* Main content grid - ordre inversé pour avoir les tabs à gauche */}
				<section className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
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

					{/* Right column: Sticky cards with responsive behavior */}
					<aside className="xl:col-span-1 order-1 xl:order-1 space-y-4 md:space-y-6 relative">
						<div className="hidden xl:block xl:sticky xl:top-20 xl:self-start xl:space-y-4">
							<PatientInfo patient={patient} />
							<PersonalInfoCard patient={patient} />
						</div>
						{/* Mobile/tablet view - non-sticky */}
						<div className="xl:hidden space-y-4">
							<PatientInfo patient={patient} />
							<PersonalInfoCard patient={patient} />
						</div>
					</aside>
				</section>
			</div>
		</Layout>
	);
};

export default PatientDetailPage;
