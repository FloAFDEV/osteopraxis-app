
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { InvoicePrintView } from "@/components/invoice-print-view";
import { useReactToPrint } from "react-to-print";
import { FileText, Printer, ArrowLeft, AlertCircle, Check, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ConfirmDeleteInvoiceModal from "@/components/modals/ConfirmDeleteInvoiceModal";

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [patient, setPatient] = useState(null);
  const [osteopath, setOsteopath] = useState(null);
  const [cabinet, setCabinet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const printRef = useRef(null);
  
  // Fixed: Using proper properties supported by the useReactToPrint hook
  const handlePrint = useReactToPrint({
    documentTitle: `Facture-${id}`,
    content: () => printRef.current,
    onPrintError: (error) => {
      console.error("Erreur d'impression:", error);
      toast.error("Erreur lors de l'impression");
    },
    removeAfterPrint: true,
  });

  const updatePaymentStatus = async (status) => {
    try {
      if (!invoice) return;
      await api.updatePaymentStatus(invoice.id, status);
      setInvoice({
        ...invoice,
        paymentStatus: status
      });
      toast.success("Statut de paiement mis à jour");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Impossible de mettre à jour le statut de paiement");
    }
  };

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const invoiceData = await api.getInvoiceById(parseInt(id));
        
        if (!invoiceData) {
          setError("Facture non trouvée");
          return;
        }
        
        setInvoice(invoiceData);
        
        // Charger les données du patient
        if (invoiceData.patientId) {
          try {
            const patientData = await api.getPatientById(invoiceData.patientId);
            setPatient(patientData || null);
            
            // Une fois que nous avons le patient, nous pouvons récupérer l'ostéopathe
            if (patientData && patientData.osteopathId) {
              try {
                const osteopathData = await api.getOsteopathById(patientData.osteopathId);
                setOsteopath(osteopathData || null);
                
                // Maintenant que nous avons l'ostéopathe, récupérons le cabinet principal
                if (osteopathData) {
                  try {
                    const cabinets = await api.getCabinetsByOsteopathId(osteopathData.id);
                    if (cabinets && cabinets.length > 0) {
                      setCabinet(cabinets[0]);
                    }
                  } catch (cabinetError) {
                    console.error("Erreur lors de la récupération du cabinet:", cabinetError);
                  }
                }
              } catch (osteopathError) {
                console.error("Erreur lors de la récupération de l'ostéopathe:", osteopathError);
              }
            }
          } catch (patientError) {
            console.error("Erreur lors de la récupération du patient:", patientError);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la facture:", error);
        setError("Impossible de charger les données de la facture");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoiceData();
  }, [id]);

  const handleDelete = async () => {
    try {
      if (!invoice) return;
      // Utiliser l'API pour supprimer la facture
      await api.deleteInvoice(invoice.id);
      toast.success("Facture supprimée avec succès");
      navigate("/invoices");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Impossible de supprimer la facture");
    } finally {
      setDeleteModalOpen(false);
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

  if (error || !invoice) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              {error || "Facture non trouvée. Vérifiez l'identifiant de la facture."}
            </AlertDescription>
          </Alert>
          
          <div className="mt-6">
            <Button asChild>
              <Link to="/invoices">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux factures
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Button variant="ghost" size="sm" className="mb-2" asChild>
              <Link to="/invoices">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux factures
              </Link>
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Facture #{invoice.id.toString().padStart(4, '0')}
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              // Fixed: Wrap handlePrint in a function that accepts the React event
              onClick={() => handlePrint()}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm mb-6">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Statut de paiement</h2>
            <div className="mt-4 flex gap-2">
              <Button 
                size="sm" 
                variant={invoice.paymentStatus === "PAID" ? "default" : "outline"}
                className={invoice.paymentStatus === "PAID" ? "bg-green-600 hover:bg-green-700" : ""}
                onClick={() => updatePaymentStatus("PAID")}
              >
                <Check className="mr-2 h-4 w-4" />
                Payée
              </Button>
              <Button 
                size="sm" 
                variant={invoice.paymentStatus === "PENDING" ? "default" : "outline"}
                onClick={() => updatePaymentStatus("PENDING")}
              >
                <Clock className="mr-2 h-4 w-4" />
                En attente
              </Button>
              <Button 
                size="sm" 
                variant={invoice.paymentStatus === "CANCELED" ? "default" : "outline"}
                className={invoice.paymentStatus === "CANCELED" ? "bg-red-600 hover:bg-red-700" : ""}
                onClick={() => updatePaymentStatus("CANCELED")}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Annulée
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow-sm">
          <div className="p-4 border-b bg-gray-50 rounded-t-lg">
            <h2 className="text-lg font-medium">Aperçu de la facture</h2>
          </div>
          <div className="p-4">
            <div ref={printRef}>
              <InvoicePrintView 
                invoice={invoice} 
                patient={patient || undefined} 
                osteopath={osteopath || undefined} 
                cabinet={cabinet || undefined} 
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" asChild>
            <Link to="/invoices">Retour</Link>
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setDeleteModalOpen(true)}
          >
            Supprimer
          </Button>
        </div>
      </div>

      <ConfirmDeleteInvoiceModal 
        isOpen={deleteModalOpen}
        invoiceNumber={invoice.id.toString().padStart(4, '0')}
        onCancel={() => setDeleteModalOpen(false)}
        onDelete={handleDelete}
      />
    </Layout>
  );
};

export default InvoiceDetailPage;
