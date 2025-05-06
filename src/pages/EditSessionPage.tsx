
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar } from "lucide-react";
import { api } from "@/services/api";
import { sessionService } from "@/services/api/session-service";
import { Appointment, Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { SessionForm } from "@/components/session/SessionForm";
import { toast } from "sonner";

const EditSessionPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [session, setSession] = useState<Appointment | null>(null);
	const [patient, setPatient] = useState<Patient | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSessionAndPatient = async () => {
			setLoading(true);
			try {
				if (!id) {
					toast.error("L'ID de la séance est manquant.");
					return;
				}

				const sessionId = parseInt(id, 10);
				const sessionData = await sessionService.getSessionById(sessionId);

				if (!sessionData) {
					toast.error("Séance non trouvée.");
					navigate("/sessions");
					return;
				}

				setSession(sessionData);
				
				// Fetch patient data
				if (sessionData.patientId) {
					const patientData = await api.getPatientById(sessionData.patientId);
					setPatient(patientData);
				}
			} catch (error) {
				console.error("Erreur lors du chargement des données :", error);
				toast.error(
					"Impossible de charger les données. Veuillez réessayer."
				);
			} finally {
				setLoading(false);
			}
		};

		fetchSessionAndPatient();
	}, [id, navigate]);

	if (loading) {
		return (
			<Layout>
				<div className="flex justify-center items-center h-full">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4" />
						<p className="text-gray-500 dark:text-gray-400">
							Chargement des données...
						</p>
					</div>
				</div>
			</Layout>
		);
	}

	if (!session) {
		return (
			<Layout>
				<div className="flex justify-center items-center h-full">
					<div className="text-center">
						<p className="text-red-500 dark:text-red-400">
							Séance non trouvée. Veuillez vérifier l'ID.
						</p>
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<header className="mb-6">
					<h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
						<Calendar className="h-8 w-8 text-purple-500 dark:text-purple-400" />
						Modifier la séance
					</h1>
					<p className="text-gray-500 dark:text-gray-400 mt-2">
						Modifiez les informations de la séance en utilisant le formulaire ci-dessous.
					</p>
				</header>

				<section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
					{session && (
						<SessionForm
							patient={patient || undefined}
							onCancel={() => navigate(-1)}
						/>
					)}
				</section>
			</div>
		</Layout>
	);
};

export default EditSessionPage;
