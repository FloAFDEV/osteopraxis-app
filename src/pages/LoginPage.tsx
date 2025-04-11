
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Activity, UserPlus } from "lucide-react";
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
  const {
    login,
    loginWithMagicLink,
    isLoading
  } = useAuth();
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
      await login(data.email, data.password);
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  
  const onMagicLinkSubmit = async (data: MagicLinkFormValues) => {
    try {
      await loginWithMagicLink(data.email);
    } catch (error) {
      console.error("Magic link error:", error);
    }
  };
  
  return <div className="min-h-screen flex">
      {/* Left section - Login form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 md:p-12 bg-[#0d1117]">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            PatientHub
          </h1>
        </div>
        
        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                Votre espace dédié aux ostéopathes
              </h2>
              <p className="text-gray-400 text-lg">
                Connectez-vous pour consulter vos dossiers.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6 bg-gray-900">
                <TabsTrigger value="password" className="bg-gray-600 hover:bg-gray-500 text-zinc-100">Mot de passe</TabsTrigger>
                <TabsTrigger value="magiclink" className="bg-gray-600 hover:bg-gray-500 text-zinc-100">Magic Link</TabsTrigger>
              </TabsList>
              
              <TabsContent value="password">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#0d1117] text-gray-400">Connexion par mot de passe</span>
                  </div>
                </div>

                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <FormField control={loginForm.control} name="email" render={({
                    field
                  }) => <FormItem>
                          <FormLabel className="text-gray-300">Email :</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                              <Input 
                                className="pl-10 bg-[#161b22] border-gray-700 text-white" 
                                placeholder="votre@email.com" 
                                autoComplete="email"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={loginForm.control} name="password" render={({
                    field
                  }) => <FormItem>
                          <FormLabel className="text-gray-300">Mot de passe :</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                              <Input 
                                type="password" 
                                className="pl-10 bg-[#161b22] border-gray-700 text-white" 
                                placeholder="Votre mot de passe" 
                                autoComplete="current-password"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity" disabled={isLoading}>
                      {isLoading ? <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                          Se connecter...
                        </> : "Se connecter"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="magiclink">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#0d1117] text-gray-400">Connexion par Magic Link</span>
                  </div>
                </div>

                <Form {...magicLinkForm}>
                  <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="space-y-6">
                    <FormField control={magicLinkForm.control} name="email" render={({
                    field
                  }) => <FormItem>
                          <FormLabel className="text-gray-300">Email :</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                              <Input 
                                className="pl-10 bg-[#161b22] border-gray-700 text-white" 
                                placeholder="votre@email.com"
                                autoComplete="email"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity" disabled={isLoading}>
                      {isLoading ? <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                          Envoi du lien...
                        </> : "Recevoir un lien de connexion"}
                    </Button>
                  </form>
                </Form>

                <div className="text-center text-sm text-gray-400 mt-4">
                  <p>
                    Un lien de connexion sécurisé sera envoyé à votre adresse email.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
                
            <div className="text-center">
              <p className="text-gray-400">
                Pas encore de compte ? <Link to="/register" className="text-blue-400 hover:underline">S'inscrire</Link>
              </p>
            </div>

            <div className="text-center text-sm text-gray-400 mt-6">
              <p>
                Pour la démo, utilisez : <br />
                Email: franck.blanchet@example.com <br />
                Mot de passe: password
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            La plateforme conçue pour faciliter la gestion des données médicales.<br />
            Gérez vos rendez-vous et suivez efficacement vos patients
          </p>
          <p className="mt-4">
            © 2024 PatientHub. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* Right section - Spine image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img src="/lovable-uploads/3b5eb6d0-bf13-4f00-98c8-6cc25a7e5c4f.png" alt="Image d'une colonne vertébrale" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117]/80 to-transparent"></div>
      </div>
    </div>;
};

export default LoginPage;
