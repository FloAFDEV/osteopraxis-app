
import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { PatientCard } from "@/components/patient-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { UserPlus, Search, Users, Check, X } from "lucide-react";
import { Patient, Gender } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const data = await api.getPatients();
        setPatients(data);
        setFilteredPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Erreur lors du chargement des patients");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Apply filters when searchTerm or selectedGender changes
  useEffect(() => {
    const filtered = patients.filter((patient) => {
      const matchesSearch =
        searchTerm === "" ||
        `${patient.firstName} ${patient.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm);

      const matchesGender =
        selectedGender === "all" || patient.gender === selectedGender as Gender;

      return matchesSearch && matchesGender;
    });

    setFilteredPatients(filtered);
  }, [searchTerm, selectedGender, patients]);

  // Statistical Calculations
  const totalPatients = patients.length;
  const malePatients = patients.filter((p) => p.gender === "MALE").length;
  const femalePatients = patients.filter((p) => p.gender === "FEMALE").length;
  const otherPatients = totalPatients - malePatients - femalePatients;

  const activePatients = patients.filter((p) => !p.isDeceased).length;
  const newPatientsThisMonth = patients.filter((p) => {
    const createdDate = new Date(p.createdAt);
    const now = new Date();
    return (
      createdDate.getMonth() === now.getMonth() &&
      createdDate.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Users className="mr-2 h-8 w-8 text-primary" />
              Patients
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos patients et leurs dossiers médicaux
            </p>
          </div>
          <Button asChild>
            <Link to="/patients/new" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Nouveau patient
            </Link>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPatients}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activePatients} actifs
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Répartition par genre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="text-sm">Hommes</div>
                  <div className="text-2xl font-bold">{malePatients}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm">Femmes</div>
                  <div className="text-2xl font-bold">{femalePatients}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm">Autre</div>
                  <div className="text-2xl font-bold">{otherPatients}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Nouveaux ce mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newPatientsThisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((newPatientsThisMonth / totalPatients) * 100 || 0).toFixed(1)}%
                du total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un patient..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={selectedGender}
            onValueChange={setSelectedGender}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les genres</SelectItem>
              <SelectItem value="MALE">Hommes</SelectItem>
              <SelectItem value="FEMALE">Femmes</SelectItem>
              <SelectItem value="OTHER">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Patients List */}
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 border rounded-lg">
            <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">Aucun patient trouvé</h3>
            <p className="mt-2 text-sm text-muted-foreground mb-4">
              Aucun patient ne correspond à vos critères de recherche.
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setSelectedGender("all");
            }}>
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PatientsPage;
