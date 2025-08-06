
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PatientDetail() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Détail du patient</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Détail du patient à implémenter</p>
        </CardContent>
      </Card>
    </div>
  );
}
