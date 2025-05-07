
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/types";
import { ArrowDownIcon, ArrowUpIcon, Users, UserPlus, Calendar, TrendingUp } from "lucide-react";
import StatCard from "@/components/ui/stat-card";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { formatAppointmentDate } from "@/utils/date-utils";

interface DashboardStatsProps {
  data: DashboardData;
}

export function DashboardStats({ data }: DashboardStatsProps) {
  // Get current day and year for the appointments card
  const today = new Date();
  const formattedToday = format(today, "EEEE d MMMM yyyy", { locale: fr });

  // Format next appointment with day and date if available
  let nextAppointmentText = "Prochaine: Aucune séance prévue";
  
  if (data && data.nextAppointment !== "Aucune séance prévue") {
    // Extract date from the nextAppointment string if it contains a date
    try {
      // Parse the appointment data - assuming format like "HH:mm, dd MMM"
      const appointmentData = data.nextAppointment.split(',');
      if (appointmentData.length > 1) {
        // Try to construct a valid date from the appointment information
        const timePart = appointmentData[0].trim(); // "HH:mm"
        const datePart = appointmentData[1].trim(); // "dd MMM"
        
        // Create a date object based on the current year
        const nextDate = new Date();
        
        // Parse month and day from datePart (e.g., "23 mai")
        const [day, month] = datePart.split(' ');
        
        // Map French month names to numbers (simplified approach)
        const monthNames = {
          'jan': 0, 'fév': 1, 'mar': 2, 'avr': 3, 'mai': 4, 'juin': 5,
          'juil': 6, 'août': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'déc': 11
        };
        
        // Find the matching month number
        let monthIndex = -1;
        for (const [key, value] of Object.entries(monthNames)) {
          if (month.toLowerCase().startsWith(key.toLowerCase())) {
            monthIndex = value;
            break;
          }
        }
        
        if (monthIndex !== -1) {
          nextDate.setMonth(monthIndex);
          nextDate.setDate(parseInt(day));
          
          // Format with the day of week and full date information
          const formattedNextDate = format(nextDate, "EEEE d MMMM yyyy", { locale: fr });
          nextAppointmentText = `Prochaine: ${data.nextAppointment} (${formattedNextDate})`;
        } else {
          nextAppointmentText = `Prochaine: ${data.nextAppointment}`;
        }
      } else {
        nextAppointmentText = `Prochaine: ${data.nextAppointment}`;
      }
    } catch (error) {
      console.error("Error formatting next appointment date:", error);
      nextAppointmentText = `Prochaine: ${data.nextAppointment}`;
    }
  }

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
        subtitle={formattedToday}
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
