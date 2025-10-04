import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/pages/LandingPage';

/**
 * Composant Home intelligent
 * Redirige vers /dashboard si l'utilisateur est connecté
 * Sinon, affiche la landing page
 */
const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Attendre la fin du chargement de l'authentification
    if (loading) return;

    // Si l'utilisateur est connecté, rediriger vers le dashboard
    if (user) {
      console.log("🏠 Home - Utilisateur connecté détecté, redirection vers /dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Afficher la landing page si pas encore chargé ou pas connecté
  if (loading || user) {
    return null; // ou un loader si souhaité
  }

  return <LandingPage />;
};

export default Home;
