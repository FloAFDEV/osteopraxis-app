
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AppointmentsEmptyState() {
  return (
				<div className="text-center py-10 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-dashed">
      {/* Background wave SVG */}
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
      {/* Illustration */}
      <img
        src="/lovable-uploads/256dca24-4b34-4c54-9acf-3556dfb11b34.png"
        alt="Ostéopathe illustration"
        className="mx-auto mb-8 w-44 h-44 object-cover rounded-full border-8 border-white shadow-lg bg-[#eaf4ef]"
        loading="lazy"
      />
      <h3 className="text-2xl font-semibold text-[#2a585a] dark:text-white mb-2">
        Aucune séance trouvée
      </h3>
      <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto text-base">
        Commencez par créer une nouvelle séance pour enrichir votre suivi patient.<br />
        Toutes vos consultations seront affichées ici, organisées avec soin.
      </p>
      <Button asChild>
        <Link to="/appointments/new">
          <Plus className="mr-2 h-5 w-5" /> Créer une séance
        </Link>
      </Button>
    </div>
  );
}
