
import React from "react";

/**
 * Composant affichant un loader animé lors du chargement des données du graphique
 */
export const ChartLoader: React.FC = () => {
  return (
    <div className="h-[300px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  );
};
