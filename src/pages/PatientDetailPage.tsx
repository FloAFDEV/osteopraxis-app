
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  User, Calendar, FileText, MapPin, Mail, Phone, Activity, 
  List, Heart, AlertCircle, Loader2, Edit, Plus, UserCheck, UserCircle, Users,
  Clock
} from "lucide-react";
import { format, parseISO, differenceInYears } from "date-fns";
import { fr } from "date-fns/locale";
import { api } from "@/services/api";
import { Patient, Appointment, Invoice } from "@/types";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppointmentCard } from "@/components/appointment-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [patientData, appointmentsData, invoicesData] = await Promise.all([
          api.getPatientById(parseInt(id, 10)),
          api.getAppointments(),
          api.getInvoices()
        ]);
        
        if (!patientData) {
          toast.error("Patient non trouvé");
          navigate("/patients");
          return;
        }
        
        setPatient(patientData);
        
        // Filter appointments for this patient
        const filteredAppointments = appointmentsData.filter(app => app.patientId === parseInt(id, 10));
        setAppointments(filteredAppointments);
        
        // Filter invoices for this patient
        const filteredInvoices = invoicesData.filter(inv => inv.patientId === parseInt(id, 10));
        setInvoices(filteredInvoices);
      } catch (error) {
        console.error("Error fetching patient data:", error);
        toast.error("Erreur lors du chargement des données du patient");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
            Le patient que vous recherchez n'existe pas ou a été supprimé.
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

  // Add null check for birthDate
  const birthDate = patient.birthDate ? parseISO(patient.birthDate) : new Date();
  const age = patient.birthDate ? differenceInYears(new Date(), birthDate) : 0;
  
  const upcomingAppointments = appointments
    .filter(app => app.status === "SCHEDULED" && new Date(app.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const pastAppointments = appointments
    .filter(app => app.status !== "SCHEDULED" || new Date(app.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Définir les couleurs en fonction du genre
  const getGenderColors = (gender: string) => {
    if (gender === "Homme") {
      return {
        badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        avatar: "bg-blue-600 text-white",
        border: "border-blue-500",
        lightBg: "bg-blue-50 dark:bg-blue-900/10",
        icon: <UserCheck className="h-5 w-5 text-blue-600" />
      };
    } else if (gender === "Femme") {
      return {
        badge: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
        avatar: "bg-pink-600 text-white",
        border: "border-pink-500",
        lightBg: "bg-pink-50 dark:bg-pink-900/10",
        icon: <UserCircle className="h-5 w-5 text-pink-600" />
      };
    } else {
      return {
        badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        avatar: "bg-purple-600 text-white",
        border: "border-purple-500",
        lightBg: "bg-purple-50 dark:bg-purple-900/10",
        icon: <Users className="h-5 w-5 text-purple-600" />
      };
    }
  };

  const genderColors = getGenderColors(patient.gender || "");

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
            <CardContent className={`p-6 ${genderColors.lightBg}`}>
              <div className="flex flex-col items-center text-center">
                <Avatar className={`h-24 w-24 mb-4 ring-2 ring-offset-2 ${genderColors.border} ring-offset-white dark:ring-offset-gray-950`}>
                  {patient.avatarUrl ? (
                    <AvatarImage src={patient.avatarUrl} alt={`${patient.firstName} ${patient.lastName}`} />
                  ) : (
                    <AvatarFallback className={`text-2xl ${genderColors.avatar}`}>
                      {getInitials(patient.firstName, patient.lastName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h1 className="text-2xl font-bold mb-1">
                  {patient.firstName} {patient.lastName}
                </h1>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={`flex items-center gap-1 ${genderColors.badge}`}>
                    {genderColors.icon} {patient.gender}
                  </Badge>
                  {patient.occupation && (
                    <Badge variant="outline" className="text-xs">
                      {patient.occupation}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {patient.birthDate ? (
                    <>
                      {age} ans • Né(e) le {format(birthDate, "dd/MM/yyyy")}
                    </>
                  ) : (
                    "Date de naissance non spécifiée"
                  )}
                </p>
                
                <div className="w-full space-y-3">
                  {patient.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      <a 
                        href={`tel:${patient.phone}`}
                        className="hover:text-blue-600 hover:underline transition-colors"
                      >
                        {patient.phone}
                      </a>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <a 
                        href={`mailto:${patient.email}`}
                        className="hover:text-blue-600 hover:underline transition-colors"
                      >
                        {patient.email}
                      </a>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{patient.address}</span>
                    </div>
                  )}
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
                    {!patient.maritalStatus && "Non spécifié"}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Enfants</dt>
                  <dd className="mt-1">
                    {patient.hasChildren === "true" && patient.childrenAges && patient.childrenAges.length > 0 
                      ? `${patient.childrenAges.length} enfant(s) (${patient.childrenAges.sort((a, b) => a - b).join(", ")} ans)`
                      : patient.hasChildren === "true" ? "A des enfants (âges non spécifiés)" : "Pas d'enfants"}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Latéralité</dt>
                  <dd className="mt-1">
                    {patient.handedness === "RIGHT" && "Droitier(ère)"}
                    {patient.handedness === "LEFT" && "Gaucher(ère)"}
                    {patient.handedness === "AMBIDEXTROUS" && "Ambidextre"}
                    {!patient.handedness && "Non spécifié"}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Fumeur</dt>
                  <dd className="mt-1">{patient.isSmoker ? "Oui" : "Non"}</dd>
                </div>
                
                {patient.gender === "Femme" && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Contraception</dt>
                    <dd className="mt-1">
                      {patient.contraception === "NONE" && "Aucune"}
                      {patient.contraception === "PILLS" && "Pilule"}
                      {patient.contraception === "PATCH" && "Patch"}
                      {patient.contraception === "RING" && "Anneau vaginal"}
                      {patient.contraception === "IUD" && "Stérilet"}
                      {patient.contraception === "IMPLANTS" && "Implant"}
                      {patient.contraception === "CONDOM" && "Préservatif"}
                      {patient.contraception === "DIAPHRAGM" && "Diaphragme"}
                      {patient.contraception === "INJECTION" && "Injection"}
                      {patient.contraception === "NATURAL_METHODS" && "Méthodes naturelles"}
                      {patient.contraception === "STERILIZATION" && "Stérilisation"}
                      {!patient.contraception && "Non spécifiée"}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-2/3">
          <Tabs defaultValue="medical-info">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="medical-info">
                <FileText className="h-4 w-4 mr-2" />
                Dossier médical
              </TabsTrigger>
              <TabsTrigger value="upcoming-appointments">
                <Calendar className="h-4 w-4 mr-2" />
                Rendez-vous
              </TabsTrigger>
              <TabsTrigger value="invoices">
                <FileText className="h-4 w-4 mr-2" />
                Factures
              </TabsTrigger>
              <TabsTrigger value="notes">
                <List className="h-4 w-4 mr-2" />
                Notes
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
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Rendez-vous à venir</h3>
                  <Button asChild>
                    <Link to={`/appointments/new?patientId=${patient.id}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouveau rendez-vous
                    </Link>
                  </Button>
                </div>

                {upcomingAppointments.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-xl font-medium">Aucun rendez-vous à venir</h3>
                      <p className="text-muted-foreground mt-2 mb-6">
                        Ce patient n'a pas de rendez-vous programmés.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                    {upcomingAppointments.map(appointment => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        patient={patient}
                        onEdit={() => navigate(`/appointments/${appointment.id}/edit`)}
                        onCancel={async () => {
                          try {
                            await api.cancelAppointment(appointment.id);
                            // Update local state
                            setAppointments(prevAppointments =>
                              prevAppointments.map(app =>
                                app.id === appointment.id
                                  ? { ...app, status: "CANCELED" }
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
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Rendez-vous passés</h3>
                {pastAppointments.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium">Aucun historique</h3>
                      <p className="text-muted-foreground mt-2">
                        Ce patient n'a pas d'historique de rendez-vous.
                      </p>
                    </CardContent>
                  </Card>
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
                                  : appointment.status === "CANCELED"
                                    ? "bg-red-500" 
                                    : "bg-amber-500"
                              }
                            >
                              {appointment.status === "COMPLETED" && "Terminé"}
                              {appointment.status === "CANCELED" && "Annulé"}
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
                          {appointment.status === "COMPLETED" && (
                            <Button 
                              variant="outline"
                              size="sm"
                              asChild
                              className="ml-2"
                            >
                              <Link to={`/invoices/new?appointmentId=${appointment.id}`}>
                                <FileText className="h-4 w-4 mr-1" />
                                Facturer
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="invoices">
              {invoices.length > 0 ? (
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Factures</h3>
                    <Button asChild>
                      <Link to={`/invoices/new?patientId=${patient.id}`}>
                        Nouvelle facture
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left">N° Facture</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-right">Montant</th>
                          <th className="px-4 py-3 text-center">Statut</th>
                          <th className="px-4 py-3 text-center">Paiement</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map(invoice => (
                          <tr key={invoice.id} className="border-b hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <Link to={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
                                #{invoice.id}
                              </Link>
                            </td>
                            <td className="px-4 py-3">
                              {format(parseISO(invoice.date), 'dd MMMM yyyy', {
                                locale: fr
                              })}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                              }).format(invoice.amount)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge className={invoice.paymentStatus === 'PAID' ? 'bg-green-500' : invoice.paymentStatus === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'}>
                                {invoice.paymentStatus === 'PAID' ? 'Payée' : invoice.paymentStatus === 'PENDING' ? 'En attente' : 'Annulée'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {invoice.paymentMethod === 'CB' && "Carte Bancaire"}
                              {invoice.paymentMethod === 'ESPECES' && "Espèces"}
                              {invoice.paymentMethod === 'CHEQUE' && "Chèque"}
                              {invoice.paymentMethod === 'VIREMENT' && "Virement"}
                              {!invoice.paymentMethod && "-"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button asChild variant="ghost" size="sm">
                                <Link to={`/invoices/${invoice.id}`}>
                                  Voir
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/30 rounded-lg mt-6">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/60 mb-2" />
                  <p className="text-muted-foreground mb-4">Aucune facture pour ce patient</p>
                  <Button asChild>
                    <Link to={`/invoices/new?patientId=${patient.id}`}>
                      Créer une facture
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="notes">
              <div className="text-center py-8 bg-muted/30 rounded-lg mt-6">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/60 mb-2" />
                <p className="text-muted-foreground">Les notes de consultation seront disponibles dans une future mise à jour</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default PatientDetailPage;
