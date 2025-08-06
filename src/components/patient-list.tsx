
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PatientList() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Liste des patients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Liste des patients à implémenter</p>
        </CardContent>
      </Card>
    </div>
  );
}
