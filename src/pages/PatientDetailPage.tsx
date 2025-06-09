
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Patient } from "@/types";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { PatientHeader } from "@/components/patients/detail/PatientHeader";
import { PatientInfo } from "@/components/patients/detail/PatientInfo";
import { PersonalInfoCard } from "@/components/patients/detail/PersonalInfoCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicalInfoTab } from "@/components/patients/detail/MedicalInfoTab";
import { AppointmentHistoryTab } from "@/components/patients/detail/AppointmentHistoryTab";
import { UpcomingAppointmentsTab } from "@/components/patients/detail/UpcomingAppointmentsTab";
import { InvoicesTab } from "@/components/patients/detail/InvoicesTab";
import { QuotesTab } from "@/components/patients/detail/QuotesTab";
import { useSectionNavigation } from "@/hooks/useSectionNavigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const PatientDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [patient, setPatient] = useState<Patient | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const { activeTab, setActiveTab } = useSectionNavigation();

	useEffect(() => {
		const loadPatient = async () => {
			if (!id) {
				setError("ID du patient manquant");
				setIsLoading(false);
				return;
			}

			const numericId = parseInt(id, 10);
			if (isNaN(numericId)) {
				setError("ID du patient invalide");
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				const patientData = await api.getPatientById(numericId);
				if (patientData) {
					setPatient(patientData);
				} else {
					setError("Patient non trouvé");
				}
			} catch (err) {
				console.error("Erreur lors du chargement du patient:", err);
				setError("Erreur lors du chargement du patient");
				toast.error("Erreur lors du chargement du patient");
			} finally {
				setIsLoading(false);
			}
		};

		loadPatient();
	}, [id]);

	if (isLoading) {
		return (
			<Layout>
				<div className="container mx-auto py-6 space-y-6">
					<Skeleton className="h-8 w-64" />
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
						<div className="lg:col-span-3 space-y-6">
							<Skeleton className="h-48 w-full" />
							<Skeleton className="h-96 w-full" />
						</div>
						<div className="lg:col-span-1">
							<Skeleton className="h-64 w-full" />
						</div>
					</div>
				</div>
			</Layout>
		);
	}

	if (error || !patient) {
		return (
			<Layout>
				<div className="container mx-auto py-6">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-gray-900 mb-4">
							{error || "Patient non trouvé"}
						</h1>
						<button
							onClick={() => navigate("/patients")}
							className="text-blue-600 hover:text-blue-800 underline"
						>
							Retourner à la liste des patients
						</button>
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="container mx-auto py-6">
				<PatientHeader patient={patient} />

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
					{/* Contenu principal */}
					<div className="lg:col-span-3">
						{/* Card PatientInfo */}
						<PatientInfo patient={patient} />

						{/* Tabs */}
						<Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
							<TabsList className="grid w-full grid-cols-5">
								<TabsTrigger value="medical">Médical</TabsTrigger>
								<TabsTrigger value="upcoming">RDV à venir</TabsTrigger>
								<TabsTrigger value="history">Historique</TabsTrigger>
								<TabsTrigger value="invoices">Factures</TabsTrigger>
								<TabsTrigger value="quotes">Devis</TabsTrigger>
							</TabsList>

							<TabsContent value="medical" className="mt-6">
								<MedicalInfoTab patient={patient} />
							</TabsContent>

							<TabsContent value="upcoming" className="mt-6">
								<UpcomingAppointmentsTab patient={patient} />
							</TabsContent>

							<TabsContent value="history" className="mt-6">
								<AppointmentHistoryTab patient={patient} />
							</TabsContent>

							<TabsContent value="invoices" className="mt-6">
								<InvoicesTab patient={patient} />
							</TabsContent>

							<TabsContent value="quotes" className="mt-6">
								<QuotesTab patient={patient} />
							</TabsContent>
						</Tabs>
					</div>

					{/* Sidebar */}
					<div className="lg:col-span-1">
						<PersonalInfoCard patient={patient} />
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default PatientDetailPage;
