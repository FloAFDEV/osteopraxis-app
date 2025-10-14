import { InvitationCodeInput } from "@/components/cabinet/InvitationCodeInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Lock, User, UserPlus } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const registerSchema = z
  .object({
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    website: z.string().optional(),
    invitationCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas",
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
  const [validInvitation, setValidInvitation] = useState<{
    code: string;
    cabinetName: string;
  } | null>(null);

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
        lastName: data.lastName,
      });

      setRegistrationSuccess(true);
      toast.success("Votre compte a été créé avec succès !");

      let counter = 4;
      const countdownInterval = setInterval(() => {
        counter -= 1;
        setRedirectCountdown(counter);

        if (counter <= 0) {
          clearInterval(countdownInterval);
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 md:p-12 bg-card border border-border rounded-xl shadow-xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-6">
              Inscription réussie !
            </h1>
            <div className="flex justify-center mb-6">
              <div className="bg-green-500/20 rounded-full p-3">
                <User className="h-10 w-10 text-green-400" />
              </div>
            </div>
            <p className="text-foreground mb-6">
              Votre compte a été créé avec succès.
              {validInvitation && (
                <span className="block mt-2 text-primary">
                  Vous allez être redirigé vers la configuration avec votre invitation pour{" "}
                  {validInvitation.cabinetName}.
                </span>
              )}
            </p>
            <div className="flex justify-center mb-4">
              <div className="bg-primary/20 rounded-full px-4 py-2">
                <span className="text-primary font-semibold">
                  Redirection dans {redirectCountdown}s...
                </span>
              </div>
            </div>
            <div className="animate-pulse mb-6 flex justify-center">
              <div className="bg-primary/30 rounded-full h-2 w-24"></div>
            </div>
            <p className="text-muted-foreground text-sm">
              Si vous n'êtes pas redirigé automatiquement,
              <button
                onClick={() =>
                  navigate(validInvitation?.code
                    ? `/profile/setup?invitation=${validInvitation.code}`
                    : returnTo)
                }
                className="text-primary hover:underline ml-1"
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-background dark:bg-gradient-to-br dark:from-slate-950 dark:to-slate-900">
      {/* Left section - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 md:p-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <BackButton to="/" />
          <h1 className="text-4xl font-extrabold tracking-tight flex-1 text-center">
            <span className="text-foreground">Patient</span>
            <span className="ml-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              Hub
            </span>
          </h1>
          <ThemeToggle />
        </div>

        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
                Créez votre compte
              </h2>
              <p className="text-muted-foreground text-lg">
                Rejoignez PatientHub pour gérer vos patients efficacement.
              </p>
            </div>

            {(initialInvitationCode || form.watch("invitationCode")) && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h3 className="text-primary font-medium mb-3">
                  Invitation Cabinet
                </h3>
                <InvitationCodeInput
                  initialCode={initialInvitationCode}
                  onValidCode={handleValidInvitation}
                  onInvalidCode={handleInvalidInvitation}
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-primary">Inscription</span>
              </div>
            </div>

            {registerError && (
              <Alert className="bg-destructive/10 border border-destructive/50 text-destructive">
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
                         <FormLabel className="text-foreground">Prénom</FormLabel>
                         <FormControl>
                           <div className="relative">
                             <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                             <Input
                               className="pl-10 bg-background border-input text-foreground"
                               placeholder="Prénom"
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
                    name="lastName"
                    render={({ field }) => (
                       <FormItem className="flex-1">
                         <FormLabel className="text-foreground">Nom</FormLabel>
                         <FormControl>
                           <div className="relative">
                             <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                             <Input
                               className="pl-10 bg-background border-input text-foreground"
                               placeholder="Nom"
                               {...field}
                             />
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
                       <FormLabel className="text-foreground">Email</FormLabel>
                       <FormControl>
                         <div className="relative">
                           <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                           <Input
                             className="pl-10 bg-background border-input text-foreground"
                             placeholder="votre@email.com"
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
                       <FormLabel className="text-foreground">Mot de passe</FormLabel>
                       <FormControl>
                         <div className="relative">
                           <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                           <Input
                             type="password"
                             className="pl-10 bg-background border-input text-foreground"
                             placeholder="Votre mot de passe"
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
                       <FormLabel className="text-foreground">Confirmez le mot de passe</FormLabel>
                       <FormControl>
                         <div className="relative">
                           <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                           <Input
                             type="password"
                             className="pl-10 bg-background border-input text-foreground"
                             placeholder="Confirmer votre mot de passe"
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
                  {isLoading ? "Création en cours..." : "S'inscrire"}
                </Button>

                 <div className="text-center">
                   <p className="text-muted-foreground">
                     Déjà inscrit ?{" "}
                     <Link to="/login" className="text-primary hover:underline">
                       Se connecter
                     </Link>
                   </p>
                 </div>
              </form>
            </Form>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            La plateforme conçue pour faciliter la gestion des données médicales.
            <br />
            Gérez vos rendez-vous et suivez efficacement vos patients.
          </p>
          <p className="mt-4">© 2024 PatientHub. Tous droits réservés.</p>
        </div>
      </div>

      {/* Right section - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="/lovable-uploads/3b5eb6d0-bf13-4f00-98c8-6cc25a7e5c4f.png"
          alt="Colonne vertébrale"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent dark:from-[#0d1117]/80"></div>
      </div>
    </div>
  );
};

export default RegisterPage;
