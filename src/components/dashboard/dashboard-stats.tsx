
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/types";
import { ArrowDownIcon, ArrowUpIcon, Users, UserPlus, Calendar, TrendingUp } from "lucide-react";
import StatCard from "@/components/ui/stat-card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DashboardStatsProps {
  data: DashboardData;
}

export function DashboardStats({ data }: DashboardStatsProps) {
  // Get current day and year for the appointments card
  const today = new Date();
  const dayAndYear = format(today, "EEEE, yyyy", { locale: fr });

  // Format next appointment with day and year if available
  const nextAppointmentText = data && data.nextAppointment !== "Aucune séance prévue" 
    ? `Prochaine: ${data.nextAppointment} (${dayAndYear})`
    : `Prochaine: ${data.nextAppointment}`;

  if (!data) {
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(item => <Card key={item} className="overflow-hidden shadow-sm border-t-4 border-t-blue-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chargement...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse h-6 bg-blue-100 dark:bg-blue-800/30 rounded mb-2"></div>
              <div className="animate-pulse h-4 w-1/2 bg-blue-100 dark:bg-blue-800/30 rounded"></div>
            </CardContent>
          </Card>)}
      </div>;
  }

  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Patients totaux"
        value={data.totalPatients}
        description={data.thirtyDayGrowthPercentage > 0 
          ? `+${data.thirtyDayGrowthPercentage}% ce mois-ci` 
          : `${data.thirtyDayGrowthPercentage}% ce mois-ci`}
        color={data.thirtyDayGrowthPercentage > 0 ? "text-blue-500" : "text-blue-500"}
        icon={<Users />}
      />
      
      <StatCard
        title="Nouveaux patients (mois)"
        value={data.newPatientsThisMonth}
        description={`+${data.newPatientsLast30Days} ces 30 derniers jours`}
        color="text-purple-500"
        icon={<UserPlus />}
      />
      
      <StatCard
        title="Séance aujourd'hui"
        subtitle={dayAndYear}
        value={data.appointmentsToday}
        description={nextAppointmentText}
        color="text-green-500"
        icon={<Calendar />}
      />
      
      <StatCard
        title="Croissance annuelle"
        value={`${data.annualGrowthPercentage}%`}
        description={`${data.newPatientsThisYear} nouveaux cette année`}
        color="text-amber-500"
        icon={<TrendingUp />}
      />
    </div>;
}
