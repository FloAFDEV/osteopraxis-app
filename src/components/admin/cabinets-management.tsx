import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Users, 
  FileText, 
  Phone, 
  Mail, 
  MapPin,
  Search,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { getCabinetsWithStats, deactivateCabinet, AdminCabinetWithStats } from "@/services/admin-service";
import { adminApiService } from "@/services/admin-api-service";

export function CabinetsManagement() {
  const [cabinets, setCabinets] = useState<AdminCabinetWithStats[]>([]);
  const [filteredCabinets, setFilteredCabinets] = useState<AdminCabinetWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCabinet, setSelectedCabinet] = useState<AdminCabinetWithStats | null>(null);

  useEffect(() => {
    loadCabinets();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = cabinets.filter(cabinet => 
        cabinet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cabinet.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cabinet.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cabinet.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCabinets(filtered);
    } else {
      setFilteredCabinets(cabinets);
    }
  }, [searchTerm, cabinets]);

  const loadCabinets = async () => {
    try {
      setLoading(true);
      const { data } = await adminApiService.getCabinets();
      setCabinets(data);
      setFilteredCabinets(data);
    } catch (error) {
      console.error('Erreur lors du chargement des cabinets:', error);
      toast.error('Erreur lors du chargement des cabinets');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (cabinetId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir désactiver ce cabinet ?')) {
      return;
    }

    try {
      await deactivateCabinet(cabinetId);
      toast.success('Cabinet désactivé avec succès');
      loadCabinets();
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error);
      toast.error('Erreur lors de la désactivation du cabinet');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building className="h-6 w-6 text-blue-500" />
            Gestion des cabinets
          </h2>
          <p className="text-muted-foreground">
            {cabinets.length} cabinet{cabinets.length !== 1 ? 's' : ''} • {filteredCabinets.length} affiché{filteredCabinets.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un cabinet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau cabinet
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredCabinets.map((cabinet) => (
          <Card key={cabinet.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-500" />
                    {cabinet.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Propriétaire: {cabinet.owner_name}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedCabinet(cabinet)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeactivate(cabinet.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Désactiver
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{cabinet.address}</span>
                </div>
                
                {cabinet.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{cabinet.email}</span>
                  </div>
                )}
                
                {cabinet.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{cabinet.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{cabinet.associated_osteopaths_count} ostéopathe{cabinet.associated_osteopaths_count !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div className="flex gap-4 mt-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {cabinet.active_patients_count} patients actifs
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {cabinet.patients_count} patients total
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCabinets.length === 0 && (
        <div className="text-center py-8">
          <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun cabinet trouvé</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Aucun cabinet ne correspond à votre recherche.' : 'Aucun cabinet n\'est configuré.'}
          </p>
        </div>
      )}

      {/* Modal détails cabinet */}
      {selectedCabinet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedCabinet(null)}>
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 pr-10">
                <Building className="h-5 w-5 text-blue-500" />
                Détails du cabinet: {selectedCabinet.name}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedCabinet(null)}
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
                      <label className="text-sm font-medium text-muted-foreground">Nom</label>
                      <p>{selectedCabinet.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Propriétaire</label>
                      <p>{selectedCabinet.owner_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Adresse</label>
                      <p>{selectedCabinet.address}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p>{selectedCabinet.email || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                      <p>{selectedCabinet.phone || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Statistiques</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <div className="text-2xl font-bold text-blue-600">{selectedCabinet.associated_osteopaths_count}</div>
                      <div className="text-sm text-muted-foreground">Ostéopathes associés</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="text-2xl font-bold text-green-600">{selectedCabinet.active_patients_count}</div>
                      <div className="text-sm text-muted-foreground">Patients actifs</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded">
                      <div className="text-2xl font-bold text-gray-600">{selectedCabinet.patients_count}</div>
                      <div className="text-sm text-muted-foreground">Patients total</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Dates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Créé le</label>
                      <p>{new Date(selectedCabinet.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Modifié le</label>
                      <p>{new Date(selectedCabinet.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}