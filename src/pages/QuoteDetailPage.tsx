
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/services/api";
import { Quote, Patient, Osteopath, Cabinet } from "@/types";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { toast } from "sonner";
import { QuotePrintView } from "@/components/quote-print-view";

const QuoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuoteDetails = async () => {
      setIsLoading(true);
      try {
        if (!id) return;
        
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
          toast.error("ID de devis invalide");
          return navigate("/patients");
        }
        
        // Pour l'instant, utilisation de données mockées
        // TODO: Implémenter quoteService.getQuoteById
        const mockQuote: Quote = {
          id: numericId,
          patientId: 1,
          osteopathId: 1,
          title: "Suivi postural",
          description: "Pack de 3 séances d'ostéopathie pour suivi postural",
          amount: 180,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: "DRAFT",
          items: [
            {
              description: "Séance d'ostéopathie",
              quantity: 3,
              unitPrice: 60,
              total: 180
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setQuote(mockQuote);
        
        // Charger les informations du patient
        if (mockQuote.patientId) {
          const patientData = await api.getPatientById(mockQuote.patientId);
          setPatient(patientData);
        }

        // Charger les informations de l'ostéopathe et du cabinet
        try {
          const currentOsteopathData = await api.getCurrentOsteopath();
          if (currentOsteopathData && currentOsteopathData.id) {
            const osteopathData = await api.getOsteopathById(currentOsteopathData.id);
            if (osteopathData) {
              setOsteopath(osteopathData);
              
              const cabinets = await api.getCabinetsByOsteopathId(osteopathData.id);
              if (cabinets && cabinets.length > 0) {
                const selectedCabinet = mockQuote.cabinetId 
                  ? cabinets.find(c => c.id === mockQuote.cabinetId) || cabinets[0]
                  : cabinets[0];
                setCabinet(selectedCabinet);
              }
            }
          }
        } catch (error) {
          console.error("Erreur lors du chargement des données professionnelles:", error);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du devis:", error);
        toast.error("Erreur lors du chargement du devis");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuoteDetails();
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
            <p className="text-muted-foreground">Chargement du devis...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!quote) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Devis non trouvé.</p>
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
        <QuotePrintView
          quote={quote}
          patient={patient || undefined}
          osteopath={osteopath || undefined}
          cabinet={cabinet || undefined}
        />
      </div>
    </Layout>
  );
};

export default QuoteDetailPage;
