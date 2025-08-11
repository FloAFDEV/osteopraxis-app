import { PatientCard } from "@/components/patient-card";
import { Card } from "@/components/ui/card";
import { Layout } from "@/components/ui/layout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useGlobalOptimization } from "@/hooks/useGlobalOptimization";
import { SmartSkeleton } from "@/components/ui/skeleton-loaders";
import { useOptimizedPatients } from "@/hooks/useOptimizedPatients";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield } from "lucide-react";

// Import refactored components
import AlphabetFilter from "@/components/patients/AlphabetFilter";
import CabinetFilter from "@/components/patients/CabinetFilter";
import EmptyPatientState from "@/components/patients/EmptyPatientState";
import PatientHeader from "@/components/patients/PatientHeader";
import PatientListItem from "@/components/patients/PatientListItem";
import PatientLoadingState from "@/components/patients/PatientLoadingState";
import PatientPagination from "@/components/patients/PatientPagination";
import PatientResultsSummary from "@/components/patients/PatientResultsSummary";
import PatientSearch from "@/components/patients/PatientSearch";

type SortOption = "name" | "date" | "email" | "gender";

const PatientsPage = () => {
	const { user } = useAuth();
	const [searchQuery, setSearchQuery] = useState("");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [sortBy, setSortBy] = useState<SortOption>("name");
	const [activeLetter, setActiveLetter] = useState("");
	const [viewMode, setViewMode] = useState<"cards" | "list">("list");
	const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(
		null
	);

	// Pagination - updated to 30 patients per page
	const [currentPage, setCurrentPage] = useState(1);
	const patientsPerPage = 30;

	// Utilisation du système d'optimisation global
	const { data: globalData, loading: globalLoading, optimize } = useGlobalOptimization();

	// Récupérer les cabinets de l'utilisateur
	const { data: cabinets = [], isLoading: cabinetsLoading } = useQuery({
		queryKey: ["cabinets", user?.osteopathId],
		queryFn: async () => {
			if (!user?.osteopathId) return [];
			return await api.getCabinetsByOsteopathId(user.osteopathId);
		},
		enabled: !!user?.osteopathId,
		refetchOnWindowFocus: false,
	});

	// Récupération des patients (service original)
	const {
		data: allPatients = [],
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["patients", user?.osteopathId],
		queryFn: async () => {
			if (!user?.osteopathId) return [];
			return await api.getPatients();
		},
		enabled: !!user?.osteopathId,
		refetchOnWindowFocus: false,
	});

	// Filtrer les patients par cabinet sélectionné
	const patients =
		allPatients?.filter((patient) => {
			if (!selectedCabinetId) return true;
			return patient.cabinetId === selectedCabinetId;
		}) || [];

	// Amélioration du handler avec architecture hybride
	const handleRetry = async () => {
		setIsRefreshing(true);
		toast.info("Chargement des patients en cours...");
		try {
			// Utiliser le refetch du hook hybride
			await refetch();
			if (patients && patients.length > 0) {
				toast.success(
					`${patients.length} patients chargés avec succès`
				);
			} else {
				toast.warning("Aucun patient trouvé dans la base de données");
			}
		} catch (err) {
			toast.error("Impossible de charger les patients");
			console.error("Erreur lors du chargement des patients:", err);
		} finally {
			setIsRefreshing(false);
		}
	};

	// Force reload on component mount
	useEffect(() => {
		refetch();
	}, [refetch]);

	const handleLetterChange = (letter: string) => {
		setActiveLetter(letter);
		setSearchQuery("");
		setCurrentPage(1); // Reset to first page when filter changes
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
		setCurrentPage(1); // Reset to first page when search changes
	};

	const handleClearFilter = () => {
		setActiveLetter("");
		setSearchQuery("");
		setSelectedCabinetId(null);
	};

	const getSortedPatients = () => {
		if (!patients) return [];

		// First filter the patients
		let filtered = patients.filter((patient) => {
			const fullName = `${patient.firstName || ""} ${
				patient.lastName || ""
			}`.toLowerCase();
			const searchLower = searchQuery.toLowerCase();

			// If a letter is selected, filter by the first letter of the name
			if (activeLetter && !searchQuery) {
				const firstLetter = (patient.lastName || "")
					.charAt(0)
					.toUpperCase();
				return firstLetter === activeLetter;
			}

			// Otherwise, filter by search
			return (
				searchQuery === "" ||
				fullName.includes(searchLower) ||
				(patient.email &&
					patient.email.toLowerCase().includes(searchLower)) ||
				(patient.phone && patient.phone.includes(searchLower)) ||
				(patient.occupation &&
					patient.occupation.toLowerCase().includes(searchLower))
			);
		});

		// Then sort the patients by the chosen criterion
		return [...filtered].sort((a, b) => {
			switch (sortBy) {
				case "name":
					return (a.lastName || "").localeCompare(b.lastName || "");
				case "date":
					// Sort by creation date, newest first
					return (
						new Date(b.createdAt || "").getTime() -
						new Date(a.createdAt || "").getTime()
					);
				case "email":
					return (a.email || "").localeCompare(b.email || "");
				case "gender":
					return (a.gender || "").localeCompare(b.gender || "");
				default:
					return (a.lastName || "").localeCompare(b.lastName || "");
			}
		});
	};

	const filteredPatients = getSortedPatients();

	// Pagination logic
	const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
	const paginatedPatients = filteredPatients.slice(
		(currentPage - 1) * patientsPerPage,
		currentPage * patientsPerPage
	);

	// Page navigation
	const goToPage = (page: number) => {
		if (page > 0 && page <= totalPages) {
			setCurrentPage(page);
			window.scrollTo(0, 0);
		}
	};

	return (
		<Layout>
			<div className="flex flex-col min-h-full">
				{/* Header section */}
				<PatientHeader
					patientCount={allPatients?.length || 0}
					isRefreshing={isRefreshing}
					onRefresh={handleRetry}
				/>

				{/* HDS notice */}
				<div className="mb-4">
					<Alert>
						<AlertTitle className="flex items-center gap-2">
							<Shield className="h-4 w-4" /> Données patients stockées localement (HDS)
						</AlertTitle>
						<AlertDescription>
							Vos données sensibles ne quittent pas votre appareil. Partage via export USB sécurisé ou future synchronisation de cabinet.
						</AlertDescription>
					</Alert>
				</div>

				{/* Search and filter section */}
				<div className="mb-4 space-y-4">
					<PatientSearch
						searchQuery={searchQuery}
						onSearchChange={handleSearchChange}
						sortBy={sortBy}
						onSortChange={(option) => setSortBy(option)}
						viewMode={viewMode}
						onViewModeChange={(mode) => setViewMode(mode)}
					/>

					{/* Filtre par cabinet */}
					<CabinetFilter
						cabinets={cabinets}
						selectedCabinetId={selectedCabinetId}
						onCabinetChange={setSelectedCabinetId}
						loading={cabinetsLoading}
					/>
				</div>

				{/* Alphabet filter */}
				<AlphabetFilter
					activeLetter={activeLetter}
					onLetterChange={handleLetterChange}
				/>

				{/* Loading and error states optimisées */}
				{(isLoading || globalLoading.initializing) ? (
					<SmartSkeleton type="patient-list" count={10} />
				) : (
					<PatientLoadingState
						isLoading={isLoading}
						error={error}
						onRetry={handleRetry}
					/>
				)}

				{/* Main content - patient list or empty state */}
				{!isLoading && !globalLoading.initializing && !error && (
					<>
						{filteredPatients.length === 0 ? (
							<EmptyPatientState
								searchQuery={searchQuery}
								activeLetter={activeLetter}
								onClearFilter={handleClearFilter}
								onCreateTestPatient={() => {
									toast.info(
										"Création de patient de test non implémentée"
									);
								}}
							/>
						) : (
							<>
								<PatientResultsSummary
									patientCount={filteredPatients.length}
									currentPage={currentPage}
									totalPages={totalPages}
								/>

								{viewMode === "cards" ? (
									<div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
										{paginatedPatients.map((patient) => (
											<PatientCard
												key={patient.id}
												patient={patient}
												compact={false}
											/>
										))}
									</div>
								) : (
									<Card className="overflow-hidden">
										<div className="divide-y">
											{paginatedPatients.map(
												(patient) => (
													<PatientListItem
														key={patient.id}
														patient={patient}
													/>
												)
											)}
										</div>
									</Card>
								)}

								{/* Pagination */}
								<PatientPagination
									currentPage={currentPage}
									totalPages={totalPages}
									onPageChange={goToPage}
								/>
							</>
						)}
					</>
				)}
			</div>
		</Layout>
	);
};

export default PatientsPage;
