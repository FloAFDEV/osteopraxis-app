
import React from 'react';
import { Layout } from "@/components/ui/layout";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Building2, UserCog } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SettingsPage = () => {
  const { isAdmin } = useAuth();

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
    </Layout>
  );
};

export default SettingsPage;
