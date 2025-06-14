import { Calendar } from "lucide-react";

export default function AppointmentsHeader() {
	return (
		<div className="relative w-full rounded-2xl overflow-hidden shadow-none mb-8">
			{/* Background violet en dégradé */}
			<div
				className="absolute inset-0 bg-gradient-to-br from-violet-100 via-violet-200/20 to-violet-700 dark:from-violet-900 dark:via-violet-800/30 dark:to-violet-950 opacity-95"
				aria-hidden="true"
			/>

			<div className="relative flex z-10 flex-col sm:flex-row items-center gap-4 px-6 py-10 sm:py-14">
				<div className="rounded-full bg-white/70 dark:bg-violet-900/30 shadow-md p-4 flex items-center">
					<Calendar className="h-9 w-9 text-violet-600 dark:text-violet-300" />
				</div>
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-violet-800 dark:text-white tracking-tight mb-2">
						Suivi de vos séances et rendez-vous
					</h1>
					<p className="text-base sm:text-lg text-violet-700 dark:text-violet-200 font-medium max-w-2xl">
						Gérez vos consultations, retrouvez l’historique, et
						planifiez vos prochaines séances dans une interface
						claire et apaisante.
					</p>
				</div>
			</div>
		</div>
	);
}
