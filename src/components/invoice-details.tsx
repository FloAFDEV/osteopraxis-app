
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Edit, Printer, Trash } from "lucide-react";
import { Invoice, PaymentStatus } from "@/types";
import { useNavigate } from "react-router-dom";

interface InvoiceDetailsProps {
  invoice: Invoice;
  patientName?: string;
  onDelete?: () => void;
  onPrint?: () => void;
  onEdit?: () => void;
}

export function InvoiceDetails({
  invoice,
  patientName,
  onDelete,
  onPrint,
  onEdit,
}: InvoiceDetailsProps) {
  const navigate = useNavigate();
  
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-500">Payée</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500">En attente</Badge>;
      case "CANCELED":
        return <Badge className="bg-red-500">Annulée</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">
          Note d'honoraire n° {invoice.id.toString().padStart(4, "0")}
        </CardTitle>
        <div>{getStatusBadge(invoice.paymentStatus)}</div>
      </CardHeader>
      
      <CardContent className="grid gap-3 pt-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Patient</p>
              <p className="font-medium">{patientName || "Information non disponible"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Date d'émission</p>
              <p className="font-medium">
                {format(new Date(invoice.date), "dd MMMM yyyy", { locale: fr })}
              </p>
            </div>

            {invoice.appointmentId && (
              <div>
                <p className="text-sm text-muted-foreground">Séance associée</p>
                <p className="font-medium">Séance #{invoice.appointmentId}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Montant</p>
              <p className="text-lg font-bold">{invoice.amount.toFixed(2)} €</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Mode de paiement</p>
              <p className="font-medium">
                {invoice.paymentMethod ? invoice.paymentMethod : "Non spécifié"}
              </p>
            </div>

            {invoice.tvaExoneration && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Exonération de TVA
                </p>
                <p className="font-medium text-sm">
                  {invoice.tvaMotif || "TVA non applicable - Article 261-4-1° du CGI"}
                </p>
              </div>
            )}
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Notes</p>
            <p className="mt-1 text-sm">{invoice.notes}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-2 pt-2">
        {onPrint && (
          <Button 
            variant="outline"
            size="sm"
            onClick={onPrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
        )}
        
        {onEdit ? (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        )}
        
        {onDelete && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onDelete}
            className="text-red-500 hover:text-red-600"
          >
            <Trash className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Export the component
export default InvoiceDetails;
