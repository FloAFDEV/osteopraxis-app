import { Clock } from "lucide-react";

export default function ScheduleHeader() {
	return (
		<div className="relative w-full rounded-2xl overflow-hidden shadow-none mb-8">
			{/* Fond dégradé amber clair -> foncé, avec support dark mode */}
			<div
				className="absolute inset-0 bg-gradient-to-br from-amber-100 via-amber-200/20 to-amber-400 dark:from-amber-800 dark:via-amber-700/20 dark:to-amber-900 opacity-95"
				aria-hidden="true"
			/>

			<div className="relative flex z-10 flex-col sm:flex-row items-center gap-4 px-6 py-10 sm:py-14">
				<div className="rounded-full bg-white/70 dark:bg-amber-900/30 shadow-md p-4 flex items-center">
					<Clock className="h-9 w-9 text-amber-500 dark:text-amber-300" />
				</div>
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-amber-900 dark:text-white tracking-tight mb-2">
						Planning de vos séances
					</h1>
					<p className="text-base sm:text-lg text-amber-800 dark:text-amber-200 font-medium max-w-2xl">
						Visualisez votre planning de consultations, naviguez
						facilement entre les jours ou semaines, et retrouvez
						tous vos rendez-vous à venir ou passés.
					</p>
				</div>
			</div>
		</div>
	);
}
