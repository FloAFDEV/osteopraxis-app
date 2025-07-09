import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserX, 
  Users, 
  Search, 
  AlertTriangle, 
  Copy, 
  Phone, 
  Mail, 
  Calendar,
  Filter,
  RefreshCw,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { 
  searchPatients, 
  findPatientDuplicates, 
  getOrphanPatients,
  AdminPatientSearchResult,
  PatientDuplicate,
  OrphanPatient,
  getCabinetsWithStats,
  AdminCabinetWithStats
} from "@/services/admin-service";

export function PatientsManagement() {
  const [searchResults, setSearchResults] = useState<AdminPatientSearchResult[]>([]);
  const [duplicates, setDuplicates] = useState<PatientDuplicate[]>([]);
  const [orphans, setOrphans] = useState<OrphanPatient[]>([]);
  const [cabinets, setCabinets] = useState<AdminCabinetWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCabinet, setSelectedCabinet] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<AdminPatientSearchResult | null>(null);

  useEffect(() => {
    loadCabinets();
    loadOrphans();
    loadDuplicates();
  }, []);

  const loadCabinets = async () => {
    try {
      const data = await getCabinetsWithStats();
      setCabinets(data);
    } catch (error) {
      console.error('Erreur lors du chargement des cabinets:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Veuillez entrer un terme de recherche');
      return;
    }

    try {
      setLoading(true);
      const results = await searchPatients(
        searchTerm,
        undefined,
        selectedCabinet ? parseInt(selectedCabinet) : undefined,
        100
      );
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast.error('Erreur lors de la recherche de patients');
    } finally {
      setLoading(false);
    }
  };

  const loadDuplicates = async () => {
    try {
      const data = await findPatientDuplicates();
      setDuplicates(data);
    } catch (error) {
      console.error('Erreur lors du chargement des doublons:', error);
      toast.error('Erreur lors du chargement des doublons');
    }
  };

  const loadOrphans = async () => {
    try {
      const data = await getOrphanPatients();
      setOrphans(data);
    } catch (error) {
      console.error('Erreur lors du chargement des patients orphelins:', error);
      toast.error('Erreur lors du chargement des patients orphelins');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const groupedDuplicates = duplicates.reduce((acc, duplicate) => {
    if (!acc[duplicate.group_id]) {
      acc[duplicate.group_id] = [];
    }
    acc[duplicate.group_id].push(duplicate);
    return acc;
  }, {} as Record<number, PatientDuplicate[]>);

  const PatientCard = ({ patient }: { patient: AdminPatientSearchResult }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-lg">
              {patient.first_name} {patient.last_name}
            </h3>
            <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedPatient(patient)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Voir
            </Button>
            {patient.deleted_at && (
              <Badge variant="destructive">Supprimé</Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {patient.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{patient.email}</span>
            </div>
          )}
          {patient.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{patient.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{patient.osteopath_name}</span>
          </div>
          {patient.cabinet_name && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Cabinet:</span>
              <span>{patient.cabinet_name}</span>
            </div>
          )}
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          Créé le {formatDate(patient.created_at)} • Modifié le {formatDate(patient.updated_at)}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-green-500" />
            Gestion des patients
          </h2>
          <p className="text-muted-foreground">
            Accès en lecture seule aux données patients
          </p>
        </div>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Recherche
          </TabsTrigger>
          <TabsTrigger value="duplicates">
            <Copy className="h-4 w-4 mr-2" />
            Doublons ({Object.keys(groupedDuplicates).length})
          </TabsTrigger>
          <TabsTrigger value="orphans">
            <UserX className="h-4 w-4 mr-2" />
            Orphelins ({orphans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Recherche globale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Nom, prénom, email, téléphone, ou ID patient..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Select value={selectedCabinet} onValueChange={setSelectedCabinet}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par cabinet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les cabinets</SelectItem>
                    {cabinets.map((cabinet) => (
                      <SelectItem key={cabinet.id} value={cabinet.id.toString()}>
                        {cabinet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Rechercher
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    {searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''} trouvé{searchResults.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              <div className="grid gap-4">
                {searchResults.map((patient) => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </div>

              {searchResults.length === 0 && searchTerm && !loading && (
                <div className="text-center py-8">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun résultat</h3>
                  <p className="text-muted-foreground">
                    Aucun patient ne correspond à votre recherche.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                Doublons détectés
                <Button variant="outline" size="sm" onClick={loadDuplicates}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(groupedDuplicates).length === 0 ? (
                <div className="text-center py-8">
                  <Copy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun doublon détecté</h3>
                  <p className="text-muted-foreground">
                    Aucun patient en double n'a été trouvé.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedDuplicates).map(([groupId, duplicateGroup]) => (
                    <Card key={groupId} className="border-orange-200 bg-orange-50/50 dark:bg-orange-900/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          Groupe de doublons #{groupId}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {duplicateGroup.map((duplicate) => (
                            <div key={duplicate.patient_id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
                              <div>
                                <h4 className="font-medium">
                                  {duplicate.first_name} {duplicate.last_name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  ID: {duplicate.patient_id} • Né le {formatDate(duplicate.birth_date)}
                                </p>
                                {duplicate.email && (
                                  <p className="text-sm text-muted-foreground">
                                    Email: {duplicate.email}
                                  </p>
                                )}
                                {duplicate.phone && (
                                  <p className="text-sm text-muted-foreground">
                                    Téléphone: {duplicate.phone}
                                  </p>
                                )}
                              </div>
                              <Badge variant="outline">
                                {Math.round(duplicate.similarity_score * 100)}% similaire
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orphans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Patients orphelins
                <Button variant="outline" size="sm" onClick={loadOrphans}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orphans.length === 0 ? (
                <div className="text-center py-8">
                  <UserX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun patient orphelin</h3>
                  <p className="text-muted-foreground">
                    Tous les patients ont un ostéopathe assigné.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {orphans.map((patient) => (
                    <Card key={patient.id} className="border-red-200 bg-red-50/50 dark:bg-red-900/10">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-lg">
                              {patient.first_name} {patient.last_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
                          </div>
                          <Badge variant="destructive">
                            {patient.issue_type === 'no_osteopath' ? 'Sans ostéopathe' : 'Ostéopathe introuvable'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {patient.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{patient.email}</span>
                            </div>
                          )}
                          {patient.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{patient.phone}</span>
                            </div>
                          )}
                          {patient.cabinet_name && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Cabinet:</span>
                              <span>{patient.cabinet_name}</span>
                            </div>
                          )}
                          {patient.osteopath_id && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Ostéopathe ID:</span>
                              <span>{patient.osteopath_id}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 text-xs text-muted-foreground">
                          Créé le {formatDate(patient.created_at)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal détails patient */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Détails patient: {selectedPatient.first_name} {selectedPatient.last_name}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedPatient(null)}
                className="absolute top-4 right-4"
              >
                ×
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informations générales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">ID</label>
                      <p>{selectedPatient.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
                      <p>{selectedPatient.first_name} {selectedPatient.last_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p>{selectedPatient.email || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                      <p>{selectedPatient.phone || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Praticien et cabinet</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ostéopathe</label>
                      <p>{selectedPatient.osteopath_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Cabinet</label>
                      <p>{selectedPatient.cabinet_name || 'Non assigné'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Dates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Créé le</label>
                      <p>{formatDate(selectedPatient.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Modifié le</label>
                      <p>{formatDate(selectedPatient.updated_at)}</p>
                    </div>
                  </div>
                </div>

                {selectedPatient.deleted_at && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">Patient supprimé</h4>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      Supprimé le {formatDate(selectedPatient.deleted_at)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}