import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useMode } from '@/contexts/ModeContext';
import { DemoBanner } from "@/components/DemoBanner";
import { DemoNavigation } from "@/components/DemoNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DemoInvoicesPage() {
  const { mode, setMode, getDemoData } = useMode();

  useEffect(() => {
    if (mode !== 'demo') {
      setMode('demo');
    }
  }, [mode, setMode]);

  if (mode !== 'demo') {
    return <Navigate to="/" replace />;
  }

  const demoData = getDemoData();

  return (
    <div className="min-h-screen bg-background">
      <DemoBanner />
      <DemoNavigation />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Factures - Mode Démo</h1>
        
        <div className="space-y-4">
          {demoData.invoices.map((invoice: any) => (
            <Card key={invoice.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Facture #{invoice.id}
                </CardTitle>
                <Badge variant={invoice.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
                  {invoice.paymentStatus === 'PAID' ? 'Payée' : 'En attente'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Patient: {demoData.patients.find((p: any) => p.id === invoice.patientId)?.firstName} {demoData.patients.find((p: any) => p.id === invoice.patientId)?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Date: {new Date(invoice.date).toLocaleDateString()}
                    </p>
                    {invoice.notes && (
                      <p className="text-sm text-muted-foreground">Notes: {invoice.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{invoice.amount}€</p>
                    {invoice.paymentMethod && (
                      <p className="text-sm text-muted-foreground">{invoice.paymentMethod}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}