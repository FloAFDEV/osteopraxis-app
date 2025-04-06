
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/types";
import { Calendar, Clock, User } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { format, isToday, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/types";

interface AppointmentsOverviewProps {
  data: DashboardData;
  className?: string;
}

export function AppointmentsOverview({ data, className }: AppointmentsOverviewProps) {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les rendez-vous et les patients
        const [appointmentsData, patientsData] = await Promise.all([
          api.getAppointments(),
          api.getPatients()
        ]);

        // Filtrer pour garder seulement les rendez-vous à venir
        const now = new Date();
        const filteredAppointments = appointmentsData
          .filter(appointment => {
            const appointmentDate = parseISO(appointment.date);
            return appointmentDate >= now && appointment.status === "SCHEDULED";
          })
          .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
          .slice(0, 5); // Garder seulement les 5 prochains rendez-vous

        setUpcomingAppointments(filteredAppointments);
        setPatients(patientsData);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des rendez-vous:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Obtenir les informations sur un patient par ID
  const getPatientById = (patientId: number) => {
    return patients.find(p => p.id === patientId);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Prochains rendez-vous</span>
          <span className="text-sm font-normal text-muted-foreground">
            {upcomingAppointments.filter(app => 
              isToday(parseISO(app.date))
            ).length} aujourd'hui
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun rendez-vous à venir
          </div>
        ) : (
          <div className="grid gap-4">
            {upcomingAppointments.map((appointment) => {
              const patient = getPatientById(appointment.patientId);
              const appointmentDate = parseISO(appointment.date);
              return (
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
                    <p className="font-medium truncate">
                      {patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${appointment.patientId}`}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{appointment.reason}</p>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                    <span>{format(appointmentDate, 'HH:mm')}</span>
                  </div>
                  <div className="ml-4 flex items-center text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                    <span>
                      {format(appointmentDate, 'dd MMM', { locale: fr })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
