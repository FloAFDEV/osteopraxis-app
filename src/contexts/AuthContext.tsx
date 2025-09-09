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
		// Empêcher les déconnexions multiples
		if (loading) {
			console.log('⚠️ Déconnexion déjà en cours, ignorer cette tentative');
			return;
		}
		
		try {
			console.log('🔓 Début de la déconnexion');
			
			// 1️⃣ Vérifier s'il y a une session demo locale à nettoyer
			try {
				const { demoLocalStorage } = await import('@/services/demo-local-storage');
				if (demoLocalStorage.isSessionActive()) {
					console.log('🧹 Nettoyage session démo locale');
					demoLocalStorage.clearSession();
				}
			} catch (error) {
				console.warn('Erreur nettoyage session démo:', error);
			}
			
			// 2️⃣ Déconnexion Supabase seulement si session existe
			if (session) {
				console.log('🔓 Déconnexion Supabase');
				const { error } = await supabase.auth.signOut();
				if (error) {
					console.warn('Erreur déconnexion Supabase:', error);
					// Ne pas bloquer pour cette erreur
				}
			} else {
				console.log('ℹ️ Pas de session Supabase à déconnecter');
			}
			
			// 3️⃣ Nettoyer l'état local
			setUser(null);
			setSession(null);
			setIsAuthenticated(false);
			
			console.log('✅ Déconnexion terminée avec succès');
			toast.success("Déconnexion réussie !");
			
			// 4️⃣ Navigation en dernier
			navigate("/", { replace: true });
			
		} catch (err: any) {
			console.error("❌ Erreur lors de la déconnexion:", err);
			
			// En cas d'échec, forcer la déconnexion locale
			setUser(null);
			setSession(null);
			setIsAuthenticated(false);
			navigate("/", { replace: true });
			toast.error("Déconnexion forcée suite à une erreur");
		} finally {
			setLoading(false);
		}
	}, [navigate, session]);

	const checkAuth = useCallback(async () => {
		try {
			const { data: { session } } = await supabase.auth.getSession();
			if (session?.user) {
				// Récupérer les données utilisateur complètes depuis la table User
				let { data: userData, error } = await supabase
					.from('User')
					.select('*')
					.eq('auth_id', session.user.id)
					.maybeSingle();

				// Si erreur 401, essayer de réauthentifier
				if (error && error.message?.includes('401')) {
					console.warn('Session expirée, tentative de rafraîchissement...');
					const { error: refreshError } = await supabase.auth.refreshSession();
					if (refreshError) {
						console.error('Échec du rafraîchissement de session:', refreshError);
						throw refreshError;
					}
					// Réessayer après refresh
					const { data: retryUserData, error: retryError } = await supabase
						.from('User')
						.select('*')
						.eq('auth_id', session.user.id)
						.maybeSingle();
					
					if (retryError) throw retryError;
					userData = retryUserData;
					error = retryError;
				} else if (error) {
					throw error;
				}

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
					// Vérifier si c'est un utilisateur démo (incluant les comptes temporaires)
					const isDemoUser = session.user.email === 'demo@patienthub.com' || 
									  session.user.email?.startsWith('demo-') ||
									  session.user.user_metadata?.is_demo === true ||
									  session.user.user_metadata?.is_demo_user === true;

					if (isDemoUser) {
						// Mode démo - créer un utilisateur virtuel
						const demoUser: User = {
							id: session.user.id,
							email: session.user.email || '',
							firstName: 'Utilisateur',
							lastName: 'Démo',
							role: 'OSTEOPATH',
							osteopathId: 534, // ID fixe pour le mode démo
							created_at: new Date().toISOString(),
							updated_at: new Date().toISOString(),
						};

						setUser(demoUser);
						setSession(session);
						setIsAuthenticated(true);
						console.log('🎭 Mode démo activé - utilisateur virtuel configuré');
					} else {
						setUser(null);
						setSession(null);
						setIsAuthenticated(false);
					}
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
			async (event, session) => {
				if (!mounted) return;

				// Synchronous state updates only
				setSession(session ?? null);
				const hasUser = !!session?.user;
				setIsAuthenticated(hasUser);
				
				// Plus besoin de réinitialisation

				if (hasUser) {
					// Defer any Supabase calls to avoid deadlocks
					setTimeout(() => {
						if (!mounted || !session?.user) return;
						(async () => {
							try {
								let { data: userData, error } = await supabase
									.from('User')
									.select('*')
									.eq('auth_id', session.user.id)
									.maybeSingle();

								if (!mounted) return;
								
								// Gestion des erreurs 401 avec réauthentification
								if (error && error.message?.includes('401')) {
									console.warn('Session expirée dans listener, tentative de rafraîchissement...');
									const { error: refreshError } = await supabase.auth.refreshSession();
									if (!refreshError) {
										// Réessayer après refresh
										const { data: retryUserData, error: retryError } = await supabase
											.from('User')
											.select('*')
											.eq('auth_id', session.user.id)
											.maybeSingle();
										
										if (retryUserData && !retryError) {
											userData = retryUserData;
											error = retryError;
										}
									}
								}
								
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
					// Navigation après connexion réussie
					if (event === 'SIGNED_IN') {
						// Redirection uniquement lors d'une nouvelle connexion
						if (userWithRole.role === "ADMIN") {
							navigate("/admin/dashboard", { replace: true });
							console.log("🔄 Redirection vers admin dashboard");
						} else {
							navigate("/dashboard", { replace: true });
							console.log("🔄 Redirection vers dashboard");
						}
					}
								} else {
									// Vérifier si c'est un utilisateur démo (incluant les comptes temporaires)
									const isDemoUser = session.user.email === 'demo@patienthub.com' || 
													  session.user.email?.startsWith('demo-') ||
													  session.user.user_metadata?.is_demo === true ||
													  session.user.user_metadata?.is_demo_user === true;

									if (isDemoUser) {
										// Mode démo - créer un utilisateur virtuel
										const demoUser: User = {
											id: session.user.id,
											email: session.user.email || '',
											firstName: 'Utilisateur',
											lastName: 'Démo',
											role: 'OSTEOPATH',
											osteopathId: 999, // ID factice pour démo
											created_at: new Date().toISOString(),
											updated_at: new Date().toISOString(),
										};
										setUser(demoUser);
										setSession(session);
										setIsAuthenticated(true);
										
										// Navigation immédiate vers dashboard pour les utilisateurs démo
										console.log('🎭 Redirection utilisateur démo vers dashboard');
										setTimeout(() => {
											navigate("/dashboard", { replace: true });
											toast.success("Connexion en mode démo réussie !");
										}, 100);
									} else {
										setUser(null);
									}
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