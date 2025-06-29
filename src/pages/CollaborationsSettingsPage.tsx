import React from "react";
import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Building, ArrowLeft, HelpCircle } from "lucide-react";
import { ReplacementManagement } from "@/components/collaborations/ReplacementManagement";
import { CabinetAssociationManagement } from "@/components/collaborations/CabinetAssociationManagement";
import { BackButton } from "@/components/ui/back-button";
import { useNavigate } from "react-router-dom";

const CollaborationsSettingsPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-6">
          <BackButton to="/settings" />
          <h1 className="text-3xl font-bold">Collaborations & Remplacements</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos remplacements, délégations et associations aux cabinets
          </p>
        </div>

        <div className="space-y-6">
          {/* Replacement Management Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-500" />
                Gestion des remplacements
              </CardTitle>
              <CardDescription>
                Configurez vos remplacements et déléguez l'accès à vos patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReplacementManagement />
            </CardContent>
          </Card>

          {/* Cabinet Association Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-purple-500" />
                Associations aux cabinets
              </CardTitle>
              <CardDescription>
                Gérez vos associations aux différents cabinets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CabinetAssociationManagement />
            </CardContent>
          </Card>

          {/* Responsive back button */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-6 border-t">
            <BackButton to="/settings" className="w-full sm:w-auto" />
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                variant="outline"
                onClick={() => navigate("/settings")}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Retour aux paramètres</span>
                <span className="sm:hidden">Retour</span>
              </Button>
              <Button 
                onClick={() => navigate("/help")}
                variant="ghost"
                className="w-full sm:w-auto"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Aide & support</span>
                <span className="sm:hidden">Aide</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CollaborationsSettingsPage;
