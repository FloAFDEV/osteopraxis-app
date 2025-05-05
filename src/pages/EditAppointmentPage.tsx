import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar } from "lucide-react";
import { api } from "@/services/api";
import { Appointment, AppointmentStatus, Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { AppointmentForm } from "@/components/appointment-form";
import { toast } from "sonner";
import { format } from "date-fns";

const EditAppointmentPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [appointment, setAppointment] = useState<Appointment | null>(null);
	const [patients, setPatients] = useState<Patient[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchAppointmentAndPatients = async () => {
			setLoading(true);
			try {
				if (!id) {
					toast.error("L'ID de la séance est manquant.");
					return;
				}

				const appointmentId = parseInt(id, 10);
				const [appointmentData, patientsData] = await Promise.all([
					api.getAppointmentById(appointmentId),
					api.getPatients(),
				]);

				if (!appointmentData) {
					toast.error("Séance non trouvée.");
					navigate("/appointments");
					return;
				}

				setAppointment(appointmentData);
				setPatients(
					patientsData.sort((a: Patient, b: Patient) =>
						a.lastName.localeCompare(b.lastName)
					)
				);
			} catch (error) {
				console.error(
					"Erreur lors du chargement des données :",
					error
				);
				toast.error(
					"Impossible de charger les données. Veuillez réessayer."
				);
			} finally {
				setLoading(false);
			}
		};

		fetchAppointmentAndPatients();
	}, [id, navigate]);

	if (loading) {
		return (
			<Layout>
				<div className="flex justify-center items-center h-full">
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

	if (!appointment) {
		return (
			<Layout>
				<div className="flex justify-center items-center h-full">
					<div className="text-center">
						<p className="text-red-500">
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
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Calendar className="h-8 w-8 text-purple-500" />
						Modifier la séance
					</h1>
					<p className="text-gray-500 mt-2">
						Modifiez les informations de la séance en remplissant le
						formulaire ci-dessous.
					</p>
				</header>

				<section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
					{appointment && (
						<AppointmentForm
							patients={patients}
							defaultValues={{
								id: appointment.id,
								patientId: appointment.patientId,
								date: new Date(appointment.date),
								time: format(new Date(appointment.date), "HH:mm"),
								reason: appointment.reason,
								status: appointment.status,
								notes: appointment.notes,
							}}
							isEditMode={true}
						/>
					)}
				</section>
			</div>
		</Layout>
	);
};

export default EditAppointmentPage;
