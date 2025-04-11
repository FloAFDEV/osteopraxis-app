import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, MapPin, Phone, Edit, Trash2, Plus } from "lucide-react";
import { api } from "@/services/api";
import { Cabinet } from "@/types";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import ConfirmDeleteCabinetModal from "@/components/modals/ConfirmDeleteCabinetModal";
const CabinetsManagementPage = () => {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cabinetToDelete, setCabinetToDelete] = useState<Cabinet | null>(null);
  useEffect(() => {
    const fetchCabinets = async () => {
      try {
        const cabinetData = await api.getCabinets();
        setCabinets(cabinetData);
      } catch (error) {
        console.error("Erreur lors de la récupération des cabinets:", error);
        toast.error("Impossible de charger les cabinets. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    fetchCabinets();
  }, []);
  const confirmDelete = (cabinet: Cabinet) => {
    setCabinetToDelete(cabinet);
    setDeleteModalOpen(true);
  };
  const handleDelete = async () => {
    if (!cabinetToDelete) return;
    try {
      await api.deleteCabinet(cabinetToDelete.id);
      setCabinets(cabinets.filter(c => c.id !== cabinetToDelete.id));
      toast.success("Cabinet supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression du cabinet:", error);
      toast.error("Impossible de supprimer le cabinet. Veuillez réessayer.");
    } finally {
      setDeleteModalOpen(false);
      setCabinetToDelete(null);
    }
  };
  if (loading) {
    return <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des cabinets...</p>
          </div>
        </div>
      </Layout>;
  }
  return <Layout>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8 text-green-500" />
              Gestion des Cabinets
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos cabinets d'ostéopathie
            </p>
          </div>
          <Button asChild>
            <Link to="/cabinets/new" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nouveau Cabinet
            </Link>
          </Button>
        </div>

        {cabinets.length === 0 ? <div className="text-center py-10 bg-muted/30 rounded-lg border border-dashed">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Aucun cabinet trouvé</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Commencez par créer votre premier cabinet d'ostéopathie
            </p>
            <Button asChild className="mt-6">
              <Link to="/cabinets/new">
                Ajouter un cabinet
              </Link>
            </Button>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cabinets.map(cabinet => <Card key={cabinet.id} className="overflow-hidden hover-scale">
                <CardContent className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {cabinet.name}
                    </h3>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{cabinet.address}</span>
                    </div>
                    {cabinet.phone && <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        <span className="text-gray-700 dark:text-gray-300">{cabinet.phone}</span>
                      </div>}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-800 p-4 border-t flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/cabinets/${cabinet.id}/edit`} className="flex items-center gap-1">
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" className="flex items-center gap-1" onClick={() => confirmDelete(cabinet)}>
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                </CardFooter>
              </Card>)}
          </div>}
      </div>

      <ConfirmDeleteCabinetModal isOpen={deleteModalOpen} cabinetName={cabinetToDelete?.name} onCancel={() => setDeleteModalOpen(false)} onDelete={handleDelete} />
    </Layout>;
};
export default CabinetsManagementPage;