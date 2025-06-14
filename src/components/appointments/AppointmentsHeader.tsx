
import { Calendar } from "lucide-react";

export default function AppointmentsHeader() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-none mb-8">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-[url('/lovable-uploads/4b186fbd-26a1-4d89-85fc-0ea60ae928e9.png')] bg-cover bg-center opacity-90"
        aria-hidden="true"
      />
      {/* Overlay for white/blue gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fafdffcc] via-[#e0f7fad0] to-[#e1edecbb] dark:from-[#213745f5] dark:to-[#215d67c7]" />
      <div className="relative flex z-10 flex-col sm:flex-row items-center gap-4 px-6 py-10 sm:py-14">
        <div className="rounded-full bg-white/70 shadow-md p-4 flex items-center">
          <Calendar className="h-9 w-9 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#22535b] dark:text-white tracking-tight mb-2">
            Suivi de vos séances et rendez-vous
          </h1>
          <p className="text-base sm:text-lg text-[#398087] dark:text-gray-300 font-medium max-w-2xl">
            Gérez vos consultations, retrouvez l’historique, et planifiez vos prochaines séances dans une interface claire et apaisante.
          </p>
        </div>
      </div>
    </div>
  );
}
