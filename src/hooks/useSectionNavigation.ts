
import { useCallback } from 'react';

export function useSectionNavigation() {
  const navigateToSection = useCallback((sectionValue: string) => {
    // Fonction pour faire défiler vers la section spécifique
    const scrollToSection = () => {
      const section = document.querySelector(`[data-section="${sectionValue}"]`);
      if (section) {
        section.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        
        // Optionnel: ajouter un effet de surbrillance
        section.classList.add('highlight-section');
        setTimeout(() => {
          section.classList.remove('highlight-section');
        }, 2000);
      }
    };

    // Activer l'onglet médical d'abord
    const medicalTab = document.querySelector('[value="medical-info"]') as HTMLElement;
    if (medicalTab) {
      medicalTab.click();
      // Attendre que l'onglet soit activé avant de faire défiler
      setTimeout(scrollToSection, 100);
    } else {
      scrollToSection();
    }
  }, []);

  return { navigateToSection };
}
