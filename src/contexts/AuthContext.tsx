
import React, {
	createContext,
	useState,
	useEffect,
	useContext,
	useCallback,
} from "react";
import { User } from "@/types";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useAutoLogout } from "@/hooks/use-auto-logout";

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
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	
	// Activer la déconnexion automatique si l'utilisateur est connecté
	useAutoLogout();

	const login = useCallback(async (email: string, password: string) => {
		setLoading(true);
		setError(null);
		try {
			const authResult = await api.login(email, password);
			setUser(authResult.user);
			setIsAuthenticated(authResult.isAuthenticated);
			// Navigation sera gérée par le composant qui appelle login
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
			await api.register(userData);
			toast.success("Inscription réussie !");
			// Navigation sera gérée par le composant qui appelle register
		} catch (err: any) {
			setError(err.message || "Erreur lors de l'inscription");
			console.error("Registration failed", err);
			toast.error("Échec de l'inscription");
		} finally {
			setLoading(false);
		}
	}, []);

	const logout = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			await api.logout();
			setUser(null);
			setIsAuthenticated(false);
			// Navigation sera gérée par le composant qui appelle logout
			toast.success("Déconnexion réussie !");
		} catch (err: any) {
			setError(err.message || "Erreur lors de la déconnexion");
			console.error("Logout failed", err);
			toast.error("Échec de la déconnexion");
		} finally {
			setLoading(false);
		}
	}, []);

	const checkAuth = useCallback(async () => {
		try {
			setLoading(true);
			const authResult = await api.checkAuth();
			if (authResult && authResult.isAuthenticated) {
				setUser(authResult.user);
				setIsAuthenticated(true);
			} else {
				setUser(null);
				setIsAuthenticated(false);
			}
		} catch (err: any) {
			console.error("Check auth failed", err);
			setUser(null);
			setIsAuthenticated(false);
		} finally {
			setLoading(false);
		}
	}, []);

	const loginWithMagicLink = useCallback(async (email: string) => {
    try {
      setLoading(true);
      await api.loginWithMagicLink?.(email);
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
      const success = await api.promoteToAdmin?.(userId);
      
      if (success) {
        toast.success("Utilisateur promu administrateur avec succès");
      }
      
      return success || false;
    } catch (error) {
      console.error("Erreur lors de la promotion:", error);
      toast.error("Erreur lors de la promotion de l'utilisateur");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

	// Initialize auth state on mount - with error handling
	useEffect(() => {
		const initAuth = async () => {
			try {
				await checkAuth();
			} catch (error) {
				console.error("Failed to initialize auth:", error);
				setLoading(false); // Ensure loading is false even on error
			}
		};
		
		initAuth();
	}, []); // Remove checkAuth dependency to prevent infinite loops

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
