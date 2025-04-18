import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { api } from "@/services/api";
import { Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { PatientCard } from "@/components/patient-card";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/services/supabase-api/utils";

// Import refactored components
import AlphabetFilter from "@/components/patients/AlphabetFilter";
import PatientListItem from "@/components/patients/PatientListItem";
import EmptyPatientState from "@/components/patients/EmptyPatientState";
import PatientSearch from "@/components/patients/PatientSearch";
import PatientLoadingState from "@/components/patients/PatientLoadingState";
import PatientHeader from "@/components/patients/PatientHeader";
import PatientResultsSummary from "@/components/patients/PatientResultsSummary";
import PatientPagination from "@/components/patients/PatientPagination";

type SortOption = 'name' | 'date' | 'email' | 'gender';

const PatientsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [activeLetter, setActiveLetter] = useState("");
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list');
  const navigate = useNavigate();
  
  // Pagination - updated to 25 patients per page
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 25;

  // Use useQuery for better state and cache management
  const { data: patients, isLoading, error, refetch } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return [];
        }

        // Get the osteopath's patients - application des politiques RLS
        const { data: patients, error } = await supabase
          .from('Patient')
          .select('*')
          .order('lastName', { ascending: true });

        if (error) {
          console.error("Erreur lors de la récupération des patients:", error);
          throw error;
        }

        return patients || [];
      } catch (err) {
        console.error("Error fetching patients:", err);
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handler for forcing data reload with animation
  const handleRetry = async () => {
    setIsRefreshing(true);
    toast.info("Chargement des patients en cours...");
    try {
      await refetch();
      if (patients && patients.length > 0) {
        toast.success(`${patients.length} patients chargés avec succès`);
      } else {
        toast.warning("Aucun patient trouvé. Vous pouvez créer un nouveau patient en cliquant sur le bouton '+' en haut à droite.");
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
    setActiveLetter('');
    setSearchQuery('');
  };

  const getSortedPatients = () => {
    if (!patients) return [];
    
    // First filter the patients
    let filtered = patients.filter(patient => {
      const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      
      // If a letter is selected, filter by the first letter of the name
      if (activeLetter && !searchQuery) {
        const firstLetter = (patient.lastName || '').charAt(0).toUpperCase();
        return firstLetter === activeLetter;
      }
      
      // Otherwise, filter by search
      return (
        searchQuery === "" ||
        fullName.includes(searchLower) ||
        (patient.email && patient.email.toLowerCase().includes(searchLower)) ||
        (patient.phone && patient.phone.includes(searchLower)) ||
        (patient.occupation && patient.occupation.toLowerCase().includes(searchLower))
      );
    });
    
    // Then sort the patients by the chosen criterion
    return [...filtered].sort((a, b) => {
      switch(sortBy) {
        case 'name':
          return (a.lastName || '').localeCompare(b.lastName || '');
        case 'date':
          // Sort by creation date, newest first
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'gender':
          return (a.gender || '').localeCompare(b.gender || '');
        default:
          return (a.lastName || '').localeCompare(b.lastName || '');
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

  // Function to create a test patient in Supabase for debugging
  const createTestPatient = async () => {
    try {
      toast.info("Création d'un patient test...");
      
      // Get current user's osteopathId
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour ajouter un patient");
        navigate('/login');
        return;
      }

      // Récupérer l'ostéopathe associé à l'utilisateur
      const { data: osteopath, error: osteoError } = await supabase
        .from('Osteopath')
        .select('id')
        .eq('userId', user.id)
        .single();

      if (osteoError || !osteopath) {
        toast.error("Impossible de récupérer vos informations d'ostéopathe");
        return;
      }
      
      const testPatient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> = {
        firstName: "Test",
        lastName: `Patient ${new Date().getTime().toString().slice(-4)}`, // Unique name
        gender: "Homme",
        email: `test${new Date().getTime()}@example.com`, // Unique email
        phone: "0123456789",
        osteopathId: osteopath.id,
        address: "123 Rue Test",
        cabinetId: 1,
        maritalStatus: "SINGLE",
        birthDate: new Date().toISOString(),
        handedness: "RIGHT",
        contraception: "NONE",
        hasVisionCorrection: false,
        isDeceased: false,
        isSmoker: false,
        hasChildren: "false",
        childrenAges: [],
        physicalActivity: null,
        currentTreatment: null,
        digestiveDoctorName: null,
        digestiveProblems: null,
        entDoctorName: null,
        entProblems: null,
        generalPractitioner: null,
        occupation: null,
        ophtalmologistName: null,
        rheumatologicalHistory: null,
        surgicalHistory: null,
        traumaHistory: null,
        hdlm: null,
        userId: null,
        avatarUrl: null
      };
      
      try {
        await api.createPatient(testPatient);
        toast.success("Patient test créé avec succès");
        refetch();
      } catch (err: any) {
        toast.error(`Erreur lors de la création du patient test: ${err.message}`);
        console.error("Erreur lors de la création du patient test:", err);
      }
    } catch (err) {
      console.error("Erreur lors de la préparation du patient test:", err);
      toast.error("Impossible de créer le patient test");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col min-h-full">
        {/* Header section */}
        <PatientHeader 
          patientCount={patients?.length || 0}
          isRefreshing={isRefreshing} 
          onRefresh={handleRetry}
          onCreateTestPatient={createTestPatient}
        />

        {/* Search and filter section */}
        <PatientSearch 
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          sortBy={sortBy}
          onSortChange={(option) => setSortBy(option)}
          viewMode={viewMode}
          onViewModeChange={(mode) => setViewMode(mode)}
        />

        {/* Alphabet filter */}
        <AlphabetFilter activeLetter={activeLetter} onLetterChange={handleLetterChange} />

        {/* Loading and error states */}
        <PatientLoadingState isLoading={isLoading} error={error} onRetry={handleRetry} />

        {/* Main content - patient list or empty state */}
        {!isLoading && !error && (
          <>
            {filteredPatients.length === 0 ? (
              <EmptyPatientState 
                searchQuery={searchQuery} 
                activeLetter={activeLetter} 
                onClearFilter={handleClearFilter} 
                onCreateTestPatient={createTestPatient} 
              />
            ) : (
              <>
                <PatientResultsSummary 
                  patientCount={filteredPatients.length}
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
                
                {viewMode === 'cards' ? (
                  <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedPatients.map(patient => (
                      <PatientCard key={patient.id} patient={patient} />
                    ))}
                  </div>
                ) : (
                  <Card className="overflow-hidden">
                    <div className="divide-y">
                      {paginatedPatients.map(patient => (
                        <PatientListItem key={patient.id} patient={patient} />
                      ))}
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
