
import { useState, useEffect } from "react";
import { Patient, Quote } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuoteCard } from "@/components/quote-card";
import { QuoteForm } from "@/components/quote-form";
import { QuotePrintView } from "@/components/quote-print-view";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { quoteService } from "@/services/api/quote-service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface QuotesTabProps {
  patient: Patient;
}

export function QuotesTab({ patient }: QuotesTabProps) {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | undefined>();
  const [printingQuote, setPrintingQuote] = useState<Quote | null>(null);

  useEffect(() => {
    loadQuotes();
  }, [patient.id]);

  const loadQuotes = async () => {
    setIsLoading(true);
    try {
      const patientQuotes = await quoteService.getQuotesByPatientId(patient.id);
      setQuotes(patientQuotes);
    } catch (error) {
      console.error("Erreur lors du chargement des devis:", error);
      toast.error("Erreur lors du chargement des devis");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuote = () => {
    setEditingQuote(undefined);
    setShowForm(true);
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setShowForm(true);
  };

  const handleSaveQuote = async (quoteData: any) => {
    try {
      if (editingQuote) {
        await quoteService.updateQuote(editingQuote.id, quoteData);
        toast.success("Devis modifié avec succès");
      } else {
        await quoteService.createQuote(quoteData);
        toast.success("Devis créé avec succès");
      }
      setShowForm(false);
      setEditingQuote(undefined);
      await loadQuotes();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde du devis");
    }
  };

  const handleSendQuote = async (quote: Quote) => {
    try {
      await quoteService.sendQuote(quote.id);
      toast.success("Devis envoyé avec succès");
      await loadQuotes();
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error("Erreur lors de l'envoi du devis");
    }
  };

  const handleDeleteQuote = async (quote: Quote) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce devis ?")) {
      try {
        await quoteService.deleteQuote(quote.id);
        toast.success("Devis supprimé avec succès");
        await loadQuotes();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression du devis");
      }
    }
  };

  const handlePrintQuote = (quote: Quote) => {
    navigate(`/quotes/${quote.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Devis</h3>
        <Button onClick={handleCreateQuote}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau devis
        </Button>
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Aucun devis pour ce patient.</p>
          <Button className="mt-4" onClick={handleCreateQuote}>
            <Plus className="h-4 w-4 mr-2" />
            Créer le premier devis
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {quotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onEdit={handleEditQuote}
              onSend={handleSendQuote}
              onDelete={handleDeleteQuote}
              onPrint={handlePrintQuote}
            />
          ))}
        </div>
      )}

      {/* Dialog pour créer/modifier un devis */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuote ? "Modifier le devis" : "Nouveau devis"}
            </DialogTitle>
          </DialogHeader>
          <QuoteForm
            patient={patient}
            quote={editingQuote}
            onSave={handleSaveQuote}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
