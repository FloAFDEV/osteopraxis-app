
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/ui/layout';
import { useNavigate, useParams } from 'react-router-dom';
import { InvoiceForm } from '@/components/invoice-form';
import { api } from '@/services/api';
import { Invoice, Patient } from '@/types';
import { toast } from 'sonner';
import { FancyLoader } from '@/components/ui/fancy-loader';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EditInvoicePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const invoiceData = await api.getInvoiceById(parseInt(id));
        
        if (invoiceData) {
          setInvoice(invoiceData);
          
          // Charger les données du patient associé
          if (invoiceData.patientId) {
            const patientData = await api.getPatientById(invoiceData.patientId);
            setPatient(patientData || null);
          }
        } else {
          setError('Facture non trouvée');
          toast.error('Facture non trouvée');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la facture:', error);
        setError('Erreur lors du chargement de la facture');
        toast.error('Erreur lors du chargement de la facture');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const handleSubmit = async (updatedInvoice: Invoice) => {
    try {
      await api.updateInvoice(parseInt(id!), updatedInvoice);
      toast.success('Facture mise à jour avec succès');
      
      // Attendre un peu avant de naviguer pour que le toast s'affiche
      setTimeout(() => {
        navigate('/invoices');
      }, 500);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la facture:', error);
      toast.error('Erreur lors de la mise à jour de la facture');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-6">
          <FancyLoader message="Chargement de la facture..." />
        </div>
      </Layout>
    );
  }

  if (error || !invoice) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">{error || 'Facture non trouvée'}</h1>
            <Button 
              onClick={() => navigate('/invoices')}
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux factures
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/invoices')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Modifier la facture #{invoice.id.toString().padStart(4, '0')}</h1>
        </div>
        
        <InvoiceForm 
          initialInvoice={invoice}
          patient={patient}
          onSubmit={handleSubmit}
          onCreate={() => navigate('/invoices')}
        />
      </div>
    </Layout>
  );
};

export default EditInvoicePage;
