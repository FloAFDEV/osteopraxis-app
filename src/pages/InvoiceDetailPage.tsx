import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/services/api";
import { Invoice, Patient, Osteopath, Cabinet } from "@/types";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, User, Building, CreditCard, Receipt, Calendar, Euro } from "lucide-react";
import { toast } from "sonner";

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInvoiceDetails = async () => {
      setIsLoading(true);
      try {
        if (!id) return;
        
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
          toast.error("ID de facture invalide");
          return navigate("/invoices");
        }
        
        const invoiceData = await api.getInvoiceById(numericId);
        
        if (invoiceData) {
          setInvoice(invoiceData);
          
          // Charger les informations du patient
          if (invoiceData.patientId) {
            const patientData = await api.getPatientById(invoiceData.patientId);
            setPatient(patientData);
          }

          // Charger les informations de l'ostéopathe et du cabinet
          try {
            const osteopathData = await api.getCurrentOsteopath();
            if (osteopathData) {
              setOsteopath(osteopathData);
              
              // Charger les cabinets de l'ostéopathe
              const cabinets = await api.getCabinetsByOsteopathId(osteopathData.id);
              if (cabinets && cabinets.length > 0) {
                // Utiliser le cabinet spécifié dans la facture ou le premier disponible
                const selectedCabinet = invoiceData.cabinetId 
                  ? cabinets.find(c => c.id === invoiceData.cabinetId) || cabinets[0]
                  : cabinets[0];
                setCabinet(selectedCabinet);
              }
            }
          } catch (error) {
            console.error("Erreur lors du chargement des données professionnelles:", error);
          }
        } else {
          toast.error("Facture non trouvée");
          navigate("/invoices");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la facture:", error);
        toast.error("Erreur lors du chargement de la facture");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInvoiceDetails();
  }, [id, navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getPaymentMethod = (method?: string) => {
    if (!method) return "Non spécifié";
    switch (method) {
      case "CB":
        return "Carte Bancaire";
      case "ESPECES":
        return "Espèces";
      case "CHEQUE":
        return "Chèque";
      case "VIREMENT":
        return "Virement bancaire";
      default:
        return method;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Payée</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>;
      case "CANCELED":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Annulée</Badge>;
      default:
        return <Badge variant="secondary">Statut inconnu</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de la facture...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!invoice) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Facture non trouvée.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate("/invoices")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux factures
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h1 className="text-2xl font-bold">
              Note d'honoraire n° {invoice.id.toString().padStart(4, '0')}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Détails de la facture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Statut et montant */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Statut de paiement</p>
                  {getPaymentStatusBadge(invoice.paymentStatus)}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Montant total</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(invoice.amount)}</p>
                </div>
              </div>

              <Separator />

              {/* Dates et paiement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date de consultation</p>
                    <p className="font-medium">{format(new Date(invoice.date), 'dd MMMM yyyy', { locale: fr })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mode de règlement</p>
                    <p className="font-medium">{getPaymentMethod(invoice.paymentMethod)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* TVA et mentions */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Mentions TVA</p>
                <p className="text-sm bg-muted p-3 rounded">
                  {invoice.tvaMotif || "TVA non applicable - Article 261-4-1° du CGI"}
                </p>
              </div>

              {/* Prestation */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">Prestation</p>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2 font-medium text-sm">
                    Désignation
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex justify-between items-center">
                      <span>Consultation d'ostéopathie</span>
                      <span className="font-medium">{formatCurrency(invoice.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm bg-muted p-3 rounded">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations patient et cabinet */}
          <div className="space-y-6">
            {/* Patient */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient ? (
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-lg">{patient.firstName} {patient.lastName}</p>
                      {patient.birthDate && (
                        <p className="text-sm text-muted-foreground">
                          Né(e) le {format(new Date(patient.birthDate), 'dd/MM/yyyy')}
                        </p>
                      )}
                    </div>
                    {patient.email && (
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-sm">{patient.email}</p>
                      </div>
                    )}
                    {patient.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Téléphone</p>
                        <p className="text-sm">{patient.phone}</p>
                      </div>
                    )}
                    {patient.address && (
                      <div>
                        <p className="text-sm text-muted-foreground">Adresse</p>
                        <p className="text-sm">{patient.address}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Patient #{invoice.patientId}</p>
                )}
              </CardContent>
            </Card>

            {/* Cabinet */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Cabinet
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cabinet ? (
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-lg">{cabinet.name}</p>
                      {osteopath?.professional_title && (
                        <p className="text-sm text-muted-foreground">{osteopath.professional_title}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Adresse</p>
                      <p className="text-sm">{cabinet.address}</p>
                    </div>
                    {cabinet.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Téléphone</p>
                        <p className="text-sm">{cabinet.phone}</p>
                      </div>
                    )}
                    {cabinet.email && (
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-sm">{cabinet.email}</p>
                      </div>
                    )}
                    {osteopath?.siret && (
                      <div>
                        <p className="text-sm text-muted-foreground">SIRET</p>
                        <p className="text-sm">{osteopath.siret}</p>
                      </div>
                    )}
                    {osteopath?.adeli_number && (
                      <div>
                        <p className="text-sm text-muted-foreground">ADELI</p>
                        <p className="text-sm">{osteopath.adeli_number}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Informations non disponibles</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvoiceDetailPage;
