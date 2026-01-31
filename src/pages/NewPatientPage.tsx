import { PatientForm } from "@/components/PatientForm";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/ui/layout";
import { useAuth } from "@/contexts/AuthContext";
import { useHybridStorageContext } from "@/contexts/HybridStorageContext";
import { Patient, Cabinet } from "@/types";
import { useCabinetById } from "@/hooks/useCabinets";
import { api } from "@/services/api";
import { ArrowLeft, Loader2, UserPlus, Building } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";

const NewPatientPage = () => {
	const [loading, setLoading] = useState(false);
	const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(null);
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuth();
	const queryClient = useQueryClient();

	// Récupérer le cabinet sélectionné depuis localStorage
	useEffect(() => {
		const storedCabinetId = localStorage.getItem("selectedCabinetId");
		if (storedCabinetId) {
			setSelectedCabinetId(Number(storedCabinetId));
		}
	}, []);

	// Utiliser le hook pour récupérer le cabinet
	const { data: selectedCabinet } = useCabinetById(selectedCabinetId || 0);

	if (!isAuthenticated || !user) {
		toast.error("Vous devez être connecté pour ajouter un patient");
		navigate("/login");
		return null;
	}

	const handleAddPatient = async (patientData: any) => {
		console.log("🚀 Début de handleAddPatient");
		try {
			setLoading(true);

			// Vérifier les champs obligatoires - supprimer la vérification de l'email
			if (!patientData.firstName || !patientData.lastName) {
				toast.error("Veuillez remplir au moins le nom et le prénom");
				setLoading(false);
				return;
			}

			// Vérifier qu'un cabinet est sélectionné
			if (!patientData.cabinetId && !selectedCabinetId) {
				toast.error("Veuillez sélectionner un cabinet");
				setLoading(false);
				return;
			}

			// Convertir la date si elle est au format Date
			if (patientData.birthDate instanceof Date) {
				patientData.birthDate = patientData.birthDate.toISOString();
			}

			// Assurer le bon type pour les valeurs numériques
			if (patientData.height)
				patientData.height = Number(patientData.height);
			if (patientData.weight)
				patientData.weight = Number(patientData.weight);
			if (patientData.bmi) patientData.bmi = Number(patientData.bmi);
			if (patientData.weight_at_birth)
				patientData.weight_at_birth = Number(
					patientData.weight_at_birth
				);
			if (patientData.height_at_birth)
				patientData.height_at_birth = Number(
					patientData.height_at_birth
				);
			if (patientData.head_circumference)
				patientData.head_circumference = Number(
					patientData.head_circumference
				);

			console.log("Préparation création patient - cabinetId:", patientData.cabinetId || selectedCabinetId);

			// Utiliser l'ID de l'ostéopathe connecté et le cabinet sélectionné
			const patientToCreate = {
				...patientData,
				osteopathId: user.osteopathId || user.id, // Utilise osteopathId ou id selon ce qui est disponible
				cabinetId: patientData.cabinetId || selectedCabinetId || 1, // Utiliser le cabinetId du formulaire ou celui sélectionné dans la navbar
				userId: null, // Requis par le type mais peut être null
				occupation: patientData.job || patientData.occupation || null, // Mapper job vers occupation
				// Champs existants requis
				complementaryExams: patientData.complementaryExams || null,
				generalSymptoms: patientData.generalSymptoms || null,
				pregnancyHistory: patientData.pregnancyHistory || null,
				birthDetails: patientData.birthDetails || null,
				developmentMilestones:
					patientData.developmentMilestones || null,
				sleepingPattern: patientData.sleepingPattern || null,
				feeding: patientData.feeding || null,
				behavior: patientData.behavior || null,
				childCareContext: patientData.childCareContext || null,
				isExSmoker: patientData.isExSmoker || false,
				smokingSince: patientData.smokingSince || null,
				smokingAmount: patientData.smokingAmount || null,
				quitSmokingDate: patientData.quitSmokingDate || null,

				// Nouveaux champs généraux
				ent_followup: patientData.ent_followup || null,
				intestinal_transit: patientData.intestinal_transit || null,
				sleep_quality: patientData.sleep_quality || null,
				fracture_history: patientData.fracture_history || null,
				dental_health: patientData.dental_health || null,
				sport_frequency: patientData.sport_frequency || null,
				gynecological_history:
					patientData.gynecological_history || null,
				other_comments_adult: patientData.other_comments_adult || null,
				
				// Nouveaux champs contraception et parenté
				contraception_notes: patientData.contraception_notes || null,
				relationship_type: patientData.relationship_type || null,
				relationship_other: patientData.relationship_other || null,

				// Nouveaux champs spécifiques aux enfants
				fine_motor_skills: patientData.fine_motor_skills || null,
				gross_motor_skills: patientData.gross_motor_skills || null,
				weight_at_birth: patientData.weight_at_birth || null,
				height_at_birth: patientData.height_at_birth || null,
				head_circumference: patientData.head_circumference || null,
				apgar_score: patientData.apgar_score || null,
				childcare_type: patientData.childcare_type || null,
				school_grade: patientData.school_grade || null,
				pediatrician_name: patientData.pediatrician_name || null,
				paramedical_followup: patientData.paramedical_followup || null,
				other_comments_child: patientData.other_comments_child || null,

				// Gestion des champs taille, poids et IMC
				height: patientData.height || null,
				weight: patientData.weight || null,
				bmi: patientData.bmi || null,
			} as Omit<Patient, "id" | "createdAt" | "updatedAt">;

			console.log("📤 Appel api.createPatient avec cabinetId:", patientToCreate.cabinetId);
			const newPatient = await api.createPatient(patientToCreate);
			console.log("✅ Patient créé avec succès - ID:", newPatient.id);

			// Vérifier que le patient a bien un ID valide
			if (!newPatient?.id) {
				console.error("❌ Patient créé sans ID:", newPatient);
				throw new Error("Le patient n'a pas été créé correctement - ID manquant");
			}

			// Invalider les queries pour mettre à jour la liste des patients
			queryClient.invalidateQueries({
				queryKey: ['patients']
			});

			console.log("🎉 Affichage du toast de succès");
			toast.success(
				`Patient ${newPatient.firstName} ${newPatient.lastName} ajouté avec succès`
			);

			// Invalider les queries pour mettre à jour la liste des patients
			queryClient.invalidateQueries({ queryKey: ['patients'] });
			queryClient.invalidateQueries({ queryKey: ['patients', user.osteopathId] });

			console.log("🔄 Navigation vers la fiche patient:", `/patients/${newPatient.id}`);
			// Navigation immédiate sans délai pour éviter les problèmes de synchronisation
			navigate(`/patients/${newPatient.id}`);
		} catch (error) {
			console.error("❌ Erreur complète dans handleAddPatient:", error);
			
			if (
				error instanceof Error &&
				error.message.includes("duplicate key value")
			) {
				toast.error("Cet email est déjà utilisé par un autre patient.");
			} else {
				toast.error(
					error instanceof Error
						? `Erreur: ${error.message}`
						: "Impossible d'ajouter le patient. Veuillez réessayer."
				);
			}
		} finally {
			console.log("🔄 setLoading(false)");
			setLoading(false);
		}
	};

	return (
		<Layout>
			<div className="max-w-6xl mx-auto">
				{/* Bouton Retour */}
				<div className="relative z-10">
					<div className="flex items-center gap-2 mb-8">
						<Button
							variant="outline"
							size="sm"
							onClick={() => navigate(-1)}
							className="flex items-center gap-1"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Retour
						</Button>
					</div>
				</div>

				<div className="mb-6">
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<UserPlus className="h-8 w-8 text-pink-500" />
						Nouveau patient
					</h1>
					<p className="text-muted-foreground mt-1">
						Créez un nouveau patient en remplissant le formulaire
						ci-dessous.
					</p>
				</div>

				{/* Affichage du cabinet sélectionné */}
				{selectedCabinet && (
					<Alert className="mb-6">
						<Building className="h-4 w-4" />
						<AlertDescription>
							<strong>Cabinet de rattachement :</strong> {selectedCabinet.name}
							{selectedCabinet.address && (
								<span className="block text-sm text-muted-foreground mt-1">
									<MapPin className="h-4 w-4 inline-block mr-1" />{selectedCabinet.address}
								</span>
							)}
						</AlertDescription>
					</Alert>
				)}

				<div className="relative mb-6 p-4 bg-gradient-to-r from-blue-50 to-pink-50 dark:from-blue-950/20 dark:to-pink-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
					<div className="flex flex-col md:flex-row items-center">
						<img
							src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=120&h=120&q=80"
							alt="Nouveau patient"
							className="w-24 h-24 rounded-md object-cover mb-4 md:mb-0 md:mr-6"
						/>
						<div>
							<h3 className="text-lg font-medium text-pink-800 dark:text-pink-300">
								Ajout d'un nouveau patient
							</h3>
							<p className="text-pink-600/70 dark:text-pink-400/70 mt-1">
								Les informations collectées permettront
								d'assurer un suivi de qualité et d'offrir des
								soins personnalisés. Remplissez les champs
								obligatoires pour commencer.
							</p>
						</div>
					</div>
				</div>

				{loading ? (
					<div className="flex justify-center items-center py-12 bg-card rounded-lg border">
						<div className="text-center">
							<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
							<p className="text-muted-foreground">
								Enregistrement du patient...
							</p>
						</div>
					</div>
				) : (
					<div className="bg-card rounded-lg border shadow-sm p-3">
						<PatientForm
							onSubmit={handleAddPatient}
							emailRequired={false}
							selectedCabinetId={selectedCabinetId}
							isLoading={loading}
						/>
					</div>
				)}
			</div>
		</Layout>
	);
};

export default NewPatientPage;
