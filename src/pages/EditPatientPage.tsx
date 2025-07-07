import ConfirmDeletePatientModal from "@/components/modals/ConfirmDeletePatientModal";
import { PatientForm } from "@/components/patient-form";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/ui/layout";
import { patientService } from "@/services/api/patient-service";
import { Patient } from "@/types";
import { PatientFormValues } from "@/components/patient-form/types";
import { Trash, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const EditPatientPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [patient, setPatient] = useState<Patient | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(
		null
	);

	// Récupérer le cabinet sélectionné depuis le localStorage
	useEffect(() => {
		const storedCabinetId = localStorage.getItem("selectedCabinetId");
		if (storedCabinetId) {
			setSelectedCabinetId(Number(storedCabinetId));
		}
	}, []);

	useEffect(() => {
		if (!id) return;

		const loadPatient = async () => {
			try {
				setIsLoading(true);
				const patientId = parseInt(id);
				const patient = await patientService.getPatientById(patientId);

				if (!patient) {
					toast.error("Patient non trouvé");
					navigate("/patients");
					return;
				}

				setPatient(patient as Patient);
			} catch (error) {
				console.error("Error loading patient:", error);
				toast.error("Impossible de charger les données du patient");
			} finally {
				setIsLoading(false);
			}
		};

		loadPatient();
	}, [id, navigate]);

	const handleSave = async (updatedData: PatientFormValues) => {
		if (!patient) return;

		try {
			setIsSaving(true);
			console.info("Submitting values:", updatedData);

			// Convertir les champs numériques correctement - traiter les valeurs undefined
			if (updatedData.height !== undefined) updatedData.height = updatedData.height ? Number(updatedData.height) : null;
			if (updatedData.weight !== undefined) updatedData.weight = updatedData.weight ? Number(updatedData.weight) : null;
			if (updatedData.bmi !== undefined) updatedData.bmi = updatedData.bmi ? Number(updatedData.bmi) : null;
			if (updatedData.weight_at_birth !== undefined) updatedData.weight_at_birth = updatedData.weight_at_birth ? Number(updatedData.weight_at_birth) : null;
			if (updatedData.height_at_birth !== undefined) updatedData.height_at_birth = updatedData.height_at_birth ? Number(updatedData.height_at_birth) : null;
			if (updatedData.head_circumference !== undefined) updatedData.head_circumference = updatedData.head_circumference ? Number(updatedData.head_circumference) : null;

			// Ensure enum fields are properly formatted
			const patientUpdate = {
				...patient,
				...updatedData,
				// Préserver le cabinetId existant ou utiliser celui du formulaire ou celui de la navbar
				cabinetId:
					updatedData.cabinetId ||
					patient.cabinetId ||
					selectedCabinetId ||
					1,
				updatedAt: new Date().toISOString(),
				// Make sure these fields are properly set for the update
				gender: updatedData.gender || patient.gender,
				maritalStatus:
					updatedData.maritalStatus || patient.maritalStatus,
				handedness: updatedData.handedness || patient.handedness,
				contraception:
					updatedData.contraception || patient.contraception,
				childrenAges: updatedData.childrenAges || patient.childrenAges || null,
				// Nouveaux champs
				contraception_notes: updatedData.contraception_notes || patient.contraception_notes || null,
				relationship_type: updatedData.relationship_type || patient.relationship_type || null,
				relationship_other: updatedData.relationship_other || patient.relationship_other || null,
				
				// Champs existants
				complementaryExams:
					updatedData.complementaryExams ||
					patient.complementaryExams ||
					null,
				generalSymptoms:
					updatedData.generalSymptoms ||
					patient.generalSymptoms ||
					null,
				pregnancyHistory:
					updatedData.pregnancyHistory ||
					patient.pregnancyHistory ||
					null,
				birthDetails:
					updatedData.birthDetails || patient.birthDetails || null,
				developmentMilestones:
					updatedData.developmentMilestones ||
					patient.developmentMilestones ||
					null,
				sleepingPattern:
					updatedData.sleepingPattern ||
					patient.sleepingPattern ||
					null,
				feeding: updatedData.feeding || patient.feeding || null,
				behavior: updatedData.behavior || patient.behavior || null,
				childCareContext:
					updatedData.childCareContext ||
					patient.childCareContext ||
					null,
					
				// Nouveaux champs généraux
				ent_followup: updatedData.ent_followup || patient.ent_followup || null,
				intestinal_transit: updatedData.intestinal_transit || patient.intestinal_transit || null,
				sleep_quality: updatedData.sleep_quality || patient.sleep_quality || null,
				fracture_history: updatedData.fracture_history || patient.fracture_history || null,
				dental_health: updatedData.dental_health || patient.dental_health || null,
				sport_frequency: updatedData.sport_frequency || patient.sport_frequency || null,
				gynecological_history: updatedData.gynecological_history || patient.gynecological_history || null,
				other_comments_adult: updatedData.other_comments_adult || patient.other_comments_adult || null,
				
				// Nouveaux champs spécifiques aux enfants
				fine_motor_skills: updatedData.fine_motor_skills || patient.fine_motor_skills || null,
				gross_motor_skills: updatedData.gross_motor_skills || patient.gross_motor_skills || null,
				weight_at_birth: updatedData.weight_at_birth !== undefined ? updatedData.weight_at_birth : patient.weight_at_birth || null,
				height_at_birth: updatedData.height_at_birth !== undefined ? updatedData.height_at_birth : patient.height_at_birth || null,
				head_circumference: updatedData.head_circumference !== undefined ? updatedData.head_circumference : patient.head_circumference || null,
				apgar_score: updatedData.apgar_score || patient.apgar_score || null,
				childcare_type: updatedData.childcare_type || patient.childcare_type || null,
				school_grade: updatedData.school_grade || patient.school_grade || null,
				pediatrician_name: updatedData.pediatrician_name || patient.pediatrician_name || null,
				paramedical_followup: updatedData.paramedical_followup || patient.paramedical_followup || null,
				other_comments_child: updatedData.other_comments_child || patient.other_comments_child || null,
				
				// Champs height, weight et bmi avec traitement spécial pour les valeurs nulles
				height: updatedData.height !== undefined ? updatedData.height : patient.height || null,
				weight: updatedData.weight !== undefined ? updatedData.weight : patient.weight || null,
				bmi: updatedData.bmi !== undefined ? updatedData.bmi : patient.bmi || null,
			};

			console.log(
				"Mise à jour du patient avec cabinetId:",
				patientUpdate.cabinetId
			);

			// Use the patientService updatePatient method
			const updatedPatient = await patientService.updatePatient(patientUpdate);
			
			// Update local state immediately
			setPatient(updatedPatient);
			
			// Invalidate all patient-related queries to refresh data everywhere
			queryClient.invalidateQueries({
				queryKey: ['patients']
			});
			queryClient.invalidateQueries({
				queryKey: ['patient', patient.id]
			});
			
			toast.success("Patient mis à jour avec succès!");

			// Attendre un peu avant de naviguer pour laisser le toast s'afficher
			setTimeout(() => {
				navigate("/patients");
			}, 1500);
		} catch (error: any) {
			console.error("Error updating patient:", error);
			toast.error("Impossible de mettre à jour le patient");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeletePatient = async () => {
		setShowDeleteModal(false);
		if (!patient) return;
		try {
			await patientService.deletePatient(patient.id);
			
			// Invalidate queries after deletion
			queryClient.invalidateQueries({
				queryKey: ['patients']
			});
			queryClient.removeQueries({
				queryKey: ['patient', patient.id]
			});
			
			toast.success("Patient supprimé avec succès !");
			setTimeout(() => {
				navigate("/patients");
			}, 1500);
		} catch (err) {
			toast.error("Erreur lors de la suppression du patient");
			setShowDeleteModal(false);
		}
	};

	if (isLoading) {
		return (
			<Layout>
				<div className="flex justify-center items-center py-12">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">
							Chargement du patient...
						</p>
					</div>
				</div>
			</Layout>
		);
	}

	if (!patient) {
		return (
			<Layout>
				<div className="flex justify-center items-center py-12">
					<div className="text-center">
						<div className="text-red-500 mb-4">
							Patient non trouvé
						</div>
						<button
							onClick={() => navigate("/patients")}
							className="px-4 py-2 bg-primary text-white rounded-md"
						>
							Retour à la liste des patients
						</button>
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<ConfirmDeletePatientModal
				isOpen={showDeleteModal}
				onCancel={() => setShowDeleteModal(false)}
				onDelete={handleDeletePatient}
				patientName={patient?.firstName + " " + patient?.lastName}
			/>
			<div className="max-w-4xl mx-auto">
				<div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-2">
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-2">
							<UserRound className="h-8 w-8 text-pink-500" />
							Modifier la fiche patient de {
								patient?.firstName
							}{" "}
							{patient?.lastName}
						</h1>
						<p className="text-muted-foreground mt-1">
							Modifiez les informations du patient
						</p>
						{patient?.hasChildren === "true" &&
							patient?.childrenAges &&
							patient.childrenAges.length > 0 && (
								<div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-700">
									<span className="font-medium">
										Enfants :{" "}
									</span>
									{patient.childrenAges.length} enfant(s):{" "}
									{patient.childrenAges.join(", ")} ans
								</div>
							)}
					</div>
					<Button
						variant="destructive"
						onClick={() => setShowDeleteModal(true)}
						className="flex items-center gap-2"
						size="sm"
					>
						<Trash className="mr-1 h-4 w-4" />
						Supprimer
					</Button>
				</div>
				{patient && (
					<PatientForm
						patient={patient}
						onSave={handleSave}
						isLoading={isSaving}
						selectedCabinetId={selectedCabinetId}
					/>
				)}
			</div>
		</Layout>
	);
};

export default EditPatientPage;
