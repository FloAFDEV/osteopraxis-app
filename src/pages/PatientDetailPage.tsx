
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  User, Calendar, FileText, MapPin, Mail, Phone, Activity, 
  List, Heart, AlertCircle, Loader2, Edit, Plus 
} from "lucide-react";
import { format, parseISO, differenceInYears } from "date-fns";
import { fr } from "date-fns/locale";
import { api } from "@/services/api";
import { Patient, Appointment } from "@/types";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppointmentCard } from "@/components/appointment-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return;
      
      try {
        const [patientData, appointmentsData] = await Promise.all([
          api.getPatientById(parseInt(id)),
          api.getAppointmentsByPatientId(parseInt(id))
        ]);
        
        if (!patientData) {
          throw new Error("Patient non trouvé");
        }
        
        setPatient(patientData);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error fetching patient data:", error);
        toast.error("Impossible de charger les données du patient");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des données du patient...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
          <h3 className="text-xl font-medium">Patient non trouvé</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            Le patient que vous recherchez n&apos;existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link to="/patients">
              Retour à la liste des patients
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const birthDate = parseISO(patient.birthDate);
  const age = differenceInYears(new Date(), birthDate);
  const upcomingAppointments = appointments
    .filter(app => app.status === "SCHEDULED" && new Date(app.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastAppointments = appointments
    .filter(app => app.status !== "SCHEDULED" || new Date(app.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Layout>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            asChild
          >
            <Link to="/patients">
              Retour
            </Link>
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/patients/${patient.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/appointments/new?patientId=${patient.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau rendez-vous
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(patient.firstName, patient.lastName)}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold mb-1">
                  {patient.firstName} {patient.lastName}
                </h1>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {patient.gender}
                  </Badge>
                  {patient.occupation && (
                    <Badge variant="outline" className="text-xs">
                      {patient.occupation}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {age} ans • Né(e) le {format(birthDate, "dd/MM/yyyy")}
                </p>
                
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{patient.address}</span>
                  </div>
                  {patient.physicalActivity && (
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-primary" />
                      <span>{patient.physicalActivity}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Statut marital</dt>
                  <dd className="mt-1">
                    {patient.maritalStatus === "SINGLE" && "Célibataire"}
                    {patient.maritalStatus === "MARRIED" && "Marié(e)"}
                    {patient.maritalStatus === "DIVORCED" && "Divorcé(e)"}
                    {patient.maritalStatus === "WIDOWED" && "Veuf/Veuve"}
                    {patient.maritalStatus === "PARTNERED" && "En couple"}
                    {patient.maritalStatus === "ENGAGED" && "Fiancé(e)"}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Enfants</dt>
                  <dd className="mt-1">
                    {patient.childrenAges.length > 0 
                      ? `${patient.childrenAges.length} enfant(s) (${patient.childrenAges.sort((a, b) => a - b).join(", ")} ans)`
                      : "Pas d'enfants"}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Latéralité</dt>
                  <dd className="mt-1">
                    {patient.handedness === "RIGHT" && "Droitier(ère)"}
                    {patient.handedness === "LEFT" && "Gaucher(ère)"}
                    {patient.handedness === "AMBIDEXTROUS" && "Ambidextre"}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Fumeur</dt>
                  <dd className="mt-1">{patient.isSmoker ? "Oui" : "Non"}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Contraception</dt>
                  <dd className="mt-1">
                    {patient.contraception === "NONE" && "Aucune"}
                    {patient.contraception === "PILLS" && "Pilule"}
                    {patient.contraception === "PATCH" && "Patch"}
                    {patient.contraception === "RING" && "Anneau vaginal"}
                    {patient.contraception === "IUD" && "Stérilet"}
                    {patient.contraception === "IMPLANT" && "Implant"}
                    {patient.contraception === "CONDOM" && "Préservatif"}
                    {patient.contraception === "DIAPHRAGM" && "Diaphragme"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-2/3">
          <Tabs defaultValue="medical-info">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="medical-info">
                <FileText className="h-4 w-4 mr-2" />
                Dossier médical
              </TabsTrigger>
              <TabsTrigger value="upcoming-appointments">
                <Calendar className="h-4 w-4 mr-2" />
                Rendez-vous à venir
              </TabsTrigger>
              <TabsTrigger value="history">
                <List className="h-4 w-4 mr-2" />
                Historique
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="medical-info" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Médecins et spécialistes</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Médecin traitant</dt>
                      <dd className="mt-1">{patient.generalPractitioner || "Non spécifié"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Ophtalmologiste</dt>
                      <dd className="mt-1">{patient.ophtalmologistName || "Non spécifié"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">ORL</dt>
                      <dd className="mt-1">{patient.entDoctorName || "Non spécifié"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Gastro-entérologue</dt>
                      <dd className="mt-1">{patient.digestiveDoctorName || "Non spécifié"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Antécédents médicaux</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Traitement actuel</dt>
                      <dd className="mt-1">{patient.currentTreatment || "Aucun traitement en cours"}</dd>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Antécédents chirurgicaux</dt>
                      <dd className="mt-1">{patient.surgicalHistory || "Aucun"}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Antécédents traumatiques</dt>
                      <dd className="mt-1">{patient.traumaHistory || "Aucun"}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Antécédents rhumatologiques</dt>
                      <dd className="mt-1">{patient.rheumatologicalHistory || "Aucun"}</dd>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Problèmes digestifs</dt>
                      <dd className="mt-1">{patient.digestiveProblems || "Aucun"}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Problèmes ORL</dt>
                      <dd className="mt-1">{patient.entProblems || "Aucun"}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Correction visuelle</dt>
                      <dd className="mt-1">{patient.hasVisionCorrection ? "Oui" : "Non"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="upcoming-appointments" className="space-y-6 mt-6">
              {upcomingAppointments.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-xl font-medium">Aucun rendez-vous à venir</h3>
                    <p className="text-muted-foreground mt-2 mb-6">
                      Ce patient n'a pas de rendez-vous programmés.
                    </p>
                    <Button asChild>
                      <Link to={`/appointments/new?patientId=${patient.id}`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Planifier un rendez-vous
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                  {upcomingAppointments.map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      patient={patient}
                      onEdit={() => {
                        window.location.href = `/appointments/${appointment.id}/edit`;
                      }}
                      onCancel={async () => {
                        try {
                          await api.updateAppointment(appointment.id, { status: "CANCELLED" });
                          // Update local state
                          setAppointments(prevAppointments =>
                            prevAppointments.map(app =>
                              app.id === appointment.id
                                ? { ...app, status: "CANCELLED" }
                                : app
                            )
                          );
                          toast.success("Rendez-vous annulé avec succès");
                        } catch (error) {
                          console.error("Error cancelling appointment:", error);
                          toast.error("Une erreur est survenue lors de l'annulation");
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historique des rendez-vous</CardTitle>
                  <CardDescription>
                    Historique de tous les rendez-vous passés et annulés
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  {pastAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium">Aucun historique</h3>
                      <p className="text-muted-foreground mt-2">
                        Ce patient n'a pas d'historique de rendez-vous.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pastAppointments.map(appointment => (
                        <div 
                          key={appointment.id} 
                          className="flex flex-col sm:flex-row justify-between p-4 rounded-md border"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={
                                  appointment.status === "COMPLETED" 
                                    ? "bg-green-500" 
                                    : appointment.status === "CANCELLED" 
                                      ? "bg-red-500" 
                                      : "bg-amber-500"
                                }
                              >
                                {appointment.status === "COMPLETED" && "Terminé"}
                                {appointment.status === "CANCELLED" && "Annulé"}
                                {appointment.status === "RESCHEDULED" && "Reporté"}
                                {appointment.status === "SCHEDULED" && "Passé"}
                              </Badge>
                              <span className="font-medium">
                                {format(new Date(appointment.date), "dd/MM/yyyy")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(appointment.date), "HH:mm")} - {appointment.reason}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              asChild
                            >
                              <Link to={`/appointments/${appointment.id}/edit`}>
                                Détails
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default PatientDetailPage;
