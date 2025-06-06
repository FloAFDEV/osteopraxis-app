import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/services/api";
import { Invoice, Patient, Osteopath, Cabinet } from "@/types";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { toast } from "sonner";
import { InvoicePrintView } from "@/components/invoice-print-view";

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
            // Récupérer d'abord l'ID de l'ostéopathe courant
            const currentOsteopathData = await api.getCurrentOsteopath();
            if (currentOsteopathData && currentOsteopathData.id) {
              // Puis récupérer l'objet Osteopath complet avec cet ID
              const osteopathData = await api.getOsteopathById(currentOsteopathData.id);
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

  const handlePrint = () => {
    window.print();
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
      <div className="container mx-auto py-6">
        {/* Navigation et actions */}
        <div className="flex items-center justify-between mb-6 print:hidden">
        		<Button
					onClick={() => navigate(-1)}
					className="mb-4 bg-amber-500"
				>
					<ArrowLeft className="mr-2 h-4 w-4" /> Retour
				</Button>
          <Button onClick={handlePrint} variant="default">
            <Printer className="mr-2 h-4 w-4" /> Imprimer
          </Button>
        </div>

        {/* Vue d'impression intégrée */}
        <InvoicePrintView
          invoice={invoice}
          patient={patient || undefined}
          osteopath={osteopath || undefined}
          cabinet={cabinet || undefined}
        />
      </div>
    </Layout>
  );
};

export default InvoiceDetailPage;
