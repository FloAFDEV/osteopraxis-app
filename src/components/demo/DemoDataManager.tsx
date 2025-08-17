import { useEffect } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { DemoService } from "@/services/demo-service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const DemoDataManager = () => {
  const { isDemoMode } = useDemo();
  const { user } = useAuth();

  useEffect(() => {
    if (!isDemoMode) return;

    // Vérifier si c'est une session démo temporaire
    if (user?.email && DemoService.isDemoUser(user.email)) {
      // Pour les sessions temporaires, vérifier l'expiration toutes les minutes
      const sessionCheckInterval = setInterval(() => {
        if (DemoService.isSessionExpired()) {
          toast.error("Session démo expirée", {
            description: "Votre session temporaire a expiré. Veuillez rafraîchir la page."
          });
          // Optionnel: redirection automatique ou déconnexion
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      }, 60 * 1000); // Chaque minute

      return () => {
        clearInterval(sessionCheckInterval);
      };
    }

    // Pour les anciennes sessions démo (compatibilité)
    const cleanupInterval = setInterval(async () => {
      try {
        console.log("🧹 Nettoyage automatique des comptes démo expirés...");
        await DemoService.cleanupExpiredDemoAccounts();
        toast.info("Nettoyage automatique effectué", {
          description: "Les comptes démo expirés ont été supprimés"
        });
      } catch (error) {
        console.error("Erreur lors du nettoyage auto:", error);
      }
    }, 4 * 60 * 60 * 1000); // 4 heures

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [isDemoMode, user]);

  return null; // Composant invisible qui gère les données en arrière-plan
};