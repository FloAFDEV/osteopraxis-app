import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
	useEffect,
} from "react";
import { User } from "@/types";
import { api } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import { useAutoLogout } from "@/hooks/use-auto-logout";
import { useNavigate } from "react-router-dom";

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	token: string | null;
	message?: string; // Optional message field for auth feedback
	needsProfileSetup?: boolean; // Indique si l'utilisateur doit configurer son profil
}

interface AuthContextType extends AuthState {
	isAdmin: boolean;
	login: (email: string, password: string) => Promise<boolean>;
	register: (userData: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	}) => Promise<boolean>;
	logout: () => void;
	loadStoredToken: () => Promise<boolean>;
	updateUser: (updatedUser: User) => boolean;
	isLoading: boolean;
	loginWithMagicLink: (email: string) => Promise<void>;
	promoteToAdmin: (userId: string) => Promise<boolean>;
	redirectToSetupIfNeeded: (fallbackUrl: string) => void;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	isAuthenticated: false,
	token: null,
	isAdmin: false,
	isLoading: false,
	login: async () => false,
	register: async () => false,
	logout: () => {},
	loadStoredToken: async () => false,
	updateUser: () => true,
	loginWithMagicLink: async () => {},
	promoteToAdmin: async () => false,
	redirectToSetupIfNeeded: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [authState, setAuthState] = useState<AuthState>({
		user: null,
		isAuthenticated: false,
		token: null,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [initialCheckDone, setInitialCheckDone] = useState(false);
	const isAdmin = useMemo(
		() => authState.user?.role === "ADMIN",
		[authState.user]
	);
	const [loadAttempts, setLoadAttempts] = useState(0);
	const MAX_LOAD_ATTEMPTS = 3;

	// Define loadStoredToken FIRST
	const loadStoredToken = useCallback(async () => {
		console.log("Début de loadStoredToken");
		const storedAuthState = localStorage.getItem("authState");
		if (storedAuthState) {
			try {
				const parsedState = JSON.parse(storedAuthState);
				console.log("État d'authentification trouvé:", parsedState);

				if (parsedState.token) {
					try {
						if (parsedState.token) {
							await supabase.auth.setSession({
								access_token: parsedState.token,
								refresh_token: "",
							});
						}

						await new Promise((resolve) =>
							setTimeout(resolve, 500)
						); // Augmenté à 500ms

						const authCheck = await api.checkAuth();
						console.log("Résultat de checkAuth:", authCheck);

						if (authCheck.isAuthenticated && authCheck.user) {
							console.log("Authentification validée par l'API");
							setAuthState({
								user: authCheck.user,
								isAuthenticated: true,
								token: authCheck.token || parsedState.token,
								needsProfileSetup: authCheck.needsProfileSetup
							});

							// Vérifier l'état de la session Supabase
							const { data: session } =
								await supabase.auth.getSession();
							console.log("Session Supabase après checkAuth:", session);

							return true;
						} else {
							console.warn(
								"Token invalidé par l'API, suppression de l'état d'authentification"
							);
							localStorage.removeItem("authState");
							setAuthState({
								user: null,
								isAuthenticated: false,
								token: null,
							});
							return false;
						}
					} catch (error) {
						console.error("Error checking auth:", error);

						// Dernier recours: tenter une connexion directe avec Supabase
						try {
							console.log(
								"Tentative de récupération directe de la session Supabase..."
							);
							const { data: supabaseSession } =
								await supabase.auth.getSession();

							if (supabaseSession?.session) {
								console.log("Session Supabase récupérée directement:", supabaseSession);
								// Utilisez la session Supabase et mettez à jour l'état local
								return true;
							}
						} catch (supabaseError) {
							console.error(
								"Erreur lors de la récupération directe de la session Supabase:",
								supabaseError
							);
						}

						console.warn(
							"Erreur de vérification d'authentification, utilisation du token local comme fallback"
						);
						setAuthState({
							user: parsedState.user,
							isAuthenticated: true,
							token: parsedState.token,
							needsProfileSetup: parsedState.needsProfileSetup
						});

						return true;
					}
				} else {
					console.log("Aucun token trouvé dans l'état stocké");
				}
			} catch (error) {
				console.error("Error parsing auth state:", error);
				localStorage.removeItem("authState");
			}
		} else {
			console.log(
				"Aucun état d'authentification trouvé dans localStorage"
			);
		}
		return false;
	}, []);

	// Then use useEffect with loadStoredToken
	useEffect(() => {
		// Set up auth state listener FIRST
		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			(event, session) => {
				console.log("Auth state changed:", event, session?.user?.email);
				if (session) {
					// Update local state from session
					const needsProfileSetup = !session.user?.user_metadata?.osteopathId;
					console.log("needsProfileSetup (onAuthStateChange):", needsProfileSetup);

					setAuthState({
						user: session.user ? {
							id: session.user.id,
							email: session.user.email || "",
							first_name: session.user.user_metadata.first_name,
							last_name: session.user.user_metadata.last_name,
							role: (session.user.user_metadata.role || "OSTEOPATH") as any,
							created_at: session.user.created_at,
							updated_at: new Date().toISOString(),
							osteopathId: session.user.user_metadata.osteopathId
						} : null,
						isAuthenticated: true,
						token: session.access_token || null,
						needsProfileSetup: needsProfileSetup
					});
				} else {
					setAuthState({
						user: null,
						isAuthenticated: false,
						token: null,
					});
				}
			}
		);

		const initialAuth = async () => {
			try {
				console.log(
					`Tentative d'authentification initiale (${
						loadAttempts + 1
					}/${MAX_LOAD_ATTEMPTS})...`
				);
				setIsLoading(true);
				const success = await loadStoredToken();
				console.log(
					"Résultat de la tentative:",
					success ? "Succès" : "Échec"
				);

				if (!success && loadAttempts < MAX_LOAD_ATTEMPTS) {
					console.log(
						`Tentative d'authentification ${
							loadAttempts + 1
						}/${MAX_LOAD_ATTEMPTS} échouée, nouvel essai dans 1s...`
					);
					setTimeout(() => setLoadAttempts((prev) => prev + 1), 1000);
					return;
				}
			} catch (error) {
				console.error("Error during initial auth check:", error);
			} finally {
				setIsLoading(false);
				setInitialCheckDone(true);
			}
		};

		initialAuth();

		// Cleanup the subscription when component unmounts
		return () => {
			subscription.unsubscribe();
		};
	}, [loadAttempts, loadStoredToken]);

	const login = useCallback(async (email: string, password: string) => {
		try {
			console.log("Tentative de connexion avec:", email);
			setIsLoading(true);
			// Simulation d'une requête d'authentification
			const response = await api.login(email, password);

			if (response.token) {
				console.log("Connexion réussie, token reçu");
				const authData = {
					user: response.user,
					isAuthenticated: true,
					token: response.token,
					needsProfileSetup: response.needsProfileSetup
				};

				localStorage.setItem("authState", JSON.stringify(authData));
				setAuthState(authData);

				// Définir également la session dans Supabase
				if (response.token) {
					console.log(
						"Configuration de la session Supabase avec le token"
					);
					await supabase.auth.setSession({
						access_token: response.token,
						refresh_token: "",
					});
				}

				// Forcer un court délai pour s'assurer que l'état est bien mis à jour
				await new Promise((resolve) => setTimeout(resolve, 500));

				return true;
			}
			console.log("Échec de connexion: pas de token reçu");
			return false;
		} catch (error) {
			console.error("Login error:", error);
			return false;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const loginWithMagicLink = useCallback(async (email: string) => {
		try {
			setIsLoading(true);
			await api.loginWithMagicLink(email);
			// Note: We don't set auth state here as the user will need to click the link in their email
		} catch (error) {
			console.error("Magic link error:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const register = useCallback(
		async (userData: {
			firstName: string;
			lastName: string;
			email: string;
			password: string;
		}) => {
			try {
				setIsLoading(true);
				const response = await api.register(userData);

				if (response.token) {
					const authData = {
						user: response.user,
						isAuthenticated: true,
						token: response.token,
					};

					localStorage.setItem("authState", JSON.stringify(authData));
					setAuthState(authData);

					// Forcer un court délai pour s'assurer que l'état est bien mis à jour
					await new Promise((resolve) => setTimeout(resolve, 300));

					return true;
				}
				return false;
			} catch (error) {
				console.error("Registration error:", error);
				throw error;
			} finally {
				setIsLoading(false);
			}
		},
		[]
	);

	const logout = useCallback(() => {
		localStorage.removeItem("authState");
		setAuthState({
			user: null,
			isAuthenticated: false,
			token: null,
		});
		api.logout();
	}, []);

	const updateUser = useCallback((updatedUser: User) => {
		console.log("Mise à jour utilisateur avec:", updatedUser);
		setAuthState((prev) => {
			const newState = {
				...prev,
				user: updatedUser,
				needsProfileSetup: !updatedUser.osteopathId
			};

			console.log("Nouvel état après mise à jour:", newState);

			// Update localStorage
			localStorage.setItem("authState", JSON.stringify(newState));

			return newState;
		});

		return true;
	}, []);

	const promoteToAdmin = useCallback(async (userId: string) => {
		try {
			setIsLoading(true);
			const result = await api.promoteToAdmin(userId);
			return result;
		} catch (error) {
			console.error("Error promoting user to admin:", error);
			return false;
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Correction de la fonction redirectToSetupIfNeeded pour mieux gérer la redirection
	const redirectToSetupIfNeeded = useCallback((fallbackUrl: string = "/dashboard") => {
		console.log("redirectToSetupIfNeeded appelé avec:", { 
			fallbackUrl, 
			needsProfileSetup: authState.needsProfileSetup, 
			isAuthenticated: authState.isAuthenticated,
			user: authState.user
		});
		
		// Si l'utilisateur n'est pas connecté, ne rien faire
		if (!authState.user || !authState.isAuthenticated) {
			console.log("Redirection ignorée: utilisateur non connecté");
			return false;
		}
		
		// Vérification explicite et simple si l'utilisateur a un ID d'ostéopathe
		const needsSetup = !authState.user.osteopathId;
		console.log("L'utilisateur a-t-il besoin de configuration?", needsSetup, "osteopathId:", authState.user.osteopathId);
		
		// Ne rediriger que si l'utilisateur n'a pas d'osteopathId
		if (needsSetup) {
			// Stocker l'URL de retour pour après la configuration
			if (fallbackUrl !== "/dashboard") {
				sessionStorage.setItem("profileSetupReturnUrl", fallbackUrl);
			}
			
			// Utiliser la navigation directe (plus fiable pour cette redirection spécifique)
			console.log(`Redirection vers la configuration du profil avec returnTo=${fallbackUrl}`);
			const setupUrl = `/profile/setup${fallbackUrl !== "/dashboard" ? `?returnTo=${encodeURIComponent(fallbackUrl)}` : ""}`;
			window.location.href = setupUrl;
			return true;
		}
		
		console.log("Pas besoin de redirection vers la configuration");
		return false;
	}, [authState]);

    // Add auto logout functionality when user is authenticated
    const isAuthenticated = authState.isAuthenticated;
    useAutoLogout();

	return (
		<AuthContext.Provider
			value={{
				...authState,
				isAdmin,
				login,
				register,
				logout,
				loadStoredToken,
				updateUser,
				isLoading,
				loginWithMagicLink,
				promoteToAdmin,
				redirectToSetupIfNeeded,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);
