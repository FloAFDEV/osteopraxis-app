
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, AuthState, User, Role, DbRole } from "@/types";
import { api } from "@/services/api";
import { toast } from 'sonner';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  loadStoredToken: async () => {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null
    };
  },
  updateUser: () => {},
  loginWithMagicLink: async () => false,
  isAdmin: false,
  promoteToAdmin: async () => {},
});

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null
  });

  useEffect(() => {
    console.log("Setting up auth listener");
    
    // Add auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (session && session.user) {
          // Fetch user profile separately to avoid race conditions with setTimeout
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('User')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
                
              if (error) {
                console.error("Error fetching user data:", error);
                return;
              }
              
              if (data) {
                console.log("User found in database:", data);
                setAuthState({
                  user: data as User,
                  isAuthenticated: true,
                  isLoading: false,
                  token: session.access_token
                });
              } else {
                console.log("User not found in database, creating new user record");
                
                try {
                  // Create a new user record if one doesn't exist
                  const newUserData = {
                    id: session.user.id,
                    email: session.user.email || '',
                    first_name: session.user.user_metadata?.first_name || '',
                    last_name: session.user.user_metadata?.last_name || '',
                    role: "USER" as DbRole, // Explicitly cast to match DB type
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  };
                  
                  const { data: newUser, error: createError } = await supabase
                    .from('User')
                    .insert([newUserData])
                    .select()
                    .single();
                    
                  if (createError) {
                    console.error("Error creating new user:", createError);
                    return;
                  }
                  
                  console.log("New user created:", newUser);
                  setAuthState({
                    user: newUser as User,
                    isAuthenticated: true,
                    isLoading: false,
                    token: session.access_token
                  });
                } catch (err) {
                  console.error("Failed to create user record:", err);
                }
              }
            } catch (error) {
              console.error("Error in auth state change handler:", error);
            }
          }, 0);
        } else {
          // No active session
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            token: null
          });
        }
      }
    );
    
    // Then check for existing session
    const setupAuth = async () => {
      try {
        console.log("Checking for existing session");
        await loadStoredToken();
      } catch (error) {
        console.error("Error during auth setup:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        });
      }
    };

    setupAuth();
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadStoredToken = async (): Promise<AuthState> => {
    try {
      // Récupérer la session utilisateur
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error checking auth session:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        });
        return {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        };
      }

      if (!session) {
        console.log("No session found");
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        });
        return {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        };
      }

      try {
        // Récupérer les données complètes de l'utilisateur
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (userError) {
          console.error("Error fetching user data:", userError);
          throw userError;
        }
        
        if (!userData) {
          console.log("User not found in database, creating new user record");
          
          // Create a new user record if one doesn't exist
          const newUserData = {
            id: session.user.id,
            email: session.user.email || '',
            first_name: session.user.user_metadata?.first_name || '',
            last_name: session.user.user_metadata?.last_name || '',
            role: "USER" as DbRole, // Explicitly cast to match DB type
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          const { data: newUser, error: createError } = await supabase
            .from('User')
            .insert([newUserData])
            .select()
            .single();
            
          if (createError) {
            console.error("Error creating new user:", createError);
            throw createError;
          }
          
          console.log("New user created:", newUser);
          
          const updatedAuthState = {
            user: newUser as User,
            isAuthenticated: true,
            isLoading: false,
            token: session.access_token
          };
          
          setAuthState(updatedAuthState);
          return updatedAuthState;
        }
        
        console.log("User authenticated:", userData);
        const updatedAuthState = {
          user: userData as User,
          isAuthenticated: true,
          isLoading: false,
          token: session.access_token
        };
        
        setAuthState(updatedAuthState);
        return updatedAuthState;
      } catch (err) {
        console.error("Error processing user data:", err);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        });
        return {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        };
      }
    } catch (error) {
      console.error("Error loading stored token:", error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      });
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error("Pas de session après connexion");
      }

      // Fetch the complete user profile
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('*')
        .eq('id', data.session.user.id)
        .maybeSingle();

      if (userError) {
        console.error("Error fetching user data:", userError);
        throw userError;
      }

      let user: User;

      if (!userData) {
        // Create user record if it doesn't exist
        const newUserData = {
          id: data.session.user.id,
          email: email,
          first_name: data.session.user.user_metadata?.first_name || '',
          last_name: data.session.user.user_metadata?.last_name || '',
          role: "USER" as DbRole, // Explicitly cast to match DB type
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        const { data: newUser, error: createError } = await supabase
          .from('User')
          .insert([newUserData])
          .select()
          .single();
          
        if (createError) {
          console.error("Error creating new user:", createError);
          throw createError;
        }
        
        user = newUser as User;
      } else {
        user = userData as User;
      }
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        token: data.session.access_token
      });
      
      toast.success(`Bienvenue, ${user.first_name || user.email} !`);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Échec de la connexion. Veuillez réessayer.");
      throw error;
    }
  };

  const loginWithMagicLink = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }
      
      toast.success(`Un lien de connexion a été envoyé à ${email}`);
      return true;
    } catch (error: any) {
      console.error("Magic link login error:", error);
      toast.error(error.message || "Échec de l'envoi du lien magique. Veuillez réessayer.");
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      });
      
      toast.info("Vous avez été déconnecté");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Échec de la déconnexion. Veuillez réessayer.");
    }
  };

  const register = async (userData: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        // If email confirmation is required by Supabase settings
        toast.success("Compte créé ! Veuillez vérifier votre email pour confirmer votre inscription.");
        return;
      }

      // If email confirmation is not required, create user profile
      const newUserData = {
        id: data.user!.id,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: "USER" as DbRole, // Explicitly cast to match DB type
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data: newUser, error: createError } = await supabase
        .from('User')
        .insert([newUserData])
        .select()
        .single();
        
      if (createError) {
        console.error("Error creating new user:", createError);
        throw createError;
      }
      
      setAuthState({
        user: newUser as User,
        isAuthenticated: true,
        isLoading: false,
        token: data.session.access_token
      });
      
      toast.success(`Bienvenue, ${userData.firstName} ! Votre compte a été créé.`);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Échec de l'inscription. Veuillez réessayer.");
      throw error;
    }
  };
  
  const updateUser = (updatedUserData: User) => {
    if (authState.user) {
      setAuthState({
        ...authState,
        user: {
          ...authState.user,
          ...updatedUserData
        }
      });
    }
  };
  
  const promoteToAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('User')
        .update({
          role: 'ADMIN' as DbRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast.success("Utilisateur promu administrateur avec succès");
      
      // Si l'utilisateur courant est promu, mettre à jour son état
      if (authState.user && authState.user.id === userId) {
        updateUser(data as User);
      }
    } catch (error: any) {
      console.error("Error promoting user to admin:", error);
      toast.error(error.message || "Échec de la promotion. Veuillez réessayer.");
      throw error;
    }
  };
  
  return (
    <AuthContext.Provider 
      value={{
        ...authState,
        login,
        logout,
        register,
        loadStoredToken,
        updateUser,
        loginWithMagicLink,
        isAdmin: authState.user?.role === 'ADMIN',
        promoteToAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
