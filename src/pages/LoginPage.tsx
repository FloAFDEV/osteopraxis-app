
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const LoginPage = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await login(email, password);
      // Success toast is displayed by the context if successful
    } catch (error) {
      console.error("Login error:", error);
      // Error toast is displayed by the context
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendMagicLink = async () => {
    if (!email) {
      toast.error("Veuillez entrer votre email pour recevoir un lien de connexion");
      return;
    }

    setIsSubmitting(true);
    try {
      // Assuming this is an async function that returns a boolean indicating success
      const result = await login(email, '');
      if (result !== false) {
        toast.success("Un lien de connexion a été envoyé à votre adresse email");
      }
    } catch (error) {
      console.error("Magic link error:", error);
      toast.error("Erreur lors de l'envoi du lien magique");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
          <CardDescription className="text-center">
            Entrez vos identifiants pour accéder à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="nom@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Mot de passe oublié?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <span className="text-sm text-muted-foreground">
              Vous n'avez pas de compte?{" "}
              <Link to="/register" className="text-primary hover:underline">
                S'inscrire
              </Link>
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="relative w-full mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => toast.info("Cette fonctionnalité sera disponible bientôt")}
            disabled={isSubmitting}
          >
            Continuer avec email (lien magique)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
