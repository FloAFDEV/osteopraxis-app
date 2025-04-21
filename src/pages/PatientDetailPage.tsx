import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Activity, User, Mail, Phone, Calendar, FileText, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '@/services/api';
import { Patient, Appointment, Invoice } from '@/types';
import { Layout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from 'sonner';
import { InvoiceIcon } from 'lucide-react';

const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
    
      setLoading(true);
      setLoadingInvoices(true);
    
      try {
        const [patientData, appointmentsData, invoicesData] = await Promise.all([
          api.getPatientById(parseInt(id)),
          api.getAppointmentsByPatientId(parseInt(id)),
          api.getInvoicesByPatientId(parseInt(id))
        ]);
      
        if (!patientData) {
          console.error("Patient not found:", id);
          toast.error("Patient non trouvé");
          navigate('/patients');
          return;
        }
      
        setPatient(patientData);
        setAppointments(appointmentsData);
        setInvoices(invoicesData);
      } catch (error) {
        console.error("Error fetching patient data:", error);
        toast.error("Une erreur est survenue lors du chargement des données");
      } finally {
        setLoading(false);
        setLoadingInvoices(false);
      }
    };
  
    fetchData();
  }, [id, navigate]);

  if (loading) {
    return <Layout>
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des informations du patient...</p>
        </div>
      </div>
    </Layout>;
  }

  if (!patient) {
    return <Layout>
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold">Patient non trouvé</p>
          <p className="text-muted-foreground">Le patient demandé n'existe pas.</p>
        </div>
      </div>
    </Layout>;
  }

  return (
    <Layout>
      <div className="md:flex md:space-x-6">
        {/* Patient Info Card */}
        <Card className="w-full md:w-1/3 mb-6 md:mb-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Informations du patient</span>
            </CardTitle>
            <CardDescription>Détails personnels du patient.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={patient.imageUrl} />
                <AvatarFallback>{patient.firstName[0]}{patient.lastName[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold">{patient.firstName} {patient.lastName}</h2>
              <p className="text-sm text-muted-foreground">{patient.dateOfBirth ? format(parseISO(patient.dateOfBirth), 'd MMMM yyyy', { locale: fr }) : 'Date de naissance non renseignée'}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${patient.email}`} className="hover:underline">
                  {patient.email || 'Non renseigné'}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{patient.phone || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{patient.currentTreatment || 'Aucun traitement en cours'}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="secondary" asChild>
              <Link to={`/patients/${id}/edit`}>Modifier</Link>
            </Button>
            <Button asChild>
              <Link to={`/appointments/new?patientId=${id}`}>Nouveau RDV</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Appointments and Invoices Tabs */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              <Activity className="h-4 w-4 mr-2 inline-block" />
              Activité
            </CardTitle>
            <CardDescription>Historique des rendez-vous et factures.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="border-b">
                <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
                <TabsTrigger value="invoices">Factures</TabsTrigger>
              </TabsList>
              <TabsContent value="appointments" className="p-4">
                <ScrollArea className="h-[400px] w-full rounded-md border">
                  <div className="space-y-4">
                    {appointments.length > 0 ? (
                      appointments.map((appointment) => (
                        <Card key={appointment.id} className="hover-scale">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">
                                  Rendez-vous du {format(parseISO(appointment.date), 'd MMMM yyyy', { locale: fr })}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.reason}
                                </p>
                              </div>
                              <Badge className={
                                appointment.status === "SCHEDULED" ? "bg-blue-500" :
                                appointment.status === "COMPLETED" ? "bg-green-500" :
                                appointment.status === "CANCELED" ? "bg-red-500" :
                                "bg-amber-500"
                              }>
                                {appointment.status === "SCHEDULED" ? "Planifié" :
                                 appointment.status === "COMPLETED" ? "Terminé" :
                                 appointment.status === "CANCELED" ? "Annulé" :
                                 "Reporté"}
                              </Badge>
                            </div>
                            <div className="mt-2 flex justify-end">
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/appointments/${appointment.id}/edit`}>
                                  Voir détails
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center p-6">
                        <Calendar className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Aucun rendez-vous trouvé pour ce patient.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="invoices">
                <div className="space-y-6">
                  {loadingInvoices ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : invoices.length > 0 ? (
                    <div className="space-y-4">
                      {invoices.map((invoice) => (
                        <Card key={invoice.id} className="hover-scale">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">
                                  Facture #{invoice.id}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(invoice.date).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <div>
                                <Badge className={
                                  invoice.paymentStatus === "PAID" ? "bg-green-500" :
                                  invoice.paymentStatus === "PENDING" ? "bg-amber-500" :
                                  "bg-red-500"
                                }>
                                  {invoice.paymentStatus === "PAID" ? "Payée" :
                                   invoice.paymentStatus === "PENDING" ? "En attente" :
                                   "Annulée"}
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="font-bold">{invoice.amount.toFixed(2)} €</span>
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/invoices/${invoice.id}`}>
                                  Voir détails
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-dashed rounded-lg">
                      <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <InvoiceIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">Aucune facture</h3>
                      <p className="text-muted-foreground mb-4">
                        Ce patient n'a pas encore de factures.
                      </p>
                      <Button asChild>
                        <Link to={`/invoices/new?patientId=${id}`}>
                          <InvoiceIcon className="h-4 w-4 mr-2" />
                          Créer une facture
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PatientDetailPage;
