
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, Search, UserPlus, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "@/services/api";
import { Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { PatientCard } from "@/components/patient-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { debugPatient } from "@/utils/patient-form-helpers";
import { Card, CardContent } from "@/components/ui/card";

const PatientsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Utiliser useQuery pour une meilleure gestion de l'état et du cache
  const { data: patients, isLoading, error, refetch } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      console.log("Fetching patients through useQuery...");
      try {
        const data = await api.getPatients();
        console.log(`Patients fetched successfully: ${data.length} patients found`);
        
        // Debug logs pour voir le contenu réel des patients
        if (data.length > 0) {
          console.log("First patient sample:", data[0]);
          debugPatient(data[0], "First patient from API");
        } else {
          console.log("No patients returned from API");
        }
        
        return data;
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

  const filteredPatients = patients 
    ? patients.filter(patient => {
        const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
        const searchLower = searchQuery.toLowerCase();
        
        return (
          searchQuery === "" ||
          fullName.includes(searchLower) ||
          (patient.email && patient.email.toLowerCase().includes(searchLower)) ||
          (patient.phone && patient.phone.includes(searchLower)) ||
          (patient.occupation && patient.occupation.toLowerCase().includes(searchLower))
        );
      }).sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''))
    : [];

  console.log(`Filtered patients: ${filteredPatients.length}`);

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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher un patient par nom, email, téléphone..."
                className="pl-10 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

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
                      {searchQuery ? "Aucun patient ne correspond à vos critères de recherche." : 
                       "Aucun patient n'a été ajouté pour le moment."}
                    </p>
                    <Button asChild variant="outline" className="border-blue-500/30 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                      <Link to="/patients/new">
                        <Plus className="mr-2 h-4 w-4" /> Ajouter un patient
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="w-full mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300">{filteredPatients.length} patient{filteredPatients.length > 1 ? 's' : ''} trouvé{filteredPatients.length > 1 ? 's' : ''}</h3>
                          <p className="text-blue-600/70 dark:text-blue-400/70">
                            Consultez et gérez vos dossiers patients
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPatients.map(patient => (
                    <PatientCard key={patient.id} patient={patient} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default PatientsPage;
