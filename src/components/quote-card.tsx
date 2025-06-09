import { Quote } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Send, Check, X, Clock, AlertCircle, Printer } from "lucide-react";

interface QuoteCardProps {
  quote: Quote;
  onEdit?: (quote: Quote) => void;
  onSend?: (quote: Quote) => void;
  onDelete?: (quote: Quote) => void;
  onPrint?: (quote: Quote) => void;
}

export function QuoteCard({ quote, onEdit, onSend, onDelete, onPrint }: QuoteCardProps) {
  const getStatusBadge = (status: Quote["status"]) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="secondary">Brouillon</Badge>;
      case "SENT":
        return <Badge variant="default">Envoyé</Badge>;
      case "ACCEPTED":
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Accepté</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Refusé</Badge>;
      case "EXPIRED":
        return <Badge variant="warning">Expiré</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: Quote["status"]) => {
    switch (status) {
      case "DRAFT":
        return <FileText className="h-4 w-4" />;
      case "SENT":
        return <Send className="h-4 w-4" />;
      case "ACCEPTED":
        return <Check className="h-4 w-4" />;
      case "REJECTED":
        return <X className="h-4 w-4" />;
      case "EXPIRED":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const isExpired = new Date(quote.validUntil) < new Date();
  const canSend = quote.status === "DRAFT" && !isExpired;
  const canEdit = quote.status === "DRAFT";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {getStatusIcon(quote.status)}
          {quote.title}
        </CardTitle>
        {getStatusBadge(quote.status)}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {quote.description}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">
            {quote.amount.toFixed(2)} €
          </div>
          <div className="text-sm text-muted-foreground">
            Valide jusqu'au {format(new Date(quote.validUntil), "dd MMMM yyyy", { locale: fr })}
          </div>
        </div>

        {quote.items.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="font-medium mb-2">Détails :</h4>
            <ul className="space-y-1 text-sm">
              {quote.items.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span>{item.description} x{item.quantity}</span>
                  <span className="font-medium">{item.total.toFixed(2)} €</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isExpired && quote.status !== "EXPIRED" && (
          <div className="bg-orange-50 border border-orange-200 rounded p-2 text-sm text-orange-800">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            Ce devis a expiré
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {canEdit && onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(quote)}>
              Modifier
            </Button>
          )}
          {canSend && onSend && (
            <Button size="sm" onClick={() => onSend(quote)}>
              <Send className="h-4 w-4 mr-1" />
              Envoyer
            </Button>
          )}
          {onPrint && (
            <Button variant="outline" size="sm" onClick={() => onPrint(quote)}>
              <Printer className="h-4 w-4 mr-1" />
              Imprimer
            </Button>
          )}
          {canEdit && onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(quote)}>
              Supprimer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
