
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/ui/layout';
import { api } from '@/services/api';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, Info, MapPin, User } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Patient, Appointment, Cabinet } from '@/types';
import { Link } from 'react-router-dom';
import { FancyLoader } from '@/components/ui/fancy-loader';

const SchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [appointmentsData, patientsData, cabinetsData] = await Promise.all([
          api.getAppointments(),
          api.getPatients(),
          api.getCabinets()
        ]);

        setAppointments(appointmentsData);
        setPatients(patientsData);
        setCabinets(cabinetsData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrer les rendez-vous pour la date sélectionnée
  const appointmentsForSelectedDate = useMemo(() => {
    return appointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.date);
      return (
        appointmentDate.getDate() === selectedDate.getDate() &&
        appointmentDate.getMonth() === selectedDate.getMonth() &&
        appointmentDate.getFullYear() === selectedDate.getFullYear() &&
        appointment.status !== 'CANCELLED'
      );
    }).sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
  }, [appointments, selectedDate]);

  // Fonction pour obtenir les détails du patient
  const getPatientDetails = (patientId: number) => {
    return patients.find(p => p.id === patientId);
  };

  // Fonction pour obtenir les détails du cabinet
  const getCabinetDetails = (cabinetId?: number) => {
    if (!cabinetId) return null;
    return cabinets.find(c => c.id === cabinetId);
  };

  // Fonction pour obtenir la couleur de badge en fonction du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500 hover:bg-green-600';
      case 'PLANNED':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'CANCELLED':
        return 'bg-red-500 hover:bg-red-600';
      case 'COMPLETED':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Fonction pour traduire le statut
  const translateStatus = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmé';
      case 'PLANNED':
        return 'Planifié';
      case 'CANCELLED':
        return 'Annulé';
      case 'COMPLETED':
        return 'Terminé';
      default:
        return status;
    }
  };

  // Fonction pour formater une date plus lisible
  const formatDateHeading = (date: Date) => {
    if (isToday(date)) {
      return "Aujourd'hui";
    } else if (isTomorrow(date)) {
      return "Demain";
    } else {
      return format(date, "EEEE d MMMM yyyy", { locale: fr });
    }
  };

  if (isLoading) {
    return <FancyLoader message="Chargement de votre agenda..." />;
  }

  return (
    <Layout>
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                locale={fr}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Rendez-vous aujourd'hui
                </span>
                <span className="font-medium">
                  {appointments.filter(a => isToday(parseISO(a.date)) && a.status !== 'CANCELLED').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Rendez-vous cette semaine
                </span>
                <span className="font-medium">
                  {/* Placeholder for weekly appointments count */}
                  {appointments.filter(a => {
                    const date = parseISO(a.date);
                    const today = new Date();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    return date >= startOfWeek && date <= endOfWeek && a.status !== 'CANCELLED';
                  }).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight capitalize">
              {formatDateHeading(selectedDate)}
            </h2>

            <Link to="/appointments/new">
              <Button>Nouveau rendez-vous</Button>
            </Link>
          </div>

          {appointmentsForSelectedDate.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Info className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold">Aucun rendez-vous</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Vous n'avez pas de rendez-vous programmé pour cette date.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointmentsForSelectedDate.map((appointment) => {
                const patient = getPatientDetails(appointment.patientId);
                const cabinet = getCabinetDetails(appointment.cabinetId);

                return (
                  <Card key={appointment.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex-none bg-muted p-4 text-center sm:w-32 flex flex-col justify-center">
                          <div className="text-2xl font-bold">{appointment.startTime}</div>
                          <div className="text-xs text-muted-foreground">
                            {appointment.endTime && `→ ${appointment.endTime}`}
                          </div>
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">
                              {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu'}
                            </h3>
                            <Badge className={getStatusColor(appointment.status)}>
                              {translateStatus(appointment.status)}
                            </Badge>
                          </div>

                          {appointment.reason && (
                            <p className="text-sm text-muted-foreground mb-4">
                              {appointment.reason}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-3 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{format(parseISO(appointment.date), "EEEE d MMMM", { locale: fr })}</span>
                            </div>
                            {cabinet && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{cabinet.name}</span>
                              </div>
                            )}
                            {patient && patient.phone && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>{patient.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex justify-end gap-2">
                            {patient && (
                              <Link to={`/patients/${patient.id}`}>
                                <Button variant="outline" size="sm">
                                  Voir patient
                                </Button>
                              </Link>
                            )}
                            <Link to={`/appointments/${appointment.id}`}>
                              <Button size="sm">Détails</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SchedulePage;
