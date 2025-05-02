
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, AlertCircle, FileText, ChevronLeft, Trash2 } from "lucide-react";
import { api } from "@/services";
import { Appointment, Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { AppointmentForm } from "@/components/appointment-form";
import { toast } from "sonner";
import { formatAppointmentDate, formatAppointmentTime } from "@/utils/date-utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const EditAppointmentPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [appointment, setAppointment] = useState<Appointment | null>(null);
	const [patients, setPatients] = useState<Patient[]>([]);
	const [loading, setLoading] = useState(true);
	const [processingAction, setProcessingAction] = useState<'cancel' | 'delete' | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			if (!id) return;

			try {
				const [appointmentData, patientsData] = await Promise.all([
					api.getAppointmentById(parseInt(id)),
					api.getPatients(),
				]);

				if (!appointmentData) {
					throw new Error("Rendez-vous non trouvé");
				}

				setAppointment(appointmentData);
				setPatients(patientsData);
			} catch (error) {
				console.error("Error fetching appointment data:", error);
				toast.error(
					"Impossible de charger les données du rendez-vous. Veuillez réessayer."
				);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);

	const handleCancel = async () => {
		if (!appointment || !id) return;

		try {
			setProcessingAction('cancel');
			
			// Utiliser directement la méthode cancelAppointment de l'API
			const result = await api.cancelAppointment(parseInt(id));
			toast.success("Rendez-vous annulé avec succès");
			setAppointment({ ...appointment, status: "CANCELED" });
		} catch (error) {
			console.error("Error cancelling appointment:", error);
			toast.error("Impossible d'annuler le rendez-vous.");
		} finally {
			setProcessingAction(null);
		}
	};
	
	const handleDelete = async () => {
		if (!appointment || !id) return;

		try {
			setProcessingAction('delete');
			
			// Utiliser la méthode deleteAppointment de l'API
			await api.deleteAppointment(parseInt(id));
			toast.success("Rendez-vous supprimé avec succès");
			navigate("/appointments");
		} catch (error) {
			console.error("Error deleting appointment:", error);
			toast.error("Impossible de supprimer le rendez-vous.");
		} finally {
			setProcessingAction(null);
		}
	};

	// Retourne un badge de statut
	const getStatusBadge = (status: string) => {
		const statusMap: { [key: string]: { label: string; color: string } } = {
			SCHEDULED: { label: "Planifié", color: "bg-blue-500" },
			COMPLETED: { label: "Terminé", color: "bg-green-500" },
			CANCELED: { label: "Annulé", color: "bg-red-500" },
			RESCHEDULED: { label: "Reporté", color: "bg-amber-500" },
			NO_SHOW: { label: "Non présenté", color: "bg-gray-500" },
		};

		return statusMap[status] || { label: "Inconnu", color: "bg-gray-500" };
	};

	if (loading) {
		return (
			<Layout>
				<div className="flex justify-center items-center py-12">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">
							Chargement des données du rendez-vous...
						</p>
					</div>
				</div>
			</Layout>
		);
	}

	if (!appointment) {
		return (
			<Layout>
				<div className="text-center py-12">
					<AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
					<h3 className="text-xl font-medium">
						Rendez-vous non trouvé
					</h3>
					<p className="text-muted-foreground mt-2 mb-6">
						Le rendez-vous que vous recherchez n&apos;existe pas ou
						a été supprimé.
					</p>
					<Button asChild>
						<Link to="/appointments">Retour aux rendez-vous</Link>
					</Button>
				</div>
			</Layout>
		);
	}

	const appointmentDate = new Date(appointment.date);
	const formattedDate = formatAppointmentDate(appointment.date);
	const time = formatAppointmentTime(appointment.date);

	const status = getStatusBadge(appointment.status);

	return (
		<Layout>
			{/* Container for the page content */}
			<div className="max-w-3xl mx-auto px-4 py-6">
				{/* Retour Button */}
				<Button
					variant="outline"
					size="sm"
					className="mb-6"
					onClick={() => navigate(-1)}
					aria-label="Retour à la page précédente"
				>
					<ChevronLeft className="mr-2 h-4 w-4" />
					Retour
				</Button>

				{/* Header Section: Title and Description */}
				<div className="mb-6">
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Calendar className="h-8 w-8 text-purple-500" />
						Modifier le rendez-vous
					</h1>
					<p className="text-muted-foreground mt-1">
						{formattedDate} - Modifiez les détails du rendez-vous en utilisant le
						formulaire ci-dessous.
					</p>
				</div>

				{/* Status Badge */}
				<div className="mb-4">
					<Badge
						className={`${status.color} text-white py-1 px-3 rounded-md shadow-sm border border-white/10`}
					>
						{status.label}
					</Badge>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-wrap gap-2 mb-6">
					{appointment.status === "SCHEDULED" && (
						<Button
							variant="destructive"
							onClick={handleCancel}
							aria-label="Annuler le rendez-vous"
							disabled={!!processingAction}
						>
							{processingAction === 'cancel' ? (
								<>
									<span className="animate-spin mr-2">⏳</span>
									Annulation en cours...
								</>
							) : (
								"Annuler le rendez-vous"
							)}
						</Button>
					)}
					
					{/* Bouton de suppression avec confirmation */}
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button 
								variant="outline" 
								className="text-destructive border-destructive hover:bg-destructive/10"
								disabled={!!processingAction}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Supprimer définitivement
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Supprimer le rendez-vous</AlertDialogTitle>
								<AlertDialogDescription>
									Êtes-vous sûr de vouloir supprimer définitivement ce rendez-vous ? 
									Cette action ne peut pas être annulée.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Annuler</AlertDialogCancel>
								<AlertDialogAction onClick={handleDelete} className="bg-destructive">
									{processingAction === 'delete' ? (
										<>
											<span className="animate-spin mr-2">⏳</span>
											Suppression...
										</>
									) : (
										"Supprimer"
									)}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					{appointment.status === "COMPLETED" && (
						<Button variant="outline" asChild>
							<Link
								to={`/invoices/new?appointmentId=${appointment.id}`}
								aria-label="Créer une facture pour ce rendez-vous"
							>
								<FileText className="h-4 w-4 mr-2" />
								Créer une facture
							</Link>
						</Button>
					)}
				</div>

				{/* Appointment Form Section */}
				<div className="bg-card rounded-lg border shadow-sm p-6">
					<AppointmentForm
						patients={patients}
						defaultValues={{
							patientId: appointment.patientId,
							date: appointmentDate,
							time,
							reason: appointment.reason,
							status: appointment.status,
						}}
						appointmentId={appointment.id}
						isEditing={true}
					/>
				</div>
			</div>
		</Layout>
	);
};

export default EditAppointmentPage;
