import { Calendar } from "lucide-react";

export default function AppointmentsHeader() {
	return (
		<div className="relative w-full rounded-2xl overflow-hidden shadow-none mb-8">
			{/* Nouveau background : dégradé bleu/émeraude moderne */}
			<div
				className="absolute inset-0 bg-gradient-to-br from-[#5B2253] via-[#c837ab1a] to-[#f7e0fa] dark:from-[#2e183d] dark:to-[#5B2253] opacity-95"
				aria-hidden="true"
			/>
			{/* (optionnel) Photo médicale soft en overlay, ici désactivée */}
			{/* 
      <div
        className="absolute inset-0 bg-[url('/lovable-uploads/photo-1581091226825-a6a2a5aee158.jpg')] bg-cover bg-center opacity-30 mix-blend-lighten pointer-events-none"
        aria-hidden="true"
      /> 
      */}
			<div className="relative flex z-10 flex-col sm:flex-row items-center gap-4 px-6 py-10 sm:py-14">
				<div className="rounded-full bg-white/70 shadow-md p-4 flex items-center">
					<Calendar className="h-9 w-9 text-violet-600" />
				</div>
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-[#22535b] dark:text-white tracking-tight mb-2">
						Suivi de vos séances et rendez-vous
					</h1>
					<p className="text-base sm:text-lg text-[#398087] dark:text-gray-300 font-medium max-w-2xl">
						Gérez vos consultations, retrouvez l’historique, et
						planifiez vos prochaines séances dans une interface
						claire et apaisante.
					</p>
				</div>
			</div>
		</div>
	);
}
