import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/types";
import { ArrowDownIcon, ArrowUpIcon, Users, UserPlus, Calendar, TrendingUp } from "lucide-react";
interface DashboardStatsProps {
  data: DashboardData;
}
export function DashboardStats({
  data
}: DashboardStatsProps) {
  if (!data) {
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(item => <Card key={item} className="overflow-hidden shadow-sm border-t-4 border-t-gray-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chargement...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse h-6 bg-gray-200 rounded mb-2"></div>
              <div className="animate-pulse h-4 w-1/2 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>)}
      </div>;
  }
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow border-t-4 border-t-blue-400">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Patients totaux</CardTitle>
          <Users className="h-7 w-7 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalPatients}</div>
          <p className="text-xs text-muted-foreground">
            {data.thirtyDayGrowthPercentage > 0 ? <span className="flex items-center text-green-500">
                <ArrowUpIcon className="mr-1 h-3 w-3" />
                <span className="truncate">{data.thirtyDayGrowthPercentage}% ce mois-ci</span>
              </span> : <span className="flex items-center text-red-500">
                <ArrowDownIcon className="mr-1 h-3 w-3" />
                <span className="truncate">{Math.abs(data.thirtyDayGrowthPercentage)}% ce mois-ci</span>
              </span>}
          </p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow border-t-4 border-t-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nouveaux patients (mois)</CardTitle>
          <UserPlus className="h-7 w-7 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.newPatientsThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            +{data.newPatientsLast30Days} ces 30 derniers jours
          </p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow border-t-4 border-t-pink-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rendez-vous aujourd'hui</CardTitle>
          <Calendar className="h-7 w-7 text-pink-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.appointmentsToday}</div>
          <p className="text-xs text-muted-foreground truncate">
            Prochain: {data.nextAppointment}
          </p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow border-t-4 border-t-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Croissance annuelle</CardTitle>
          <TrendingUp className="h-7 w-7 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.annualGrowthPercentage}%</div>
          <p className="text-xs text-muted-foreground">
            {data.newPatientsThisYear} nouveaux cette année
          </p>
        </CardContent>
      </Card>
    </div>;
}