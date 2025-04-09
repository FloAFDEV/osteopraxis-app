import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { AppointmentsOverview } from "@/components/dashboard/appointments-overview";
import { DemographicsCard } from "@/components/dashboard/demographics-card";
import { DashboardData } from "@/types";
import { api } from "@/services/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Users, Clock, UserPlus, TrendingUp, BarChart4 } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalPatients: 0,
    maleCount: 0,
    femaleCount: 0,
    averageAge: 0,
    averageAgeMale: 0,
    averageAgeFemale: 0,
    newPatientsThisMonth: 0,
    newPatientsThisYear: 0,
    newPatientsLastYear: 0,
    appointmentsToday: 0,
    nextAppointment: "Aucun rendez-vous prévu",
    patientsLastYearEnd: 0,
    newPatientsLast30Days: 0,
    thirtyDayGrowthPercentage: 0,
    annualGrowthPercentage: 0,
    monthlyGrowth: [{
      month: "Jan",
      patients: 0,
      prevPatients: 0,
      growthText: "0%"
    }, {
      month: "Fév",
      patients: 0,
      prevPatients: 0,
      growthText: "0%"
    }, {
      month: "Mar",
      patients: 0,
      prevPatients: 0,
      growthText: "0%"
    }, {
      month: "Avr",
      patients: 0,
      prevPatients: 0,
      growthText: "0%"
    }, {
      month: "Mai",
      patients: 0,
      prevPatients: 0,
      growthText: "0%"
    }, {
      month: "Juin",
      patients: 0,
      prevPatients: 0,
      growthText: "0%"
    }, {
      month: "Juil",
      patients: 0,
      prevPatients: 0,
      growthText: "0%"
    }, {
      month: "Août",
      patients: 0,
      prevPatients: 0,
      growthText: "0%"
    }, {
      month: "Sep",
      patients: 0,
      prevPatients: 0,
      growthText: "0%"
    }, {
      month: "Oct",
      patients: 0,
      prevPatients: 0,
      growthText: "0%"
    }, {
      month: "Nov",
      patients: 0,
      prevPatients: 0,
      growthText: "0%"
    }, {
      month: "Déc",
      patients: 0,
      prevPatients: 0,
      growthText: "0%"
    }]
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Get patients and appointments data
        const [patients, appointments] = await Promise.all([api.getPatients(), api.getAppointments()]);

        // Calculate statistics
        const totalPatients = patients.length;
        const maleCount = patients.filter(p => p.gender === "Homme").length;
        const femaleCount = patients.filter(p => p.gender === "Femme").length;

        // Calculate ages and growth metrics
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        // Get new patients this month and year
        const newPatientsThisMonth = patients.filter(p => {
          const createdAt = new Date(p.createdAt);
          return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
        }).length;
        const newPatientsThisYear = patients.filter(p => {
          const createdAt = new Date(p.createdAt);
          return createdAt.getFullYear() === currentYear;
        }).length;
        const newPatientsLastYear = patients.filter(p => {
          const createdAt = new Date(p.createdAt);
          return createdAt.getFullYear() === currentYear - 1;
        }).length;

        // Appointments today
        const appointmentsToday = appointments.filter(a => {
          const appDate = new Date(a.date);
          return appDate.toDateString() === today.toDateString();
        }).length;

        // Next appointment
        const futureAppointments = appointments.filter(a => new Date(a.date) > today).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const nextAppointment = futureAppointments.length > 0 ? format(new Date(futureAppointments[0].date), 'HH:mm, dd MMM', {
          locale: fr
        }) : "Aucun rendez-vous prévu";

        // Calculate 30-day growth
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newPatientsLast30Days = patients.filter(p => {
          const createdAt = new Date(p.createdAt);
          return createdAt >= thirtyDaysAgo;
        }).length;
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const patientsPrevious30Days = patients.filter(p => {
          const createdAt = new Date(p.createdAt);
          return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
        }).length;

        // Calculate growth rates
        const thirtyDayGrowthPercentage = patientsPrevious30Days > 0 ? Math.round((newPatientsLast30Days - patientsPrevious30Days) / patientsPrevious30Days * 100) : newPatientsLast30Days > 0 ? 100 : 0;
        const patientsLastYearEnd = patients.filter(p => {
          const createdAt = new Date(p.createdAt);
          return createdAt.getFullYear() < currentYear;
        }).length;
        const annualGrowthPercentage = patientsLastYearEnd > 0 ? Math.round(newPatientsThisYear / patientsLastYearEnd * 100) : newPatientsThisYear > 0 ? 100 : 0;

        // Generate monthly growth data
        const frenchMonths = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const monthlyGrowth = frenchMonths.map((month, index) => {
          const thisYearPatients = patients.filter(p => {
            const createdAt = new Date(p.createdAt);
            return createdAt.getMonth() === index && createdAt.getFullYear() === currentYear;
          }).length;
          const lastYearPatients = patients.filter(p => {
            const createdAt = new Date(p.createdAt);
            return createdAt.getMonth() === index && createdAt.getFullYear() === currentYear - 1;
          }).length;
          const growthRate = lastYearPatients > 0 ? Math.round((thisYearPatients - lastYearPatients) / lastYearPatients * 100) : thisYearPatients > 0 ? 100 : 0;
          return {
            month,
            patients: thisYearPatients,
            prevPatients: lastYearPatients,
            growthText: `${growthRate}%`
          };
        });

        // Calculate average ages
        const calculateAverageAge = patientList => {
          const patientsWithBirthDate = patientList.filter(p => p.birthDate);
          if (patientsWithBirthDate.length === 0) return 0;
          const totalAge = patientsWithBirthDate.reduce((sum, patient) => {
            const birthDate = new Date(patient.birthDate);
            const age = currentYear - birthDate.getFullYear();
            return sum + age;
          }, 0);
          return Math.round(totalAge / patientsWithBirthDate.length);
        };
        const averageAge = calculateAverageAge(patients);
        const averageAgeMale = calculateAverageAge(patients.filter(p => p.gender === "Homme"));
        const averageAgeFemale = calculateAverageAge(patients.filter(p => p.gender === "Femme"));

        // Update dashboard data
        setDashboardData({
          totalPatients,
          maleCount,
          femaleCount,
          averageAge,
          averageAgeMale,
          averageAgeFemale,
          newPatientsThisMonth,
          newPatientsThisYear,
          newPatientsLastYear,
          appointmentsToday,
          nextAppointment,
          patientsLastYearEnd,
          newPatientsLast30Days,
          thirtyDayGrowthPercentage,
          annualGrowthPercentage,
          monthlyGrowth
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Préparation des données pour les graphiques
  const ageData = [{
    name: 'Général',
    Age: dashboardData.averageAge || 0
  }, {
    name: 'Hommes',
    Age: dashboardData.averageAgeMale || 0
  }, {
    name: 'Femmes',
    Age: dashboardData.averageAgeFemale || 0
  }];
  const genderData = [{
    name: 'Hommes',
    value: dashboardData.maleCount
  }, {
    name: 'Femmes',
    value: dashboardData.femaleCount
  }];
  return <div className="space-y-8">
      {/* Header Image Banner */}
      <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden rounded-xl mb-8 animate-fade-in shadow-lg transform hover:scale-[1.01] transition-all duration-500">
        <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1600&h=400" alt="Cabinet d'ostéopathie" className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent flex items-center">
          <div className="px-6 md:px-10 max-w-2xl animate-fade-in animate-delay-100">
            <h1 className="text-2xl md:text-3xl lg:text-4xl text-white font-bold mb-2">
              Tableau de bord
            </h1>
            <p className="text-white/90 text-sm md:text-base lg:text-lg max-w-md">
              Bienvenue sur votre espace de gestion. Suivez vos activités et consultez vos statistiques en temps réel.
            </p>
          </div>
        </div>
      </div>

      {loading ? <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">Chargement des données...</p>
          </div>
        </div> : <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 animate-fade-in">
            <StatCard icon={<Users className="h-5 w-5 text-blue-500" />} title="Patients actifs" value={dashboardData.totalPatients} explanation="Vos patients au complet 🎉 (patients archivés ou décédés exclus)." change={`${dashboardData.thirtyDayGrowthPercentage > 0 ? '+' : ''}${dashboardData.thirtyDayGrowthPercentage}% sur 30 jours`} changeDirection={dashboardData.thirtyDayGrowthPercentage > 0 ? 'up' : dashboardData.thirtyDayGrowthPercentage < 0 ? 'down' : 'neutral'} />

            <StatCard icon={<Clock className="h-5 w-5 text-green-500" />} title="Rendez-vous aujourd'hui" value={dashboardData.appointmentsToday} subtitle={`Prochain: ${dashboardData.nextAppointment}`} explanation="Nombre total de rendez-vous pour la journée." />

            <StatCard icon={<UserPlus className="h-5 w-5 text-purple-500" />} title="Nouveaux patients (30 jours)" value={dashboardData.newPatientsLast30Days} explanation="Représente le nombre de nouveaux patients enregistrés ces 30 derniers jours." change={`${dashboardData.thirtyDayGrowthPercentage > 0 ? '+' : ''}${dashboardData.thirtyDayGrowthPercentage}% sur 30 jours`} changeDirection={dashboardData.thirtyDayGrowthPercentage > 0 ? 'up' : dashboardData.thirtyDayGrowthPercentage < 0 ? 'down' : 'neutral'} />

            <StatCard icon={<TrendingUp className="h-5 w-5 text-purple-500" />} title="Nouveaux patients (Cette année)" value={dashboardData.newPatientsThisYear} explanation="Représente le nombre de nouveaux patients enregistrés cette année." change={`${dashboardData.annualGrowthPercentage > 0 ? '+' : ''}${dashboardData.annualGrowthPercentage}% depuis le 1er janvier`} changeDirection={dashboardData.annualGrowthPercentage > 0 ? 'up' : dashboardData.annualGrowthPercentage < 0 ? 'down' : 'neutral'} />
          </div>

          <section className="rounded-xl p-0 animate-fade-in animate-delay-100">
            <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-8">
              Graphiques et visualisations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {/* Age statistics */}
              <Card className="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                
              </Card>

              {/* Gender distribution */}
              
            </div>

            <div className="mt-8">
              <Card className="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6 text-purple-600 dark:text-purple-400 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Croissance mensuelle des patients en {new Date().getFullYear()}
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.monthlyGrowth} margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 50
                  }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                        <XAxis dataKey="month" tick={{
                      fontSize: 12,
                      fontWeight: 500
                    }} tickLine={{
                      stroke: 'var(--border)'
                    }} height={50} angle={0} textAnchor="middle" interval={0} />
                        <YAxis tick={{
                      fontSize: 12
                    }} tickLine={{
                      stroke: 'var(--border)'
                    }} />
                        <Tooltip formatter={(value, name) => {
                      return [value, name === "patients" ? "Patients" : "Année précédente"];
                    }} labelFormatter={label => `Mois: ${label}`} contentStyle={{
                      backgroundColor: 'white',
                      borderColor: '#60a5fa',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} labelStyle={{
                      fontWeight: 'bold',
                      color: '#2563eb'
                    }} />
                        <Legend formatter={value => <span style={{
                      color: value === "patients" ? "#60a5fa" : "#c084fc",
                      fontWeight: 500,
                      padding: '0 10px'
                    }}>
                              {value === "patients" ? "Cette année" : "Année précédente"}
                            </span>} wrapperStyle={{
                      paddingTop: '15px'
                    }} />
                        <Bar dataKey="patients" name="patients" fill="#60a5fa" radius={[6, 6, 0, 0]} barSize={20} />
                        <Bar dataKey="prevPatients" name="prevPatients" fill="#c084fc" radius={[6, 6, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in animate-delay-200">
            <div>
              <AppointmentsOverview data={dashboardData} />
            </div>
            <div>
              <DemographicsCard data={dashboardData} />
            </div>
          </div>
        </>}
    </div>;
}