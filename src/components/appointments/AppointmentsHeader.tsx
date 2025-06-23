import React from "react";
import { HelpButton } from "@/components/ui/help-button";

const AppointmentsHeader = () => {
	return (
		<div className="relative w-full rounded-2xl overflow-hidden shadow-none mb-8">
			{/* Fond dégradé bleu -> indigo, avec support dark mode */}
			<div
				className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/20 to-indigo-200 dark:from-blue-900 dark:via-indigo-800/20 dark:to-indigo-950 opacity-95"
				aria-hidden="true"
			/>

			{/* Contenu */}
			<div className="relative flex z-10 flex-col sm:flex-row items-center gap-4 px-6 py-10 sm:py-14">
				<div className="rounded-full bg-white/70 dark:bg-indigo-900/30 shadow-md p-4 flex items-center justify-center">
					<svg
						className="w-9 h-9 text-blue-600 dark:text-indigo-200"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<div className="text-center sm:text-left">
					<div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
						<h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
							Gestion des Séances
						</h1>
						<div className="bg-white rounded-full p-1 shadow-sm">
							<HelpButton
								content="Ici vous pouvez voir toutes vos séances : passées, présentes et futures. Vous pouvez les organiser, les modifier et suivre leur statut."
								className="text-blue-600 hover:text-blue-800"
							/>
						</div>
					</div>
					<p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium max-w-2xl">
						Organisez et suivez vos rendez-vous patients en toute
						simplicité
					</p>
				</div>
			</div>
		</div>
	);
};

export default AppointmentsHeader;
