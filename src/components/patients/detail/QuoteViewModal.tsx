
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Quote } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Calendar, Euro, User, Building, ScrollText, StickyNote } from "lucide-react";

interface QuoteViewModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuoteViewModal({ quote, isOpen, onClose }: QuoteViewModalProps) {
  if (!quote) return null;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Brouillon';
      case 'SENT':
        return 'Envoyé';
      case 'ACCEPTED':
        return 'Accepté';
      case 'REJECTED':
        return 'Refusé';
      case 'EXPIRED':
        return 'Expiré';
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'secondary';
      case 'SENT':
        return 'default';
      case 'ACCEPTED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      case 'EXPIRED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Détails du devis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête du devis */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{quote.title}</h2>
              <p className="text-sm text-muted-foreground">
                Devis #{quote.id}
              </p>
            </div>
            <Badge variant={getStatusVariant(quote.status) as any}>
              {getStatusLabel(quote.status)}
            </Badge>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Patient:</span>
                <span className="text-sm">
                  {quote.Patient ? `${quote.Patient.firstName} ${quote.Patient.lastName}` : 'Non spécifié'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Montant:</span>
                <span className="text-lg font-semibold text-green-600">
                  {quote.amount.toFixed(2)} €
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Créé le:</span>
                <span className="text-sm">
                  {format(new Date(quote.createdAt), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Valide jusqu'au:</span>
                <span className="text-sm">
                  {format(new Date(quote.validUntil), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {quote.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Description:</span>
              </div>
              <p className="text-sm bg-gray-50 p-3 rounded-md">
                {quote.description}
              </p>
            </div>
          )}

          {/* Notes */}
          {quote.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Notes:</span>
              </div>
              <p className="text-sm bg-yellow-50 p-3 rounded-md italic">
                {quote.notes}
              </p>
            </div>
          )}

          {/* Items du devis (si disponibles) */}
          {quote.items && quote.items.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Détail des prestations:</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3">Description</th>
                      <th className="text-center p-3">Qté</th>
                      <th className="text-right p-3">Prix unitaire</th>
                      <th className="text-right p-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((item, index) => (
                      <tr key={item.id || index} className="border-t">
                        <td className="p-3">{item.description}</td>
                        <td className="text-center p-3">{item.quantity}</td>
                        <td className="text-right p-3">{item.unitPrice.toFixed(2)} €</td>
                        <td className="text-right p-3 font-medium">{item.total.toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t">
                    <tr>
                      <td colSpan={3} className="p-3 text-right font-medium">Total:</td>
                      <td className="p-3 text-right font-bold text-green-600">
                        {quote.amount.toFixed(2)} €
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Dernière modification */}
          <div className="text-xs text-muted-foreground border-t pt-4">
            Dernière modification: {format(new Date(quote.updatedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
