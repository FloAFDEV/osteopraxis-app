import { AppointmentForm } from "@/components/appointment-form";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/ui/layout";
import { api } from "@/services/api";
import { Patient } from "@/types";
import { ArrowLeft, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const EditAppointmentPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [appointment, setAppointment] = useState<any>(null);
	const [patients, setPatients] = useState<Patient[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch appointment and patients in parallel
				const [appointmentData, patientsData] = await Promise.all([
					api.getAppointmentById(Number(id)),
					api.getPatients(),
				]);

				if (!appointmentData) {
					setError("Séance introuvable");
					return;
				}

				// Trie les patients par nom de famille et prénom
				const sortedPatients = patientsData.sort(
					(a: Patient, b: Patient) => {
						const lastNameComparison = a.lastName.localeCompare(
							b.lastName,
							"fr",
							{
								sensitivity: "base",
							}
						);

						if (lastNameComparison !== 0) {
							return lastNameComparison;
						}

						return a.firstName.localeCompare(b.firstName, "fr", {
							sensitivity: "base",
						});
					}
				);

				setAppointment(appointmentData);
				setPatients(sortedPatients);
			} catch (err) {
				console.error("Erreur lors du chargement des données:", err);
				setError("Erreur lors du chargement des données");
				toast.error("Erreur lors du chargement des données");
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchData();
		}
	}, [id]);

	if (loading) {
		return (
			<Layout>
				<div className="flex justify-center items-center py-20">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4" />
						<p className="text-gray-500">
							Chargement des données...
						</p>
					</div>
				</div>
			</Layout>
		);
	}

	if (error || !appointment) {
		return (
			<Layout>
				<div className="flex flex-col items-center justify-center py-20">
					<h2 className="text-2xl font-bold text-red-600 mb-4">
						{error || "Une erreur est survenue"}
					</h2>
					<p className="text-gray-600 mb-6">
						La séance demandée n'a pas pu être chargée.
					</p>
					<button
						onClick={() => navigate("/appointments")}
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
					>
						Retourner à la liste des séances
					</button>
				</div>
			</Layout>
		);
	}

	// Format date for form
	const formattedDate = new Date(appointment.date);
	const formattedTime = formattedDate.toLocaleTimeString("fr-FR", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

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
						<Calendar className="h-8 w-8 text-purple-600" />
						Modifier la séance
					</h1>
					<p className="text-gray-500 mt-2">
						Modifiez les informations de la séance en utilisant le
						formulaire ci-dessous.
					</p>
				</header>

				<section className="rounded-lg border border-gray-200 shadow-sm p-6">
					<AppointmentForm
						patients={patients}
						defaultValues={{
							patientId: appointment.patientId,
							date: formattedDate,
							time: formattedTime,
							reason: appointment.reason || "",
							notes: appointment.notes || "",
							status: appointment.status,
							website: "", // Initialiser le honeypot
						}}
						appointmentId={Number(id)}
						isEditing={true}
					/>
				</section>
			</div>
		</Layout>
	);
};

export default EditAppointmentPage;
