
import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/ui/layout";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Building2, UserCog, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Osteopath } from "@/types";

const SettingsPage = () => {
  const { isAdmin, user } = useAuth();
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOsteopathData = async () => {
      if (user?.osteopathId) {
        try {
          const osteopathData = await api.getOsteopathById(user.osteopathId);
          setOsteopath(osteopathData || null);
        } catch (error) {
          console.error("Error fetching osteopath data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadOsteopathData();
  }, [user]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Paramètres
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les paramètres de votre application
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des informations...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                  Profil professionnel
                </CardTitle>
                <CardDescription>
                  Gérez vos informations professionnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {osteopath ? (
                  <>
                    <div className="mb-4 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Nom:</span> {osteopath.name}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Titre:</span> {osteopath.professional_title || "Non spécifié"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Numéro ADELI:</span> {osteopath.adeli_number || "Non spécifié"}
                      </p>
                    </div>
                    <Button asChild variant="outline">
                      <Link to="/settings/profile">Modifier mon profil</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="mb-4 text-sm">
                      Complétez votre profil professionnel pour accéder à toutes les fonctionnalités.
                    </p>
                    <Button asChild>
                      <Link to="/settings/profile">Compléter mon profil</Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                  Cabinets
                </CardTitle>
                <CardDescription>
                  Gérez vos cabinets d'ostéopathie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm">
                  Ajoutez, modifiez ou supprimez des cabinets pour votre pratique.
                </p>
                <Button asChild variant="outline">
                  <Link to="/cabinets">Gérer les cabinets</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Ajout de la carte pour les factures */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                  Factures
                </CardTitle>
                <CardDescription>
                  Gérez vos factures patients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm">
                  Créez et gérez les factures pour vos patients.
                </p>
                <Button asChild variant="outline">
                  <Link to="/invoices">Gérer les factures</Link>
                </Button>
              </CardContent>
            </Card>

            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                    Administration
                  </CardTitle>
                  <CardDescription>
                    Paramètres administrateur
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm">
                    Accédez aux paramètres d'administration (réservé aux administrateurs).
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/admin">Panneau d'administration</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SettingsPage;
