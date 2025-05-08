import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/ui/layout";
import { DashboardData } from "@/types";
import { api } from "@/services/api";
import { AppointmentsOverview } from "@/components/dashboard/appointments-overview";
import { PatientsOverview } from "@/components/dashboard/patients-overview";
import { InvoicesOverview } from "@/components/dashboard/invoices-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is a new user who needs to complete their profile
  useEffect(() => {
    const checkNewUser = async () => {
      const isNewUser = localStorage.getItem("newUserProfileSetup");
      
      if (isNewUser === "true" && isAuthenticated && user) {
        // Clear the flag
        localStorage.removeItem("newUserProfileSetup");
        
        // Redirect to osteopath profile setup
        navigate("/profile/osteopath");
        return;
      }
      
      // If user is authenticated but has no osteopathId, redirect to profile setup
      if (isAuthenticated && user && !user.osteopathId) {
        navigate("/profile/osteopath");
      }
    };
    
    checkNewUser();
  }, [isAuthenticated, user, navigate]);
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await api.getDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!isAuthenticated) {
    return null; // Route protection
  }

  return (
    <Layout>
      <div className="container relative">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Séances aujourd'hui
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : data?.appointmentsToday || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {[
                  format(new Date(), "EEEE", { locale: fr }),
                  format(new Date(), "d MMMM", { locale: fr }),
                ].join(" ")}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-1 mt-4">
          <AppointmentsOverview data={data || {}} />
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mt-4">
          <PatientsOverview data={data || {}} />
          <InvoicesOverview data={data || {}} />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
