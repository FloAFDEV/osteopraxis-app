import { PatientFormValues } from "@/components/patient-form/types";
import { AppointmentHistoryTab } from "@/components/patients/detail/AppointmentHistoryTab";
import { InvoicesTab } from "@/components/patients/detail/InvoicesTab";
import { MedicalInfoTab } from "@/components/patients/detail/MedicalInfoTab";
import { NewAppointmentTab } from "@/components/patients/detail/NewAppointmentTab";
import { PatientHeader } from "@/components/patients/detail/PatientHeader";
import { PatientInfo } from "@/components/patients/detail/PatientInfo";
import { PersonalInfoCard } from "@/components/patients/detail/PersonalInfoCard";
import { QuotesTab } from "@/components/patients/detail/QuotesTab";
import { UpcomingAppointmentsTab } from "@/components/patients/detail/UpcomingAppointmentsTab";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/ui/layout";
import { PatientStat } from "@/components/ui/patient-stat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientDetail } from "@/hooks/usePatientDetail";
import { api } from "@/services/api";
import { exportPatientToPDF } from "@/services/export/patient-pdf-exporter";
import { AppointmentStatus } from "@/types";
import { format } from "date-fns";
import {
	Activity,
	AlertCircle,
	Calendar,
	ClipboardList,
	Download,
	FileText,
	History,
	Loader2,
	Plus,
	Stethoscope,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const PatientDetailPage = () => {
	const { id } = useParams<{ id: string }>();

	// Guard: Vérifier si l'ID est "new" ou invalide
	if (!id || id === "new") {
		console.warn(
			"PatientDetailPage: ID de patient invalide ou route 'new':",
			id
		);
		return (
			<Layout>
				<div className="flex flex-col justify-center items-center h-full">
					<AlertCircle className="h-10 w-10 text-red-500 mb-4" />
					<p className="text-xl font-semibold text-center">
						Accès non autorisé
					</p>
					<p className="text-muted-foreground mt-2">
						Cette page est réservée aux détails des patients
						existants
					</p>
				</div>
			</Layout>
		);
	}

	const patientId = parseInt(id, 10);

	if (isNaN(patientId) || patientId <= 0) {
		console.warn(
			"PatientDetailPage: ID de patient non numérique ou invalide:",
			id
		);
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
	const { user } = useAuth();
	const {
		patient,
		appointments,
		invoices,
		isLoading,
		error,
		updateAppointmentStatusOptimistically,
		addAppointmentOptimistically,
		updatePatientOptimistically,
	} = usePatientDetail(patientId);

	const [viewMode, setViewMode] = useState<"cards" | "table">("table");
	const [isExporting, setIsExporting] = useState(false);
	const historyTabRef = useRef<HTMLElement | null>(null);

	// Sticky swap for cards (must also be before return)
	const patientInfoRef = useRef<HTMLDivElement>(null);
	const [showStickyAntecedents, setShowStickyAntecedents] = useState(false);

	// Memoized appointment filtering and sorting
	const upcomingAppointments = useMemo(
		() =>
			appointments
				.filter(
					(appointment) => new Date(appointment.date) >= new Date()
				)
				.sort(
					(a, b) =>
						new Date(a.date).getTime() - new Date(b.date).getTime()
				),
		[appointments]
	);

	const pastAppointments = useMemo(
		() =>
			appointments
				.filter(
					(appointment) => new Date(appointment.date) < new Date()
				)
				.sort(
					(a, b) =>
						new Date(b.date).getTime() - new Date(a.date).getTime()
				),
		[appointments]
	);

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
				if (
					entry.boundingClientRect.top <= 20 &&
					!entry.isIntersecting
				) {
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
			await updateAppointmentStatusOptimistically(
				appointmentId,
				"CANCELED"
			);
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
			await updateAppointmentStatusOptimistically(appointmentId, status);
		} catch (error) {
			console.error("Error updating appointment status:", error);
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

		return `${
			nb === 1 ? "Un enfant de" : `${nb} enfants de`
		} ${agesText} ans`;
	}

	const handleAppointmentCreated = (newAppointment?: any) => {
		// Optimistic update - add the appointment immediately to the UI
		if (newAppointment) {
			addAppointmentOptimistically(newAppointment);
		}
		toast.success("Séance créée avec succès");
		
		// Force immediate re-render of tabs by triggering state update
		setTimeout(() => {
			window.dispatchEvent(new CustomEvent('appointment-created', { detail: newAppointment }));
		}, 100);
	};

	const handlePatientUpdated = async (updatedData: PatientFormValues) => {
		try {
			await updatePatientOptimistically(updatedData);
		} catch (error: any) {
			console.error("Error updating patient:", error);
			// Error toast will be handled in the MedicalInfoTab component
			throw error;
		}
	};

	// Fonction d'export PDF
	const handleExportToPDF = async () => {
		if (!patient) return;

		setIsExporting(true);
		try {
			// Récupérer les données complémentaires si nécessaire
			let osteopath = null;
			let cabinet = null;

			if (user?.osteopathId) {
				try {
					osteopath = await api.getOsteopathById(user.osteopathId);
				} catch (err) {
					console.warn("Could not load osteopath data:", err);
				}
			}

			if (patient.cabinetId) {
				try {
					cabinet = await api.getCabinetById(patient.cabinetId);
				} catch (err) {
					console.warn("Could not load cabinet data:", err);
				}
			}

			await exportPatientToPDF(
				patient as any, // Type assertion pour compatibilité
				appointments,
				invoices,
				osteopath,
				cabinet
			);

			toast.success("Dossier patient exporté avec succès");
		} catch (error) {
			console.error("Error exporting patient file:", error);
			toast.error("Erreur lors de l'export du dossier patient");
		} finally {
			setIsExporting(false);
		}
	};

	if (isLoading) {
		return (
			<Layout>
				<div className="flex justify-center items-center h-full">
					<Loader2 className="h-6 w-6 animate-spin" />
				</div>
			</Layout>
		);
	}

	if (error || !patient) {
		const errorMessage =
			error instanceof Error
				? error.message
				: String(error || "Patient non trouvé");
		return (
			<Layout>
				<div className="flex flex-col justify-center items-center h-full">
					<AlertCircle className="h-10 w-10 text-red-500 mb-4" />
					<p className="text-xl font-semibold text-center">
						{errorMessage}
					</p>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="flex flex-col space-y-6 max-w-full mx-auto px-4">
				{/* Header section avec bouton export */}
				<div className="flex flex-col">
					<PatientHeader patientId={patient.id} />
					<Button
						onClick={handleExportToPDF}
						disabled={isExporting}
						variant="secondary"
						size="sm"
						className="self-start px-2 py-1 text-xs rounded-full flex items-center gap-1"
					>
						{isExporting ? (
							<Loader2 className="h-3 w-3 animate-spin" />
						) : (
							<Download className="h-3 w-3" />
						)}
						<span>{isExporting ? "Export..." : "PDF"}</span>
					</Button>
				</div>

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
							<TabsList className="grid w-full grid-cols-3 md:grid-cols-6 text-xs md:text-sm">
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
									value="new-appointment"
									className="px-2 md:px-4"
								>
									<Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-green-600" />
									<span className="hidden sm:inline">
										Nouvelle séance
									</span>
									<span className="sm:hidden">Nouvelle</span>
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
									onAppointmentCreated={
										handleAppointmentCreated
									}
									onPatientUpdated={handlePatientUpdated}
									selectedCabinetId={parseInt(
										localStorage.getItem(
											"selectedCabinetId"
										) || "1"
									)}
								/>
							</TabsContent>

							<TabsContent value="new-appointment">
								<NewAppointmentTab
									patient={patient}
									onAppointmentCreated={
										handleAppointmentCreated
									}
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
