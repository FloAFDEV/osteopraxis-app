
import React from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AppointmentsOverviewProps } from '@/types';

export function AppointmentsOverview({ appointmentsToday, nextAppointment }: AppointmentsOverviewProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Rendez-vous</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{appointmentsToday}</p>
              <p className="text-sm text-muted-foreground">Rendez-vous aujourd'hui</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{nextAppointment}</p>
              <p className="text-sm text-muted-foreground">Prochain rendez-vous</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-right">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/appointments" className="flex items-center">
              Voir tous les rendez-vous <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
