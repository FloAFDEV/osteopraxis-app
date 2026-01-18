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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, AlertTriangle } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const magicLinkSchema = z.object({
  email: z.string().email("Email invalide"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type MagicLinkFormValues = z.infer<typeof magicLinkSchema>;

const LoginPage = () => {
  const { login, loginWithMagicLink, isLoading } = useAuth();
  const { isDemoMode } = useDemo();
  const [activeTab, setActiveTab] = useState("password");
  const [showPassword, setShowPassword] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const magicLinkForm = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast.error("Une erreur est survenue lors de la connexion");
    }
  };

  const onMagicLinkSubmit = async (data: MagicLinkFormValues) => {
    try {
      await loginWithMagicLink(data.email);
      toast.success(
        "Lien de connexion envoyé ! Veuillez vérifier votre boîte mail.",
        { duration: 6000 }
      );
    } catch (error) {
      console.error("Erreur magic link:", error);
      toast.error("Erreur lors de l'envoi du lien de connexion");
    }
  };

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
                Votre espace dédié aux ostéopathes
              </h2>
              <p className="text-muted-foreground text-lg">
                Connectez-vous pour consulter vos dossiers.
              </p>
            </div>

            {/* ⚠️ Alerte si utilisateur déjà en mode démo */}
            {isDemoMode && (
              <Alert variant="destructive" className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <strong>Vous êtes actuellement en mode démo</strong>
                  <p className="mt-1 text-sm">En vous connectant avec un compte réel, vous perdrez l'accès aux données de démonstration.</p>
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6 bg-muted">
                <TabsTrigger value="password" className="text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
                  Mot de passe
                </TabsTrigger>
                <TabsTrigger value="magiclink" className="text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
                  Magic Link
                </TabsTrigger>
              </TabsList>

              {/* Password Tab */}
              <TabsContent value="password">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Email :</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Mot de passe :</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                className="pl-10 pr-10 bg-background border-input text-foreground"
                                placeholder="Votre mot de passe"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 h-6 w-6 text-muted-foreground hover:text-foreground transition"
                                tabIndex={-1}
                                aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                              >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
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
                      {isLoading ? "Se connecter..." : "Se connecter"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Magic Link Tab */}
              <TabsContent value="magiclink">
                <Form {...magicLinkForm}>
                  <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="space-y-6">
                    <FormField
                      control={magicLinkForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Email :</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
                      disabled={isLoading}
                    >
                      {isLoading ? "Envoi du lien..." : "Recevoir un lien de connexion"}
                    </Button>
                  </form>
                </Form>
                <div className="text-center text-sm text-muted-foreground mt-4">
                  <p>Un lien de connexion sécurisé sera envoyé à votre adresse email.</p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="text-center">
              <p className="text-muted-foreground">
                Pas encore de compte ?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            La plateforme conçue pour faciliter la gestion des données médicales.
            <br />
            Gérez vos rendez-vous et suivez efficacement vos patients
          </p>
          <p className="mt-4">© 2024 OstéoPraxis. Tous droits réservés.</p>
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

export default LoginPage;
