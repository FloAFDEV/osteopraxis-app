
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/types";
import { ArrowDownIcon, ArrowUpIcon, Users, UserPlus, Calendar, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  data: DashboardData;
}

export function DashboardStats({ data }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden">
        <div className="absolute h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600 top-0 left-0"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Patients totaux</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalPatients}</div>
          <p className="text-xs text-muted-foreground">
            {data.thirtyDayGrowthPercentage > 0 ? (
              <span className="flex items-center text-green-500">
                <ArrowUpIcon className="mr-1 h-3 w-3" />
                {data.thirtyDayGrowthPercentage}% ce mois-ci
              </span>
            ) : (
              <span className="flex items-center text-red-500">
                <ArrowDownIcon className="mr-1 h-3 w-3" />
                {Math.abs(data.thirtyDayGrowthPercentage)}% ce mois-ci
              </span>
            )}
          </p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <div className="absolute h-1 w-full bg-gradient-to-r from-purple-400 to-purple-600 top-0 left-0"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nouveaux patients (mois)</CardTitle>
          <UserPlus className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.newPatientsThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            +{data.newPatientsLast30Days} ces 30 derniers jours
          </p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <div className="absolute h-1 w-full bg-gradient-to-r from-pink-400 to-pink-600 top-0 left-0"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rendez-vous aujourd'hui</CardTitle>
          <Calendar className="h-4 w-4 text-pink-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.appointmentsToday}</div>
          <p className="text-xs text-muted-foreground">
            Prochain: {data.nextAppointment}
          </p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <div className="absolute h-1 w-full bg-gradient-to-r from-blue-600 to-purple-600 top-0 left-0"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Croissance annuelle</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.annualGrowthPercentage}%</div>
          <p className="text-xs text-muted-foreground">
            {data.newPatientsThisYear} nouveaux cette année
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
