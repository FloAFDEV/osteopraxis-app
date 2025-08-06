
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AppointmentCalendar() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendrier des rendez-vous</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Calendrier des rendez-vous à implémenter</p>
        </CardContent>
      </Card>
    </div>
  );
}
