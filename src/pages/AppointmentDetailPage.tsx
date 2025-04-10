
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Edit, Trash, User, MapPin, Phone, ChevronLeft, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '@/services/api';
import { Appointment, Patient } from '@/types';
import { Layout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';

const AppointmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        if (!id) return;
        const appointmentData = await api.getAppointment(id);
        setAppointment(appointmentData);
        
        // Fetch patient data if available
        if (appointmentData.patientId) {
          const patientData = await api.getPatient(appointmentData.patientId);
          setPatient(patientData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointment:', error);
        toast.error('Impossible de charger les détails du rendez-vous');
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleDelete = async () => {
    try {
      if (!id) return;
      await api.deleteAppointment(id);
      toast.success('Rendez-vous supprimé avec succès');
      navigate('/appointments');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Impossible de supprimer le rendez-vous');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Programmé</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmé</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Terminé</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!appointment) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Rendez-vous non trouvé</h2>
            <p className="mb-6 text-muted-foreground">
              Le rendez-vous que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Button asChild>
              <Link to="/appointments">Retour aux rendez-vous</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="mr-4"
          >
            <Link to="/appointments" className="flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" /> Retour
            </Link>
          </Button>
          <h1 className="text-3xl font-bold flex-grow">Détails du rendez-vous</h1>
        </div>
        
        <div className="grid gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
              <h2 className="text-xl font-semibold">Informations générales</h2>
              <div className="flex items-center">
                {getStatusBadge(appointment.status)}
              </div>
            </CardHeader>
            <CardContent className="px-6">
              <div className="grid gap-1">
                <div className="flex items-center text-sm py-2 border-b">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium mr-2">Date:</span>
                  <span>
                    {format(new Date(appointment.date), 'd MMMM yyyy', {locale: fr})}
                  </span>
                </div>
                <div className="flex items-center text-sm py-2 border-b">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium mr-2">Heure:</span>
                  <span>
                    {format(new Date(appointment.date), 'HH:mm', {locale: fr})}
                  </span>
                </div>
                <div className="flex items-center text-sm py-2 border-b">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium mr-2">Cabinet:</span>
                  <span>
                    {appointment.cabinetName || "Non spécifié"}
                  </span>
                </div>
                <div className="flex items-center text-sm py-2">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium mr-2">Type:</span>
                  <span>
                    {appointment.type || "Consultation standard"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
              <h2 className="text-xl font-semibold">Patient</h2>
              {patient && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                >
                  <Link to={`/patients/${patient.id}`}>
                    Voir le dossier
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent className="px-6">
              {patient ? (
                <div className="grid gap-1">
                  <div className="flex items-center text-sm py-2 border-b">
                    <User className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium mr-2">Nom:</span>
                    <span>
                      {patient.firstName} {patient.lastName}
                    </span>
                  </div>
                  {patient.birthDate && (
                    <div className="flex items-center text-sm py-2 border-b">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium mr-2">Date de naissance:</span>
                      <span>
                        {format(new Date(patient.birthDate), 'd MMMM yyyy', {locale: fr})}
                      </span>
                    </div>
                  )}
                  {patient.phone && (
                    <div className="flex items-center text-sm py-2 border-b">
                      <Phone className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium mr-2">Téléphone:</span>
                      <span>{patient.phone}</span>
                    </div>
                  )}
                  {appointment.reason && (
                    <div className="flex items-start text-sm py-2">
                      <FileText className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                      <div>
                        <span className="font-medium mb-1 block">Raison de la visite:</span>
                        <p className="text-gray-600">{appointment.reason}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Aucun patient associé à ce rendez-vous</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {appointment.comment && (
            <Card>
              <CardHeader className="pb-2 pt-6 px-6">
                <h2 className="text-xl font-semibold">Notes</h2>
              </CardHeader>
              <CardContent className="px-6">
                <p className="text-sm text-gray-600">{appointment.comment}</p>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardFooter className="px-6 py-4 flex justify-between">
              <Button 
                variant="outline" 
                asChild
                className="flex items-center"
              >
                <Link to={`/appointments/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Link>
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
                className="flex items-center"
              >
                <Trash className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AppointmentDetailPage;
