
import { DashboardData } from "@/types";
import StatCard from "@/components/ui/stat-card";
import { Users, UserPlus, Calendar, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";

interface DashboardStatsProps {
  data: DashboardData;
}

export function DashboardStats({ data }: DashboardStatsProps) {
  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-gradient-to-r from-white to-gray-100 dark:bg-neutral-800 p-4 sm:p-6 rounded-lg shadow-lg animate-pulse"
          >
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Patients totaux"
        value={data.totalPatients}
        description={
          data.thirtyDayGrowthPercentage > 0
            ? `+${data.thirtyDayGrowthPercentage}% ce mois-ci`
            : `${data.thirtyDayGrowthPercentage}% ce mois-ci`
        }
        color={data.thirtyDayGrowthPercentage > 0 ? "text-green-500" : "text-red-500"}
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
        title="Rendez-vous aujourd'hui"
        value={data.appointmentsToday}
        description={`Prochain : ${data.nextAppointment}`}
        color="text-pink-500"
        icon={<Calendar />}
      />
      
      <StatCard
        title="Croissance annuelle"
        value={`${data.annualGrowthPercentage}%`}
        description={`${data.newPatientsThisYear} nouveaux cette année`}
        color="text-blue-600"
        icon={<TrendingUp />}
      />
    </div>
  );
}
