import React, { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";
import PatientSearch from "@/components/patients/PatientSearch";
import PatientHeader from "@/components/patients/PatientHeader";
import PatientPagination from "@/components/patients/PatientPagination";
import PatientResultsSummary from "@/components/patients/PatientResultsSummary";
import PatientLoadingState from "@/components/patients/PatientLoadingState";
import EmptyPatientState from "@/components/patients/EmptyPatientState";
import CabinetFilter from "@/components/patients/CabinetFilter";
import AlphabetFilter from "@/components/patients/AlphabetFilter";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PatientListItem } from "@/components/patients/PatientListItem";
import { usePatientCache } from "@/hooks/usePatientCache";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { patientService } from "@/services/api/patient-service";

const PATIENTS_PER_PAGE = 20;

const PatientsPage = () => {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(null);
	const [selectedLetter, setSelectedLetter] = useState<string>("");
	const [currentPage, setCurrentPage] = useState(1);
	const [sortBy, setSortBy] = useState<"name" | "date" | "age">("name");
	const [viewMode, setViewMode] = useState<"list" | "cards">("list");
	const { patients, loading, error, loadPatients, updatePatientInCache } = usePatientCache();

	// Récupérer le cabinet sélectionné depuis le localStorage au démarrage
	useEffect(() => {
		const storedCabinetId = localStorage.getItem("selectedCabinetId");
		if (storedCabinetId && storedCabinetId !== "null") {
			setSelectedCabinetId(Number(storedCabinetId));
		}
	}, []);

	// Fetch patients with search and filtering
	const { data: patientsData, isLoading, error: queryError } = useQuery({
		queryKey: ['patients', searchQuery, selectedCabinetId, selectedLetter],
		queryFn: async () => {
			let patients = await patientService.getPatients();
			
			// Update cache
			patients.forEach(patient => updatePatientInCache(patient));
			
			// Filtrer par cabinet si sélectionné
			if (selectedCabinetId) {
				patients = patients.filter(patient => patient.cabinetId === selectedCabinetId);
			}
			
			// Filtrer par recherche
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase().trim();
				patients = patients.filter(patient => 
					patient.firstName.toLowerCase().includes(query) ||
					patient.lastName.toLowerCase().includes(query) ||
					patient.email?.toLowerCase().includes(query) ||
					patient.phone?.includes(query)
				);
			}
			
			// Filtrer par lettre
			if (selectedLetter) {
				patients = patients.filter(patient => 
					patient.lastName.toLowerCase().startsWith(selectedLetter.toLowerCase())
				);
			}
			
			// Trier par nom de famille puis prénom
			patients.sort((a, b) => {
				const lastNameComparison = a.lastName.localeCompare(b.lastName);
				if (lastNameComparison !== 0) return lastNameComparison;
				return a.firstName.localeCompare(b.firstName);
			});
			
			return patients;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Pagination
	const paginatedData = useMemo(() => {
		if (!patientsData) return { patients: [], totalPages: 0 };
		
		const startIndex = (currentPage - 1) * PATIENTS_PER_PAGE;
		const endIndex = startIndex + PATIENTS_PER_PAGE;
		const patients = patientsData.slice(startIndex, endIndex);
		const totalPages = Math.ceil(patientsData.length / PATIENTS_PER_PAGE);
		
		return { patients, totalPages };
	}, [patientsData, currentPage]);

	// Reset page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, selectedCabinetId, selectedLetter]);

	if (queryError) {
		console.error("Error loading patients:", queryError);
		toast.error("Erreur lors du chargement des patients");
	}

	const handleNewPatient = () => {
		navigate("/patients/new");
	};

	const handlePatientClick = (patientId: number) => {
		navigate(`/patients/${patientId}`);
	};

	return (
		<Layout>
			<div className="space-y-6">
				<PatientHeader 
					patientCount={patientsData?.length || 0}
					isRefreshing={isLoading}
					onRefresh={() => loadPatients(true)}
				/>

				{/* Filtres et recherche */}
				<div className="flex flex-col lg:flex-row gap-4">
					<div className="flex-1">
						<PatientSearch 
							searchQuery={searchQuery}
							onSearchChange={(e) => setSearchQuery(e.target.value)}
							sortBy={sortBy}
							onSortChange={setSortBy}
							viewMode={viewMode}
							onViewModeChange={setViewMode}
						/>
					</div>
					<div className="flex flex-col sm:flex-row gap-2">
						<CabinetFilter 
							cabinets={[]}
							selectedCabinetId={selectedCabinetId}
							onCabinetChange={setSelectedCabinetId}
						/>
					</div>
				</div>

				<AlphabetFilter 
					activeLetter={selectedLetter}
					onLetterChange={setSelectedLetter}
				/>

				{/* Résumé des résultats */}
				<PatientResultsSummary 
					patientCount={paginatedData.patients.length}
					currentPage={currentPage}
					totalPages={paginatedData.totalPages}
				/>

				{/* Liste des patients */}
				<Card>
					<CardContent className="p-0">
						{isLoading ? (
							<PatientLoadingState 
								isLoading={true}
								error={null}
								onRetry={() => {}}
							/>
						) : paginatedData.patients.length === 0 ? (
							<EmptyPatientState 
								searchQuery={searchQuery}
								activeLetter={selectedLetter}
								onClearFilter={() => {
									setSearchQuery("");
									setSelectedLetter("");
								}}
								onCreateTestPatient={() => {}}
							/>
						) : (
							<div className="divide-y">
								{paginatedData.patients.map((patient) => (
									<PatientListItem 
										key={patient.id}
										patient={patient}
									/>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Pagination */}
				{paginatedData.totalPages > 1 && (
					<PatientPagination 
						currentPage={currentPage}
						totalPages={paginatedData.totalPages}
						onPageChange={setCurrentPage}
					/>
				)}

				{/* Bouton flottant pour mobile */}
				<Button
					onClick={handleNewPatient}
					className="fixed bottom-6 right-6 rounded-full w-14 h-14 md:w-16 md:h-16 shadow-lg hover:shadow-xl transition-shadow z-50 lg:hidden"
				>
					<UserPlus className="h-6 w-6 md:h-8 md:w-8" />
				</Button>
			</div>
		</Layout>
	);
};

export default PatientsPage;
