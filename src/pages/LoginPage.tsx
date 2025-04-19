
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères")
});

const magicLinkSchema = z.object({
  email: z.string().email("Email invalide")
});

type LoginFormValues = z.infer<typeof loginSchema>;
type MagicLinkFormValues = z.infer<typeof magicLinkSchema>;

const LoginPage = () => {
  const { login, loginWithMagicLink, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("password");
  const navigate = useNavigate();
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const magicLinkForm = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: ""
    }
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      console.log("Tentative de connexion avec:", data.email);
      const result = await login(data.email, data.password);
      console.log("Résultat de connexion:", result);
      if (result) {
        toast.success("Connexion réussie!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      toast.error(error.message || "Échec de connexion. Vérifiez vos identifiants.");
    }
  };

  const onMagicLinkSubmit = async (data: MagicLinkFormValues) => {
    try {
      console.log("Envoi de magic link à:", data.email);
      await loginWithMagicLink(data.email);
      toast.success(`Un lien de connexion a été envoyé à ${data.email}`);
    } catch (error: any) {
      console.error("Erreur d'envoi du magic link:", error);
      toast.error(error.message || "Échec de l'envoi du lien magique.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            PatientHub
          </h1>
          <h2 className="text-2xl font-bold text-center text-gray-900 mt-6">
            Connexion
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Bienvenue sur votre espace professionnel
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="password">Mot de passe</TabsTrigger>
            <TabsTrigger value="magiclink">Magic Link</TabsTrigger>
          </TabsList>
          
          <TabsContent value="password">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <FormField 
                  control={loginForm.control} 
                  name="email" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            className="pl-10" 
                            placeholder="votre@email.com" 
                            autoComplete="email" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField 
                  control={loginForm.control} 
                  name="password" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            type="password" 
                            className="pl-10" 
                            placeholder="Votre mot de passe" 
                            autoComplete="current-password" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                      Connexion...
                    </>
                  ) : "Se connecter"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="magiclink">
            <Form {...magicLinkForm}>
              <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="space-y-6">
                <FormField 
                  control={magicLinkForm.control} 
                  name="email" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            className="pl-10" 
                            placeholder="votre@email.com" 
                            autoComplete="email" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                      Envoi du lien...
                    </>
                  ) : "Recevoir un lien de connexion"}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm text-gray-600 mt-4">
              <p>
                Un lien de connexion sécurisé sera envoyé à votre adresse email.
              </p>
            </div>
          </TabsContent>
        </Tabs>
              
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Pas encore de compte ? <Link to="/register" className="text-blue-500 hover:underline">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
