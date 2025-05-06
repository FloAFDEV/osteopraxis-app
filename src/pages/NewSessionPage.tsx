
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Calendar, Plus } from "lucide-react";
import { api } from "@/services/api";
import { Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { toast } from "sonner";
import { SessionForm } from "@/components/session/SessionForm";
import { Button } from "@/components/ui/button";
import { sessionService } from "@/services/api/session-service";

const NewSessionPage = () => {
	const [patient, setPatient] = useState<Patient | null>(null);
	const [loading, setLoading] = useState(true);

	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);

	const patientId = queryParams.get("patientId")
		? parseInt(queryParams.get("patientId")!)
		: undefined;

	useEffect(() => {
		const fetchPatient = async () => {
			try {
				if (patientId) {
					const data = await api.getPatientById(patientId);
					setPatient(data);
				}
			} catch (error) {
				console.error(
					"Erreur lors du chargement du patient :",
					error
				);
				toast.error(
					"Impossible de charger le patient. Veuillez réessayer."
				);
			} finally {
				setLoading(false);
			}
		};
		fetchPatient();
	}, [patientId]);

	const createImmediateSession = async () => {
		if (!patientId) {
			toast.error("Veuillez d'abord sélectionner un patient");
			return;
		}

		try {
			setLoading(true);
			await sessionService.createImmediateSession(patientId, "Séance immédiate");
			toast.success("Séance immédiate créée avec succès");
			// Rediriger vers les séances du patient
			window.location.href = `/patients/${patientId}`;
		} catch (error) {
			console.error("Erreur lors de la création de la séance immédiate:", error);
			toast.error("Impossible de créer la séance immédiate");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Layout>
			<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<header className="mb-6">
					<div className="flex justify-between items-center">
						<h1 className="text-3xl font-bold flex items-center gap-2">
							<Calendar className="h-8 w-8 text-purple-500" />
							Nouvelle séance
						</h1>

						{patientId && (
							<Button 
								onClick={createImmediateSession}
								disabled={loading}
								className="bg-amber-600 hover:bg-amber-700"
							>
								<Plus className="mr-2 h-4 w-4" />
								Séance immédiate
							</Button>
						)}
					</div>
					<p className="text-gray-500 mt-2">
						Planifiez une séance ou démarrez immédiatement une consultation avec le patient.
					</p>
				</header>

				{loading ? (
					<div className="flex justify-center items-center py-20">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4" />
							<p className="text-gray-500">
								Chargement des données...
							</p>
						</div>
					</div>
				) : (
					<section className="rounded-lg border border-gray-200 shadow-sm p-6">
						<SessionForm patient={patient || undefined} />
					</section>
				)}
			</div>
		</Layout>
	);
};

export default NewSessionPage;
