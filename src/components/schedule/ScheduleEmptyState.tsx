
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ScheduleEmptyState({ date }: { date?: Date }) {
  // Format a friendly date string if provided
  let formatted =
    date &&
    date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="text-center py-16 rounded-lg border border-dashed bg-gradient-to-br from-[#fafdffee] via-[#eaf4eedd] to-[#f5fafafd] dark:from-[#19272dff] dark:to-[#2e474aff] shadow-sm relative animate-fade-in">
      {/* Decorative SVG wave at bottom */}
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
          fillOpacity="0.34"
        />
        <path
          d="M0 90 Q 180 120 300 100 Q 510 70 600 100 V120H0Z"
          fill="#A2C6CB"
          fillOpacity="0.16"
        />
      </svg>
      {/* Medical illustration (osteopath/agenda): placeholder */}
      <img
        src="/lovable-uploads/256dca24-4b34-4c54-9acf-3556dfb11b34.png"
        alt="Agenda médical illustration"
        className="mx-auto mb-8 w-40 h-40 object-cover rounded-full border-8 border-white shadow-lg bg-[#eaf4ef]"
        loading="lazy"
      />
      <h3 className="text-2xl font-semibold text-[#277575] dark:text-white mb-2">
        {date ? "Aucune séance ce jour-là" : "Aucun rendez-vous cette semaine"}
      </h3>
      <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto text-base">
        {date
          ? `Aucune séance n'est prévue pour le ${formatted}.<br/>Vous pouvez ajouter une consultation à cette date.`
          : "Commencez par planifier un rendez-vous pour organiser votre agenda.<br/>Tous vos créneaux de la semaine s’afficheront ici."}
      </p>
      <Button asChild>
        <Link to="/appointments/new">
          <Plus className="mr-2 h-5 w-5" /> Créer une séance
        </Link>
      </Button>
    </div>
  );
}
