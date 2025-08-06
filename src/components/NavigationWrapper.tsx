
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export const NavigationWrapper = ({ children }: NavigationWrapperProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Handle navigation based on authentication state
    if (isAuthenticated && user) {
      const currentPath = window.location.pathname;
      
      // Redirect admins to admin dashboard if they're on login/register pages
      if (user.role === "ADMIN" && (currentPath === "/login" || currentPath === "/register")) {
        navigate("/admin/dashboard");
      }
      // Redirect regular users away from login/register pages
      else if (user.role !== "ADMIN" && (currentPath === "/login" || currentPath === "/register")) {
        navigate("/");
      }
    }
    // Redirect unauthenticated users to login (except if already on login/register)
    else if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        navigate("/login");
      }
    }
  }, [isAuthenticated, user, navigate]);

  return <>{children}</>;
};
