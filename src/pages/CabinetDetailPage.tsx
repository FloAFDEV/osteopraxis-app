
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Building2, MapPin, Phone, Users, Calendar, Edit, AlertCircle } from "lucide-react";
import { api } from "@/services/api";
import { Cabinet, Appointment } from "@/types";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const CabinetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const cabinetData = await api.getCabinetById(parseInt(id));
        
        if (!cabinetData) {
          throw new Error("Cabinet non trouvé");
        }
        
        setCabinet(cabinetData);
        
        // For the demo, let's use appointments API to show some upcoming appointments
        // In a real app, we would filter by cabinet ID
        const appointmentsData = await api.getAppointments();
        const upcoming = appointmentsData
          .filter(app => app.status === "SCHEDULED")
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5); // Get first 5 upcoming appointments
          
        setUpcomingAppointments(upcoming);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Impossible de charger les données du cabinet. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!cabinet) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
          <h3 className="text-xl font-medium">Cabinet non trouvé</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            Le cabinet que vous recherchez n&apos;existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link to="/cabinets">
              Retour aux cabinets
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            {cabinet.name}
          </h1>
          
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/cabinets">
                Retour aux cabinets
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/cabinets/${cabinet.id}/edit`} className="flex items-center gap-1">
                <Edit className="h-4 w-4 mr-1" />
                Modifier
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Informations du cabinet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Adresse</p>
                    <p>{cabinet.address}</p>
                  </div>
                </div>
                
                {cabinet.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Téléphone</p>
                      <p>{cabinet.phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Prochains rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.map(appointment => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                        <div>
                          <div className="font-medium">
                            {format(new Date(appointment.date), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                          </div>
                          <div className="text-sm text-muted-foreground">{appointment.reason}</div>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/appointments/${appointment.id}`}>
                            Détails
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-10">
                    Aucun rendez-vous à venir dans ce cabinet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Ostéopathes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-3">
                  <p className="font-medium">Dr. Martin Durand</p>
                  <p className="text-sm text-muted-foreground">Ostéopathe principal</p>
                </div>
                <div className="border-t pt-3">
                  <Button variant="outline" className="w-full">
                    Gérer l'équipe
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full" variant="outline">
                  <Link to="/appointments/new">
                    <Calendar className="h-4 w-4 mr-2" />
                    Nouveau rendez-vous
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/patients/new">
                    <Users className="h-4 w-4 mr-2" />
                    Nouveau patient
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CabinetDetailPage;
