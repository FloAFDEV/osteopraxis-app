
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Activity } from 'lucide-react';
import { invoiceService } from '@/services/api/invoice-service';
import { Layout } from '@/components/ui/layout';
import { InvoiceForm } from '@/components/invoice-form';
import { FancyLoader } from '@/components/ui/fancy-loader';
import { Patient, Invoice } from '@/types';
import { Card } from '@/components/ui/card';
import { api } from '@/services/api';

const EditInvoicePage = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInvoiceData = async () => {
      try {
        if (!id) {
          toast.error("ID de facture manquant");
          navigate('/invoices');
          return;
        }
        
        setIsLoading(true);
        const invoiceData = await invoiceService.getInvoiceById(parseInt(id, 10));
        
        if (!invoiceData) {
          toast.error("Facture non trouvée");
          navigate('/invoices');
          return;
        }
        
        setInvoice(invoiceData);
        
        // Load patient data
        const patientData = await api.getPatientById(invoiceData.patientId);
        if (patientData) {
          setPatient(patientData);
        }
        
      } catch (error) {
        console.error("Erreur lors du chargement de la facture:", error);
        toast.error("Impossible de charger les données de la facture");
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoiceData();
  }, [id, navigate]);

  const handleInvoiceUpdated = () => {
    toast.success("Facture mise à jour avec succès !");
    navigate('/invoices');
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-amber-500 dark:text-amber-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-500">
              Modifier la Facture
            </span>
          </h1>
        </div>

        {isLoading ? (
          <FancyLoader message="Chargement des données de la facture..." />
        ) : (
          <Card className="p-6">
            <InvoiceForm
              initialInvoice={invoice}
              initialPatient={patient}
              onCreate={handleInvoiceUpdated}
            />
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default EditInvoicePage;
