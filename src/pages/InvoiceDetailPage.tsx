
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/ui/layout';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/services/api';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FancyLoader } from '@/components/ui/fancy-loader';
import { InvoicePrintView } from '@/components/invoice-print-view';
import { InvoiceDetails } from '@/components/invoice-details';
import { toast } from 'sonner';
import { Invoice, Patient, ProfessionalProfile, Cabinet } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Activity } from 'lucide-react';

const InvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile | null>(null);
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Configuration pour l'impression
  const handlePrint = useReactToPrint({
    documentTitle: `Facture_${id}`,
    contentRef: printRef
  });
  
  // Charger les données de la facture
  useEffect(() => {
    const loadInvoiceData = async () => {
      if (!id) return;
      
      try {
        console.log(`Chargement des données de la facture ID: ${id}`);
        setLoading(true);
        
        const invoiceData = await api.getInvoiceById(parseInt(id));
        console.log("Données de facture récupérées:", invoiceData);
        
        if (invoiceData) {
          setInvoice(invoiceData);
          
          // Charger les données du patient associé
          if (invoiceData.patientId) {
            try {
              console.log(`Chargement des données du patient ID: ${invoiceData.patientId}`);
              const patientData = await api.getPatientById(invoiceData.patientId);
              console.log("Données de patient récupérées:", patientData);
              setPatient(patientData || null);
              
              // Si le patient a un professionalProfileId, utiliser celui-ci pour charger le profil professionnel
              if (patientData?.professionalProfileId) {
                try {
                  console.log(`Chargement des données du profil professionnel ID: ${patientData.professionalProfileId}`);
                  const profileData = await api.getProfessionalProfileById(patientData.professionalProfileId);
                  console.log("Données de profil professionnel récupérées:", profileData);
                  setProfessionalProfile(profileData || null);
                  
                  // Charger les données du cabinet associé au profil professionnel
                  if (profileData?.id) {
                    try {
                      console.log(`Chargement des données du cabinet pour le profil professionnel ID: ${profileData.id}`);
                      const cabinets = await api.getCabinetsByProfessionalProfileId(profileData.id);
                      console.log("Données de cabinets récupérées:", cabinets);
                      
                      if (cabinets && cabinets.length > 0) {
                        setCabinet(cabinets[0]);
                      }
                    } catch (cabinetError) {
                      console.error("Erreur lors du chargement du cabinet:", cabinetError);
                    }
                  }
                } catch (profileError) {
                  console.error("Erreur lors du chargement du profil professionnel:", profileError);
                }
              }
              // Si l'utilisateur est connecté mais que le patient n'a pas de professionalProfileId
              else if (user?.professionalProfileId) {
                try {
                  console.log(`Utilisation du professionalProfileId de l'utilisateur: ${user.professionalProfileId}`);
                  const profileData = await api.getProfessionalProfileById(user.professionalProfileId);
                  console.log("Données de profil professionnel récupérées via user:", profileData);
                  setProfessionalProfile(profileData || null);
                  
                  if (profileData?.id) {
                    const cabinets = await api.getCabinetsByProfessionalProfileId(profileData.id);
                    if (cabinets && cabinets.length > 0) {
                      setCabinet(cabinets[0]);
                    }
                  }
                } catch (error) {
                  console.error("Erreur lors du chargement du profil professionnel via userId:", error);
                }
              }
              
            } catch (patientError) {
              console.error("Erreur lors du chargement du patient:", patientError);
            }
          }
        } else {
          toast.error("Facture non trouvée");
          navigate('/invoices');
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la facture:", error);
        toast.error("Erreur lors du chargement de la facture");
      } finally {
        setLoading(false);
      }
    };
    
    loadInvoiceData();
  }, [id, user, navigate]);
  
  const handleDelete = async () => {
    if (!invoice) return;
    
    try {
      await api.deleteInvoice(invoice.id);
      toast.success("Facture supprimée avec succès");
      navigate('/invoices');
    } catch (error) {
      console.error("Erreur lors de la suppression de la facture:", error);
      toast.error("Erreur lors de la suppression de la facture");
    }
  };
  
  const handleDownload = () => {
    handlePrint();
  };
  
  const getPatientName = () => {
    if (patient) {
      return `${patient.firstName} ${patient.lastName}`;
    }
    return `Patient #${invoice?.patientId || ""}`;
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
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-500 dark:via-purple-500 dark:to-purple-500">
               Facture #{invoice?.id.toString().padStart(4, "0")}
            </span>
          </h1>          
         
          <div className="space-x-2">
            <Button 
              onClick={() => handlePrint()} 
              variant="outline"
            >
              Imprimer
            </Button>
            <Button 
              onClick={handleDownload} 
              variant="default"
            >
              Télécharger
            </Button>
          </div>
        </div>
        
        <Separator className="mb-6" />
        
        {invoice && (
          <>
            <div className="mb-6">
              <InvoiceDetails 
                invoice={invoice}
                patientName={getPatientName()}
                onEdit={() => {}} 
                onDelete={handleDelete}
                onPrint={() => handlePrint()}
                onDownload={handleDownload}
              />
            </div>
            
            <div className="hidden">
              <div ref={printRef}>
                <InvoicePrintView 
                  invoice={invoice}
                  patient={patient}
                  professionalProfile={professionalProfile}
                  cabinet={cabinet}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default InvoiceDetailPage;
