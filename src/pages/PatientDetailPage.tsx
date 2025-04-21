
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Clock, Mail, Phone, Map, User, Edit, AlertTriangle, Trash2 } from "lucide-react";
import { api } from "@/services/api";
import { Patient, Appointment, Invoice } from "@/types";
import { format, parseISO, differenceInYears } from "date-fns";
import { fr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentCard } from "@/components/appointment-card";
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
        const filteredAppointments = appointmentsData.filter(
          (app) => app.patientId === parseInt(id, 10)
        );
        setAppointments(filteredAppointments);

        // Filter invoices for this patient
        const filteredInvoices = invoicesData.filter(
          (inv) => inv.patientId === parseInt(id, 10)
        );
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
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-3" />
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

  const patientAge = patient.birthDate
    ? differenceInYears(new Date(), parseISO(patient.birthDate))
    : null;

  const upcomingAppointments = appointments.filter(app => {
    return new Date(app.date) >= new Date() && app.status === "SCHEDULED";
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = appointments.filter(app => {
    return new Date(app.date) < new Date() || app.status !== "SCHEDULED";
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between mb-6 items-start gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {patient.firstName[0]}{patient.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex flex-wrap items-center gap-2">
                {patient.firstName} {patient.lastName}
                <Badge className={
                  patient.gender === "Homme" ? "bg-blue-600" : 
                  patient.gender === "Femme" ? "bg-pink-600" : "bg-gray-600"
                }>
                  {patient.gender || "Non spécifié"}
                </Badge>
              </h1>
              
              <div className="text-gray-500 flex items-center gap-2 mt-1">
                <User className="h-4 w-4" />
                {patientAge ? (
                  <span>{patientAge} ans ({format(parseISO(patient.birthDate), "dd/MM/yyyy")})</span>
                ) : (
                  <span>Âge non spécifié</span>
                )}
              </div>
            </div>
          </div>
          
          <Button asChild variant="outline" className="shrink-0">
            <Link to={`/patients/${patient.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier le profil
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Informations de contact</h2>
              
              <div className="space-y-2">
                {patient.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <a href={`mailto:${patient.email}`} className="text-blue-600 hover:underline">
                        {patient.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {patient.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <a href={`tel:${patient.phone}`} className="hover:underline">
                        {patient.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {patient.address && (
                  <div className="flex items-start gap-2">
                    <Map className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                    <div className="text-sm whitespace-pre-wrap">
                      {patient.address}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 md:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Résumé médical</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Traitement en cours</h3>
                  <p className="font-medium">
                    {patient.currentTreatment || "Aucun traitement en cours"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Médecin traitant</h3>
                  <p className="font-medium">
                    {patient.doctor || "Non spécifié"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Antécédents médicaux</h3>
                  <p className="font-medium">
                    {patient.medicalHistory || "Aucun antécédent médical noté"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Allergies</h3>
                  <p className="font-medium">
                    {patient.allergies || "Aucune allergie notée"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="appointments" className="mb-8">
          <TabsList>
            <TabsTrigger value="appointments" className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              Rendez-vous ({appointments.length})
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center">
              <FileText className="mr-1 h-4 w-4" />
              Factures ({invoices.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center">
              <FileText className="mr-1 h-4 w-4" />
              Notes de consultation
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="appointments">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Rendez-vous à venir</h3>
                  <Button asChild>
                    <Link to={`/appointments/new?patientId=${patient.id}`}>
                      Nouveau rendez-vous
                    </Link>
                  </Button>
                </div>
                
                {upcomingAppointments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        patient={patient}
                        onEdit={() => navigate(`/appointments/${appointment.id}/edit`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/30 rounded-lg">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground/60 mb-2" />
                    <p className="text-muted-foreground mb-4">Aucun rendez-vous à venir</p>
                    <Button asChild>
                      <Link to={`/appointments/new?patientId=${patient.id}`}>
                        Planifier un rendez-vous
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Rendez-vous passés</h3>
                {pastAppointments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pastAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        patient={patient}
                        onEdit={() => navigate(`/appointments/${appointment.id}/edit`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground">Aucun rendez-vous passé</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="invoices">
            {invoices.length > 0 ? (
              <div className="space-y-4">
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
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <Link to={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
                              #{invoice.id}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            {format(parseISO(invoice.date), 'dd MMMM yyyy', { locale: fr })}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoice.amount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={
                              invoice.status === 'PAID' ? 'bg-green-500' :
                              invoice.status === 'PENDING' ? 'bg-amber-500' :
                              'bg-red-500'
                            }>
                              {invoice.status === 'PAID' ? 'Payée' : 
                               invoice.status === 'PENDING' ? 'En attente' : 
                               'Annulée'}
                            </Badge>
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
              <div className="text-center py-8 bg-muted/30 rounded-lg">
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
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-muted-foreground">Les notes de consultation seront disponibles dans une future mise à jour</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PatientDetailPage;
