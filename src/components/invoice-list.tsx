
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InvoiceList() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Liste des factures à implémenter</p>
        </CardContent>
      </Card>
    </div>
  );
}
