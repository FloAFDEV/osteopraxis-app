
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

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	token: string | null;
	message?: string;
	needsProfileSetup?: boolean;
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
	const [isLoading, setIsLoading] = useState(true);
	const [initialCheckDone, setInitialCheckDone] = useState(false);
	const isAdmin = useMemo(
		() => authState.user?.role === "ADMIN",
		[authState.user]
	);

	// Simplified loadStoredToken without multiple retries
	const loadStoredToken = useCallback(async () => {
		console.log("Début de loadStoredToken");
		
		try {
			// Check Supabase session first
			const { data: { session }, error } = await supabase.auth.getSession();
			
			if (error) {
				console.error("Erreur lors de la récupération de la session:", error);
				return false;
			}

			if (session?.user) {
				console.log("Session Supabase active trouvée");
				const needsProfileSetup = !session.user?.user_metadata?.osteopathId;
				
				setAuthState({
					user: {
						id: session.user.id,
						email: session.user.email || "",
						firstName: session.user.user_metadata?.firstName || "",
						lastName: session.user.user_metadata?.lastName || "",
						role: (session.user.user_metadata?.role || "OSTEOPATH") as any,
						created_at: session.user.created_at,
						updated_at: new Date().toISOString(),
						osteopathId: session.user.user_metadata?.osteopathId
					},
					isAuthenticated: true,
					token: session.access_token,
					needsProfileSetup: needsProfileSetup
				});
				return true;
			}

			// If no Supabase session, check localStorage as fallback
			const storedAuthState = localStorage.getItem("authState");
			if (storedAuthState) {
				try {
					const parsedState = JSON.parse(storedAuthState);
					console.log("État d'authentification trouvé dans localStorage");
					
					setAuthState({
						user: parsedState.user,
						isAuthenticated: true,
						token: parsedState.token,
						needsProfileSetup: parsedState.needsProfileSetup
					});
					return true;
				} catch (error) {
					console.error("Erreur lors du parsing de l'état stocké:", error);
					localStorage.removeItem("authState");
				}
			}

			console.log("Aucune session active trouvée");
			return false;
		} catch (error) {
			console.error("Erreur dans loadStoredToken:", error);
			return false;
		}
	}, []);

	// Set up auth state listener and initial check
	useEffect(() => {
		let mounted = true;

		// Set up Supabase auth state listener
		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				if (!mounted) return;
				
				console.log("Auth state changed:", event, session?.user?.email);
				
				if (session?.user) {
					const needsProfileSetup = !session.user?.user_metadata?.osteopathId;
					console.log("needsProfileSetup (onAuthStateChange):", needsProfileSetup);

					const newAuthState = {
						user: {
							id: session.user.id,
							email: session.user.email || "",
							firstName: session.user.user_metadata?.firstName || "",
							lastName: session.user.user_metadata?.lastName || "",
							role: (session.user.user_metadata?.role || "OSTEOPATH") as any,
							created_at: session.user.created_at,
							updated_at: new Date().toISOString(),
							osteopathId: session.user.user_metadata?.osteopathId
						},
						isAuthenticated: true,
						token: session.access_token || null,
						needsProfileSetup: needsProfileSetup
					};

					setAuthState(newAuthState);
					// Update localStorage
					localStorage.setItem("authState", JSON.stringify(newAuthState));
				} else if (event === 'SIGNED_OUT') {
					setAuthState({
						user: null,
						isAuthenticated: false,
						token: null,
					});
					localStorage.removeItem("authState");
				}
			}
		);

		// Initial auth check
		const initialAuth = async () => {
			if (!mounted) return;
			
			try {
				console.log("Vérification d'authentification initiale...");
				setIsLoading(true);
				await loadStoredToken();
			} catch (error) {
				console.error("Erreur lors de la vérification initiale:", error);
			} finally {
				if (mounted) {
					setIsLoading(false);
					setInitialCheckDone(true);
				}
			}
		};

		initialAuth();

		return () => {
			mounted = false;
			subscription.unsubscribe();
		};
	}, [loadStoredToken]);

	const login = useCallback(async (email: string, password: string) => {
		try {
			console.log("Tentative de connexion avec:", email);
			setIsLoading(true);
			
			const response = await api.login(email, password);

			if (response.token && response.user) {
				console.log("Connexion réussie");
				const authData = {
					user: response.user,
					isAuthenticated: true,
					token: response.token,
					needsProfileSetup: response.needsProfileSetup
				};

				localStorage.setItem("authState", JSON.stringify(authData));
				setAuthState(authData);
				return true;
			}
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

				if (response.token && response.user) {
					const authData = {
						user: response.user,
						isAuthenticated: true,
						token: response.token,
					};

					localStorage.setItem("authState", JSON.stringify(authData));
					setAuthState(authData);
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

	const logout = useCallback(async () => {
		try {
			await api.logout();
			await supabase.auth.signOut();
		} catch (error) {
			console.error("Logout error:", error);
		}
		
		localStorage.removeItem("authState");
		setAuthState({
			user: null,
			isAuthenticated: false,
			token: null,
		});
	}, []);

	const updateUser = useCallback((updatedUser: User) => {
		console.log("Mise à jour utilisateur avec:", updatedUser);
		setAuthState((prev) => {
			const newState = {
				...prev,
				user: updatedUser,
				needsProfileSetup: !updatedUser.osteopathId
			};

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

	const redirectToSetupIfNeeded = useCallback((fallbackUrl: string = "/dashboard") => {
		console.log("redirectToSetupIfNeeded appelé avec:", { 
			fallbackUrl, 
			needsProfileSetup: authState.needsProfileSetup, 
			isAuthenticated: authState.isAuthenticated,
			user: authState.user
		});
		
		if (!authState.user || !authState.isAuthenticated) {
			console.log("Redirection ignorée: utilisateur non connecté");
			return false;
		}
		
		const needsSetup = !authState.user.osteopathId;
		console.log("L'utilisateur a-t-il besoin de configuration?", needsSetup, "osteopathId:", authState.user.osteopathId);
		
		if (needsSetup) {
			if (fallbackUrl !== "/dashboard") {
				sessionStorage.setItem("profileSetupReturnUrl", fallbackUrl);
			}
			
			console.log(`Redirection vers la configuration du profil avec returnTo=${fallbackUrl}`);
			const setupUrl = `/profile/setup${fallbackUrl !== "/dashboard" ? `?returnTo=${encodeURIComponent(fallbackUrl)}` : ""}`;
			window.location.href = setupUrl;
			return true;
		}
		
		console.log("Pas besoin de redirection vers la configuration");
		return false;
	}, [authState]);

	// Add auto logout functionality when user is authenticated
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
