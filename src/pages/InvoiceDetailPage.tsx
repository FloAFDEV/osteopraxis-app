
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, FileText, ArrowLeft, Printer, Download, Activity } from "lucide-react";
import { toast } from "sonner";
import { InvoicePrintView } from "@/components/invoice-print-view";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const InvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isPrinting, setIsPrinting] = useState(false);
  
  const { data: invoice, isLoading, error, refetch } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      if (!id) throw new Error("ID de facture non défini");
      return await api.getInvoiceById(parseInt(id));
    },
    enabled: !!id,
  });
  
  const { data: patient } = useQuery({
    queryKey: ['patient', invoice?.patientId],
    queryFn: async () => {
      if (!invoice?.patientId) throw new Error("ID du patient non défini");
      return await api.getPatientById(invoice.patientId);
    },
    enabled: !!invoice?.patientId,
  });
  
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };
  
  const handleStatusChange = async (newStatus: 'PAID' | 'PENDING' | 'CANCELED') => {
    if (!id) return;
    
    try {
      await api.updatePaymentStatus(parseInt(id), newStatus);
      toast.success(`Statut mis à jour avec succès`);
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Payée</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">En attente</Badge>;
      case 'CANCELED':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Annulée</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Inconnue</Badge>;
    }
  };
  
  const formattedDate = invoice 
    ? format(new Date(invoice.date), "dd MMMM yyyy", { locale: fr }) 
    : "";
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <span className="ml-3 text-lg">Chargement de la facture...</span>
        </div>
      </Layout>
    );
  }
  
  if (error || !invoice) {
    return (
      <Layout>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center py-8 bg-red-50 dark:bg-red-900/10 rounded-lg">
              <p className="text-red-600 dark:text-red-400 mb-2">Cette facture n'existe pas ou une erreur s'est produite.</p>
              <Button onClick={() => navigate('/invoices')}>Retour aux factures</Button>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }
  
  return (
    <>
      <div className={`print:hidden ${isPrinting ? 'hidden' : ''}`}>
        <Layout>
          <Card className="border-none shadow-sm mb-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-full" 
                    onClick={() => navigate('/invoices')}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Activity className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                    <CardTitle className="text-2xl">
                      Facture #{invoice.id.toString().padStart(4, '0')}
                    </CardTitle>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimer
                  </Button>
                  <Button className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                    Détails de la facture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Numéro</p>
                        <p className="font-medium">#{invoice.id.toString().padStart(4, '0')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</p>
                        <p>{formattedDate}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Patient</p>
                      <p className="font-medium">
                        {patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${invoice.patientId}`}
                      </p>
                      {patient && (
                        <>
                          {patient.email && <p className="text-gray-600 dark:text-gray-400">{patient.email}</p>}
                          {patient.address && <p className="text-gray-600 dark:text-gray-400">{patient.address}</p>}
                        </>
                      )}
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Services</p>
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
                        <div className="flex justify-between">
                          <span>Consultation d'ostéopathie</span>
                          <span className="font-medium">{formatAmount(invoice.amount)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between mt-4 pt-2 border-t font-medium">
                        <span>Total</span>
                        <span className="text-amber-600 dark:text-amber-500">{formatAmount(invoice.amount)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Statut de paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Statut actuel</p>
                      <div className="flex items-center">
                        {getStatusBadge(invoice.paymentStatus)}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Mettre à jour le statut</p>
                      <Select 
                        value={invoice.paymentStatus}
                        onValueChange={(value) => handleStatusChange(
                          value as 'PAID' | 'PENDING' | 'CANCELED'
                        )}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PAID">Payée</SelectItem>
                          <SelectItem value="PENDING">En attente</SelectItem>
                          <SelectItem value="CANCELED">Annulée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start pt-0">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Remarque</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Les factures marquées comme "Payée" sont archivées et ne peuvent plus être modifiées.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </Layout>
      </div>
      
      {/* Vue d'impression */}
      <div className={`hidden ${isPrinting ? 'block' : 'print:block'}`}>
        <InvoicePrintView invoice={invoice} patient={patient} />
      </div>
    </>
  );
};

export default InvoiceDetailPage;
