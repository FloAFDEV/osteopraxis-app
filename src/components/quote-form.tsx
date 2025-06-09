
import { Quote, QuoteItem, CreateQuoteData, Patient } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface QuoteFormProps {
  patient: Patient;
  quote?: Quote;
  onSave: (quoteData: CreateQuoteData) => Promise<void>;
  onCancel: () => void;
}

export function QuoteForm({ patient, quote, onSave, onCancel }: QuoteFormProps) {
  const [title, setTitle] = useState(quote?.title || "");
  const [description, setDescription] = useState(quote?.description || "");
  const [items, setItems] = useState<QuoteItem[]>(quote?.items || [
    { description: "", quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [validUntil, setValidUntil] = useState(
    quote?.validUntil || 
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 jours par défaut
  );
  const [notes, setNotes] = useState(quote?.notes || "");
  const [isLoading, setIsLoading] = useState(false);

  const updateItemTotal = (index: number, quantity: number, unitPrice: number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      quantity,
      unitPrice,
      total: quantity * unitPrice
    };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    if (items.some(item => !item.description.trim())) {
      toast.error("Toutes les lignes doivent avoir une description");
      return;
    }

    setIsLoading(true);
    try {
      const quoteData: CreateQuoteData = {
        patientId: patient.id,
        osteopathId: patient.osteopathId,
        cabinetId: patient.cabinetId,
        title: title.trim(),
        description: description.trim(),
        amount: totalAmount,
        validUntil,
        status: "DRAFT",
        items: items.filter(item => item.description.trim()),
        notes: notes.trim() || undefined,
      };

      await onSave(quoteData);
      toast.success(quote ? "Devis modifié avec succès" : "Devis créé avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde du devis");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {quote ? "Modifier le devis" : "Nouveau devis"} - {patient.firstName} {patient.lastName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du devis *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Suivi postural, Pack 3 séances..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valide jusqu'au</Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description détaillée du devis..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Lignes du devis</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Ajouter une ligne
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-4 border rounded-lg">
                <div className="md:col-span-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Input
                    id={`description-${index}`}
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].description = e.target.value;
                      setItems(newItems);
                    }}
                    placeholder="Séance d'ostéopathie..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`quantity-${index}`}>Quantité</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const quantity = parseInt(e.target.value) || 1;
                      updateItemTotal(index, quantity, item.unitPrice);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor={`unitPrice-${index}`}>Prix unitaire (€)</Label>
                  <Input
                    id={`unitPrice-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const unitPrice = parseFloat(e.target.value) || 0;
                      updateItemTotal(index, item.quantity, unitPrice);
                    }}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label>Total</Label>
                    <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                      {item.total.toFixed(2)} €
                    </div>
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="mb-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <div className="text-right">
                <div className="text-lg font-semibold">
                  Total: {totalAmount.toFixed(2)} €
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes internes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes internes (non visibles par le patient)..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Sauvegarde..." : (quote ? "Modifier" : "Créer")} le devis
        </Button>
      </div>
    </form>
  );
}
