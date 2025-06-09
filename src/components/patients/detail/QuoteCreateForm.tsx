
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Patient, CreateQuotePayload } from "@/types";
import { quoteService } from "@/services/quote-service";
import { toast } from "sonner";

interface QuoteCreateFormProps {
  patient: Patient;
  onSuccess: () => void;
  onCancel: () => void;
}

export function QuoteCreateForm({ patient, onSuccess, onCancel }: QuoteCreateFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [validUntil, setValidUntil] = useState<Date>(addDays(new Date(), 30));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !amount) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      setLoading(true);
      
      const quoteData: CreateQuotePayload = {
        patientId: patient.id,
        osteopathId: patient.osteopathId,
        cabinetId: patient.cabinetId,
        title,
        description: description || null,
        amount: parseFloat(amount),
        validUntil: format(validUntil, 'yyyy-MM-dd'),
        status: "DRAFT",
        notes: notes || null,
      };

      await quoteService.createQuote(quoteData);
      toast.success("Devis créé avec succès");
      onSuccess();
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error("Erreur lors de la création du devis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Nouveau devis pour {patient.firstName} {patient.lastName}</CardTitle>
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Consultation ostéopathique"
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Montant (€) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description détaillée du devis..."
              rows={3}
            />
          </div>

          <div>
            <Label>Date de validité</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !validUntil && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {validUntil ? (
                    format(validUntil, "dd MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Choisir une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={validUntil}
                  onSelect={(date) => date && setValidUntil(date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes supplémentaires..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer le devis"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
