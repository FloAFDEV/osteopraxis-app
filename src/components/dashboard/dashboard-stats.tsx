
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/types";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface DashboardStatsProps {
  data: DashboardData;
}

export function DashboardStats({ data }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Patients totaux</CardTitle>
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
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nouveaux patients (mois)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.newPatientsThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            +{data.newPatientsLast30Days} ces 30 derniers jours
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rendez-vous aujourd'hui</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.appointmentsToday}</div>
          <p className="text-xs text-muted-foreground">
            Prochain: {data.nextAppointment}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Croissance annuelle</CardTitle>
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
