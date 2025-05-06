
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Building2, Plus, ArrowRight } from "lucide-react";
import { Cabinet } from "@/types";

const CabinetSettingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);

  useEffect(() => {
    const loadCabinets = async () => {
      if (!user?.id) {
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        // First get the osteopath ID based on the user ID
        const osteopathData = await api.getOsteopathByUserId(user.id);
        
        if (osteopathData && osteopathData.id) {
          // Then get cabinets for that osteopath ID
          const cabinetList = await api.getCabinetsByOsteopathId(osteopathData.id);
          setCabinets(cabinetList || []);
        } else {
          setCabinets([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des cabinets:", error);
        toast.error("Erreur lors du chargement des cabinets. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    loadCabinets();
  }, [user, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-5xl px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-green-500" />
            Gestion des cabinets
          </h1>
          <Button onClick={() => navigate('/cabinets/new')} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Nouveau cabinet
          </Button>
        </div>
        
        {cabinets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">Aucun cabinet trouvé</h2>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Vous n'avez pas encore de cabinet enregistré. Créez votre premier cabinet pour commencer à gérer vos patients.
              </p>
              <Button onClick={() => navigate('/cabinets/new')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Créer mon premier cabinet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {cabinets.map(cabinet => (
              <Card key={cabinet.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-md flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>{cabinet.name}</div>
                  </CardTitle>
                  <CardDescription>{cabinet.address}, {cabinet.city} {cabinet.postalCode}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/cabinets/${cabinet.id}/edit`)}
                      className="flex items-center gap-1"
                    >
                      Modifier
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CabinetSettingsPage;
