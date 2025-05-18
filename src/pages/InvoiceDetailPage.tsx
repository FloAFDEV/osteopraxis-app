import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/services/api";
import { Invoice, Patient } from "@/types";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      setIsLoading(true);
      try {
        if (!id) return;
        
        // Convertir l'ID en nombre si nécessaire
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        const invoiceData = await api.getInvoiceById(numericId);
        
        if (invoiceData) {
          setInvoice(invoiceData);
          
          // Charger les informations du patient
          if (invoiceData.patientId) {
            const patientData = await api.getPatientById(invoiceData.patientId);
            setPatient(patientData);
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
    
    loadInvoice();
  }, [id, navigate]);

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
      <div className="container mx-auto py-10">
        <Button onClick={() => navigate("/invoices")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux factures
        </Button>

        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-2xl font-semibold mb-6">Détails de la Facture</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <strong>Numéro de Facture:</strong> {invoice.number}
            </div>
            <div>
              <strong>Date:</strong> {format(new Date(invoice.date), 'dd MMMM yyyy', { locale: fr })}
            </div>
            <div>
              <strong>Patient:</strong> {patient ? `${patient.firstName} ${patient.lastName}` : "N/A"}
            </div>
            <div>
              <strong>Montant Total:</strong> {invoice.totalAmount} €
            </div>
            <div>
              <strong>Statut:</strong> {invoice.status}
            </div>
            <div>
              <strong>Méthode de Paiement:</strong> {invoice.paymentMethod || "N/A"}
            </div>
          </div>

          <div>
            <strong>Notes:</strong> {invoice.notes || "Aucune note."}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvoiceDetailPage;
