
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/ui/layout";
import { DashboardData } from "@/types";
import { api } from "@/services/api";
import { AppointmentsOverview } from "@/components/dashboard/appointments-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dashboard } from "@/components/dashboard/dashboard";

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

  if (!isAuthenticated) {
    return null; // Route protection
  }

  return (
    <Layout>
      <div className="container relative">
        <Dashboard />
      </div>
    </Layout>
  );
};

export default DashboardPage;
