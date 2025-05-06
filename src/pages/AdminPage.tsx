import { useState, useEffect } from "react";
import { Layout } from "@/components/ui/layout";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api"; // Make sure this is imported
import { toast } from "sonner";

const AdminPage = () => {
  const { isAdmin, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [adminViewMode, setAdminViewMode] = useState("dashboard");

  const handlePromoteToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setPromoting(true);
      // First, find the user by email
      // This is a mock implementation since we don't have a direct lookup by email
      // In a real implementation, you would have an API endpoint to find users by email
      
      // Call the promote to admin API endpoint
      await api.promoteToAdmin(email);
      
      toast.success(`User ${email} has been promoted to admin`);
      setEmail("");
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      toast.error("Failed to promote user to admin. Make sure the email exists in the system.");
    } finally {
      setPromoting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-center mb-6">Access Denied</h2>
              <p className="text-center text-gray-600 dark:text-gray-400">
                You need administrator privileges to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          
          <div className="flex space-x-2">
            <Button 
              variant={adminViewMode === "dashboard" ? "default" : "outline"}
              onClick={() => setAdminViewMode("dashboard")}
            >
              Dashboard
            </Button>
            <Button 
              variant={adminViewMode === "userManagement" ? "default" : "outline"}
              onClick={() => setAdminViewMode("userManagement")}
            >
              User Management
            </Button>
          </div>
        </div>
        
        {adminViewMode === "dashboard" ? (
          <AdminDashboard />
        ) : (
          <div className="grid gap-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Promote User to Admin</h2>
                <form onSubmit={handlePromoteToAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">User Email</Label>
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="Enter user email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={promoting}>
                    {promoting ? "Processing..." : "Promote to Admin"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Add more user management components here */}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPage;
