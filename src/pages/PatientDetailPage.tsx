
import { useState, useEffect } from "react";
import { Layout } from "@/components/ui/layout";
import { api } from "@/services/api";
import { invoiceService } from "@/services/api/invoice-service";
import { AppointmentStatus } from "@/types";
import { AlertCircle, Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { PatientHeader } from "@/components/patients/detail/PatientHeader";
import { PatientStatistics } from "@/components/patients/detail/PatientStatistics";
import { PatientDetailContent } from "@/components/patients/detail/PatientDetailContent";

const PatientDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const [patient, setPatient] = useState(null);
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [invoices, setInvoices] = useState([]);
	const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
	
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
			} catch (e) {
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

	const handleCancelAppointment = async (appointmentId) => {
		try {
			await api.cancelAppointment(appointmentId);
			// Refresh appointments list
			const updatedAppointments = await api.getAppointmentsByPatientId(
				parseInt(id)
			);
			setAppointments(updatedAppointments);
			toast.success("La séance a été annulée avec succès");
		} catch (error) {
			console.error("Error canceling appointment:", error);
			toast.error("Impossible d'annuler la séance");
		}
	};

	const handleUpdateAppointmentStatus = async (appointmentId, status) => {
		try {
			setLoading(true);
			await api.updateAppointment(appointmentId, { status });
			// Refresh appointments list
			const updatedAppointments = await api.getAppointmentsByPatientId(
				parseInt(id)
			);
			setAppointments(updatedAppointments);
			toast.success(`Le statut de la séance a été modifié en "${getStatusLabel(status)}"`);
		} catch (error) {
			console.error("Error updating appointment status:", error);
			toast.error("Impossible de modifier le statut de la séance");
		} finally {
			setLoading(false);
		}
	};

	const getStatusLabel = (status) => {
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
			<div className="flex flex-col space-y-6 max-w-6xl mx-auto px-4">
				{/* Header section */}
				<PatientHeader patientId={patient.id} />

				{/* Statistics section */}
				<PatientStatistics 
					patient={patient}
					appointments={appointments}
					upcomingAppointments={upcomingAppointments}
					pastAppointments={pastAppointments}
				/>

				{/* Main content */}
				<PatientDetailContent 
					patient={patient}
					upcomingAppointments={upcomingAppointments}
					pastAppointments={pastAppointments}
					invoices={invoices}
					onCancelAppointment={handleCancelAppointment}
					onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
					viewMode={viewMode}
					setViewMode={setViewMode}
				/>
			</div>
		</Layout>
	);
};

export default PatientDetailPage;
