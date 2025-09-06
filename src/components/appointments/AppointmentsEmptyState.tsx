import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AppointmentsEmptyState() {
  return (
    <div className="text-center py-10 rounded-lg mt-8 border border-dashed bg-gray-50 dark:bg-gray-900/30 shadow-sm relative w-full">
      {/* Background wave SVG full-width */}
      <svg
        viewBox="0 0 600 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-0 bottom-0 w-full h-36 pointer-events-none"
        aria-hidden="true"
      >
        <path
          d="M0 40 Q 150 70 300 30 Q 450 -10 600 40 V120H0Z"
          fill="#B8DDD7"
          fillOpacity="0.33"
        />
        <path
          d="M0 90 Q 180 120 300 100 Q 510 70 600 100 V120H0Z"
          fill="#A2C6CB"
          fillOpacity="0.20"
        />
      </svg>

      {/* Logo rond avec badge Calendar */}
      <div className="mb-4 relative w-24 h-24 mx-auto">
        <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <Calendar className="h-12 w-12 text-blue-500 absolute inset-0 m-auto" />
      </div>

      <h3 className="text-xl font-medium mb-2">Aucune séance trouvée</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto text-base">
        Commencez par créer une nouvelle séance pour enrichir votre suivi patient.
        <br />
        Toutes vos consultations seront affichées ici, organisées avec soin.
      </p>

      <Button asChild variant="outline">
        <Link to="/appointments/new">
          <Plus className="mr-2 h-4 w-4" /> Créer une séance
        </Link>
      </Button>
    </div>
  );
}
