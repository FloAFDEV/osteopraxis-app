import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, FileText, User, UserRound, Users, Plus, AlertCircle } from "lucide-react";
import { api } from "@/services/api";
import { Patient, Appointment, Gender, AppointmentStatus } from "@/types";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppointmentCard } from "@/components/appointment-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const patientId = parseInt(id, 10);
        const [patientData, appointmentsData] = await Promise.all([
          api.getPatientById(patientId),
          api.getAppointmentsByPatientId(patientId)
        ]);
        
        if (!patientData) {
          console.error("Patient non trouvé avec l'ID:", id);
          toast.error("Patient non trouvé. Veuillez réessayer.");
          navigate('/patients');
          return;
        }
        
        setPatient(patientData);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error fetching patient data:", error);
        toast.error("Impossible de charger les données du patient. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);
  
  const getGenderIcon = (gender?: Gender) => {
    if (gender === "MALE") {
      return <User className="h-4 w-4 text-blue-500" />;
    } else if (gender === "FEMALE") {
      return <UserRound className="h-4 w-4 text-pink-500" />;
    } else {
      return <Users className="h-4 w-4 text-purple-500" />;
    }
  };
  
  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "PLANNED":
        return <Badge className="bg-blue-500">Planifié</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-green-500">Confirmé</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500">Annulé</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-500">Terminé</Badge>;
      default:
        return null;
    }
  };
  
  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      await api.updateAppointmentStatus(appointmentId, "CANCELLED");
      setAppointments(prevAppointments => 
        prevAppointments.map(app => 
          app.id === appointmentId 
            ? { ...app, status: "CANCELLED" } 
            : app
        )
      );
      toast.success("Rendez-vous annulé avec succès");
    } catch (error) {
      console.error("Erreur lors de l'annulation du rendez-vous:", error);
      toast.error("Erreur lors de l'annulation du rendez-vous");
    }
  };

  if (loading) {
    return <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des données du patient...</p>
          </div>
        </div>
      </Layout>;
  }
  
  if (!patient) {
    return <Layout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
          <h3 className="text-xl font-medium">Patient non trouvé</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            Le patient que vous recherchez n&apos;existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link to="/patients">
              Retour aux patients
            </Link>
          </Button>
        </div>
      </Layout>;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 md:py-10 px-2 md:px-0">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {getGenderIcon(patient.gender)}
              {patient.firstName} {patient.lastName}
            </h1>
            <Button asChild>
              <Link to={`/patients/${patient.id}/edit`}>
                Modifier
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground mt-1">
            Détails et historique des rendez-vous du patient
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Informations personnelles</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {patient.gender}, {patient.birthDate ? format(parseISO(patient.birthDate), "d MMMM yyyy", { locale: fr }) : "Date de naissance inconnue"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.phone || "Numéro de téléphone non renseigné"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.email || "Adresse email non renseignée"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.address || "Adresse non renseignée"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Informations médicales</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.currentTreatment || "Aucun traitement en cours"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="mb-4" />

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Rendez-vous</h2>
          <Button asChild>
            <Link to="/appointments/new">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau
            </Link>
          </Button>
        </div>

        <ScrollArea>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  patient={patient}
                  onCancel={() => handleCancelAppointment(appointment.id)}
                  onEdit={() => navigate(`/appointments/${appointment.id}/edit`)}
                />
              ))
            ) : (
              <div className="text-center py-10 col-span-full">
                <p className="text-muted-foreground">Aucun rendez-vous trouvé pour ce patient.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </Layout>
  );
};

export default PatientDetailPage;
