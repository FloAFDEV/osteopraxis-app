
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, Search, UserPlus } from "lucide-react";
import { api } from "@/services/api";
import { Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { PatientCard } from "@/components/patient-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PatientsPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await api.getPatients();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Impossible de charger les patients. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    
    return (
      searchQuery === "" ||
      fullName.includes(searchLower) ||
      (patient.email && patient.email.toLowerCase().includes(searchLower)) ||
      (patient.phone && patient.phone.includes(searchLower)) ||
      (patient.occupation && patient.occupation.toLowerCase().includes(searchLower))
    );
  }).sort((a, b) => a.lastName.localeCompare(b.lastName));

  return (
    <Layout>
      <div className="flex flex-col min-h-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Patients
          </h1>

          <Button asChild>
            <Link to="/patients/new">
              <UserPlus className="mr-2 h-4 w-4" /> Nouveau patient
            </Link>
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un patient par nom, email, téléphone..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des patients...</p>
            </div>
          </div>
        ) : (
          <>
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-xl font-medium">Aucun patient trouvé</h3>
                <p className="text-muted-foreground mt-2 mb-6">
                  Aucun patient ne correspond à vos critères de recherche.
                </p>
                <Button asChild variant="outline">
                  <Link to="/patients/new">
                    <Plus className="mr-2 h-4 w-4" /> Ajouter un patient
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredPatients.map(patient => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default PatientsPage;
