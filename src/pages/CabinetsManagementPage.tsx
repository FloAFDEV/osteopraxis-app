
import { useState, useEffect } from "react";
import { Layout } from "@/components/ui/layout";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Building, Edit, MapPin, Mail, Phone, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { FancyLoader } from "@/components/ui/fancy-loader";
import ConfirmDeleteCabinetModal from "@/components/modals/ConfirmDeleteCabinetModal";
import { Cabinet } from "@/types";

const CabinetsManagementPage = () => {
  const { user } = useAuth();
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [cabinetToDelete, setCabinetToDelete] = useState<Cabinet | null>(null);
  const navigate = useNavigate();

  // Load cabinets
  useEffect(() => {
    const loadCabinets = async () => {
      if (!user?.professionalProfileId) {
        navigate("/professional-profile");
        return;
      }
      
      try {
        setLoading(true);
        const cabinetsList = await api.getCabinetsByProfessionalProfileId(user.professionalProfileId);
        setCabinets(cabinetsList);
      } catch (error) {
        console.error("Error loading cabinets:", error);
        toast.error("Une erreur est survenue lors du chargement des cabinets");
      } finally {
        setLoading(false);
      }
    };

    loadCabinets();
  }, [user, navigate]);

  // Handle cabinet deletion
  const handleDeleteCabinet = async () => {
    if (!cabinetToDelete) return;
    
    try {
      setDeleting(true);
      await api.deleteCabinet(cabinetToDelete.id);
      setCabinets(cabinets.filter(c => c.id !== cabinetToDelete.id));
      toast.success("Cabinet supprimé avec succès");
      setCabinetToDelete(null);
    } catch (error) {
      console.error("Error deleting cabinet:", error);
      toast.error("Une erreur est survenue lors de la suppression du cabinet");
    } finally {
      setDeleting(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <FancyLoader message="Chargement des cabinets..." />
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gérer mes cabinets</h1>
          <Button onClick={() => navigate("/cabinets/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Cabinet
          </Button>
        </div>

        {cabinets.length === 0 ? (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Aucun cabinet trouvé</h2>
            <p className="mt-2 text-muted-foreground">
              Vous n'avez pas encore créé de cabinet. Créez votre premier cabinet pour commencer.
            </p>
            <Button 
              onClick={() => navigate("/cabinets/new")} 
              className="mt-6"
            >
              <Plus className="mr-2 h-4 w-4" />
              Créer un cabinet
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cabinets.map((cabinet) => (
              <Card key={cabinet.id} className="overflow-hidden border hover:shadow-md transition-shadow">
                <div className="overflow-hidden h-32 bg-gradient-to-r from-blue-400 to-indigo-500 relative">
                  {cabinet.imageUrl ? (
                    <img 
                      src={cabinet.imageUrl} 
                      alt={cabinet.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building className="h-16 w-16 text-white opacity-50" />
                    </div>
                  )}
                  {cabinet.logoUrl && (
                    <div className="absolute bottom-0 left-0 p-2 bg-white rounded-tr-md">
                      <img 
                        src={cabinet.logoUrl} 
                        alt="Logo" 
                        className="h-12 w-12 object-contain"
                      />
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{cabinet.name}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{cabinet.address}</span>
                    </div>
                    
                    {cabinet.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{cabinet.phone}</span>
                      </div>
                    )}
                    
                    {cabinet.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{cabinet.email}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCabinetToDelete(cabinet)}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => navigate(`/cabinets/${cabinet.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Confirmation modal for cabinet deletion */}
      <ConfirmDeleteCabinetModal
        isOpen={!!cabinetToDelete}
        cabinetName={cabinetToDelete?.name}
        onCancel={() => setCabinetToDelete(null)}
        onDelete={handleDeleteCabinet}
      />
    </Layout>
  );
};

export default CabinetsManagementPage;
