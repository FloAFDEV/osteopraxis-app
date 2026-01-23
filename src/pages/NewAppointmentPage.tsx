import { AppointmentForm } from "@/components/AppointmentForm";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/ui/layout";
import { api } from "@/services/api";
import { Patient } from "@/types";
import { ArrowLeft, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const NewAppointmentPage = () => {
	const { isDemoMode } = useAuth();
	const [patients, setPatients] = useState<Patient[]>([]);
	const [loading, setLoading] = useState(true);

	const location = useLocation();
	const navigate = useNavigate();
	const queryParams = new URLSearchParams(location.search);

	const patientIdParam = queryParams.get("patientId");
	const patientId = patientIdParam
		? (isDemoMode ? patientIdParam : parseInt(patientIdParam))
		: undefined;

	const dateParam = queryParams.get("date");
	const timeParam = queryParams.get("time");

	const defaultDate = dateParam ? new Date(dateParam) : new Date();
	const defaultTime =
		timeParam && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeParam)
			? timeParam
			: "09:00";

	useEffect(() => {
		const fetchPatients = async () => {
			try {
				const data = await api.getPatients();
				const sorted = data.sort((a: Patient, b: Patient) =>
					a.lastName.localeCompare(b.lastName)
				);
				setPatients(sorted);
			} catch (error) {
				console.error(
					"Erreur lors du chargement des patients :",
					error
				);
				toast.error(
					"Impossible de charger les patients. Veuillez réessayer."
				);
			} finally {
				setLoading(false);
			}
		};
		fetchPatients();
	}, []);

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
			<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
				<header className="mb-6">
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Calendar className="h-8 w-8 text-purple-500" />
						Nouvelle séance
					</h1>
					<p className="text-gray-500 mt-2">
						Créez une séance en remplissant le formulaire
						ci-dessous. Ajoutez un motif et un compte rendu pour
						suivre l'historique du patient.
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
						<AppointmentForm
							patients={patients}
							defaultValues={{
								patientId,
								date: defaultDate,
								time: defaultTime,
								status: "SCHEDULED",
								website: "", // Initialiser le honeypot
							}}
						/>
					</section>
				)}
			</div>
		</Layout>
	);
};

export default NewAppointmentPage;
