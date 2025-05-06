
import { InvoiceForm } from "@/components/invoice-form";
import { Card } from "@/components/ui/card";
import { FancyLoader } from "@/components/ui/fancy-loader";
import { Layout } from "@/components/ui/layout";
import { api } from "@/services/api";
import { Appointment, Patient } from "@/types";
import { Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

// Extend the Appointment type to include invoiceId
interface ExtendedAppointment extends Appointment {
  invoiceId?: number;
}

const NewInvoicePage = () => {
	const { patientId } = useParams<{ patientId: string }>();
	const [searchParams] = useSearchParams();
	const appointmentId = searchParams.get("appointmentId");
	const [patient, setPatient] = useState<Patient | null>(null);
	const [appointment, setAppointment] = useState<ExtendedAppointment | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const loadData = async () => {
			try {
				if (appointmentId) {
					const appointmentData = await api.getAppointmentById(
						parseInt(appointmentId, 10)
					);

					if (appointmentData) {
						// Check if there's already an invoice for this appointment
						// This requires that we've extended the appointment type to include invoiceId
						if ((appointmentData as ExtendedAppointment).invoiceId) {
							// ✅ Facture existe : on bloque, toast + redirection sans afficher le formulaire
							toast.error(
								"Une facture existe déjà pour ce rendez-vous."
							);

							setTimeout(() => {
								navigate("/invoices");
							}, 1500);

							return; // ⛔ STOP ici, on ne fait rien d'autre
						}

						setAppointment(appointmentData as ExtendedAppointment);

						// Chargement du patient lié au rendez-vous
						const patientData = await api.getPatientById(
							appointmentData.patientId
						);
						if (patientData) setPatient(patientData);
					}
				} else if (patientId) {
					// Pas de appointmentId => on charge seulement le patient
					const patientData = await api.getPatientById(
						parseInt(patientId, 10)
					);
					if (patientData) setPatient(patientData);
				}

				setIsLoading(false); // ✅ on termine le chargement uniquement si on n'a pas redirigé
			} catch (error) {
				console.error("Erreur lors du chargement des données:", error);
				toast.error("Erreur lors du chargement des données");
				setIsLoading(false);
			}
		};

		loadData();
	}, [patientId, appointmentId, navigate]);

	const handleInvoiceCreated = () => {
		toast.success("Facture créée avec succès !");
		setTimeout(() => {
			navigate("/invoices");
		}, 1500);
	};

	return (
		<Layout>
			<div className="mb-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
					<h1 className="text-3xl font-bold flex items-center gap-3">
						<Activity className="h-8 w-8 text-amber-500 dark:text-amber-400" />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-500">
							Nouvelle Facture
						</span>
					</h1>
				</div>

				{isLoading ? (
					<FancyLoader message="Chargement des données..." />
				) : (
					<Card className="p-6">
						<InvoiceForm
							initialPatient={patient}
							initialAppointment={appointment}
							onCreate={handleInvoiceCreated}
						/>
					</Card>
				)}
			</div>
		</Layout>
	);
};

export default NewInvoicePage;
