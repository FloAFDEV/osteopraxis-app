import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/types";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Users,
  UserPlus,
  Calendar,
  TrendingUp
} from "lucide-react";

interface DashboardStatsProps {
  data: DashboardData;
}

export function DashboardStats({ data }: DashboardStatsProps) {
  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Card
            key={item}
            className="overflow-hidden rounded-lg bg-gradient-to-r from-white to-gray-100 dark:bg-neutral-800 p-4 sm:p-6 shadow-lg"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Chargement...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="animate-pulse h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden rounded-lg border-t-4 border-t-blue-500 bg-gradient-to-r from-white to-gray-100 dark:bg-neutral-800 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-800 dark:text-white">
            Patients totaux
          </CardTitle>
          <Users className="h-7 w-7 text-blue-500 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">
            {data.totalPatients}
          </div>
          <p className="text-xs mt-1">
            {data.thirtyDayGrowthPercentage > 0 ? (
              <span className="flex items-center text-green-500 dark:text-green-400">
                <ArrowUpIcon className="mr-1 h-3 w-3" />
                {data.thirtyDayGrowthPercentage}% ce mois-ci
              </span>
            ) : (
              <span className="flex items-center text-red-500 dark:text-red-400">
                <ArrowDownIcon className="mr-1 h-3 w-3" />
                {Math.abs(data.thirtyDayGrowthPercentage)}% ce mois-ci
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border-t-4 border-t-purple-500 bg-gradient-to-r from-white to-gray-100 dark:bg-neutral-800 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-800 dark:text-white">
            Nouveaux patients (mois)
          </CardTitle>
          <UserPlus className="h-7 w-7 text-purple-500 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-500 dark:text-purple-400">
            {data.newPatientsThisMonth}
          </div>
          <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
            +{data.newPatientsLast30Days} ces 30 derniers jours
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border-t-4 border-t-pink-500 bg-gradient-to-r from-white to-gray-100 dark:bg-neutral-800 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-800 dark:text-white">
            Rendez-vous aujourd'hui
          </CardTitle>
          <Calendar className="h-7 w-7 text-pink-500 dark:text-pink-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-pink-500 dark:text-pink-400">
            {data.appointmentsToday}
          </div>
          <p className="text-xs mt-1 text-gray-600 dark:text-gray-400 truncate">
            Prochain: {data.nextAppointment}
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg border-t-4 border-t-blue-600 bg-gradient-to-r from-white to-gray-100 dark:bg-neutral-800 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-800 dark:text-white">
            Croissance annuelle
          </CardTitle>
          <TrendingUp className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {data.annualGrowthPercentage}%
          </div>
          <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
            {data.newPatientsThisYear} nouveaux cette année
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
