
import React from 'react';
import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Building, CreditCard, FileText, Shield, UserCog } from 'lucide-react';
import { api } from '@/services/api';

const SettingsPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const handleProfessionalProfileRedirect = () => {
    if (user?.professionalProfileId) {
      navigate('/settings/profile');
    } else {
      navigate('/professional-profile');
    }
  };
  
  const handleCabinetConfigRedirect = async () => {
    try {
      if (!user?.professionalProfileId) {
        navigate('/professional-profile');
        return;
      }
      
      const cabinets = await api.getCabinetsByProfessionalProfileId(user.professionalProfileId);
      
      if (cabinets && cabinets.length > 0) {
        navigate('/settings/cabinet');
      } else {
        navigate('/cabinets/new');
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des cabinets:", error);
      navigate('/cabinets');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Configuration du profil professionnel */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <UserCog className="h-5 w-5 text-blue-500 mr-2" />
                Profil Professionnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Configurez vos informations professionnelles (nom, SIRET, ADELI, etc.)
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleProfessionalProfileRedirect}
              >
                {user?.professionalProfileId ? "Modifier le profil" : "Créer un profil"}
              </Button>
            </CardContent>
          </Card>
          
          {/* Configuration du cabinet */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Building className="h-5 w-5 text-green-500 mr-2" />
                Cabinet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Gérez les informations de votre cabinet et configurez plusieurs lieux d'exercice
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleCabinetConfigRedirect}
              >
                Gérer les cabinets
              </Button>
            </CardContent>
          </Card>
          
          {/* Configuration de facturation */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="h-5 w-5 text-purple-500 mr-2" />
                Facturation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Personnalisez vos paramètres de facturation et configurez les modèles de factures
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/settings/billing')}
              >
                Paramètres de facturation
              </Button>
            </CardContent>
          </Card>
          
          {/* Documents */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 text-amber-500 mr-2" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Configurez vos modèles de documents (ordonnances, comptes-rendus)
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/settings/documents')}
              >
                Gérer les documents
              </Button>
            </CardContent>
          </Card>
          
          {/* Admin (visible only for admin users) */}
          {isAdmin && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Shield className="h-5 w-5 text-red-500 mr-2" />
                  Administration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Paramètres d'administration réservés aux administrateurs
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/admin')}
                >
                  Administration
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
