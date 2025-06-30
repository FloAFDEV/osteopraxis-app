
import React, { useState, useMemo } from "react";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Eye, Edit, UserCheck, Baby } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { differenceInYears, parseISO } from "date-fns";
import { PatientSearch } from "@/components/patients/PatientSearch";

type SortBy = "name" | "date" | "age" | "email";

const PatientsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("name");

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: api.getPatients,
  });

  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients.filter((patient) =>
      `${patient.firstName} ${patient.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "age":
          const ageA = a.birthDate ? differenceInYears(new Date(), parseISO(a.birthDate)) : 0;
          const ageB = b.birthDate ? differenceInYears(new Date(), parseISO(b.birthDate)) : 0;
          return ageB - ageA;
        case "email":
          return (a.email || "").localeCompare(b.email || "");
        default:
          return 0;
      }
    });
  }, [patients, searchTerm, sortBy]);

  const getPatientAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    return differenceInYears(new Date(), parseISO(birthDate));
  };

  const getPatientIcon = (patient: any) => {
    const age = getPatientAge(patient.birthDate);
    const isChild = age !== null && age < 12;
    
    if (isChild) {
      return <Baby className="h-4 w-4 text-amber-500" />;
    }
    
    switch (patient.gender) {
      case "Homme":
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case "Femme":
        return <UserCheck className="h-4 w-4 text-pink-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des patients...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              Patients
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Gérez vos patients et leurs informations médicales
            </p>
          </div>
          <Button onClick={() => navigate("/patients/new")} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau patient
          </Button>
        </div>

        {/* Search and filters */}
        <PatientSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Résultats affichés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredAndSortedPatients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Enfants (< 12 ans)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patients.filter(p => {
                  const age = getPatientAge(p.birthDate);
                  return age !== null && age < 12;
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients List */}
        <div className="grid gap-4">
          {filteredAndSortedPatients.length > 0 ? (
            filteredAndSortedPatients.map((patient) => {
              const age = getPatientAge(patient.birthDate);
              
              return (
                <Card key={patient.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center space-x-3 flex-1">
                        {getPatientIcon(patient)}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 truncate">
                            {patient.lastName} {patient.firstName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {age !== null && (
                              <Badge variant="outline" className="text-xs">
                                {age} ans
                              </Badge>
                            )}
                            {patient.gender && (
                              <Badge variant="outline" className="text-xs">
                                {patient.gender}
                              </Badge>
                            )}
                            {patient.email && (
                              <span className="text-xs text-muted-foreground truncate max-w-48">
                                {patient.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/patients/${patient.id}`)}
                          className="flex-1 sm:flex-none text-xs px-2 py-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Voir</span>
                          <span className="sm:hidden">Détails</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/patients/${patient.id}/edit`)}
                          className="flex-1 sm:flex-none text-xs px-2 py-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Modifier</span>
                          <span className="sm:hidden">Edit</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Aucun patient trouvé
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {searchTerm 
                    ? "Aucun patient ne correspond à votre recherche."
                    : "Commencez par ajouter votre premier patient."
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => navigate("/patients/new")} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un patient
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PatientsPage;
