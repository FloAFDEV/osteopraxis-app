import React, {
	createContext,
	useState,
	useEffect,
	useContext,
	useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAutoLogout } from "@/hooks/use-auto-logout";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

interface AuthContextProps {
	user: User | null;
	isAuthenticated: boolean;
	loading: boolean;
	isLoading: boolean; // Alias pour loading
	error: string | null;
	login: (email: string, password: string) => Promise<void>;
	register: (userData: any) => Promise<void>;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;
	loginWithMagicLink: (email: string) => Promise<void>;
	promoteToAdmin: (userId: string) => Promise<boolean>;
	updateUser?: (userData: any) => Promise<void>;
	loadStoredToken?: () => Promise<void>;
	redirectToSetupIfNeeded?: () => void;
	isAdmin?: boolean;
}

interface AuthContextProviderProps {
	children: React.ReactNode;
}

const AuthContext = createContext<AuthContextProps>({
	user: null,
	isAuthenticated: false,
	loading: false,
	isLoading: false,
	error: null,
	login: async () => {},
	register: async () => {},
	logout: async () => {},
	checkAuth: async () => {},
	loginWithMagicLink: async () => {},
	promoteToAdmin: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true); // Start with true during initialization
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	
	// Activer la déconnexion automatique si l'utilisateur est connecté
	useAutoLogout();

	const login = useCallback(async (email: string, password: string) => {
		setLoading(true);
		setError(null);
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) throw error;

			// Session et user seront mis à jour par le listener onAuthStateChange
			toast.success("Connexion réussie !");
		} catch (err: any) {
			setError(err.message || "Erreur lors de la connexion");
			console.error("Login failed", err);
			toast.error("Échec de la connexion");
		} finally {
			setLoading(false);
		}
	}, []);

	const register = useCallback(async (userData: any) => {
		setLoading(true);
		setError(null);
		try {
			const redirectUrl = `${window.location.origin}/`;
			
			const { error } = await supabase.auth.signUp({
				email: userData.email,
				password: userData.password,
				options: {
					emailRedirectTo: redirectUrl,
					data: {
						first_name: userData.firstName,
						last_name: userData.lastName,
						role: 'OSTEOPATH'
					}
				}
			});

			if (error) throw error;

			toast.success("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.");
			navigate("/login", { replace: true });
		} catch (err: any) {
			setError(err.message || "Erreur lors de l'inscription");
			console.error("Registration failed", err);
			toast.error("Échec de l'inscription");
		} finally {
			setLoading(false);
		}
	}, [navigate]);

	const logout = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;

			// State sera nettoyé par le listener onAuthStateChange
			navigate("/login", { replace: true });
			toast.success("Déconnexion réussie !");
		} catch (err: any) {
			setError(err.message || "Erreur lors de la déconnexion");
			console.error("Logout failed", err);
			toast.error("Échec de la déconnexion");
		} finally {
			setLoading(false);
		}
	}, [navigate]);

	const checkAuth = useCallback(async () => {
		try {
			const { data: { session } } = await supabase.auth.getSession();
			if (session?.user) {
				// Récupérer les données utilisateur complètes depuis la table User
				const { data: userData, error } = await supabase
					.from('User')
					.select('*')
					.eq('auth_id', session.user.id)
					.maybeSingle();

				if (userData && !error) {
					const userWithRole: User = {
						id: userData.auth_id,
						email: userData.email,
						firstName: userData.first_name,
						lastName: userData.last_name,
						role: userData.role,
						osteopathId: userData.osteopathId,
						created_at: userData.created_at,
						updated_at: userData.updated_at,
					};
					setUser(userWithRole);
					setSession(session);
					setIsAuthenticated(true);
				} else {
					setUser(null);
					setSession(null);
					setIsAuthenticated(false);
				}
			} else {
				setUser(null);
				setSession(null);
				setIsAuthenticated(false);
			}
		} catch (err: any) {
			console.error("Check auth failed", err);
			setUser(null);
			setSession(null);
			setIsAuthenticated(false);
		} finally {
			setLoading(false);
		}
	}, []);

	const loginWithMagicLink = useCallback(async (email: string) => {
		try {
			setLoading(true);
			const redirectUrl = `${window.location.origin}/`;
			
			const { error } = await supabase.auth.signInWithOtp({
				email,
				options: {
					emailRedirectTo: redirectUrl
				}
			});

			if (error) throw error;
			
			toast.success("Lien de connexion envoyé par email !");
		} catch (error) {
			console.error("Erreur lors de l'envoi du magic link:", error);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	const promoteToAdmin = useCallback(async (userId: string): Promise<boolean> => {
		if (!user || user.role !== "ADMIN") {
			throw new Error("Seuls les administrateurs peuvent promouvoir des utilisateurs");
		}

		try {
			setLoading(true);
			const { error } = await supabase
				.from('User')
				.update({ role: 'ADMIN' })
				.eq('auth_id', userId);

			if (error) throw error;

			toast.success("Utilisateur promu administrateur avec succès");
			return true;
		} catch (error) {
			console.error("Erreur lors de la promotion:", error);
			toast.error("Erreur lors de la promotion de l'utilisateur");
			throw error;
		} finally {
			setLoading(false);
		}
	}, [user]);

	// Initialize auth state and set up auth state listener
	useEffect(() => {
		let mounted = true;

		// Set up auth state listener FIRST
		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			(event, session) => {
				if (!mounted) return;

				// Synchronous state updates only
				setSession(session ?? null);
				const hasUser = !!session?.user;
				setIsAuthenticated(hasUser);

				if (hasUser) {
					// Defer any Supabase calls to avoid deadlocks
					setTimeout(() => {
						if (!mounted || !session?.user) return;
						(async () => {
							try {
								const { data: userData, error } = await supabase
									.from('User')
									.select('*')
									.eq('auth_id', session.user.id)
									.maybeSingle();

								if (!mounted) return;
								if (userData && !error) {
									const userWithRole: User = {
										id: userData.auth_id,
										email: userData.email,
										firstName: userData.first_name,
										lastName: userData.last_name,
										role: userData.role,
										osteopathId: userData.osteopathId,
										created_at: userData.created_at,
										updated_at: userData.updated_at,
									};
									setUser(userWithRole);
									// Navigate based on role after login or token refresh
									if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
										setTimeout(() => {
											if (userWithRole.role === "ADMIN") {
												navigate("/admin/dashboard", { replace: true });
												toast.success("Connexion réussie ! Redirection vers l'administration.");
											} else {
												navigate("/dashboard", { replace: true });
												toast.success("Connexion réussie !");
											}
										}, 100);
									}
								} else {
									setUser(null);
								}
							} catch (error) {
								console.error('Error fetching user data:', error);
								if (mounted) {
									setUser(null);
									setSession(null);
									setIsAuthenticated(false);
								}
							} finally {
								if (mounted) setLoading(false);
							}
						})();
					}, 0);

				} else {
					setUser(null);
					setSession(null);
					setIsAuthenticated(false);
					if (mounted) setLoading(false);
				}
			}
		);

		// THEN check for existing session
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (!mounted) return;
			// This will trigger the onAuthStateChange listener above with INITIAL_SESSION event
		});

		return () => {
			mounted = false;
			subscription.unsubscribe();
		};
	}, []); // Remove navigate dependency to prevent loops

	const value = {
		user,
		isAuthenticated,
		loading,
		isLoading: loading, // Alias
		error,
		login,
		register,
		logout,
		checkAuth,
		loginWithMagicLink,
		promoteToAdmin,
		isAdmin: user?.role === "ADMIN",
		updateUser: async (userData: any) => {
			setUser(userData);
		},
		loadStoredToken: async () => {
			// Token management would go here
		},
		redirectToSetupIfNeeded: () => {
			// Setup redirection logic would go here
		},
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};

// Export AuthProvider as alias for AuthContextProvider
export const AuthProvider = AuthContextProvider;