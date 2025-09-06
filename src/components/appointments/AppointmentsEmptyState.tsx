import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AppointmentsEmptyState() {
  return (
    <div className="text-center py-16 rounded-lg mt-8 border border-dashed bg-gradient-to-br from-[#fafdffee] via-[#eaf4eedd] to-[#f5fafafd] dark:from-[#19272dff] dark:to-[#2e474aff] shadow-sm relative w-full">
      {/* Background wave SVG full-width */}
      <svg
        viewBox="0 0 1440 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-0 bottom-0 w-full h-36 pointer-events-none"
        aria-hidden="true"
      >
        <path
          d="M0 40 Q 360 70 720 30 Q 1080 -10 1440 40 V160H0Z"
          fill="#B8DDD7"
          fillOpacity="0.33"
        />
        <path
          d="M0 90 Q 432 120 720 100 Q 1224 70 1440 100 V160H0Z"
          fill="#A2C6CB"
          fillOpacity="0.20"
        />
      </svg>

      {/* Illustration avec badge Calendrier */}
      <div className="relative mx-auto mb-8 w-44 h-44">
        <img
          src="/lovable-uploads/256dca24-4b34-4c54-9acf-3556dfb11b34.png"
          alt="Ostéopathe illustration"
          className="w-44 h-44 object-cover rounded-full border-8 border-white shadow-lg bg-[#eaf4ef]"
          loading="lazy"
        />
        {/* Badge Calendrier */}
        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full shadow-md p-2">
          <Calendar className="h-6 w-6 text-blue-500" />
        </div>
      </div>

      <h3 className="text-2xl font-semibold text-[#2a585a] dark:text-white mb-2">
        Aucune séance trouvée
      </h3>

      <p className="text-muted-foreground mt-2 mb-6 max-w-3xl mx-auto text-base">
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
