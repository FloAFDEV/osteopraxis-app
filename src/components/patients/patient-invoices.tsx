
import { Invoice } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PatientInvoicesProps {
  invoices: Invoice[];
}

export function PatientInvoices({ invoices }: PatientInvoicesProps) {
  const sortedInvoices = [...invoices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Factures
        </CardTitle>
        <CardDescription>Historique des factures du patient</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium">Aucune facture</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              Ce patient n'a pas encore de facture.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 rounded-md border"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      className={
                        invoice.paymentStatus === "PAID"
                          ? "bg-green-500"
                          : invoice.paymentStatus === "PENDING"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }
                    >
                      {invoice.paymentStatus === "PAID" && "Payée"}
                      {invoice.paymentStatus === "PENDING" && "En attente"}
                      {invoice.paymentStatus === "CANCELED" && "Annulée"}
                    </Badge>
                    <span className="font-medium">
                      {format(new Date(invoice.date), "dd/MM/yyyy", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {invoice.amount.toFixed(2)} €
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/invoices/${invoice.id}`}>Détails</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
