import { useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Users, 
  Plus, 
  Phone, 
  Mail, 
  Calendar,
  Filter,
  Eye,
  Edit,
  MoreHorizontal
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format, differenceInYears } from "date-fns";
import { fr } from "date-fns/locale";
import { Patient } from "@/types";

export default function DemoPatients() {
  const { demoData } = useDemo();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Filtrage des patients
  const filteredPatients = demoData.patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.includes(searchTerm) ||
      patient.occupation?.toLowerCase().includes(searchLower)
    );
  });

  const getAge = (birthDate: string | null) => {
    if (!birthDate) return "N/C";
    return differenceInYears(new Date(), new Date(birthDate));
  };

  const getLastAppointment = (patientId: number) => {
    const appointments = demoData.appointments
      .filter(a => a.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return appointments[0];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground">
            Gérez votre patientèle ({demoData.patients.length} patients)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau patient
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un patient (nom, email, téléphone...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredPatients.length}</div>
            <p className="text-xs text-muted-foreground">
              {searchTerm ? "résultat(s)" : "patients total"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Patients Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => {
          const lastAppointment = getLastAppointment(patient.id);
          const age = getAge(patient.birthDate);
          
          return (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {patient.firstName} {patient.lastName}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {age} ans
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {patient.gender === 'MALE' ? 'H' : patient.gender === 'FEMALE' ? 'F' : 'N/C'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedPatient(patient)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir le dossier
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        Nouveau RDV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Contact Info */}
                <div className="space-y-2">
                  {patient.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">{patient.email}</span>
                    </div>
                  )}
                  {patient.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{patient.phone}</span>
                    </div>
                  )}
                </div>

                {/* Occupation */}
                {patient.occupation && (
                  <div className="text-sm">
                    <span className="font-medium">Profession:</span>
                    <span className="text-muted-foreground ml-1">{patient.occupation}</span>
                  </div>
                )}

                {/* Last Appointment */}
                {lastAppointment && (
                  <div className="text-sm">
                    <span className="font-medium">Dernier RDV:</span>
                    <span className="text-muted-foreground ml-1">
                      {format(new Date(lastAppointment.date), "d MMM yyyy", { locale: fr })}
                    </span>
                    <Badge 
                      variant={lastAppointment.status === 'COMPLETED' ? 'default' : 'secondary'}
                      className="ml-2 text-xs"
                    >
                      {lastAppointment.status === 'COMPLETED' ? 'Terminé' : 'Planifié'}
                    </Badge>
                  </div>
                )}

                {/* Health Info */}
                {patient.allergies && patient.allergies !== 'NULL' && (
                  <div className="text-sm">
                    <span className="font-medium">Allergies:</span>
                    <span className="text-muted-foreground ml-1">{patient.allergies}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedPatient(patient)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir le dossier
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Créé le {format(new Date(patient.createdAt), "d MMM yyyy", { locale: fr })}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Aucun patient trouvé</h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? "Essayez de modifier votre recherche"
              : "Commencez par ajouter votre premier patient"
            }
          </p>
          {!searchTerm && (
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un patient
            </Button>
          )}
        </div>
      )}

      {/* Patient Detail Modal (placeholder) */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Dossier de {selectedPatient.firstName} {selectedPatient.lastName}
                </CardTitle>
                <Button variant="ghost" onClick={() => setSelectedPatient(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Informations personnelles</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Âge:</strong> {getAge(selectedPatient.birthDate)} ans</div>
                    <div><strong>Genre:</strong> {selectedPatient.gender || 'N/C'}</div>
                    <div><strong>Email:</strong> {selectedPatient.email || 'N/C'}</div>
                    <div><strong>Téléphone:</strong> {selectedPatient.phone || 'N/C'}</div>
                    <div><strong>Profession:</strong> {selectedPatient.occupation || 'N/C'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Informations médicales</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Allergies:</strong> {selectedPatient.allergies || 'Aucune'}</div>
                    <div><strong>Taille:</strong> {selectedPatient.height ? `${selectedPatient.height} cm` : 'N/C'}</div>
                    <div><strong>Poids:</strong> {selectedPatient.weight ? `${selectedPatient.weight} kg` : 'N/C'}</div>
                    <div><strong>IMC:</strong> {selectedPatient.bmi || 'N/C'}</div>
                  </div>
                </div>
              </div>
              
              {selectedPatient.other_comments_adult && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {selectedPatient.other_comments_adult}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline">Modifier</Button>
                <Button>Nouveau RDV</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}