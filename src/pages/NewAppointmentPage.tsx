
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Calendar } from "lucide-react";
import { api } from "@/services/api";
import { Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { AppointmentForm } from "@/components/appointment-form";
import { toast } from "sonner";

const NewAppointmentPage = () => {
	const [patients, setPatients] = useState<Patient[]>([]);
	const [loading, setLoading] = useState(true);

	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);

	const patientId = queryParams.get("patientId")
		? parseInt(queryParams.get("patientId")!)
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
			<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<header className="mb-6">
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Calendar className="h-8 w-8 text-purple-500" />
						Nouvelle séance
					</h1>
					<p className="text-gray-500 mt-2">
						Créez une séance en remplissant le formulaire
						ci-dessous. Ajoutez un motif et un compte rendu pour suivre l'historique du patient.
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
					<section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
						<AppointmentForm
							patients={patients}
							defaultValues={{
								patientId,
								date: defaultDate,
								time: defaultTime,
								status: "SCHEDULED",
							}}
						/>
					</section>
				)}
			</div>
		</Layout>
	);
};

export default NewAppointmentPage;
