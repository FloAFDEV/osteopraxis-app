import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GenderChart } from "@/components/charts/gender-chart";
import { GrowthChart } from "@/components/charts/growth-chart";
import { MonthlyGrowthChart } from "@/components/charts/monthly-growth-chart";
import { api } from "@/services/api";
import { AuthContext } from "@/contexts/AuthContext";
import { DashboardData, Appointment } from "@/types";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CardDescription } from '../ui/card';

export function Dashboard() {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await api.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAppointments = async () => {
      setLoadingAppointments(true);
      try {
        if (user?.osteopathId) {
          const appointmentsData = await api.getAppointmentsByOsteopathId(user.osteopathId);
          setAppointments(appointmentsData);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchData();
    fetchAppointments();
  }, [user?.osteopathId]);

  const completedAppointments = appointments.filter(appointment => appointment.status === 'COMPLETED').length;
  const canceledAppointments = appointments.filter(appointment => appointment.status === 'CANCELED').length;

  const appointmentRows = appointments.map((appointment) => {
    const appointmentDate = new Date(appointment.date);
    const formattedDate = format(appointmentDate, 'dd MMMM yyyy', { locale: fr });
    const formattedTime = format(appointmentDate, 'HH:mm', { locale: fr });

    let appointmentStatus = 'Planifiée';
    if (appointment.status !== 'SCHEDULED' && appointment.status !== 'CANCELED') {
      appointmentStatus = 'Terminée';
    }

    return (
      <TableRow key={appointment.id}>
        <TableCell className="font-medium">{formattedDate}</TableCell>
        <TableCell>{formattedTime}</TableCell>
        <TableCell>{appointment.reason}</TableCell>
        <TableCell>{appointmentStatus}</TableCell>
      </TableRow>
    );
  });

  const genderChartData = [
    {
      name: "Hommes",
      value: dashboardData?.maleCount || 0,
      percentage: dashboardData?.maleCount ? (dashboardData?.maleCount / dashboardData?.totalPatients) * 100 : 0,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4 mr-2"
        >
          <path
            fillRule="evenodd"
            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.914 0-5.683-.342-8.062-.9a.75.75 0 01-.437-.695z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "Femmes",
      value: dashboardData?.femaleCount || 0,
      percentage: dashboardData?.femaleCount ? (dashboardData?.femaleCount / dashboardData?.totalPatients) * 100 : 0,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4 mr-2"
        >
          <path
            fillRule="evenodd"
            d="M12 1.5a5.25 5.25 0 00-5.25 5.25c0 .682.083 1.341.23 1.973l-1.047 1.047a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 011.06-1.06L5.906 4.81A12.733 12.733 0 0112 1.5zm0 7.5a3 3 0 100-6 3 3 0 000 6zm9.375.75a1.5 1.5 0 00-1.5-1.5h-.75v-1.03a4.5 4.5 0 00-8.99 1.03v1.03h-.75a1.5 1.5 0 00-1.5 1.5v5.625a1.5 1.5 0 001.5 1.5h9.75a1.5 1.5 0 001.5-1.5V9zm-3 0h-6.75a.75.75 0 01-.75-.75V6a.75.75 0 01.75-.75h6.75a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "Autre",
      value: 0,
      percentage: 0,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4 mr-2"
        >
          <path d="M12 1.5a5.25 5.25 0 00-5.25 5.25c0 .682.083 1.341.23 1.973l-1.047 1.047a.75.75 0 01-1.06 0l-2.25-2.25a.75.75 0 011.06-1.06L5.906 4.81A12.733 12.733 0 0112 1.5zm0 7.5a3 3 0 100-6 3 3 0 000 6zm9.375.75a1.5 1.5 0 00-1.5-1.5h-.75v-1.03a4.5 4.5 0 00-8.99 1.03v1.03h-.75a1.5 1.5 0 00-1.5 1.5v5.625a1.5 1.5 0 001.5 1.5h9.75a1.5 1.5 0 001.5-1.5V9zm-3 0h-6.75a.75.75 0 01-.75-.75V6a.75.75 0 01.75-.75h6.75a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Patients Totaux</CardTitle>
            <CardDescription>Nombre total de patients enregistrés</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-4 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">{dashboardData?.totalPatients || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nouveaux Patients (Ce Mois)</CardTitle>
            <CardDescription>Nombre de nouveaux patients ce mois-ci</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-4 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">{dashboardData?.newPatientsThisMonth || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Séances Aujourd'hui</CardTitle>
            <CardDescription>Nombre de séances prévues aujourd'hui</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-4 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">{dashboardData?.appointmentsToday || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prochaine Séance</CardTitle>
            <CardDescription>Date et heure de la prochaine séance</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-4 w-[150px]" />
            ) : (
              <div className="text-xl">
                {dashboardData?.nextAppointment ? (
                  <>
                    <Calendar className="h-4 w-4 mr-2 inline-block" />
                    {format(new Date(dashboardData.nextAppointment), 'dd MMMM yyyy HH:mm', { locale: fr })}
                  </>
                ) : (
                  "Aucune séance prévue"
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Genre</CardTitle>
            <CardDescription>Pourcentage des patients par genre</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <GenderChart data={genderChartData} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Croissance des Patients</CardTitle>
            <CardDescription>Nombre de nouveaux patients par mois</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <GrowthChart data={dashboardData?.growthData?.patients || []} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Croissance Mensuelle</CardTitle>
            <CardDescription>Comparaison de la croissance mensuelle des patients</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <MonthlyGrowthChart data={dashboardData?.monthlyGrowth || []} />
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Séances Récentes</CardTitle>
            <CardDescription>Aperçu des dernières séances</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {loadingAppointments ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Heure</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointmentRows.length > 0 ? (
                    appointmentRows
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Aucune séance récente
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <div className="p-4 flex justify-end">
            <Link to="/sessions">
              <Button>Voir toutes les séances</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
