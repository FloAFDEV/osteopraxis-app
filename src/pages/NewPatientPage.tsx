import PatientForm from "@/components/patient-form";
import { Layout } from "@/components/ui/layout";
import { patientService } from "@/services/api/patient-service";
import { PatientFormValues } from "@/components/patient-form/types";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const NewPatientPage = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [isLoading, setIsLoading] = useState(false);
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

	const handleSave = async (data: PatientFormValues) => {
		try {
			setIsLoading(true);
			console.info("Submitting values:", data);

			// Convertir les champs numériques correctement
			if (data.height !== undefined) data.height = data.height ? Number(data.height) : null;
			if (data.weight !== undefined) data.weight = data.weight ? Number(data.weight) : null;
			if (data.bmi !== undefined) data.bmi = data.bmi ? Number(data.bmi) : null;
			if (data.weight_at_birth !== undefined) data.weight_at_birth = data.weight_at_birth ? Number(data.weight_at_birth) : null;
			if (data.height_at_birth !== undefined) data.height_at_birth = data.height_at_birth ? Number(data.height_at_birth) : null;
			if (data.head_circumference !== undefined) data.head_circumference = data.head_circumference ? Number(data.head_circumference) : null;

			const processedData = {
				...data,
				// Ensure required fields are present - set default values for required fields
				email: data.email || "",
				phone: data.phone || "",
				birthDate: data.birthDate || null,
				address: data.address || "",
				behavior: data.behavior || "",
				feeding: data.feeding || "",
				sleepingPattern: data.sleepingPattern || "",
				childCareContext: data.childCareContext || "",
				birthDetails: data.birthDetails || "",
				developmentMilestones: data.developmentMilestones || "",
				pregnancyHistory: data.pregnancyHistory || "",
				// Utiliser le cabinetId du formulaire ou celui de la navbar ou 1 par défaut
				cabinetId: data.cabinetId || selectedCabinetId || 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			console.log(
				"Création du patient avec cabinetId:",
				processedData.cabinetId
			);

			// Use the patientService createPatient method
			await patientService.createPatient(processedData);
			
			// Invalidate patient queries to refresh the data
			queryClient.invalidateQueries({
				queryKey: ['patients']
			});
			
			toast.success("Patient créé avec succès !");

			// Attendre un peu avant de naviguer pour laisser le toast s'afficher
			setTimeout(() => {
				navigate("/patients");
			}, 1500);
		} catch (error: any) {
			console.error("Error creating patient:", error);
			toast.error("Impossible de créer le patient");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Layout>
			<div className="max-w-4xl mx-auto">
				<div className="mb-6">
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Plus className="h-8 w-8 text-green-500" />
						Nouveau patient
					</h1>
					<p className="text-muted-foreground mt-1">
						Créez une nouvelle fiche patient
					</p>
				</div>
				<PatientForm
					onSubmit={handleSave}
					onCancel={() => navigate("/patients")}
					isLoading={isLoading}
				/>
			</div>
		</Layout>
	);
};

export default NewPatientPage;
