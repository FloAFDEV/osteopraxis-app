
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, Plus, Search, UserPlus, Loader2, AlertCircle, RefreshCw, SortAsc, Calendar, 
  Mail, UserIcon, Male, Female, MaleFemale, ChevronLeft, ChevronRight 
} from "lucide-react";
import { api } from "@/services/api";
import { Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { PatientCard } from "@/components/patient-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { differenceInYears, parseISO } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type SortOption = 'name' | 'date' | 'email' | 'gender';

// Nouveau composant pour les patients alphabétiques
const AlphabetFilter = ({ activeLetter, onLetterChange }: { activeLetter: string; onLetterChange: (letter: string) => void }) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  
  return (
    <div className="flex flex-wrap justify-center my-4 gap-1">
      {alphabet.map((letter) => (
        <Button
          key={letter}
          variant={activeLetter === letter ? "default" : "outline"}
          size="sm"
          className={`min-w-[2rem] ${activeLetter === letter ? 'bg-blue-600' : ''}`}
          onClick={() => onLetterChange(letter)}
        >
          {letter}
        </Button>
      ))}
      <Button
        variant={activeLetter === '' ? "default" : "outline"}
        size="sm"
        className={`min-w-[4rem] ${activeLetter === '' ? 'bg-blue-600' : ''}`}
        onClick={() => onLetterChange('')}
      >
        Tous
      </Button>
    </div>
  );
};

// Composant pour afficher un patient en format liste
const PatientListItem = ({ patient }: { patient: Patient }) => {
  // Calculer l'âge uniquement si birthDate est défini
  const age = patient.birthDate 
    ? differenceInYears(new Date(), parseISO(patient.birthDate)) 
    : null;
  
  // Déterminer l'icône de genre
  const getGenderIcon = (gender: string) => {
    if (gender === "Homme") {
      return <Male className="h-4 w-4 text-blue-600" />;
    } else if (gender === "Femme") {
      return <Female className="h-4 w-4 text-pink-600" />;
    } else {
      return <MaleFemale className="h-4 w-4 text-purple-600" />;
    }
  };
  
  // Définir la couleur de l'indicateur en fonction du genre
  const genderIndicatorColor = patient.gender === 'Homme' ? 'bg-blue-500' : 
                               patient.gender === 'Femme' ? 'bg-pink-500' : 'bg-purple-500';

  return (
    <div className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <Link to={`/patients/${patient.id}`} className="flex items-center gap-3 flex-grow">
            <div className={`w-2 h-6 rounded-sm ${genderIndicatorColor}`}></div>
            
            <div>
              <h3 className="font-medium text-base flex items-center gap-1">
                {patient.lastName} {patient.firstName}
                {age !== null && <span className="text-sm text-gray-500 ml-2">({age} ans)</span>}
                {getGenderIcon(patient.gender)}
              </h3>
              
              <div className="flex flex-wrap gap-x-4 text-sm text-gray-600 mt-1">
                {patient.email && (
                  <span className="flex items-center">
                    <Mail className="h-3 w-3 mr-1" /> {patient.email}
                  </span>
                )}
                
                {patient.phone && (
                  <span>{patient.phone}</span>
                )}
                
                {patient.occupation && (
                  <span className="text-gray-500 italic">{patient.occupation}</span>
                )}
              </div>
            </div>
          </Link>
          
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm" className="h-8 px-2">
              <Link to={`/patients/${patient.id}/edit`}>Modifier</Link>
            </Button>
            <Button asChild variant="default" size="sm" className="h-8 px-3 bg-blue-600 hover:bg-blue-700">
              <Link to={`/patients/${patient.id}`}>Voir</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [activeLetter, setActiveLetter] = useState("");
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10;

  // Utiliser useQuery pour une meilleure gestion de l'état et du cache
  const { data: patients, isLoading, error, refetch } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      try {
        return await api.getPatients();
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

  // Handler pour forcer un rechargement des données avec animation
  const handleRetry = async () => {
    setIsRefreshing(true);
    toast.info("Chargement des patients en cours...");
    try {
      await refetch();
      if (patients && patients.length > 0) {
        toast.success(`${patients.length} patients chargés avec succès`);
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

  // Forcer un rechargement au montage du composant
  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleLetterChange = (letter: string) => {
    setActiveLetter(letter);
    setSearchQuery("");
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const getSortedPatients = () => {
    if (!patients) return [];
    
    // D'abord filtrer les patients
    let filtered = patients.filter(patient => {
      const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      
      // Si une lettre est sélectionnée, filtrer par la première lettre du nom
      if (activeLetter && !searchQuery) {
        const firstLetter = (patient.lastName || '').charAt(0).toUpperCase();
        return firstLetter === activeLetter;
      }
      
      // Sinon, filtrer par recherche
      return (
        searchQuery === "" ||
        fullName.includes(searchLower) ||
        (patient.email && patient.email.toLowerCase().includes(searchLower)) ||
        (patient.phone && patient.phone.includes(searchLower)) ||
        (patient.occupation && patient.occupation.toLowerCase().includes(searchLower))
      );
    });
    
    // Ensuite trier les patients selon le critère choisi
    return [...filtered].sort((a, b) => {
      switch(sortBy) {
        case 'name':
          return (a.lastName || '').localeCompare(b.lastName || '');
        case 'date':
          // Tri par date de création, du plus récent au plus ancien
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
  
  // Navigation de page
  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  // Fonction pour créer un patient test dans Supabase pour le débogage
  const createTestPatient = async () => {
    try {
      toast.info("Création d'un patient test...");
      const testPatient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> = {
        firstName: "Test",
        lastName: `Patient ${new Date().getTime().toString().slice(-4)}`, // Nom unique
        gender: "Homme",
        email: `test${new Date().getTime()}@example.com`, // Email unique
        phone: "0123456789",
        osteopathId: 1,
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
        const newPatient = await api.createPatient(testPatient);
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
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              Patients {patients?.length > 0 && 
                <span className="text-lg px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {patients.length}
                </span>
              }
            </h1>

            <div className="flex gap-2 w-full md:w-auto">
              <Button 
                onClick={handleRetry}
                variant="outline" 
                className="w-auto"
                disabled={isRefreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              
              <Button 
                onClick={createTestPatient} 
                variant="outline"
                className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Patient test
              </Button>
              
              <Button asChild className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
                <Link to="/patients/new">
                  <UserPlus className="mr-2 h-4 w-4" /> Nouveau patient
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Rechercher un patient par nom, email, téléphone..."
                  className="pl-10 h-12 text-base"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page when search changes
                  }}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="px-4 min-w-36 justify-between">
                    <span className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      {sortBy === 'name' && 'Trier par nom'}
                      {sortBy === 'date' && 'Trier par date'}
                      {sortBy === 'email' && 'Trier par email'}
                      {sortBy === 'gender' && 'Trier par genre'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Options de tri</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortBy('name')} className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" /> Par nom
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('date')} className="cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" /> Par date d'ajout
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('email')} className="cursor-pointer">
                    <Mail className="mr-2 h-4 w-4" /> Par email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('gender')} className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" /> Par genre
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="flex gap-2">
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'} 
                  size="icon" 
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-blue-600' : ''}
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'cards' ? 'default' : 'outline'} 
                  size="icon" 
                  onClick={() => setViewMode('cards')}
                  className={viewMode === 'cards' ? 'bg-blue-600' : ''}
                >
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="w-1 h-1 bg-current rounded-sm"></div>
                    <div className="w-1 h-1 bg-current rounded-sm"></div>
                    <div className="w-1 h-1 bg-current rounded-sm"></div>
                    <div className="w-1 h-1 bg-current rounded-sm"></div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <AlphabetFilter activeLetter={activeLetter} onLetterChange={handleLetterChange} />

        {isLoading ? (
          <Card className="w-full p-6">
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-lg">Chargement des patients...</p>
              </div>
            </div>
          </Card>
        ) : error ? (
          <Card className="w-full">
            <CardContent className="pt-6">
              <div className="text-center py-10 bg-red-50 dark:bg-red-950/20 rounded-lg border border-dashed border-red-300 dark:border-red-800">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-red-800 dark:text-red-300 mb-2">Erreur de chargement</h3>
                <p className="text-red-600/70 dark:text-red-400/70 mb-6 max-w-md mx-auto">
                  {error instanceof Error 
                    ? `${error.message}` 
                    : "Impossible de récupérer les patients depuis la base de données."}
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleRetry} 
                  className="border-red-500/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Réessayer
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {filteredPatients.length === 0 ? (
              <Card className="w-full">
                <CardContent className="pt-6">
                  <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-dashed">
                    <div className="mb-4 relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                      <Users className="h-12 w-12 text-gray-500 absolute inset-0 m-auto" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Aucun patient trouvé</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      {(searchQuery || activeLetter) ? "Aucun patient ne correspond à vos critères de recherche." : 
                       "Aucun patient n'a été ajouté pour le moment."}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {activeLetter && (
                        <Button 
                          onClick={() => setActiveLetter('')} 
                          variant="outline"
                        >
                          Afficher tous les patients
                        </Button>
                      )}
                      <Button 
                        onClick={createTestPatient} 
                        variant="outline"
                        className="border-green-500/30 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un patient test
                      </Button>
                      <Button asChild variant="outline" className="border-blue-500/30 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                        <Link to="/patients/new">
                          <Plus className="mr-2 h-4 w-4" /> Créer un nouveau patient
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="w-full mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300">
                            {filteredPatients.length} patient{filteredPatients.length > 1 ? 's' : ''} trouvé{filteredPatients.length > 1 ? 's' : ''}
                            {totalPages > 1 && ` (Page ${currentPage}/${totalPages})`}
                          </h3>
                          <p className="text-blue-600/70 dark:text-blue-400/70">
                            Consultez et gérez vos dossiers patients
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
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
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => goToPage(currentPage - 1)}
                            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Logic to show pages around current page
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => goToPage(pageNum)}
                                isActive={currentPage === pageNum}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink 
                                onClick={() => goToPage(totalPages)}
                                isActive={false}
                              >
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          </>
                        )}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => goToPage(currentPage + 1)}
                            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default PatientsPage;
