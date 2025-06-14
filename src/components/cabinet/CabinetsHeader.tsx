
import { Building2, Sparkles } from "lucide-react";

export default function CabinetsHeader() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-none mb-8">
      {/* Fond dégradé green/emerald moderne */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#1b5e20] via-[#a7fabb1a] to-[#e8f5e9] dark:from-[#183d2e] dark:to-[#22535b] opacity-95"
        aria-hidden="true"
      />
      {/* Optionnel : overlay image médicale, désactivé */}
      <div className="relative flex z-10 flex-col sm:flex-row items-center gap-4 px-6 py-10 sm:py-14">
        <div className="rounded-full bg-white/70 shadow-md p-4 flex items-center">
          <Building2 className="h-9 w-9 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#22533b] dark:text-white tracking-tight mb-2 flex items-center gap-2">
            Gestion des Cabinets <Sparkles className="h-6 w-6 text-yellow-300" />
          </h1>
          <p className="text-base sm:text-lg text-[#398087] dark:text-gray-300 font-medium max-w-2xl">
            Vos lieux de pratique centralisés, modifiables à tout moment, pour une organisation claire et structurée.
          </p>
        </div>
      </div>
    </div>
  );
}
