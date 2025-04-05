
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/types";
import { Calendar, Clock, User } from "lucide-react";

interface AppointmentsOverviewProps {
  data: DashboardData;
  className?: string;
}

export function AppointmentsOverview({ data, className }: AppointmentsOverviewProps) {
  // Rendez-vous fictifs pour la démo
  const upcomingAppointments = [
    { id: 1, patient: "Marie Dupont", time: "14:30", date: "2025-04-05", type: "Consultation" },
    { id: 2, patient: "Jean Martin", time: "16:00", date: "2025-04-05", type: "Suivi" },
    { id: 3, patient: "Sophie Leroux", time: "17:15", date: "2025-04-05", type: "Urgence" },
    { id: 4, patient: "Thomas Bernard", time: "09:30", date: "2025-04-06", type: "Consultation" },
    { id: 5, patient: "Élise Moreau", time: "11:00", date: "2025-04-06", type: "Première visite" }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Prochains rendez-vous</span>
          <span className="text-sm font-normal text-muted-foreground">
            {data.appointmentsToday} aujourd'hui
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {upcomingAppointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="flex items-center p-3 rounded-lg border bg-card/50 hover:bg-accent/5 transition-colors"
            >
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{appointment.patient}</p>
                <p className="text-sm text-muted-foreground truncate">{appointment.type}</p>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                <span>{appointment.time}</span>
              </div>
              <div className="ml-4 flex items-center text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                <span>
                  {new Date(appointment.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
