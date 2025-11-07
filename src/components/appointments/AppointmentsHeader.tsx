import React from "react";
import { HelpButton } from "@/components/ui/help-button";

const AppointmentsHeader = () => {
	return (
		<div className="relative w-full rounded-xl overflow-hidden shadow-sm border border-border mb-6">
			{/* Fond subtil avec gradient discret */}
			<div
				className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"
				aria-hidden="true"
			/>

			{/* Contenu simplifié */}
			<div className="relative z-10 flex items-center gap-3 px-5 py-6">
				<div className="rounded-lg bg-primary/10 p-3 flex items-center justify-center">
					<svg
						className="w-6 h-6 text-primary"
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
				<div>
					<div className="flex items-center gap-2 mb-1">
						<h1 className="text-xl font-semibold text-foreground">
							Mes Séances
						</h1>
						<HelpButton
							content="Gérez toutes vos séances : passées, présentes et futures."
							className="text-muted-foreground hover:text-foreground"
						/>
					</div>
					<p className="text-sm text-muted-foreground">
						Organisez et suivez vos rendez-vous
					</p>
				</div>
			</div>
		</div>
	);
};

export default AppointmentsHeader;
