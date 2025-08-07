import { useEffect } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { DemoService } from "@/services/demo-service";
import { toast } from "sonner";

export const DemoDataManager = () => {
  const { isDemoMode } = useDemo();

  useEffect(() => {
    if (!isDemoMode) return;

    // Vérifier et nettoyer les données toutes les 4 heures
    const cleanupInterval = setInterval(async () => {
      try {
        console.log("🧹 Nettoyage automatique des données démo...");
        await DemoService.resetDemoData();
        toast.info("Données de démonstration actualisées", {
          description: "Les données de test ont été renouvelées automatiquement"
        });
      } catch (error) {
        console.error("Erreur lors du nettoyage auto des données démo:", error);
      }
    }, 4 * 60 * 60 * 1000); // 4 heures

    // Nettoyage initial au démarrage si nécessaire
    const checkInitialCleanup = async () => {
      const lastReset = localStorage.getItem('demo-last-reset');
      const now = Date.now();
      const fourHours = 4 * 60 * 60 * 1000;

      if (!lastReset || (now - parseInt(lastReset)) > fourHours) {
        try {
          await DemoService.resetDemoData();
          localStorage.setItem('demo-last-reset', now.toString());
        } catch (error) {
          console.error("Erreur lors du nettoyage initial:", error);
        }
      }
    };

    checkInitialCleanup();

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [isDemoMode]);

  return null; // Composant invisible qui gère les données en arrière-plan
};