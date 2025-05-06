
import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  const isAdmin = user?.role === "ADMIN";

  return (
    <Layout>
      <div className="container max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Paramètres</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-5 h-auto gap-2">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="cabinet">Cabinet</TabsTrigger>
            <TabsTrigger value="account">Compte</TabsTrigger>
            <TabsTrigger value="billing">Facturation</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">Admin</TabsTrigger>}
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de profil</CardTitle>
                  <CardDescription>
                    Gérez vos informations personnelles et professionnelles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Informations personnelles</h3>
                    <p className="text-sm text-muted-foreground">
                      Modifiez vos informations personnelles comme votre nom, prénom, email, etc.
                    </p>
                    <Button asChild>
                      <Link to="/settings/profile">Modifier le profil</Link>
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Préférences de notification</h3>
                    <p className="text-sm text-muted-foreground">
                      Gérez comment et quand vous recevez des notifications
                    </p>
                    <Button variant="outline" disabled>Fonctionnalité à venir</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="cabinet">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de cabinet</CardTitle>
                  <CardDescription>
                    Gérez vos cabinets d'ostéopathie
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Mes cabinets</h3>
                    <p className="text-sm text-muted-foreground">
                      Gérez les informations de vos cabinets: adresse, téléphone, horaires, etc.
                    </p>
                    <Button asChild>
                      <Link to="/settings/cabinet">Gérer mes cabinets</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres du compte</CardTitle>
                  <CardDescription>
                    Gérez votre compte et la sécurité
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Mot de passe</h3>
                    <p className="text-sm text-muted-foreground">
                      Changez votre mot de passe pour sécuriser davantage votre compte
                    </p>
                    <Button variant="outline" disabled>Fonctionnalité à venir</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-destructive">Zone de danger</h3>
                    <p className="text-sm text-muted-foreground">
                      Une fois que vous supprimez votre compte, il n'y a pas de retour en arrière. Soyez certain.
                    </p>
                    <Button variant="destructive" disabled>Fonctionnalité à venir</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de facturation</CardTitle>
                  <CardDescription>
                    Gérez vos méthodes de paiement et abonnements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Cette fonctionnalité sera disponible prochainement.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" disabled>Fonctionnalité à venir</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {isAdmin && (
              <TabsContent value="admin">
                <Card className="border-amber-200 dark:border-amber-800">
                  <CardHeader className="bg-amber-50 dark:bg-amber-950/30">
                    <CardTitle className="text-amber-800 dark:text-amber-300">Administration</CardTitle>
                    <CardDescription>
                      Accédez aux fonctionnalités d'administration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="mb-4">
                      En tant qu'administrateur, vous avez accès à des fonctionnalités supplémentaires pour gérer l'ensemble de la plateforme.
                    </p>
                    <Button asChild>
                      <Link to="/admin">Accéder à l'administration</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
