
import { DashboardData } from "@/types";
import { DashboardStats } from "./dashboard-stats";
import { DemographicsCard } from "./demographics-card";
import { GrowthChart } from "./growth-chart";

// Sample data for demo purposes
const sampleData: DashboardData = {
  totalPatients: 475,
  maleCount: 217,
  femaleCount: 258,
  averageAge: 42,
  averageAgeMale: 45,
  averageAgeFemale: 39,
  newPatientsThisMonth: 12,
  newPatientsThisYear: 87,
  newPatientsLastYear: 79,
  appointmentsToday: 5,
  nextAppointment: "14:30 - Marie Dupont",
  patientsLastYearEnd: 388,
  newPatientsLast30Days: 9,
  thirtyDayGrowthPercentage: 3.8,
  annualGrowthPercentage: 22.4,
  monthlyGrowth: [
    { month: "Jan", patients: 8, prevPatients: 6, growthText: "+33%" },
    { month: "Fév", patients: 10, prevPatients: 7, growthText: "+43%" },
    { month: "Mar", patients: 7, prevPatients: 6, growthText: "+17%" },
    { month: "Avr", patients: 9, prevPatients: 8, growthText: "+12%" },
    { month: "Mai", patients: 11, prevPatients: 7, growthText: "+57%" },
    { month: "Juin", patients: 8, prevPatients: 5, growthText: "+60%" },
    { month: "Juil", patients: 6, prevPatients: 7, growthText: "-14%" },
    { month: "Août", patients: 5, prevPatients: 4, growthText: "+25%" },
    { month: "Sep", patients: 9, prevPatients: 8, growthText: "+12%" },
    { month: "Oct", patients: 12, prevPatients: 9, growthText: "+33%" },
    { month: "Nov", patients: 8, prevPatients: 6, growthText: "+33%" },
    { month: "Déc", patients: 12, prevPatients: 10, growthText: "+20%" }
  ]
};

export function Dashboard() {
  return (
    <div className="space-y-6">
      <DashboardStats data={sampleData} />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DemographicsCard data={sampleData} />
        <GrowthChart data={sampleData} />
      </div>
    </div>
  );
}
