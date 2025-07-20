import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Mail, Lock, Activity, User, UserPlus, Info, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InvitationCodeInput } from "@/components/cabinet/InvitationCodeInput";
import { Separator } from "@/components/ui/separator";
import { DemoLoginButton } from "@/components/demo/DemoLoginButton";

const registerSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  website: z.string().optional(),
  invitationCode: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Les mots de passe ne correspondent pas",
}).superRefine((data, ctx) => {
  if (data.website && data.website.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Validation error",
      path: ["website"]
    });
  }
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialInvitationCode = searchParams.get("invitation") || "";
  const returnTo = searchParams.get("returnTo") || "/profile/setup";
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(4);
  const [validInvitation, setValidInvitation] = useState<{code: string, cabinetName: string} | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      website: "",
      invitationCode: initialInvitationCode,
    },
  });

  useEffect(() => {
    if (initialInvitationCode) {
      form.setValue("invitationCode", initialInvitationCode);
    }
  }, [initialInvitationCode, form]);

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
      
      // Compte à rebours pour la redirection
      let counter = 4;
      const countdownInterval = setInterval(() => {
        counter -= 1;
        setRedirectCountdown(counter);
        
        if (counter <= 0) {
          clearInterval(countdownInterval);
          // Si on a une invitation valide, rediriger vers la configuration avec le code
          const targetUrl = validInvitation?.code 
            ? `/profile/setup?invitation=${validInvitation.code}`
            : returnTo;
          navigate(targetUrl);
        }
      }, 1000);
    } catch (error: any) {
      console.error("Register error:", error);
      setRegisterError(error.message || "Erreur lors de la création du compte");
      toast.error(error.message || "Erreur lors de la création du compte");
    }
  };

  const handleValidInvitation = (code: string, cabinetName: string) => {
    setValidInvitation({ code, cabinetName });
    form.setValue("invitationCode", code);
  };

  const handleInvalidInvitation = () => {
    setValidInvitation(null);
  };
  
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
              Votre compte a été créé avec succès.
              {validInvitation && (
                <span className="block mt-2 text-blue-300">
                  Vous allez être redirigé vers la configuration avec votre invitation pour {validInvitation.cabinetName}.
                </span>
              )}
            </p>
            <div className="flex justify-center mb-4">
              <div className="bg-blue-500/20 rounded-full px-4 py-2">
                <span className="text-blue-300 font-semibold">Redirection dans {redirectCountdown}s...</span>
              </div>
            </div>
            <div className="animate-pulse mb-6 flex justify-center">
              <div className="bg-blue-500/30 rounded-full h-2 w-24"></div>
            </div>
            <p className="text-gray-400 text-sm">
              Si vous n'êtes pas redirigé automatiquement, 
              <button 
                onClick={() => navigate(validInvitation?.code ? `/profile/setup?invitation=${validInvitation.code}` : returnTo)}
                className="text-blue-400 hover:underline ml-1"
              >
                cliquez ici
              </button>
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
				<div className="mb-6 flex items-center justify-between">
					<h1 className="text-4xl font-extrabold tracking-tight">
						<span className="text-white">Patient</span>
						<span className="ml-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
							Hub
						</span>
					</h1>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate('/')}
						className="text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Retour
					</Button>
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

            {/* Invitation section */}
            {(initialInvitationCode || form.watch("invitationCode")) && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-blue-400 font-medium mb-3">Invitation Cabinet</h3>
                <InvitationCodeInput
                  initialCode={initialInvitationCode}
                  onValidCode={handleValidInvitation}
                  onInvalidCode={handleInvalidInvitation}
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0d1117] text-blue-400">Inscription</span>
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
                {/* Honeypot field */}
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem 
                      style={{ 
                        position: "absolute", 
                        left: "-5000px",
                        opacity: 0,
                        width: "1px",
                        height: "1px",
                        overflow: "hidden"
                      }}
                      aria-hidden="true"
                    >
                      <FormLabel>Site web</FormLabel>
                      <FormControl>
                        <Input 
                          autoComplete="off"
                          tabIndex={-1} 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
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
                  <Info className="h-4 w-4 !text-blue-400" />
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>
                    Après votre inscription, vous serez guidé pour configurer votre profil professionnel et votre cabinet.
                    {validInvitation && (
                      <span className="block mt-2 font-medium">
                        Vous serez automatiquement associé au cabinet "{validInvitation.cabinetName}".
                      </span>
                    )}
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

                {/* Séparator et bouton de démo */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#0d1117] text-gray-400">ou</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <DemoLoginButton
                    variant="outline"
                    className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                    showIcon={true}
                  />
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
