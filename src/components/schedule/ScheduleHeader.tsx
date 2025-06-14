import { Clock } from "lucide-react";
export default function ScheduleHeader() {
  return <div className="relative w-full rounded-2xl overflow-hidden shadow-none mb-8">
      {/* Fond dégradé bleu/émeraude/ambre selon la thématique planning */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#22535b] via-[#37c8ab1a] to-amber-100 dark:from-[#18343d] dark:to-[#e8be68b3] opacity-95" aria-hidden="true" />
      <div className="relative flex z-10 flex-col sm:flex-row items-center gap-4 px-6 py-10 sm:py-14 ">
        <div className="rounded-full bg-white/70 shadow-md p-4 flex items-center">
          <Clock className="h-9 w-9 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#22535b] dark:text-white tracking-tight mb-2">
            Planning de vos séances
          </h1>
          <p className="text-base sm:text-lg text-[#398087] dark:text-gray-300 font-medium max-w-2xl">
            Visualisez votre planning de consultations, naviguez facilement entre les jours ou semaines, et retrouvez tous vos rendez-vous à venir ou passés.
          </p>
        </div>
      </div>
    </div>;
}