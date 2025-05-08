
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Activity, User, UserPlus, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const registerSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères")
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Les mots de passe ne correspondent pas",
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setRegisterError(null);
    try {
      await register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      });
      
      setRegistrationSuccess(true);
      toast.success("Votre compte a été créé avec succès !");
      
      // Redirection vers la page de profil ostéopathe au lieu de profile/setup
      setTimeout(() => {
        navigate("/profile/osteopath");
      }, 4500);
      
    } catch (error: any) {
      console.error("Register error:", error);
      setRegisterError(error.message || "Erreur lors de la création du compte");
      toast.error(error.message || "Erreur lors de la création du compte");
    }
  };
  
  // Si l'inscription a réussie, afficher un message de confirmation
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0d1117]">
        <div className="w-full max-w-md space-y-8 bg-[#161b22] p-8 rounded-xl border border-gray-700 shadow-xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-6">Inscription réussie !</h1>
            <div className="flex justify-center mb-6">
              <div className="bg-green-500/20 rounded-full p-3">
                <User className="h-10 w-10 text-green-400" />
              </div>
            </div>
            <p className="text-gray-300 mb-6">
              Votre compte a été créé avec succès. Vous allez être redirigé vers la configuration de votre profil professionnel.
            </p>
            <div className="animate-pulse mb-6 flex justify-center">
              <div className="bg-blue-500/30 rounded-full h-2 w-24"></div>
            </div>
            <p className="text-gray-400 text-sm">
              Redirection automatique vers la configuration de votre profil professionnel...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left section - Register form */}
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
                Créez votre compte
              </h2>
              <p className="text-gray-400 text-lg">
                Rejoignez PatientHub pour gérer vos patients efficacement.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0d1117] text-gray-400">Inscription</span>
              </div>
            </div>

            {registerError && (
              <Alert variant="destructive" className="bg-red-500/10 border border-red-500/50 text-red-500">
                <Info className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{registerError}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-gray-300">Prénom</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input className="pl-10 bg-[#161b22] border-gray-700 text-white" placeholder="Prénom" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-gray-300">Nom</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input className="pl-10 bg-[#161b22] border-gray-700 text-white" placeholder="Nom" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Email</FormLabel>
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
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            type="password" 
                            className="pl-10 bg-[#161b22] border-gray-700 text-white" 
                            placeholder="Votre mot de passe" 
                            autoComplete="new-password"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Confirmez le mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input 
                            type="password" 
                            className="pl-10 bg-[#161b22] border-gray-700 text-white" 
                            placeholder="Confirmer votre mot de passe" 
                            autoComplete="new-password"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Alert className="bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>
                    Après votre inscription, vous serez guidé pour configurer votre profil professionnel et votre cabinet.
                  </AlertDescription>
                </Alert>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      S'inscrire
                    </>
                  )}
                </Button>
                
                <div className="text-center">
                  <p className="text-gray-400">
                    Déjà inscrit ? <Link to="/login" className="text-blue-400 hover:underline">Se connecter</Link>
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            La plateforme conçue pour faciliter la gestion des données médicales.<br />
            Gérez vos rendez-vous et suivez efficacement vos patients.
          </p>
          <p className="mt-4">
            © 2024 PatientHub. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* Right section - Spine image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img 
          src="/lovable-uploads/3b5eb6d0-bf13-4f00-98c8-6cc25a7e5c4f.png" 
          alt="Image d'une colonne vertébrale" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117]/80 to-transparent"></div>
      </div>
    </div>
  );
};

export default RegisterPage;
