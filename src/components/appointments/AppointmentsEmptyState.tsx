import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AppointmentsEmptyState() {
  return (
    <div className="text-center py-16 rounded-lg mt-8 border border-dashed bg-gradient-to-br from-[#fafdffee] via-[#eaf4eedd] to-[#f5fafafd] dark:from-[#19272dff] dark:to-[#2e474aff] shadow-sm relative overflow-hidden">
      {/* Background wave SVG */}
      <svg
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-0 bottom-0 w-full h-40 pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#B8DDD7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#A2C6CB" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Première vague (claire) */}
        <path
          d="M0,64 C360,120 1080,0 1440,64 L1440,160 L0,160Z"
          fill="url(#waveGradient)"
        />
        {/* Deuxième vague (plus subtile en arrière-plan) */}
        <path
          d="M0,96 C480,160 960,32 1440,96 L1440,160 L0,160Z"
          fill="url(#waveGradient)"
          opacity="0.6"
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
